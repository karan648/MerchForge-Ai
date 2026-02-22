"use server";

import { revalidatePath } from "next/cache";

import type { OnboardingActionResult } from "../types";
import {
  OnboardingMutationError,
  completeOnboardingForUser,
  saveBrandForUser,
  saveExperienceForUser,
  saveUseCaseForUser,
} from "./onboarding-mutations";
import { getSessionUserId } from "./session-user";

async function requireSessionUserId(): Promise<string | null> {
  return getSessionUserId();
}

function revalidateOnboarding() {
  revalidatePath("/onboarding");
  revalidatePath("/onboarding/use-case");
  revalidatePath("/onboarding/experience");
  revalidatePath("/onboarding/brand");
  revalidatePath("/onboarding/finished");
}

function mapMutationError(error: unknown): OnboardingActionResult {
  if (error instanceof OnboardingMutationError) {
    return { ok: false, error: error.message };
  }

  return { ok: false, error: "Unable to save onboarding progress. Please try again." };
}

export async function saveUseCaseAction(useCase: string): Promise<OnboardingActionResult> {
  const userId = await requireSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  try {
    await saveUseCaseForUser(userId, useCase);
    revalidateOnboarding();
    return { ok: true };
  } catch (error) {
    return mapMutationError(error);
  }
}

export async function saveExperienceAction(
  experienceLevel: string,
): Promise<OnboardingActionResult> {
  const userId = await requireSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  try {
    await saveExperienceForUser(userId, experienceLevel);
    revalidateOnboarding();
    return { ok: true };
  } catch (error) {
    return mapMutationError(error);
  }
}

type SaveBrandInput = {
  brandName: string;
  logoUrl: string | null;
};

export async function saveBrandAction(input: SaveBrandInput): Promise<OnboardingActionResult> {
  const userId = await requireSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  try {
    await saveBrandForUser(userId, input);
    revalidateOnboarding();
    return { ok: true };
  } catch (error) {
    return mapMutationError(error);
  }
}

export async function completeOnboardingAction(): Promise<OnboardingActionResult> {
  const userId = await requireSessionUserId();
  if (!userId) {
    return { ok: false, error: "Session expired. Please sign in again." };
  }

  try {
    await completeOnboardingForUser(userId);
    revalidatePath("/dashboard");
    revalidateOnboarding();
    return { ok: true };
  } catch (error) {
    return mapMutationError(error);
  }
}
