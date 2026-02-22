import { NextResponse } from "next/server";

import { clearAuthCookies } from "@/server/auth/session-cookie";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ success: true }, { status: 200 });
  clearAuthCookies(response);
  return response;
}
