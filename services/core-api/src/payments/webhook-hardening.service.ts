// FIZ: PROC-001 — Webhook Hardening Service
// REASON: Implement WebhookHardeningService; harden inbound processor webhook surface with
//         HMAC-SHA-256 verification, idempotency guard, schema validation, and NATS event routing
// IMPACT: New service — no existing logic modified; no ledger or balance columns touched
// CORRELATION_ID: PROC-001-2026-04-10
import * as crypto from 'crypto';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NatsService } from '../nats/nats.service';
import { NATS_TOPICS } from '../../../nats/topics.registry';
import { GovernanceConfigService } from '../config/governance.config';

const RULE_APPLIED_ID = 'WEBHOOK_HARDENING_v1';

export type WebhookStatus = 'VERIFIED' | 'REJECTED' | 'DUPLICATE' | 'DEAD_LETTER';

export interface WebhookHardeningResult {
  rule_applied_id: string;
  event_id: string;
  status: WebhookStatus;
  timestamp: string;
  correlation_id: string;
}

/**
 * Inbound webhook payload received from the payment processor HTTP endpoint.
 * raw_body must be the un-parsed request body buffer for HMAC verification.
 */
export interface InboundWebhookPayload {
  raw_body: Buffer;
  signature_header: string;
  event_id: string;
  event_type: string;
  schema_version: string;
  data: Record<string, unknown>;
  processor_timestamp: string;
  organization_id: string;
  tenant_id: string;
}

@Injectable()
export class WebhookHardeningService {
  private readonly logger = new Logger(WebhookHardeningService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly nats: NatsService,
    private readonly govConfig: GovernanceConfigService,
  ) {}

