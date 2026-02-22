import { NextResponse } from "next/server";

import {
  OnboardingMutationError,
  saveExperienceForUser,
} from "@/features/onboarding/server/onboarding-mutations";
import { getSessionUserId } from "@/features/onboarding/server/session-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestPayload = {
  experienceLevel?: string;
};

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => null)) as RequestPayload | null;

  try {
    await saveExperienceForUser(userId, payload?.experienceLevel ?? "");
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof OnboardingMutationError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    return NextResponse.json({ error: "Unable to save experience level." }, { status: 500 });
  }
}
