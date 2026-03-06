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