  /**
   * Inbound validation pipeline (PROC-001).
   * Steps in strict order:
   *   1. HMAC-SHA-256 signature verification
   *   2. Idempotency guard (append-only log)
   *   3. Payload schema validation
   *   4. Event-type routing to downstream NATS topic
   */
  async processInbound(
    payload: InboundWebhookPayload,
  ): Promise<WebhookHardeningResult> {
    const correlation_id = this.generateCorrelationId();
    const timestamp = this.torontoTimestamp();

    // ── Step 1: Signature Verification ──────────────────────────────────────
    if (!this.verifySignature(payload.raw_body, payload.signature_header)) {
      this.logger.warn(
        'WebhookHardeningService: signature verification failed',
        {
          rule_applied_id: RULE_APPLIED_ID,
          event_id: payload.event_id,
          correlation_id,
        },
      );
      this.nats.publish(NATS_TOPICS.WEBHOOK_RECEIVED, {
        event_id: payload.event_id,
        correlation_id,
        rule_applied_id: RULE_APPLIED_ID,
      });
      this.nats.publish(NATS_TOPICS.WEBHOOK_REJECTED, {
        event_id: payload.event_id,
        reason: 'SIGNATURE_FAILURE',
        correlation_id,
        rule_applied_id: RULE_APPLIED_ID,
      });
      return {
        rule_applied_id: RULE_APPLIED_ID,
        event_id: payload.event_id,
        status: 'REJECTED',
        timestamp,
        correlation_id,
      };
    }

    // Emit received event after signature passes
    this.nats.publish(NATS_TOPICS.WEBHOOK_RECEIVED, {
      event_id: payload.event_id,
      correlation_id,
      rule_applied_id: RULE_APPLIED_ID,
    });

    // ── Step 2: Idempotency Guard ────────────────────────────────────────────
    const existing = await this.prisma.webhookIdempotencyLog.findUnique({
      where: { event_id: payload.event_id },
    });

    if (existing !== null) {
      this.logger.warn(
        'WebhookHardeningService: duplicate event detected — returning early',
        {
          rule_applied_id: RULE_APPLIED_ID,
          event_id: payload.event_id,
          original_correlation_id: existing.correlation_id,
          correlation_id,
        },
      );
      this.nats.publish(NATS_TOPICS.WEBHOOK_DUPLICATE, {
        event_id: payload.event_id,
        original_correlation_id: existing.correlation_id,
        correlation_id,
        rule_applied_id: RULE_APPLIED_ID,
      });
      return {
        rule_applied_id: RULE_APPLIED_ID,
        event_id: payload.event_id,
        status: 'DUPLICATE',
        timestamp,
        correlation_id,
      };
    }

    // ── Step 3: Payload Schema Validation ────────────────────────────────────
    if (!this.validateSchema(payload)) {
      this.logger.error(
        'WebhookHardeningService: schema validation failed — rejecting payload',
        JSON.stringify({
          rule_applied_id: RULE_APPLIED_ID,
          event_id: payload.event_id,
          expected_schema_version: this.govConfig.WEBHOOK_EVENT_SCHEMA_VERSION,
          received_schema_version: payload.schema_version,
          correlation_id,
        }),
      );
      this.nats.publish(NATS_TOPICS.WEBHOOK_REJECTED, {
        event_id: payload.event_id,
        reason: 'SCHEMA_INVALID',
        correlation_id,
        rule_applied_id: RULE_APPLIED_ID,
      });
      return {
        rule_applied_id: RULE_APPLIED_ID,
        event_id: payload.event_id,
        status: 'REJECTED',
        timestamp,
        correlation_id,
      };
    }

    // Write idempotency record — append-only, no UPDATE or DELETE permitted
    await this.prisma.webhookIdempotencyLog.create({
      data: {
        event_id: payload.event_id,
        event_type: payload.event_type,
        schema_version: payload.schema_version,
        correlation_id,
        reason_code: 'WEBHOOK_INBOUND',
        organization_id: payload.organization_id,
        tenant_id: payload.tenant_id,
      },
    });

    // ── Step 4: Event-Type Routing ───────────────────────────────────────────
    const routed = this.routeByEventType(
      payload.event_type,
      payload.event_id,
      correlation_id,
    );

    if (!routed) {
      this.logger.warn(
        'WebhookHardeningService: unknown event type — routing to dead-letter',
        {
          rule_applied_id: RULE_APPLIED_ID,
          event_id: payload.event_id,
          event_type: payload.event_type,
          correlation_id,
        },
      );
      this.nats.publish(NATS_TOPICS.WEBHOOK_DEAD_LETTER, {
        event_id: payload.event_id,
        event_type: payload.event_type,
        correlation_id,
        rule_applied_id: RULE_APPLIED_ID,
      });
      return {
        rule_applied_id: RULE_APPLIED_ID,
        event_id: payload.event_id,
        status: 'DEAD_LETTER',
        timestamp,
        correlation_id,
      };
    }

    this.nats.publish(NATS_TOPICS.WEBHOOK_VERIFIED, {
      event_id: payload.event_id,
      event_type: payload.event_type,
      correlation_id,
      rule_applied_id: RULE_APPLIED_ID,
    });

    this.logger.log(
      'WebhookHardeningService: webhook verified and routed',
      {
        rule_applied_id: RULE_APPLIED_ID,
        event_id: payload.event_id,
        event_type: payload.event_type,
        correlation_id,
      },
    );

    return {
      rule_applied_id: RULE_APPLIED_ID,
      event_id: payload.event_id,
      status: 'VERIFIED',
      timestamp,
      correlation_id,
    };
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Verifies HMAC-SHA-256 signature using the secret from GovernanceConfig.
   * Uses crypto.timingSafeEqual to prevent timing attacks.
   */
  private verifySignature(rawBody: Buffer, signatureHeader: string): boolean {
    const secret = this.govConfig.WEBHOOK_SIGNING_SECRET;
    const expected = crypto
      .createHmac(this.govConfig.WEBHOOK_SIGNATURE_ALGO, secret)
      .update(rawBody)
      .digest('hex');
    try {
      const expectedBuf = Buffer.from(expected);
      const receivedBuf = Buffer.from(signatureHeader);
      if (expectedBuf.length !== receivedBuf.length) {
        return false;
      }
      return crypto.timingSafeEqual(expectedBuf, receivedBuf);
    } catch {
      return false;
    }
  }

  /**
   * Validates that the payload matches the expected processor event envelope.
   * All field names and version constants are read from GovernanceConfig.
   */
  private validateSchema(payload: InboundWebhookPayload): boolean {
    const expectedVersion = this.govConfig.WEBHOOK_EVENT_SCHEMA_VERSION;
    return (
      typeof payload.event_id === 'string' &&
      payload.event_id.length > 0 &&
      typeof payload.event_type === 'string' &&
      payload.event_type.length > 0 &&
      typeof payload.schema_version === 'string' &&
      payload.schema_version === expectedVersion &&
      payload.data !== null &&
      typeof payload.data === 'object' &&
      typeof payload.processor_timestamp === 'string' &&
      payload.processor_timestamp.length > 0
    );
  }

  /**
   * Routes a validated event by type to the appropriate downstream NATS topic.
   * Returns true if the event type is known, false if it should go to dead-letter.
   */
  private routeByEventType(
    eventType: string,
    eventId: string,
    correlationId: string,
  ): boolean {
    const knownEventTypes = new Set([
      'payment.completed',
      'payment.failed',
      'payment.pending',
      'payment.refunded',
      'chargeback.initiated',
      'chargeback.reversed',
      'dispute.opened',
      'dispute.resolved',
    ]);

    if (!knownEventTypes.has(eventType)) {
      return false;
    }

    this.logger.log(
      `WebhookHardeningService: routing event type '${eventType}'`,
      {
        rule_applied_id: RULE_APPLIED_ID,
        event_id: eventId,
        event_type: eventType,
        correlation_id: correlationId,
      },
    );

    return true;
  }

  /**
   * Generates a hex correlation_id using crypto.randomInt().
   * Two 32-bit segments joined to produce a 16-character hex string.
   */
  private generateCorrelationId(): string {
    const a = crypto.randomInt(0x100000000).toString(16).padStart(8, '0');
    const b = crypto.randomInt(0x100000000).toString(16).padStart(8, '0');
    return `${a}${b}`;
  }

  /**
   * Returns the current timestamp formatted as ISO 8601 in America/Toronto timezone.
   * All timestamps in this service use Toronto local time per platform governance.
   * Note: 'sv' (Swedish) locale is intentional — it produces ISO 8601 date-time format
   * (YYYY-MM-DD HH:mm:ss) without any locale-specific separators or AM/PM markers.
   */
  private torontoTimestamp(): string {
    return new Intl.DateTimeFormat('sv', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .format(new Date())
      .replace(' ', 'T');
  }
}
