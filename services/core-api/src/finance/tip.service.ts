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
import { Injectable } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { TipTransaction } from './ledger.types';

/**
 * TipService — processes token tips from a user to a broadcaster.
 *
 * Design invariants (OQMI Append-Only Ledger Doctrine):
 *   - No UPDATE or DELETE is ever issued against ledger_entries.
 *   - No direct mutation of users.tokens; financial state is derived from
 *     ledger_entries exclusively.
 *   - Idempotency is enforced via TipTransaction.correlationId, which maps
 *     1-to-1 to ledger_entries.idempotency_key (UNIQUE constraint).
 *   - All monetary amounts are computed deterministically inside
 *     LedgerService.recordSplitTip — no side-effectful or Redis-derived
 *     balances are used as authoritative inputs.
 */
@Injectable()
export class TipService {
  private readonly ledger: LedgerService;

  constructor(ledger?: LedgerService) {
    this.ledger = ledger ?? new LedgerService();
  }

  /**
   * Process a tip from a user to a broadcaster/creator.
   *
   * @param tx - Tip transaction descriptor; correlationId must be a globally
   *             unique, caller-supplied idempotency key (e.g., UUID v4).
   *
   * Correctness notes versus the naive implementation:
   *   1. Balance enforcement is NOT done via a stale Redis read outside the
   *      transaction (TOCTOU).  The ledger accumulation is the source of truth;
   * Correctness notes:
   *   1. Balance enforcement is NOT done via a stale Redis read outside the
   *      transaction (TOCTOU). The ledger accumulation is the source of truth;
   *      upstream callers must gate on a DB-consistent balance query before
   *      calling this method, or rely on downstream payment-gateway rejection.
   *   2. The ledger INSERT uses entry_type 'CHARGE' — the only valid type for
   *      an outbound tip debit per the ledger_entries CHECK constraint.
   *   3. Split allocation (performer / studio / platform) is resolved from the
   *      active studio_contract by LedgerService, which is deterministic and
   *      repeatable for the same inputs.
   *   4. A duplicate correlationId causes LedgerService to throw a unique-key
   *      violation, preventing double-charges without any manual de-dup logic.
   */
  async processTip(tx: TipTransaction): Promise<void> {
    if (!tx.userId) {
      throw new Error('userId is required');
    }
    if (!tx.creatorId) {
      throw new Error('creatorId is required');
    }
    if (!tx.correlationId) {
      throw new Error('correlationId is required for idempotency');
    }
    if (!Number.isFinite(tx.tokenAmount) || tx.tokenAmount <= 0) {
      throw new Error('tokenAmount must be a positive finite number');
    }

    await this.ledger.recordSplitTip(tx);
  }
}
