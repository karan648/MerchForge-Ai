import { NextResponse } from "next/server";

import {
  OnboardingMutationError,
  completeOnboardingForUser,
} from "@/features/onboarding/server/onboarding-mutations";
import { getSessionUserId } from "@/features/onboarding/server/session-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
  }

  try {
    await completeOnboardingForUser(userId);
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof OnboardingMutationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ error: "Unable to complete onboarding." }, { status: 500 });
  }
}
