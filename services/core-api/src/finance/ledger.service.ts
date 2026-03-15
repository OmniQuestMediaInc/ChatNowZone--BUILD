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