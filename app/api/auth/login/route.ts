import { NextResponse } from "next/server";

import { setAuthCookies, setLocalAuthCookie } from "@/server/auth/session-cookie";
import { AuthServiceError, type LoginInput } from "@/server/services/auth/auth-types";
import { loginWithEmail } from "@/server/services/auth/auth-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LoginPayload = {
  email?: string;
  password?: string;
};

function parseInput(payload: LoginPayload): LoginInput {
  const email = payload.email?.trim();
  const password = payload.password ?? "";

  if (!email || !email.includes("@")) {
    throw new AuthServiceError("Please enter a valid email address.", 400);
  }

  if (!password) {
    throw new AuthServiceError("Password is required.", 400);
  }

  return { email, password };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as LoginPayload;
    const input = parseInput(payload);

    const result = await loginWithEmail(input);

    const response = NextResponse.json(
      {
        user: result.user,
      },
      { status: 200 },
    );

    if (result.session) {
      setAuthCookies(response, result.session, result.user);
    } else {
      setLocalAuthCookie(response, result.user);
    }

    return response;
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }

    if (error instanceof Error && error.message.includes("Supabase auth is not configured")) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}
