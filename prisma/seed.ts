import { PlanTier, SubscriptionStatus, UserRole } from "@prisma/client";

import { getPrismaClient } from "../server/db/prisma";

const prisma = getPrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@merchforge.ai";
  const adminSupabaseId = process.env.SEED_ADMIN_SUPABASE_ID ?? "seed-admin-supabase-id";

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: UserRole.ADMIN,
      onboardingCompleted: true,
      lastLoginAt: new Date(),
    },
    create: {
      supabaseId: adminSupabaseId,
      email: adminEmail,
      username: "admin",
      fullName: "MerchForge Admin",
      role: UserRole.ADMIN,
      onboardingCompleted: true,
      referralCode: "MERCH1000",
      lastLoginAt: new Date(),
    },
  });

  await prisma.subscription.upsert({
    where: { providerSubscriptionId: `seed-sub-${adminUser.id}` },
    update: {
      plan: PlanTier.BUSINESS,
      status: SubscriptionStatus.ACTIVE,
      usageCreditsRemaining: 5000,
    },
    create: {
      userId: adminUser.id,
      plan: PlanTier.BUSINESS,
      status: SubscriptionStatus.ACTIVE,
      providerSubscriptionId: `seed-sub-${adminUser.id}`,
      monthlyCredits: 5000,
      usageCreditsRemaining: 5000,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`Seed complete. Admin user: ${adminUser.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
