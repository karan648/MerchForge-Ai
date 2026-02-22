import { PaymentStatus, PlanTier, SubscriptionStatus } from "@prisma/client";

import { getPrismaClient } from "@/server/db/prisma";

export type BillingOverview = {
  planName: string;
  planPriceLabel: string;
  planStatusLabel: string;
  nextBillingDateLabel: string;
  monthlyCredits: number;
  creditsUsed: number;
  creditsRemaining: number;
  invoices: Array<{
    id: string;
    date: Date;
    description: string;
    amountCents: number;
    statusLabel: "Paid" | "Pending" | "Refunded";
  }>;
  isDemoData: boolean;
};

const FALLBACK_INVOICES: BillingOverview["invoices"] = [
  {
    id: "inv-fallback-1",
    date: new Date("2025-09-12T10:30:00.000Z"),
    description: "Pro Plan - Annual",
    amountCents: 34800,
    statusLabel: "Paid",
  },
  {
    id: "inv-fallback-2",
    date: new Date("2025-08-12T11:00:00.000Z"),
    description: "Extra Credits (20)",
    amountCents: 1500,
    statusLabel: "Paid",
  },
  {
    id: "inv-fallback-3",
    date: new Date("2025-07-12T09:15:00.000Z"),
    description: "Pro Plan - Monthly",
    amountCents: 2900,
    statusLabel: "Paid",
  },
];

function planName(plan: PlanTier): string {
  if (plan === PlanTier.BUSINESS) {
    return "Business Plan";
  }

  if (plan === PlanTier.PRO) {
    return "Pro Plan";
  }

  return "Free Plan";
}

function planPrice(plan: PlanTier): string {
  if (plan === PlanTier.BUSINESS) {
    return "$99/mo";
  }

  if (plan === PlanTier.PRO) {
    return "$29/mo";
  }

  return "$0/mo";
}

function subscriptionLabel(status: SubscriptionStatus): string {
  if (status === SubscriptionStatus.ACTIVE) {
    return "Active";
  }

  if (status === SubscriptionStatus.TRIALING) {
    return "Trial";
  }

  if (status === SubscriptionStatus.CANCELED) {
    return "Canceled";
  }

  if (status === SubscriptionStatus.PAST_DUE || status === SubscriptionStatus.UNPAID) {
    return "Payment Due";
  }

  return "Incomplete";
}

function invoiceStatus(paymentStatus: PaymentStatus): "Paid" | "Pending" | "Refunded" {
  if (paymentStatus === PaymentStatus.PAID) {
    return "Paid";
  }

  if (paymentStatus === PaymentStatus.REFUNDED) {
    return "Refunded";
  }

  return "Pending";
}

export async function getBillingOverview(userId: string): Promise<BillingOverview> {
  const prisma = getPrismaClient();

  const [subscription, orders] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        plan: true,
        status: true,
        currentPeriodEnd: true,
        monthlyCredits: true,
        usageCreditsRemaining: true,
      },
    }),
    prisma.order.findMany({
      where: {
        sellerId: userId,
        paymentStatus: {
          in: [PaymentStatus.PAID, PaymentStatus.PENDING, PaymentStatus.REFUNDED],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        createdAt: true,
        amountTotalCents: true,
        paymentStatus: true,
      },
    }),
  ]);

  const plan = subscription?.plan ?? PlanTier.FREE;
  const monthlyCredits = subscription?.monthlyCredits ?? 50;
  const creditsRemaining = subscription?.usageCreditsRemaining ?? 50;
  const creditsUsed = Math.max(monthlyCredits - creditsRemaining, 0);

  const nextBillingDate = subscription?.currentPeriodEnd ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 28);

  const mappedInvoices = orders.map((order) => ({
    id: order.id,
    date: order.createdAt,
    description: `Order invoice • ${order.id.slice(0, 8)}`,
    amountCents: order.amountTotalCents,
    statusLabel: invoiceStatus(order.paymentStatus),
  }));

  return {
    planName: planName(plan),
    planPriceLabel: planPrice(plan),
    planStatusLabel: subscription ? subscriptionLabel(subscription.status) : "Active",
    nextBillingDateLabel: nextBillingDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    monthlyCredits,
    creditsUsed,
    creditsRemaining,
    invoices: mappedInvoices.length > 0 ? mappedInvoices : FALLBACK_INVOICES,
    isDemoData: mappedInvoices.length === 0,
  };
}

