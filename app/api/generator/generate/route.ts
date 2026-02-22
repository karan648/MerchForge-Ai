import { NextResponse } from "next/server";

import { generateDesignForUser } from "@/features/generator/server/generator-service";
import type { GenerateDesignInput } from "@/features/generator/types";
import { getSessionUserId } from "@/features/onboarding/server/session-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json(
      {
        ok: false,
        code: "UNAUTHORIZED",
        error: "Your session expired. Please sign in again.",
      },
      { status: 401 },
    );
  }

  const payload = (await request.json().catch(() => null)) as GenerateDesignInput | null;

  if (!payload) {
    return NextResponse.json(
      {
        ok: false,
        code: "VALIDATION",
        error: "Invalid request payload.",
      },
      { status: 400 },
    );
  }

  const result = await generateDesignForUser(userId, payload);

  if (!result.ok) {
    if (result.code === "VALIDATION") {
      return NextResponse.json(result, { status: 400 });
    }

    if (result.code === "UNAUTHORIZED") {
      return NextResponse.json(result, { status: 401 });
    }

    if (result.code === "INSUFFICIENT_CREDITS") {
      return NextResponse.json(result, { status: 402 });
    }

    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result, { status: 200 });
}
