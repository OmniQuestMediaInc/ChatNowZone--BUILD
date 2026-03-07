// WO: WO-INIT-001
import { db } from '../db';
import { TipTransaction } from './ledger.types';

export class LedgerService {
  private readonly RATES = { REGULAR: 0.065, VIP: 0.080 };

  async recordSplitTip(tx: TipTransaction): Promise<unknown> {
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
      },
      orderBy: {
        effective_date: 'desc',
      },
    });

    const studioSplit = contract ? Number(contract.studio_split) : 0;
    const platformSplit = contract ? Number(contract.platform_split) : 0;

    if (studioSplit + platformSplit > 1) {
      throw new Error(
        `Invalid contract splits: studio(${studioSplit}) + platform(${platformSplit}) > 1.0`,
      );
    }

    const studioAmountCents = Math.round(totalPayoutCents * studioSplit);
    const platformAmountCents = Math.round(totalPayoutCents * platformSplit);
    // Performer gets the exact remainder — avoids floating-point accumulation
    const performerAmountCents = totalPayoutCents - studioAmountCents - platformAmountCents;

    return await db.$transaction([
      db.ledger_entries.create({
        data: {
          transaction_ref: tx.correlationId,
          idempotency_key: tx.correlationId,
          user_id: tx.userId,
          performer_id: tx.creatorId,
          studio_id: contract?.studio_id ?? null,
          contract_id: contract?.id ?? null,
          gross_amount_cents: totalPayoutCents,
          net_amount_cents: totalPayoutCents,
          entry_type: 'CHARGE',
          performer_amount_cents: performerAmountCents,
          studio_amount_cents: studioAmountCents,
          platform_amount_cents: platformAmountCents,
          metadata: {
            amountTokens: tx.tokenAmount,
            isVIP: tx.isVIP,
            reasonCode: tx.reasonCode,
          },
        },
      }),
    ]);
  }
}
