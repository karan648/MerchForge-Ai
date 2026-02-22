import { DesignStatus, PaymentStatus } from "@prisma/client";

import { getPrismaClient } from "@/server/db/prisma";

type DashboardTrend = {
  label: string;
  tone: "positive" | "neutral" | "warning";
};

type DashboardRecentDesign = {
  id: string;
  title: string;
  generatedAt: Date;
  status: "Live" | "Draft";
  imageUrl: string | null;
};

export type DashboardOverview = {
  greetingName: string;
  totalSalesFormatted: string;
  totalSalesTrend: DashboardTrend;
  generatedDesignsCount: number;
  generatedDesignsTrend: DashboardTrend;
  creditsRemaining: number;
  creditsLimit: number;
  creditsTrend: DashboardTrend;
  recentDesigns: DashboardRecentDesign[];
};

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function monthWindow(baseDate = new Date()) {
  const currentStart = startOfMonth(baseDate);
  const previousStart = new Date(currentStart.getFullYear(), currentStart.getMonth() - 1, 1);
  return { currentStart, previousStart };
}

function formatCurrency(cents: number): string {
  const amount = cents / 100;
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

function percentageTrend(current: number, previous: number): DashboardTrend {
  if (previous <= 0) {
    if (current > 0) {
      return { label: "New", tone: "positive" };
    }

    return { label: "No change", tone: "neutral" };
  }

  const delta = ((current - previous) / previous) * 100;

  if (Math.abs(delta) < 0.5) {
    return { label: "No change", tone: "neutral" };
  }

  const sign = delta > 0 ? "+" : "";
  return {
    label: `${sign}${delta.toFixed(1)}%`,
    tone: delta > 0 ? "positive" : "warning",
  };
}

function creditsTrend(remaining: number, limit: number): DashboardTrend {
  if (limit <= 0) {
    return { label: "N/A", tone: "neutral" };
  }

  const ratio = remaining / limit;

  if (ratio < 0.3) {
    return { label: "Low Balance", tone: "warning" };
  }

  if (ratio < 0.65) {
    return { label: "Moderate", tone: "neutral" };
  }

  return { label: "Healthy", tone: "positive" };
}

export async function getDashboardOverview(
  userId: string,
  fullName: string | null,
): Promise<DashboardOverview> {
  const prisma = getPrismaClient();
  const { currentStart, previousStart } = monthWindow();

  const [
    totalSales,
    currentMonthSales,
    previousMonthSales,
    allDesignCount,
    currentMonthDesignCount,
    previousMonthDesignCount,
    subscription,
    recentDesigns,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        sellerId: userId,
        paymentStatus: PaymentStatus.PAID,
      },
      _sum: {
        amountTotalCents: true,
      },
    }),
    prisma.order.aggregate({
      where: {
        sellerId: userId,
        paymentStatus: PaymentStatus.PAID,
        createdAt: {
          gte: currentStart,
        },
      },
      _sum: {
        amountTotalCents: true,
      },
    }),
    prisma.order.aggregate({
      where: {
        sellerId: userId,
        paymentStatus: PaymentStatus.PAID,
        createdAt: {
          gte: previousStart,
          lt: currentStart,
        },
      },
      _sum: {
        amountTotalCents: true,
      },
    }),
    prisma.design.count({
      where: { userId },
    }),
    prisma.design.count({
      where: {
        userId,
        createdAt: {
          gte: currentStart,
        },
      },
    }),
    prisma.design.count({
      where: {
        userId,
        createdAt: {
          gte: previousStart,
          lt: currentStart,
        },
      },
    }),
    prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        monthlyCredits: true,
        usageCreditsRemaining: true,
      },
    }),
    prisma.design.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        createdAt: true,
        status: true,
        thumbnailUrl: true,
        primaryImageUrl: true,
      },
    }),
  ]);

  const totalSalesCents = totalSales._sum.amountTotalCents ?? 0;
  const currentMonthSalesCents = currentMonthSales._sum.amountTotalCents ?? 0;
  const previousMonthSalesCents = previousMonthSales._sum.amountTotalCents ?? 0;

  const monthlyCredits = subscription?.monthlyCredits ?? 50;
  const remainingCredits = subscription?.usageCreditsRemaining ?? 15;

  return {
    greetingName: fullName?.trim().split(/\s+/)[0] ?? "Creator",
    totalSalesFormatted: formatCurrency(totalSalesCents),
    totalSalesTrend: percentageTrend(currentMonthSalesCents, previousMonthSalesCents),
    generatedDesignsCount: allDesignCount,
    generatedDesignsTrend: percentageTrend(currentMonthDesignCount, previousMonthDesignCount),
    creditsRemaining: remainingCredits,
    creditsLimit: monthlyCredits,
    creditsTrend: creditsTrend(remainingCredits, monthlyCredits),
    recentDesigns: recentDesigns.map((design) => ({
      id: design.id,
      title: design.title,
      generatedAt: design.createdAt,
      status: design.status === DesignStatus.PUBLISHED ? "Live" : "Draft",
      imageUrl: design.thumbnailUrl ?? design.primaryImageUrl ?? null,
    })),
  };
}
