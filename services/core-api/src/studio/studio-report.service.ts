// WO: WO-INIT-001
import { Injectable, Inject } from '@nestjs/common';

interface EarningsRow {
  id: string;
  studio_id: string | null;
  performer_id: string | null;
  entry_type: string;
  gross_amount_cents: bigint;
  studio_amount_cents: bigint;
  currency: string;
  created_at: Date;
}

interface SerializedEarningsRow {
  id: string;
  studio_id: string | null;
  performer_id: string | null;
  entry_type: string;
  gross_amount_cents: string;
  studio_amount_cents: string;
  currency: string;
  created_at: Date;
}

@Injectable()
export class StudioReportService {
  constructor(@Inject('DB') private readonly db: any) {}

  async getStudioEarnings(
    studioId: string,
    page = 1,
    pageSize = 100,
  ): Promise<SerializedEarningsRow[]> {
    const rows: EarningsRow[] = await this.db.ledger_entries.findMany({
      where: {
        studio_id: studioId,
        studio_amount_cents: { gt: 0 },
      },
      orderBy: [{ created_at: 'desc' }, { id: 'desc' }],
      take: pageSize,
      skip: (page - 1) * pageSize,
      select: {
        id: true,
        studio_id: true,
        performer_id: true,
        entry_type: true,
        gross_amount_cents: true,
        studio_amount_cents: true,
        currency: true,
        created_at: true,
      },
    });

    return rows.map((row) => ({
      ...row,
      gross_amount_cents: row.gross_amount_cents.toString(),
      studio_amount_cents: row.studio_amount_cents.toString(),
    }));
  }

  async getStudioSummary(studioId: string) {
    const performerCount = await this.getActivePerformerCount(studioId);

    const aggregation = await this.db.ledger_entries.aggregate({
      where: {
        studio_id: studioId,
        studio_amount_cents: { gt: 0 },
      },
      _sum: {
        studio_amount_cents: true,
        gross_amount_cents: true,
      },
      _count: {
        _all: true,
      },
    });

    const totalStudioAmountCents: bigint =
      aggregation._sum?.studio_amount_cents ?? BigInt(0);
    const totalGrossAmountCents: bigint =
      aggregation._sum?.gross_amount_cents ?? BigInt(0);

    return {
      studio_id: studioId,
      performer_count: performerCount,
      transaction_count: aggregation._count?._all ?? 0,
      total_studio_amount_cents: totalStudioAmountCents.toString(),
      total_gross_amount_cents: totalGrossAmountCents.toString(),
      currency: 'USD',
    };
  }

  private async getActivePerformerCount(studioId: string): Promise<number> {
    const contracts = await this.db.studio_contracts.findMany({
      where: { studio_id: studioId, status: 'ACTIVE' },
      select: { performer_id: true },
    });
    const unique = new Set(
      contracts.map((c: { performer_id: string }) => c.performer_id),
    );
    return unique.size;
  }
}
