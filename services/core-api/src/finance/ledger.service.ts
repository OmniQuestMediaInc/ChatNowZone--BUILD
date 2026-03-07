// WO: WO-INIT-001
import { db } from '../db';
import { logger } from '../logger';
import { TipTransaction } from './ledger.types';

const DEFAULT_STUDIO_SPLIT = 0.20;
const DEFAULT_PERFORMER_SPLIT = 0.80;
const DEFAULT_PLATFORM_SPLIT = 0.00;
// Floating-point tolerance: splits summing to exactly 1.0 may differ by up to this amount
const SPLIT_TOLERANCE = 0.0001;

export class LedgerService {
  private readonly RATES = { REGULAR: 0.065, VIP: 0.080 };

  async recordSplitTip(tx: TipTransaction): ReturnType<typeof db.$transaction> {
    try {
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

      const studioSplit = contract ? Number(contract.studio_split) : DEFAULT_STUDIO_SPLIT;
      const platformSplit = contract ? Number(contract.platform_split) : DEFAULT_PLATFORM_SPLIT;
      const performerSplit = contract
        ? Number(contract.performer_split)
        : DEFAULT_PERFORMER_SPLIT;

      if (studioSplit + platformSplit + performerSplit > 1.0 + SPLIT_TOLERANCE) {
        throw new Error(
          `Invalid contract splits: studio(${studioSplit}) + platform(${platformSplit}) + performer(${performerSplit}) > 1.0`,
        );
      }

      const studioAmountCents = Math.round(totalPayoutCents * studioSplit);
      const platformAmountCents = Math.round(totalPayoutCents * platformSplit);
      // Performer gets the exact remainder — avoids floating-point accumulation
      const performerAmountCents = totalPayoutCents - studioAmountCents - platformAmountCents;

      const reasonCode = tx.reasonCode ?? (tx.isVIP ? 'VIP_LIFT' : 'REGULAR_TIP');

      logger.info('recordSplitTip: creating ledger entry', {
        context: 'LedgerService',
        correlationId: tx.correlationId,
        totalPayoutCents,
        studioAmountCents,
        performerAmountCents,
        platformAmountCents,
        hasContract: !!contract,
        reasonCode,
      });

      const result = await db.$transaction([
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
              reasonCode,
            },
          },
        }),
      ]);

      logger.info('recordSplitTip: ledger entry created', {
        context: 'LedgerService',
        correlationId: tx.correlationId,
      });

      return result;
    } catch (error) {
      logger.error('recordSplitTip: failed to create ledger entry', error, {
        context: 'LedgerService',
        correlationId: tx.correlationId,
      });
      throw error;
    }
  }
}
