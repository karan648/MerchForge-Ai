"use server";

import { OrderStatus, PaymentStatus, TemplateStatus } from "@prisma/client";

import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/features/onboarding/server/session-user";
import { getPrismaClient } from "@/server/db/prisma";

type PurchaseTemplateActionResult =
  | {
      ok: true;
      templateId: string;
      orderId: string;
      alreadyOwned: boolean;
      message: string;
    }
  | {
      ok: false;
      error: string;
    };

export async function purchaseTemplateAction(templateId: string): Promise<PurchaseTemplateActionResult> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  const normalizedTemplateId = templateId.trim();
  if (!normalizedTemplateId) {
    return { ok: false, error: "Template identifier is required." };
  }

  const prisma = getPrismaClient();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const template = await tx.template.findFirst({
        where: {
          id: normalizedTemplateId,
          status: TemplateStatus.PUBLISHED,
        },
        select: {
          id: true,
          title: true,
          creatorId: true,
          priceCents: true,
          currency: true,
          fileUrl: true,
          creator: {
            select: {
              username: true,
            },
          },
        },
      });

      if (!template) {
        throw new Error("TEMPLATE_NOT_FOUND");
      }

      if (template.creatorId === userId) {
        throw new Error("OWN_TEMPLATE");
      }

      const existingPurchase = await tx.templatePurchase.findFirst({
        where: {
          templateId: template.id,
          buyerId: userId,
        },
        select: {
          orderId: true,
        },
      });

      if (existingPurchase?.orderId) {
        return {
          templateId: template.id,
          orderId: existingPurchase.orderId,
          alreadyOwned: true,
          message: "Template already in your library.",
          creatorUsername: template.creator.username,
        };
      }

      const order = await tx.order.create({
        data: {
          buyerId: userId,
          sellerId: template.creatorId,
          status: OrderStatus.PAID,
          paymentStatus: PaymentStatus.PAID,
          amountSubtotalCents: template.priceCents,
          amountTotalCents: template.priceCents,
          currency: template.currency,
          metadata: {
            source: "template_marketplace",
            templateId: template.id,
            templateTitle: template.title,
          },
        },
        select: {
          id: true,
        },
      });

      await tx.templatePurchase.create({
        data: {
          templateId: template.id,
          buyerId: userId,
          orderId: order.id,
          amountCents: template.priceCents,
          currency: template.currency,
          downloadUrl: template.fileUrl,
          metadata: {
            source: "marketplace",
          },
        },
      });

      await tx.template.update({
        where: { id: template.id },
        data: {
          downloadsCount: {
            increment: 1,
          },
        },
      });

      return {
        templateId: template.id,
        orderId: order.id,
        alreadyOwned: false,
        message: "Template purchased successfully.",
        creatorUsername: template.creator.username,
      };
    });

    revalidatePath("/dashboard/templates");
    revalidatePath("/dashboard/orders");
    revalidatePath(`/store/${result.creatorUsername}`);

    return {
      ok: true,
      templateId: result.templateId,
      orderId: result.orderId,
      alreadyOwned: result.alreadyOwned,
      message: result.message,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "TEMPLATE_NOT_FOUND") {
        return { ok: false, error: "Template is no longer available." };
      }

      if (error.message === "OWN_TEMPLATE") {
        return { ok: false, error: "You already own this template as the creator." };
      }
    }

    return { ok: false, error: "Unable to complete purchase right now. Please try again." };
  }
}
