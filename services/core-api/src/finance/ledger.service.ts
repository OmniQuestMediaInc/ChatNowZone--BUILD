import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GovernanceConfigService } from '../config/governance.config';

/**
 * WO-003: Deterministic Ledger Service
 * Implementation of OQMI Doctrine: Append-Only, Deterministic, Idempotent.
 */

export enum TokenType {
  REGULAR = 'REGULAR',
  SHOW_THEATER = 'SHOW_THEATER'
}

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(
    @InjectRepository('ledger_entries')
    private readonly ledgerRepo: Repository<any>,
    private readonly config: GovernanceConfigService,
  ) {}

  /**
   * Records a deterministic, append-only transaction.
   * Source: ChatNowZone_Global_Pricing_Spec_v1_1
   */
  async recordEntry(data: {
    userId: string;
    amount: number | bigint;
    tokenType: TokenType;
    referenceId: string;
    reasonCode: string;
    metadata?: Record<string, any>;
  }) {
    // 1. Idempotency Check: reference_id must be unique per WO-002 schema
    const existing = await this.ledgerRepo.findOne({ where: { reference_id: data.referenceId } });
    if (existing) {
      this.logger.warn(`Transaction reference_id ${data.referenceId} already exists. Skipping.`);
      return existing; 
    }

    // 2. Prepare Entry (Enforce America/Toronto context in metadata)
    const entry = this.ledgerRepo.create({
      user_id: data.userId,
      amount: data.amount.toString(), // BigInt compatibility
      token_type: data.tokenType,
      reference_id: data.referenceId,
      reason_code: data.reasonCode,
      metadata: {
        ...data.metadata,
        payout_rate_applied: data.tokenType === TokenType.SHOW_THEATER 
          ? this.config.PAYOUT_RATE_SHOWTHEATER 
          : this.config.PAYOUT_RATE_REGULAR,
        governance_timezone: this.config.TIMEZONE,
      },
    });

    // 3. Append Only - The source of truth is the log
    return await this.ledgerRepo.save(entry);
  }

  /**
   * WO-035: Dispute Reversal — appends a negative-delta ledger entry linked to
   * the originating event and the dispute case. The original PAYMENT_AUTHORIZED
   * entry is never modified (Append-Only Doctrine).
   */
  async handleDisputeReversal(data: {
    disputeId: string;
    originalEventId: string;
    userId: string;
    amountGross: bigint;
    reasonCode: string;
    metadata?: Record<string, any>;
  }): Promise<unknown> {
    const idempotencyKey = `DISPUTE_REVERSAL:${data.disputeId}:${data.originalEventId}`;

    const existing = await this.ledgerRepo.findOne({
      where: { reference_id: idempotencyKey },
    });
    if (existing) {
      this.logger.warn(
        `Dispute reversal already recorded for dispute_id=${data.disputeId}. Skipping.`,
      );
      return existing;
    }

    const entry = this.ledgerRepo.create({
      user_id: data.userId,
      amount: (-data.amountGross).toString(),
      entry_type: 'REVERSAL',
      status: 'PENDING',
      reference_id: idempotencyKey,
      reason_code: data.reasonCode,
      parent_entry_id: data.originalEventId,
      metadata: {
        ...data.metadata,
        dispute_id: data.disputeId,
        original_event_id: data.originalEventId,
        governance_timezone: this.config.TIMEZONE,
      },
    });

    return await this.ledgerRepo.save(entry);
  }

  /**
   * Derives balance from the sum of ledger entries.
   */
  async getBalance(userId: string, tokenType: TokenType): Promise<bigint> {
    const result = await this.ledgerRepo
      .createQueryBuilder('ledger')
      .select('SUM(ledger.amount)', 'total')
      .where('ledger.user_id = :userId', { userId })
      .andWhere('ledger.token_type = :tokenType', { tokenType })
      .getRawOne();

    return BigInt(result?.total || 0);
  }
}