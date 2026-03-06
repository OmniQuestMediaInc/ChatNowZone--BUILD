import { Injectable } from '@nestjs/common';
import { db } from '../db';

@Injectable()
export class LedgerService {
  private readonly REGULAR_PAYOUT_RATE = 0.065;
  private readonly VIP_PAYOUT_RATE = 0.080;

  async processSplitTransaction(tx: {
    userId: string;
    creatorId: string;
    tokenAmount: number;
    isVIP: boolean;
    correlationId: string;
  }) {
    const rate = tx.isVIP ? this.VIP_PAYOUT_RATE : this.REGULAR_PAYOUT_RATE;
    const totalPayoutCents = Math.round(tx.tokenAmount * rate * 100);

    // 1. Resolve Studio Contract
    const contract = await db.studio_contracts.findFirst({
      where: { creator_id: tx.creatorId, is_active: true }
    });

    const studioPct = contract ? Number(contract.studio_commission_pct) : 0;
    const studioCents = Math.round(totalPayoutCents * (studioPct / 100));
    const performerCents = totalPayoutCents - studioCents;

    // 2. OQMI INVARIANT: Atomic Write
    return await db.$transaction([
      db.ledger_entries.create({ data: {
        correlation_id: tx.correlationId,
        actor_id: tx.userId,
        beneficiary_id: tx.creatorId,
        amount_tokens: tx.tokenAmount,
        performer_amount_cents: performerCents,
        studio_amount_cents: studioCents,
        entry_type: 'TIP',
        reason_code: tx.isVIP ? 'VIP_SHOW_LIFT' : 'REGULAR_TIP'
      }})
    ]);
  }
}
