"use server";

import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/features/onboarding/server/session-user";

import { createCheckoutOrder, type CreateCheckoutOrderInput } from "./checkout-service";

export type CheckoutActionResult =
  | {
      ok: true;
      message: string;
      orderId: string;
      redirectPath: string;
    }
  | {
      ok: false;
      error: string;
    };

type CreateCheckoutOrderActionInput = Omit<CreateCheckoutOrderInput, "buyerId">;

export async function createCheckoutOrderAction(
  input: CreateCheckoutOrderActionInput,
): Promise<CheckoutActionResult> {
  try {
    const userId = await getSessionUserId();

    const order = await createCheckoutOrder({
      ...input,
      buyerId: userId ?? undefined,
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/analytics");

    return {
      ok: true,
      message: "Order placed successfully.",
      orderId: order.orderId,
      redirectPath: `/checkout/success?order=${encodeURIComponent(order.orderId)}`,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PRODUCT_NOT_FOUND") {
        return { ok: false, error: "Product is no longer available." };
      }

      if (error.message === "VALIDATION_NAME") {
        return { ok: false, error: "Name must be at least 2 characters." };
      }

      if (error.message === "VALIDATION_EMAIL") {
        return { ok: false, error: "Please enter a valid email address." };
      }

      if (error.message === "VALIDATION_SHIPPING") {
        return { ok: false, error: "Please complete your shipping details." };
      }
    }

    return { ok: false, error: "Unable to place order right now." };
  }
}
