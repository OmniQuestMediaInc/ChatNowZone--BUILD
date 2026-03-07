// WO: WO-INIT-001

export interface StatementPeriod {
  year: number;
  month: number;
}

export interface StatementLine {
  date: string;
  description: string;
  grossCents: number;
  feeCents: number;
  netCents: number;
}

export interface CreatorStatement {
  creatorId: string;
  period: StatementPeriod;
  lines: StatementLine[];
  totalGrossCents: number;
  totalFeeCents: number;
  totalNetCents: number;
}

export class StatementsService {
  getStatement(
    creatorId: string,
    period: StatementPeriod,
  ): CreatorStatement {
    // TODO: Implement statement generation from ledger_entries
    return {
      creatorId,
      period,
      lines: [],
      totalGrossCents: 0,
      totalFeeCents: 0,
      totalNetCents: 0,
    };
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatementsService {
  constructor(private readonly db: PrismaService) {}

  async getStudioStatement(
    studioId: string,
    options?: { skip?: number; take?: number },
  ) {
    const { skip, take } = options ?? {};

    return await this.db.ledger_entries.findMany({
      where: { studio_id: studioId, studio_amount_cents: { gt: 0 } },
      orderBy: { created_at: 'desc' },
      skip,
      take: typeof take === 'number' ? take : 100,
    });
  }

  // TODO: replace skip/take with cursor-based pagination before production use
  async getCreatorEarnings(
    creatorId: string,
    options?: { skip?: number; take?: number },
  ) {
    const { skip, take } = options ?? {};

    return await this.db.ledger_entries.findMany({
      where: { performer_id: creatorId },
      orderBy: { created_at: 'desc' },
      skip,
      take: typeof take === 'number' ? take : 100,
    });
  }
}
