// prisma/seed.ts
// MEMB-001: Membership schema foundation seed data
// Seeds test organization + tenant + user + all six membership tiers for enum validation

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting MEMB-001 seed...');

  // Seed test organization and tenant
  const testOrgId = '00000000-0000-0000-0000-000000000001';
  const testTenantId = '00000000-0000-0000-0000-000000000002';

  // Seed test user
  const testUser = await prisma.user.upsert({
    where: { id: '00000000-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000003',
      organization_id: testOrgId,
      tenant_id: testTenantId,
    },
  });

  console.log(`Seeded test user: ${testUser.id}`);

  // Seed exactly SIX Membership rows — one per tier enum value
  // This is enum-coverage validation, not realistic user data
  const tiers = [
    'GUEST',
    'VIP',
    'VIP_SILVER',
    'VIP_GOLD',
    'VIP_PLATINUM',
    'VIP_DIAMOND',
  ] as const;

  for (const tier of tiers) {
    const membership = await prisma.membership.upsert({
      where: { user_id: testUser.id },
      update: {
        tier,
        account_status: 'ACTIVE',
        organization_id: testOrgId,
        tenant_id: testTenantId,
      },
      create: {
        user_id: testUser.id,
        tier,
        account_status: 'ACTIVE',
        organization_id: testOrgId,
        tenant_id: testTenantId,
      },
    });

    console.log(`Seeded membership tier: ${tier}`);

    // Seed matching MembershipTierTransition ledger entry
    // Each has previous_tier=null and new_tier=<tier> (initial grant simulation)
    await prisma.membershipTierTransition.create({
      data: {
        membership_id: membership.id,
        user_id: testUser.id,
        previous_tier: null,
        new_tier: tier,
        previous_status: null,
        new_status: 'ACTIVE',
        trigger_type: 'GATE_1_GUEST_GRANTED', // Simplified for seed; real flow varies by tier
        actor_id: null, // System-triggered
        rule_applied_id: 'MEMB-001-SEED-DATA',
        organization_id: testOrgId,
        tenant_id: testTenantId,
      },
    });

    console.log(`Seeded transition for tier: ${tier}`);
  }

  console.log('MEMB-001 seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
