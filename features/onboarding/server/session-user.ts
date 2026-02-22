import { cookies } from "next/headers";

import { AUTH_COOKIE_NAMES } from "@/server/auth/session-cookie";

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAMES.userId)?.value ?? null;
}
