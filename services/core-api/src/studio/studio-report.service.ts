import { Injectable, Inject } from '@nestjs/common';

interface EarningsTotals {
  studio_amount_cents: bigint;
  gross_amount_cents: bigint;
}

interface EarningsRow {
  studio_amount_cents: bigint;
  gross_amount_cents: bigint;
}

@Injectable()
export class StudioReportService {
  constructor(@Inject('DB') private readonly db: any) {}

  async getStudioEarnings(studioId: string) {
    return await this.db.ledger_entries.findMany({
      where: {
        beneficiary_id: { in: await this.getStudioCreatorIds(studioId) },
        studio_amount_cents: { gt: 0 },
      },
      orderBy: { created_at: 'desc' },
      select: {
        beneficiary_id: true,
        studio_amount_cents: true,
        gross_amount_cents: true,
        created_at: true,
      },
    });
  }

  async getStudioSummary(studioId: string) {
    const creatorIds = await this.getStudioCreatorIds(studioId);

    const rows: EarningsRow[] = await this.db.ledger_entries.findMany({
      where: {
        beneficiary_id: { in: creatorIds },
        studio_amount_cents: { gt: 0 },
      },
      select: {
        studio_amount_cents: true,
        gross_amount_cents: true,
      },
    });

    const totals = rows.reduce<EarningsTotals>(
      (acc, row) => {
        acc.studio_amount_cents += row.studio_amount_cents;
        acc.gross_amount_cents += row.gross_amount_cents;
        return acc;
      },
      { studio_amount_cents: BigInt(0), gross_amount_cents: BigInt(0) },
    );

    return {
      studio_id: studioId,
      creator_count: creatorIds.length,
      transaction_count: rows.length,
      total_studio_amount_cents: totals.studio_amount_cents.toString(),
      total_gross_amount_cents: totals.gross_amount_cents.toString(),
      currency: 'USD',
    };
  }

  private async getStudioCreatorIds(studioId: string): Promise<string[]> {
    const contracts = await this.db.studio_contracts.findMany({
      where: { studio_id: studioId },
      select: { creator_id: true },
    });
    return contracts.map((c: { creator_id: string }) => c.creator_id);
  }
}
