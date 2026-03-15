// WO: WO-032
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GovernanceConfigService } from '../config/governance.config';

/**
 * WO-003 / WO-032: Deterministic Ledger Service
 * Implementation of OQMI Doctrine: Append-Only, Deterministic, Idempotent.
 * WO-032 additions: BigInt-only amounts; mandatory rule_applied_id.
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
    private readonly ledgerRepo: Repository<Record<string, unknown>>,
    private readonly config: GovernanceConfigService,
  ) {}

  /**
   * Records a deterministic, append-only transaction.
   * Source: ChatNowZone_Global_Pricing_Spec_v1_1
   * WO-032: amount MUST be a BigInt; fractional tokens are prohibited.
   *         rule_applied_id defaults to GENERAL_GOVERNANCE_v10 when omitted.
   */
  async recordEntry(data: {
    userId: string;
    amount: bigint;
    tokenType: TokenType;
    referenceId: string;
    reasonCode: string;
    ruleAppliedId?: string;
    metadata?: Record<string, unknown>;
  }): Promise<unknown> {
    // WO-032: Reject any non-BigInt amount to prevent fractional token entries.
    if (typeof data.amount !== 'bigint') {
      throw new Error('INVALID_AMOUNT: amount must be a BigInt. Fractional tokens are not permitted.');
    }

    // WO-032: rule_applied_id — default to GENERAL_GOVERNANCE_v10 and warn when omitted.
    const ruleAppliedId = data.ruleAppliedId ?? 'GENERAL_GOVERNANCE_v10';
    if (!data.ruleAppliedId) {
      this.logger.warn('REMEDIATION_REQUIRED: no rule_applied_id provided; defaulting', {
        default: 'GENERAL_GOVERNANCE_v10',
        referenceId: data.referenceId,
      });
    }

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
        rule_applied_id: ruleAppliedId,
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