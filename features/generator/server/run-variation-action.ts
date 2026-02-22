"use server";

import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/features/onboarding/server/session-user";

import type {
  GeneratorVariationActionInput,
  GeneratorVariationActionResult,
} from "../types";
import { runVariationActionForUser } from "./generator-service";

function revalidateAfterSuccess(action: GeneratorVariationActionInput["action"]) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/generator");
  revalidatePath("/dashboard/designs");

  if (action === "CREATE_MOCKUP") {
    revalidatePath("/dashboard/mockups");
  }

  if (action === "CREATE_PRODUCT") {
    revalidatePath("/dashboard/storefront");
  }
}

export async function runVariationAction(
  input: GeneratorVariationActionInput,
): Promise<GeneratorVariationActionResult> {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      error: "Your session expired. Please sign in again.",
    };
  }

  const result = await runVariationActionForUser(userId, input);

  if (result.ok) {
    revalidateAfterSuccess(input.action);
  }

  return result;
}
