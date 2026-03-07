// WO: WO-INIT-001
import { Injectable } from '@nestjs/common';
import { db } from '../db';

@Injectable()
export class StudioReportService {
  async getStudioEarnings(studioId: string, take = 100, skip = 0) {
    if (!studioId) {
      throw new Error('studioId is required');
    }

    return await db.ledger_entries.findMany({
      where: {
        studio_id: studioId,
        studio_amount_cents: { gt: 0 },
      },
      orderBy: { created_at: 'desc' },
      take,
      skip,
    });
  }
}
