// services/fraud-prevention/src/repositories/ChargebackRepository.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ExtensionActionRecord } from '../interfaces/shared';

@Injectable()
export class ChargebackRepository {
  private readonly prisma = new PrismaClient();

  async createExtensionAction(record: ExtensionActionRecord): Promise<ExtensionActionRecord & { createdAt: Date }> {
    const saved = await this.prisma.extensionActionRecord.create({
      data: {
        actionId: record.actionId,
        guestId: record.guestId,
        agentId: record.agentId,
        agentTier: record.agentTier,
        action: record.action,
        expiryExtensionDays: record.expiryExtensionDays,
        goodwillCreditCZT: record.goodwillCreditCZT,
        interactionRef: record.interactionRef,
        reason: record.reason,
        executedAt: record.executedAt,
        ceoReviewFlagged: record.ceoReviewFlagged,
      },
    });
    return saved;
  }

  async getChargebackCount30d(guestId: string): Promise<number> {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const count = await this.prisma.extensionActionRecord.count({
      where: { guestId, executedAt: { gte: since } },
    });
    return count;
  }
}
