// services/core-api/src/compliance/legal-hold.service.ts
// AUDIT: AUDIT-002 — Legal hold mechanism
// Canonical Corpus Chapter 7, §13.2
// Overrides retention deletion; reversible only by COMPLIANCE role.
// All hold actions logged and audit-trailed.
// TODO: LEGAL-HOLD-DB — migrate to DB-backed store before go-live
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NatsService } from '../nats/nats.service';
import { NATS_TOPICS } from '../../../nats/topics.registry';

export type HoldSubjectType = 'USER' | 'CONTENT' | 'TRANSACTION' | 'INCIDENT';

export interface LegalHold {
  hold_id: string;
  subject_id: string;
  subject_type: HoldSubjectType;
  applied_by: string;
  applied_at_utc: string;
  lifted_by: string | null;
  lifted_at_utc: string | null;
  reason_code: string;
  rule_applied_id: string;
}

@Injectable()
export class LegalHoldService {
  private readonly logger = new Logger(LegalHoldService.name);
  private readonly RULE_ID = 'LEGAL_HOLD_v1';

  // In-memory store keyed by "subject_id:subject_type"
  // TODO: LEGAL-HOLD-DB — migrate to DB-backed store before go-live
  private readonly holds = new Map<string, LegalHold>();

  constructor(private readonly nats: NatsService) {}

  private holdKey(subject_id: string, subject_type: HoldSubjectType): string {
    return `${subject_id}:${subject_type}`;
  }

  /**
   * Marks a subject as held. Publishes NATS event. Returns the LegalHold record.
   * A subject may only have one active hold at a time.
   */
  applyHold(params: {
    subject_id: string;
    subject_type: HoldSubjectType;
    applied_by: string;
    reason_code: string;
  }): LegalHold {
    const now = new Date().toISOString();
    const hold: LegalHold = {
      hold_id: randomUUID(),
      subject_id: params.subject_id,
      subject_type: params.subject_type,
      applied_by: params.applied_by,
      applied_at_utc: now,
      lifted_by: null,
      lifted_at_utc: null,
      reason_code: params.reason_code,
      rule_applied_id: this.RULE_ID,
    };

    const key = this.holdKey(params.subject_id, params.subject_type);
    this.holds.set(key, hold);

    this.logger.log('LegalHoldService: hold applied', {
      hold_id: hold.hold_id,
      subject_id: params.subject_id,
      subject_type: params.subject_type,
      applied_by: params.applied_by,
      reason_code: params.reason_code,
      rule_applied_id: this.RULE_ID,
    });

    this.nats.publish(NATS_TOPICS.LEGAL_HOLD_APPLIED, {
      hold_id: hold.hold_id,
      subject_id: params.subject_id,
      subject_type: params.subject_type,
      applied_by: params.applied_by,
      applied_at_utc: now,
      reason_code: params.reason_code,
      rule_applied_id: this.RULE_ID,
    });

    return hold;
  }

  /**
   * Lifts a hold on a subject. Requires COMPLIANCE role assertion from caller.
   * Logs the lift and publishes NATS event.
   * Throws if no active hold exists for the given subject.
   */
  liftHold(params: {
    subject_id: string;
    subject_type: HoldSubjectType;
    lifted_by: string;
    reason_code: string;
    caller_role: string;
  }): LegalHold {
    if (params.caller_role !== 'COMPLIANCE') {
      const msg = `LEGAL_HOLD_UNAUTHORIZED: Only COMPLIANCE role may lift holds. Got: ${params.caller_role}`;
      this.logger.error(msg);
      throw new Error(msg);
    }

    const key = this.holdKey(params.subject_id, params.subject_type);
    const hold = this.holds.get(key);
    if (!hold || hold.lifted_by !== null) {
      const msg = `LEGAL_HOLD_NOT_FOUND: No active hold for ${params.subject_type}:${params.subject_id}`;
      this.logger.error(msg);
      throw new Error(msg);
    }

    const now = new Date().toISOString();
    const updated: LegalHold = {
      ...hold,
      lifted_by: params.lifted_by,
      lifted_at_utc: now,
    };

    this.holds.set(key, updated);

    this.logger.log('LegalHoldService: hold lifted', {
      hold_id: hold.hold_id,
      subject_id: params.subject_id,
      subject_type: params.subject_type,
      lifted_by: params.lifted_by,
      reason_code: params.reason_code,
      rule_applied_id: this.RULE_ID,
    });

    this.nats.publish(NATS_TOPICS.LEGAL_HOLD_LIFTED, {
      hold_id: hold.hold_id,
      subject_id: params.subject_id,
      subject_type: params.subject_type,
      lifted_by: params.lifted_by,
      lifted_at_utc: now,
      reason_code: params.reason_code,
      rule_applied_id: this.RULE_ID,
    });

    return updated;
  }

  /**
   * Returns true if the subject currently has an active (un-lifted) hold.
   */
  isHeld(subject_id: string, subject_type: HoldSubjectType): boolean {
    const key = this.holdKey(subject_id, subject_type);
    const hold = this.holds.get(key);
    return hold !== undefined && hold.lifted_by === null;
  }
}
