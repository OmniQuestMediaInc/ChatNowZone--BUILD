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
    // Validate required fields before delegating to the ledger.
    const missing: string[] = [];
    if (!tx.userId)        missing.push('userId');
    if (!tx.creatorId)     missing.push('creatorId');
    if (!tx.correlationId) missing.push('correlationId');
    if (typeof tx.tokenAmount !== 'number') {
      missing.push('tokenAmount (must be a number)');
    } else if (tx.tokenAmount <= 0) {
      missing.push('tokenAmount (must be greater than zero)');
    }

    if (missing.length > 0) {
      const msg = `processTip: invalid input — missing or invalid fields: ${missing.join(', ')}`;
      logger.error(msg, undefined, { context: 'TipService', correlationId: tx.correlationId });
      throw new Error(msg);
    }

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
