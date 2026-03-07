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
      where: { performer_id: tx.creatorId, status: 'ACTIVE' }
    });

    const studioSplit = contract ? Number(contract.studio_split) : 0;
    const studioCents = Math.round(totalPayoutCents * studioSplit);
    const performerCents = totalPayoutCents - studioCents;

    // 2. OQMI INVARIANT: Atomic Write
    const [entry] = await db.$transaction([
      db.ledger_entries.create({
        data: {
          transaction_ref: tx.correlationId,
          idempotency_key: tx.correlationId,
          user_id: tx.userId,
          performer_amount_cents: performerCents,
          studio_amount_cents: studioCents,
          gross_amount_cents: Math.round(tx.tokenAmount * 100),
          net_amount_cents: totalPayoutCents,
          entry_type: 'CHARGE'
        }
      })
    ]);

    return entry;
  }
}
