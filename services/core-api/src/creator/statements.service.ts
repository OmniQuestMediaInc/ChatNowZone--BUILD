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
  async getStatement(
    creatorId: string,
    period: StatementPeriod,
  ): Promise<CreatorStatement> {
    // TODO: Implement statement generation from ledger_entries
    return {
      creatorId,
      period,
      lines: [],
      totalGrossCents: 0,
      totalFeeCents: 0,
      totalNetCents: 0,
    };
  }
}
