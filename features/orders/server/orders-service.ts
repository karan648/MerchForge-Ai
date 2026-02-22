import { OrderStatus, PaymentStatus } from "@prisma/client";

import { getPrismaClient } from "@/server/db/prisma";

type OrderTone = "success" | "processing" | "warning" | "neutral";

export type OrdersOverview = {
  totals: {
    orders: number;
    revenueCents: number;
    delivered: number;
    pending: number;
  };
  rows: Array<{
    id: string;
    productTitle: string;
    customerName: string;
    statusLabel: string;
    statusTone: OrderTone;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    amountCents: number;
    createdAtIso: string;
  }>;
  isDemoData: boolean;
};

const FALLBACK_ROWS: OrdersOverview["rows"] = [
  {
    id: "MF-90210",
    productTitle: "Neon Cyberpunk Hoodie",
    customerName: "Sarah Jenkins",
    statusLabel: "Delivered",
    statusTone: "success",
    orderStatus: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    amountCents: 12400,
    createdAtIso: "2025-10-24T10:00:00.000Z",
  },
  {
    id: "MF-90211",
    productTitle: "Synthwave Retro Tee",
    customerName: "Michael Chen",
    statusLabel: "Shipped",
    statusTone: "processing",
    orderStatus: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.PAID,
    amountCents: 4500,
    createdAtIso: "2025-10-24T09:00:00.000Z",
  },
  {
    id: "MF-90215",
    productTitle: "AI Mesh Sneakers",
    customerName: "David Miller",
    statusLabel: "Processing",
    statusTone: "warning",
    orderStatus: OrderStatus.IN_PRODUCTION,
    paymentStatus: PaymentStatus.PENDING,
    amountCents: 18999,
    createdAtIso: "2025-10-23T15:30:00.000Z",
  },
];

function mapOrderStatus(
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
): { label: string; tone: OrderTone } {
  if (orderStatus === OrderStatus.DELIVERED) {
    return { label: "Delivered", tone: "success" };
  }

  if (orderStatus === OrderStatus.SHIPPED || orderStatus === OrderStatus.IN_PRODUCTION) {
    return { label: "Shipped", tone: "processing" };
  }

  if (orderStatus === OrderStatus.PENDING || paymentStatus === PaymentStatus.PENDING) {
    return { label: "Processing", tone: "warning" };
  }

  if (orderStatus === OrderStatus.CANCELED || paymentStatus === PaymentStatus.REFUNDED) {
    return { label: "Canceled", tone: "neutral" };
  }

  return { label: "Paid", tone: "processing" };
}

function resolveCustomerName(input: { fullName: string | null; email: string | null } | null): string {
  if (!input) {
    return "Guest checkout";
  }

  if (input.fullName?.trim()) {
    return input.fullName.trim();
  }

  return input.email ?? "Guest checkout";
}

export async function getOrdersOverview(userId: string): Promise<OrdersOverview> {
  const prisma = getPrismaClient();

  const [orders, revenue] = await Promise.all([
    prisma.order.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        amountTotalCents: true,
        status: true,
        paymentStatus: true,
        buyer: {
          select: {
            fullName: true,
            email: true,
          },
        },
        storeProduct: {
          select: {
            title: true,
          },
        },
        templatePurchase: {
          select: {
            template: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    }),
    prisma.order.aggregate({
      where: {
        sellerId: userId,
        paymentStatus: PaymentStatus.PAID,
      },
      _sum: {
        amountTotalCents: true,
      },
    }),
  ]);

  const mappedRows = orders.map((order) => {
    const orderState = mapOrderStatus(order.status, order.paymentStatus);
    const productTitle =
      order.storeProduct?.title ?? order.templatePurchase?.template?.title ?? "Custom product";

    return {
      id: order.id,
      productTitle,
      customerName: resolveCustomerName(order.buyer),
      statusLabel: orderState.label,
      statusTone: orderState.tone,
      orderStatus: order.status,
      paymentStatus: order.paymentStatus,
      amountCents: order.amountTotalCents,
      createdAtIso: order.createdAt.toISOString(),
    };
  });

  const deliveredCount = orders.filter((order) => order.status === OrderStatus.DELIVERED).length;
  const pendingCount = orders.filter(
    (order) =>
      order.status === OrderStatus.PENDING ||
      order.status === OrderStatus.FULFILLMENT ||
      order.status === OrderStatus.IN_PRODUCTION,
  ).length;

  const rows = mappedRows.length > 0 ? mappedRows : FALLBACK_ROWS;

  return {
    totals: {
      orders: orders.length,
      revenueCents: revenue._sum.amountTotalCents ?? 0,
      delivered: deliveredCount,
      pending: pendingCount,
    },
    rows,
    isDemoData: mappedRows.length === 0,
  };
}
