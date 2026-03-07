// WO: WO-INIT-001
import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { logger } from '../logger';
// WO: WO-PAYROLL-SPLIT-001
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TipTransaction } from './ledger.types';

@Injectable()
export class LedgerService {
  private readonly REGULAR_PAYOUT_RATE = 0.065;
  private readonly VIP_PAYOUT_RATE = 0.080;

  async recordSplitTip(tx: TipTransaction): Promise<unknown> {
  async recordSplitTip(tx: TipTransaction) {
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

      // Default 80/20 split: performer 80%, studio 20%, platform 0%
      // A studio_contract override replaces these defaults entirely.
      const studioSplit = contract ? Number(contract.studio_split) : 0.20;
      const platformSplit = contract ? Number(contract.platform_split) : 0.00;
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
              reasonCode: tx.isVIP ? 'VIP_LIFT' : 'REGULAR_TIP',
            },
          },
        }),
      ]);
    } catch (err) {
      logger.error('LedgerService.recordSplitTip failed', {
        correlation_id: tx.correlationId,
        error: err instanceof Error ? err.message : String(err),
      });
      throw err;
    }
  async recordSplitTip(tx: TipTransaction): Promise<unknown[]> {
  async recordSplitTip(tx: TipTransaction): Promise<unknown> {
    const rate = tx.isVIP ? this.RATES.VIP : this.RATES.REGULAR;
  constructor(private readonly db: PrismaService) {}

  async processSplitTransaction(tx: TipTransaction) {
    const rate = tx.isVIP ? this.VIP_PAYOUT_RATE : this.REGULAR_PAYOUT_RATE;
    const totalPayoutCents = Math.round(tx.tokenAmount * rate * 100);

    // 1. Resolve Studio Contract — most-recently-effective ACTIVE contract valid today
    const today = new Date();
    const contract = await this.db.studio_contracts.findFirst({
      where: {
        performer_id: tx.creatorId,
        status: 'ACTIVE',
        effective_date: { lte: today },
        OR: [{ expiry_date: null }, { expiry_date: { gte: today } }],
      },
      orderBy: { effective_date: 'desc' },
    });

    // Default 80/20 split: performer 80%, studio 20%, platform 0%
    // A studio_contract override replaces these defaults entirely.
    const studioSplit = contract ? Number(contract.studio_split) : 0.20;
    const platformSplit = contract ? Number(contract.platform_split) : 0;

    if (studioSplit + platformSplit > 1) {
      throw new Error(
        `Invalid contract splits: studio(${studioSplit}) + platform(${platformSplit}) > 1.0`,
      );
    }
    const studioSplit = contract ? Number(contract.studio_split) : 0;
    const studioCents = Math.round(totalPayoutCents * studioSplit);
    const performerCents = totalPayoutCents - studioCents;

    // 2. OQMI INVARIANT: Atomic Write
    const [entry] = await this.db.$transaction([
      this.db.ledger_entries.create({
        data: {
          transaction_ref: tx.correlationId,
          idempotency_key: tx.correlationId,
          user_id: tx.userId,
          performer_id: tx.creatorId,
          studio_id: contract?.studio_id ?? null,
          contract_id: contract?.id ?? null,
          performer_amount_cents: performerCents,
          studio_amount_cents: studioCents,
          gross_amount_cents: Math.round(tx.tokenAmount * 100),
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

    return entry;
  }
}

