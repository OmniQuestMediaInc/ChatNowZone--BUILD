// FIZ: MEMB-002 — MembershipService
// Durable tier record + lifecycle for memberships. Wired into ZoneAccessService
// to replace the MEMB-001 DAY_PASS stub on getActiveTier.
import { Injectable, Logger } from '@nestjs/common';
import {
  MembershipBillingInterval,
  MembershipStatus,
  MembershipSubscription,
  MembershipTier,
} from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { MEMBERSHIP } from '../config/governance.config';
import { NATS_TOPICS } from '../../../nats/topics.registry';
import { NatsService } from '../nats/nats.service';

const RULE_APPLIED_ID = 'MEMB-002_MEMBERSHIP_v1';

export interface CreateSubscriptionInput {
  userId: string;
  tier: MembershipTier;
  billingInterval: MembershipBillingInterval;
  organizationId: string;
  tenantId: string;
}

@Injectable()
export class MembershipService {
  private readonly logger = new Logger(MembershipService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly natsService: NatsService,
  ) {}

  /**
   * Resolve a user's current membership tier.
   * Returns DAY_PASS when no ACTIVE subscription exists.
   */
  async getActiveTier(userId: string): Promise<MembershipTier> {
    this.logger.log('MembershipService.getActiveTier: resolving', {
      user_id: userId,
      rule_applied_id: RULE_APPLIED_ID,
    });

    const active = await this.prisma.membershipSubscription.findUnique({
      where: { active_user_marker: userId },
    });

    const tier: MembershipTier = active?.tier ?? MembershipTier.DAY_PASS;

    this.logger.log('MembershipService.getActiveTier: resolved', {
      user_id: userId,
      tier,
      rule_applied_id: RULE_APPLIED_ID,
    });

    return tier;
  }

  /**
   * Create a new subscription for a user.
   * Applies ADR-003 duration-bonus matrix from GovernanceConfig.
   */
  async createSubscription(
    input: CreateSubscriptionInput,
  ): Promise<MembershipSubscription> {
    const { userId, tier, billingInterval, organizationId, tenantId } = input;

    const bonusEntry =
      billingInterval in MEMBERSHIP.DURATION_BONUS
        ? MEMBERSHIP.DURATION_BONUS[
            billingInterval as keyof typeof MEMBERSHIP.DURATION_BONUS
          ]
        : null;

    const commitmentMonths =
      bonusEntry?.commitment_months ?? this.defaultCommitmentMonths(billingInterval);
    const bonusMonths = bonusEntry?.bonus_months ?? 0;

    const periodStart = new Date();
    const periodEnd = this.addMonths(
      periodStart,
      commitmentMonths + bonusMonths,
    );

    this.logger.log('MembershipService.createSubscription: creating', {
      user_id: userId,
      tier,
      billing_interval: billingInterval,
      commitment_months: commitmentMonths,
      bonus_months: bonusMonths,
      rule_applied_id: RULE_APPLIED_ID,
    });

    const subscription = await this.prisma.membershipSubscription.create({
      data: {
        user_id: userId,
        tier,
        status: MembershipStatus.ACTIVE,
        billing_interval: billingInterval,
        commitment_months: commitmentMonths,
        bonus_months: bonusMonths,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        active_user_marker: userId,
        organization_id: organizationId,
        tenant_id: tenantId,
      },
    });

    this.natsService.publish(NATS_TOPICS.MEMBERSHIP_SUBSCRIPTION_CREATED, {
      subscription_id: subscription.id,
      user_id: userId,
      tier,
      billing_interval: billingInterval,
      commitment_months: commitmentMonths,
      bonus_months: bonusMonths,
      current_period_start: periodStart.toISOString(),
      current_period_end: periodEnd.toISOString(),
      rule_applied_id: RULE_APPLIED_ID,
      timestamp: new Date().toISOString(),
      timezone: 'America/Toronto',
      organization_id: organizationId,
      tenant_id: tenantId,
    });

    return subscription;
  }

  /**
   * Cancel a user's active subscription.
   * Retains access until current_period_end, then EXPIRED via expireSubscription.
   */
  async cancelSubscription(userId: string): Promise<MembershipSubscription | null> {
    this.logger.log('MembershipService.cancelSubscription: cancelling', {
      user_id: userId,
      rule_applied_id: RULE_APPLIED_ID,
    });

    const active = await this.prisma.membershipSubscription.findUnique({
      where: { active_user_marker: userId },
    });

    if (!active) {
      this.logger.warn('MembershipService.cancelSubscription: no active subscription', {
        user_id: userId,
        rule_applied_id: RULE_APPLIED_ID,
      });
      return null;
    }

    const updated = await this.prisma.membershipSubscription.update({
      where: { id: active.id },
      data: {
        status: MembershipStatus.CANCELLED,
        cancelled_at: new Date(),
      },
    });

    this.natsService.publish(NATS_TOPICS.MEMBERSHIP_SUBSCRIPTION_CANCELLED, {
      subscription_id: updated.id,
      user_id: userId,
      tier: updated.tier,
      cancelled_at: updated.cancelled_at?.toISOString() ?? null,
      current_period_end: updated.current_period_end.toISOString(),
      rule_applied_id: RULE_APPLIED_ID,
      timestamp: new Date().toISOString(),
      timezone: 'America/Toronto',
      organization_id: updated.organization_id,
      tenant_id: updated.tenant_id,
    });

    return updated;
  }

  /**
   * Expire a subscription at end-of-period.
   * Clears active_user_marker so the user resolves to DAY_PASS.
   */
  async expireSubscription(
    subscriptionId: string,
  ): Promise<MembershipSubscription | null> {
    this.logger.log('MembershipService.expireSubscription: expiring', {
      subscription_id: subscriptionId,
      rule_applied_id: RULE_APPLIED_ID,
    });

    const subscription = await this.prisma.membershipSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      this.logger.warn('MembershipService.expireSubscription: not found', {
        subscription_id: subscriptionId,
        rule_applied_id: RULE_APPLIED_ID,
      });
      return null;
    }

    const updated = await this.prisma.membershipSubscription.update({
      where: { id: subscriptionId },
      data: {
        status: MembershipStatus.EXPIRED,
        active_user_marker: null,
      },
    });

    this.natsService.publish(NATS_TOPICS.MEMBERSHIP_SUBSCRIPTION_EXPIRED, {
      subscription_id: updated.id,
      user_id: updated.user_id,
      tier_downgraded_from: updated.tier,
      tier_downgraded_to: MembershipTier.DAY_PASS,
      rule_applied_id: RULE_APPLIED_ID,
      timestamp: new Date().toISOString(),
      timezone: 'America/Toronto',
      organization_id: updated.organization_id,
      tenant_id: updated.tenant_id,
    });

    return updated;
  }

  private defaultCommitmentMonths(
    billingInterval: MembershipBillingInterval,
  ): number {
    switch (billingInterval) {
      case MembershipBillingInterval.MONTHLY:
        return 1;
      case MembershipBillingInterval.QUARTERLY:
        return 3;
      case MembershipBillingInterval.SEMI_ANNUAL:
        return 6;
      case MembershipBillingInterval.ANNUAL:
        return 12;
    }
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date.getTime());
    result.setUTCMonth(result.getUTCMonth() + months);
    return result;
  }
}
