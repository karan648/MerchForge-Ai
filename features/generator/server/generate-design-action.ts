"use server";

import { revalidatePath } from "next/cache";

import { getSessionUserId } from "@/features/onboarding/server/session-user";

import type { GenerateDesignInput, GenerateDesignResult } from "../types";
import { generateDesignForUser } from "./generator-service";

export async function generateDesignAction(input: GenerateDesignInput): Promise<GenerateDesignResult> {
  const userId = await getSessionUserId();

  if (!userId) {
    return {
      ok: false,
      code: "UNAUTHORIZED",
      error: "Your session expired. Please sign in again.",
    };
  }

  const result = await generateDesignForUser(userId, input);

  if (result.ok) {
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/generator");
    revalidatePath("/dashboard/designs");
    revalidatePath("/dashboard/billing");
  }

  return result;
}
