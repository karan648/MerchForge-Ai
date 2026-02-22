import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const USER_ID_COOKIE = "mf_user_id";

function isProtectedPath(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding");
}

function isGuestPath(pathname: string): boolean {
  return pathname === "/login" || pathname === "/register";
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(USER_ID_COOKIE)?.value);

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = `?next=${encodeURIComponent(`${pathname}${search}`)}`;
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestPath(pathname) && hasSession) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/login", "/register"],
};
