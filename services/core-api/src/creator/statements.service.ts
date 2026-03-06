import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class StatementsService {
  constructor(private readonly db: PrismaService) {}

  // TODO: add cursor-based pagination (take/skip) before production use
  async getStudioStatement(studioId: string) {
    return await this.db.ledger_entries.findMany({
      where: { beneficiary_id: studioId, studio_amount_cents: { gt: 0 } },
      orderBy: { created_at: 'desc' },
    });
  }

  // TODO: add cursor-based pagination (take/skip) before production use
  async getCreatorEarnings(creatorId: string) {
    return await this.db.ledger_entries.findMany({
      where: { beneficiary_id: creatorId },
      orderBy: { created_at: 'desc' },
    });
  }
}
