import { NextResponse } from "next/server";

import { setAuthCookies, setLocalAuthCookie } from "@/server/auth/session-cookie";
import {
  AuthServiceError,
  type RegisterInput,
} from "@/server/services/auth/auth-types";
import { registerWithEmail } from "@/server/services/auth/auth-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RegisterPayload = {
  name?: string;
  email?: string;
  password?: string;
  fullName?: string;
  username?: string;
};

function parseInput(payload: RegisterPayload): RegisterInput {
  const email = payload.email?.trim();
  const password = payload.password ?? "";
  const fullName = payload.fullName?.trim() ?? payload.name?.trim();
  const username = payload.username?.trim();

  if (!email || !email.includes("@")) {
    throw new AuthServiceError("Please enter a valid email address.", 400);
  }

  if (password.length < 8) {
    throw new AuthServiceError("Password must be at least 8 characters.", 400);
  }

  return {
    email,
    password,
    fullName,
    username,
  };
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload;
    const input = parseInput(payload);

    const result = await registerWithEmail(input);

    const response = NextResponse.json(
      {
        user: result.user,
        requiresEmailConfirmation: result.requiresEmailConfirmation,
      },
      { status: 201 },
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

    return NextResponse.json({ error: "Unable to register user." }, { status: 500 });
  }
}
