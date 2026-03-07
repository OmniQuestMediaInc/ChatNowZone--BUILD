// WO: WO-INIT-001
import { Injectable } from '@nestjs/common';

export interface DashboardSummary {
  creatorId: string;
  totalEarningsCents: number;
  pendingPayoutCents: number;
  activeContracts: number;
  recentTipCount: number;
}

export class DashboardController {
  getSummary(creatorId: string): DashboardSummary {
@Injectable()
export class DashboardController {
  async getSummary(creatorId: string): Promise<DashboardSummary> {
    // TODO: Implement dashboard summary aggregation from ledger_entries
    return {
      creatorId,
      totalEarningsCents: 0,
      pendingPayoutCents: 0,
      activeContracts: 0,
      recentTipCount: 0,
    };
  }
}
