"use server";

import { OrderStatus, PaymentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/features/onboarding/server/session-user";
import { getPrismaClient } from "@/server/db/prisma";

type StatusTone = "success" | "processing" | "warning" | "neutral";
type OrderRowAction = "MARK_SHIPPED" | "MARK_DELIVERED" | "CANCEL_ORDER";

type UpdateOrderStatusResult =
  | {
      ok: true;
      orderId: string;
      orderStatus: OrderStatus;
      paymentStatus: PaymentStatus;
      statusLabel: string;
      statusTone: StatusTone;
      message: string;
    }
  | {
      ok: false;
      error: string;
    };

function mapOrderStatus(
  orderStatus: OrderStatus,
  paymentStatus: PaymentStatus,
): { label: string; tone: StatusTone } {
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

function resolveNextState(
  currentOrderStatus: OrderStatus,
  currentPaymentStatus: PaymentStatus,
  action: OrderRowAction,
): { orderStatus: OrderStatus; paymentStatus: PaymentStatus; message: string } {
  if (action === "MARK_SHIPPED") {
    const shippableStates: OrderStatus[] = [
      OrderStatus.PENDING,
      OrderStatus.PAID,
      OrderStatus.FULFILLMENT,
      OrderStatus.IN_PRODUCTION,
    ];

    if (!shippableStates.includes(currentOrderStatus)) {
      throw new Error("INVALID_TRANSITION");
    }

    return {
      orderStatus: OrderStatus.SHIPPED,
      paymentStatus: currentPaymentStatus,
      message: "Order marked as shipped.",
    };
  }

  if (action === "MARK_DELIVERED") {
    if (currentOrderStatus !== OrderStatus.SHIPPED) {
      throw new Error("INVALID_TRANSITION");
    }

    return {
      orderStatus: OrderStatus.DELIVERED,
      paymentStatus: currentPaymentStatus,
      message: "Order marked as delivered.",
    };
  }

  const lockedStates: OrderStatus[] = [
    OrderStatus.DELIVERED,
    OrderStatus.CANCELED,
    OrderStatus.REFUNDED,
  ];

  if (lockedStates.includes(currentOrderStatus)) {
    throw new Error("INVALID_TRANSITION");
  }

  return {
    orderStatus: OrderStatus.CANCELED,
    paymentStatus:
      currentPaymentStatus === PaymentStatus.PAID
        ? PaymentStatus.REFUNDED
        : currentPaymentStatus,
    message: "Order canceled successfully.",
  };
}

export async function updateOrderStatusAction(input: {
  orderId: string;
  action: OrderRowAction;
}): Promise<UpdateOrderStatusResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  const orderId = input.orderId.trim();
  if (!orderId) {
    return { ok: false, error: "Order identifier is required." };
  }

  const prisma = getPrismaClient();

  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        sellerId: userId,
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
      },
    });

    if (!order) {
      return { ok: false, error: "Order not found." };
    }

    const next = resolveNextState(order.status, order.paymentStatus, input.action);

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: next.orderStatus,
        paymentStatus: next.paymentStatus,
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
      },
    });

    const mapped = mapOrderStatus(updated.status, updated.paymentStatus);

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard");

    return {
      ok: true,
      orderId: updated.id,
      orderStatus: updated.status,
      paymentStatus: updated.paymentStatus,
      statusLabel: mapped.label,
      statusTone: mapped.tone,
      message: next.message,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_TRANSITION") {
      return { ok: false, error: "This status change is not allowed for the current order state." };
    }

    return { ok: false, error: "Unable to update order status right now." };
  }
}
