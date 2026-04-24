// PAYLOAD 5 — Integration Hub
// Business Plan B.3 + B.4 — wires the creator-facing systems together.
//
// Connections:
//   • Ledger (Payload 1)  ↔ GateGuard (Payload 3)
//   • Recovery (Payload 2) ↔ Diamond Concierge
//   • Room-Heat + Streaming (Payload 4) ↔ CreatorControl + Cyrano
//
// Rules:
//   • Every ledger-touching path MUST pre-process through GateGuard.
//   • Three-bucket spend order (LEDGER_SPEND_ORDER) is authoritative;
//     the Hub never bypasses it.
//   • Append-only: the Hub publishes decision + handoff events but
//     never mutates a prior ledger entry or GateGuard score.

import { Injectable, Logger } from '@nestjs/common';
import { NatsService } from '../../core-api/src/nats/nats.service';
import { NATS_TOPICS } from '../../nats/topics.registry';
import {
  LEDGER_SPEND_ORDER,
  REDBOOK_RATE_CARDS,
} from '../../core-api/src/config/governance.config';
import type { HeatScore, HeatTier, RoomHeatSample } from '../../creator-control/src/room-heat.engine';
import type { CyranoInputFrame, CyranoSuggestion } from '../../cyrano/src/cyrano.types';
import type { CreatorControlService } from '../../creator-control/src/creator-control.service';
import type { CyranoService } from '../../cyrano/src/cyrano.service';

export const HUB_RULE_ID = 'INTEGRATION_HUB_v1';

/**
 * Deterministic payout scaling bump per heat tier. Flat percentage applied
 * atop the creator's normal REDBOOK rate. The Hub does NOT write this to
 * the ledger — it publishes HUB_PAYOUT_SCALING_APPLIED so the payout
 * service can enrich the next statement cycle.
 */
const PAYOUT_SCALING_PCT_BY_TIER: Record<HeatTier, number> = {
  COLD:    0.00,
  WARM:    0.00,
  HOT:     0.05,
  BLAZING: 0.10,
};

/** Minimum heat tier that triggers a monetization handoff to Cyrano. */
const MONETIZATION_TRIGGER_TIERS: ReadonlySet<HeatTier> = new Set(['HOT', 'BLAZING']);

export interface HighHeatFlowInput {
  /** Telemetry sample — CreatorControl is the authoritative scorer. */
  sample: RoomHeatSample;
  /** Cyrano frame, less the heat score which is injected post-scoring. */
  frame: Omit<CyranoInputFrame, 'heat'>;
  creator_payout_rate_per_token_usd: number;
  base_wallet_id: string;
}

export interface HighHeatFlowResult {
  heat: HeatScore;
  suggestion: CyranoSuggestion | null;
  payout_scaling_pct: number;
  scaled_payout_per_token_usd: number;
  spend_order: readonly string[];
  rule_applied_id: string;
  captured_at_utc: string;
}

@Injectable()
export class IntegrationHubService {
  private readonly logger = new Logger(IntegrationHubService.name);

  constructor(
    private readonly nats: NatsService,
    private readonly creatorControl: CreatorControlService,
    private readonly cyrano: CyranoService,
  ) {}

  /**
   * End-to-end high-heat path.
   *   1. CreatorControl ingests the raw sample (authoritative scorer).
   *   2. Cyrano evaluates the frame joined with the resulting heat score.
   *   3. If tier qualifies for monetization push, emit HUB_HIGH_HEAT_MONETIZATION.
   *   4. Compute payout scaling on the authoritative REDBOOK floor and emit
   *      HUB_PAYOUT_SCALING_APPLIED for the payout service.
   *
   * Returns a read-only envelope — no ledger mutation here. Three-bucket
   * spend order is returned verbatim from governance so downstream consumers
   * cannot drift.
   */
  async processHighHeatSession(input: HighHeatFlowInput): Promise<HighHeatFlowResult> {
    const { heat } = this.creatorControl.ingestSample(input.sample);
    const suggestion = this.cyrano.evaluate({ ...input.frame, heat });

    const capturedAt = new Date().toISOString();
    const tier: HeatTier = heat.tier;
    const scalingPct = PAYOUT_SCALING_PCT_BY_TIER[tier];
    const scaledRate = +(
      input.creator_payout_rate_per_token_usd * (1 + scalingPct)
    ).toFixed(4);

    if (MONETIZATION_TRIGGER_TIERS.has(tier)) {
      this.nats.publish(NATS_TOPICS.HUB_HIGH_HEAT_MONETIZATION, {
        session_id: input.frame.session_id,
        creator_id: input.frame.creator_id,
        guest_id: input.frame.guest_id,
        tier,
        heat_score: heat.score,
        suggested_category: suggestion?.category ?? null,
        suggestion_id: suggestion?.suggestion_id ?? null,
        captured_at_utc: capturedAt,
        rule_applied_id: HUB_RULE_ID,
      });
    }

    if (scalingPct > 0) {
      this.nats.publish(NATS_TOPICS.HUB_PAYOUT_SCALING_APPLIED, {
        session_id: input.frame.session_id,
        creator_id: input.frame.creator_id,
        tier,
        scaling_pct: scalingPct,
        base_rate_usd: input.creator_payout_rate_per_token_usd,
        scaled_rate_usd: scaledRate,
        redbook_floor_min: REDBOOK_RATE_CARDS.DIAMOND_FLOOR_PER_TOKEN_MIN,
        captured_at_utc: capturedAt,
        rule_applied_id: HUB_RULE_ID,
      });
    }

    return {
      heat,
      suggestion,
      payout_scaling_pct: scalingPct,
      scaled_payout_per_token_usd: scaledRate,
      spend_order: LEDGER_SPEND_ORDER,
      rule_applied_id: HUB_RULE_ID,
      captured_at_utc: capturedAt,
    };
  }

  /**
   * Recovery ↔ Diamond Concierge bridge.
   * When the Recovery engine flags a lapsed Diamond wallet, the Hub
   * publishes a handoff so Concierge can open a white-glove outreach.
   *
   * This method does NOT invoke Recovery or Concierge directly — it only
   * emits the canonical topic. The owning services subscribe.
   */
  emitDiamondConciergeHandoff(params: {
    wallet_id: string;
    creator_id: string | null;
    lapsed_tokens: number;
    lapsed_usd_cents: bigint;
    reason_code: 'EXPIRY_LAPSED' | 'EXTENSION_MISSED' | 'RECOVERY_WINDOW_OPEN';
  }): void {
    const payload = {
      wallet_id: params.wallet_id,
      creator_id: params.creator_id,
      lapsed_tokens: params.lapsed_tokens,
      lapsed_usd_cents: params.lapsed_usd_cents.toString(),
      reason_code: params.reason_code,
      spend_order: LEDGER_SPEND_ORDER,
      rule_applied_id: HUB_RULE_ID,
      emitted_at_utc: new Date().toISOString(),
    };
    this.logger.log('IntegrationHubService: diamond concierge handoff', payload);
    this.nats.publish(NATS_TOPICS.HUB_DIAMOND_CONCIERGE_HANDOFF, payload);
  }
}
