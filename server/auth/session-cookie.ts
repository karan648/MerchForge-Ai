import type { NextResponse } from "next/server";
import type { Session } from "@supabase/supabase-js";

import type { PublicUser } from "@/server/services/auth/auth-types";

export const AUTH_COOKIE_NAMES = {
  accessToken: "mf_access_token",
  refreshToken: "mf_refresh_token",
  userId: "mf_user_id",
} as const;

const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(response: NextResponse, session: Session, user: PublicUser) {
  const expires = new Date(session.expires_at ? session.expires_at * 1000 : Date.now() + 1000 * 60 * 60 * 24);

  response.cookies.set(AUTH_COOKIE_NAMES.accessToken, session.access_token, {
    ...baseCookieOptions,
    expires,
  });

  response.cookies.set(AUTH_COOKIE_NAMES.refreshToken, session.refresh_token, {
    ...baseCookieOptions,
    expires,
  });

  response.cookies.set(AUTH_COOKIE_NAMES.userId, user.id, {
    ...baseCookieOptions,
    expires,
  });
}

export function setLocalAuthCookie(response: NextResponse, user: PublicUser) {
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);

  response.cookies.set(AUTH_COOKIE_NAMES.userId, user.id, {
    ...baseCookieOptions,
    expires,
  });
}

export function clearAuthCookies(response: NextResponse) {
  const expires = new Date(0);

  response.cookies.set(AUTH_COOKIE_NAMES.accessToken, "", {
    ...baseCookieOptions,
    expires,
  });

  response.cookies.set(AUTH_COOKIE_NAMES.refreshToken, "", {
    ...baseCookieOptions,
    expires,
  });

  response.cookies.set(AUTH_COOKIE_NAMES.userId, "", {
    ...baseCookieOptions,
    expires,
  });
}
