// WO: WO-021
import { Injectable } from '@nestjs/common';
import { db } from '../db';
import { logger } from '../logger';

export interface BatchPayoutRequest {
  studioId: string;
  batchCorrelationId: string;
  periodStart: Date;
  periodEnd: Date;
}

export interface BatchPayoutResult {
  studioId: string;
  batchCorrelationId: string;
  totalAmountCents: bigint;
  entryCount: number;
  status: 'QUEUED' | 'INSUFFICIENT_ENTRIES';
}

/**
 * WO-021: Batch Payout Service
 * Deterministic aggregation of Ledger entries for bulk processing.
 * Append-only: results are recorded as new ledger entries, never mutated.
 * TODO: Implement full batch transaction and payout dispatch logic.
 */
@Injectable()
export class BatchPayoutService {
  async aggregateForPayout(request: BatchPayoutRequest): Promise<BatchPayoutResult> {
    if (!request.studioId || !request.batchCorrelationId) {
      throw new Error('BatchPayoutService: studioId and batchCorrelationId are required');
    }

    logger.info('BatchPayoutService: aggregating ledger entries', {
      context: 'BatchPayoutService',
      studioId: request.studioId,
      batchCorrelationId: request.batchCorrelationId,
      periodStart: request.periodStart,
      periodEnd: request.periodEnd,
    });

    const entries = await db.ledger_entries.findMany({
      where: {
        studio_id: request.studioId,
        studio_amount_cents: { gt: 0 },
        created_at: {
          gte: request.periodStart,
          lte: request.periodEnd,
        },
      },
      orderBy: { created_at: 'asc' },
    });

    if (entries.length === 0) {
      logger.info('BatchPayoutService: no entries found for period', {
        context: 'BatchPayoutService',
        studioId: request.studioId,
        batchCorrelationId: request.batchCorrelationId,
      });
      return {
        studioId: request.studioId,
        batchCorrelationId: request.batchCorrelationId,
        totalAmountCents: BigInt(0),
        entryCount: 0,
        status: 'INSUFFICIENT_ENTRIES',
      };
    }

    // Deterministic summation — no rounding, no hidden defaults
    const totalAmountCents = entries.reduce(
      (sum, entry) => sum + BigInt(String(entry.studio_amount_cents)),
      BigInt(0),
    );

    logger.info('BatchPayoutService: aggregation complete', {
      context: 'BatchPayoutService',
      studioId: request.studioId,
      batchCorrelationId: request.batchCorrelationId,
      totalAmountCents: totalAmountCents.toString(),
      entryCount: entries.length,
    });

    return {
      studioId: request.studioId,
      batchCorrelationId: request.batchCorrelationId,
      totalAmountCents,
      entryCount: entries.length,
      status: 'QUEUED',
    };
  }
}
