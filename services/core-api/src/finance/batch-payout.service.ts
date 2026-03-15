// WO: WO-021
import { logger } from '../logger';
import { db } from '../db';

export interface BatchPayoutRequest {
  studioId: string;
  periodStart: Date;
  periodEnd: Date;
  correlationId: string;
}

export interface BatchPayoutLine {
  performerId: string;
  studioId: string;
  totalAmountCents: bigint;
  entryCount: number;
}

export interface BatchPayoutResult {
  correlationId: string;
  studioId: string;
  periodStart: Date;
  periodEnd: Date;
  lines: BatchPayoutLine[];
  grandTotalCents: bigint;
  processedAt: Date;
}

export class BatchPayoutService {
  async aggregate(req: BatchPayoutRequest): Promise<BatchPayoutResult> {
    logger.info('aggregate: starting batch payout aggregation', {
      context: 'BatchPayoutService',
      correlationId: req.correlationId,
      studioId: req.studioId,
      periodStart: req.periodStart,
      periodEnd: req.periodEnd,
    });

    const entries = await db.ledger_entries.findMany({
      where: {
        studio_id: req.studioId,
        entry_type: 'CHARGE',
        created_at: {
          gte: req.periodStart,
          lte: req.periodEnd,
        },
      },
      orderBy: { created_at: 'asc' },
    });

    const lineMap = new Map<string, BatchPayoutLine>();

    for (const entry of entries) {
      if (!entry.performer_id) {
        throw new Error(
          `aggregate: ledger entry ${entry.id} is missing performer_id — cannot build payout line`,
        );
      }
      if (entry.performer_amount_cents === null || entry.performer_amount_cents === undefined) {
        throw new Error(
          `aggregate: ledger entry ${entry.id} is missing performer_amount_cents — cannot compute payout`,
        );
      }

      const key = entry.performer_id;
      const existing = lineMap.get(key);
      const amount = BigInt(entry.performer_amount_cents);

      if (existing) {
        existing.totalAmountCents += amount;
        existing.entryCount += 1;
      } else {
        lineMap.set(key, {
          performerId: key,
          studioId: req.studioId,
          totalAmountCents: amount,
          entryCount: 1,
        });
      }
    }

    const lines = Array.from(lineMap.values());
    const grandTotalCents = lines.reduce(
      (sum, l) => sum + l.totalAmountCents,
      BigInt(0),
    );

    const result: BatchPayoutResult = {
      correlationId: req.correlationId,
      studioId: req.studioId,
      periodStart: req.periodStart,
      periodEnd: req.periodEnd,
      lines,
      grandTotalCents,
      processedAt: new Date(),
    };

    logger.info('aggregate: batch payout aggregation complete', {
      context: 'BatchPayoutService',
      correlationId: req.correlationId,
      lineCount: lines.length,
      grandTotalCents: grandTotalCents.toString(),
    });

    return result;
  }
}
