import { db } from '../db';
import { TipTransaction } from './ledger.types';

export class LedgerService {
  private readonly RATES = { REGULAR: 0.065, VIP: 0.080 };

  async recordSplitTip(tx: TipTransaction) {
    const rate = tx.isVIP ? this.RATES.VIP : this.RATES.REGULAR;
    const totalPayoutCents = Math.round(tx.tokenAmount * rate * 100);

    const now = new Date();
    const contract = await db.studio_contracts.findFirst({
      where: {
        performer_id: tx.creatorId,
        status: 'ACTIVE',
        effective_date: { lte: now },
        OR: [
          { expiry_date: null },
          { expiry_date: { gt: now } }
        ]
      }
    });

    const studioPct = contract ? Number(contract.studio_commission_pct) : 0;
    const studioAmountCents = Math.round(totalPayoutCents * (studioPct / 100));
    const performerAmountCents = totalPayoutCents - studioAmountCents;

    return await db.$transaction([
      db.ledger_entries.create({
        data: {
          transaction_ref: tx.correlationId,
          idempotency_key: tx.correlationId,
          user_id: tx.userId,
          gross_amount_cents: totalPayoutCents,
          net_amount_cents: totalPayoutCents,
          entry_type: 'TIP',
          reason_code: tx.isVIP ? 'VIP_LIFT' : 'REGULAR_TIP',
          metadata: {
            correlationId: tx.correlationId,
            actorId: tx.userId,
            beneficiaryId: tx.creatorId,
            amountTokens: tx.tokenAmount,
            performerAmountCents,
            studioAmountCents,
            isVIP: tx.isVIP,
          },
        },
      }),
    ]);
  }
}
