// WO: WO-INIT-001
import { logger } from '../logger';
import { LedgerService } from './ledger.service';
import { TipTransaction } from './ledger.types';

export class TipService {
  private readonly ledger: LedgerService;

  constructor() {
    this.ledger = new LedgerService();
  }

  async processTip(tx: TipTransaction): Promise<void> {
    logger.info('processTip: processing tip transaction', {
      context: 'TipService',
      correlationId: tx.correlationId,
      userId: tx.userId,
      creatorId: tx.creatorId,
      tokenAmount: tx.tokenAmount,
      isVIP: tx.isVIP,
    });

    await this.ledger.recordSplitTip(tx);

    logger.info('processTip: tip processed successfully', {
      context: 'TipService',
      correlationId: tx.correlationId,
    });
  }
}
