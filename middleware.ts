/**
 * Edge middleware — the first authorization gate.
 * It only reads the JWT: no database access is possible in the Edge runtime.
 * Pages still call `requireRole()` because a token can be valid while the
 * account behind it has since been deactivated.
 */
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/jwt";

/** Route prefix -> roles permitted to enter it. */
const GUARDED: Array<{ prefix: string; roles: string[] }> = [
  { prefix: "/dashboard/admin", roles: ["ADMIN"] },
  { prefix: "/dashboard/agent", roles: ["AGENT"] },
  { prefix: "/favorites", roles: ["BUYER", "AGENT", "ADMIN"] },
];

const AUTH_PAGES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  // Signed-in users have no reason to see the login form.
  if (session && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL(dashboardFor(session.role as string), request.url));
  }

  const rule = GUARDED.find((r) => pathname.startsWith(r.prefix));
  if (!rule) return NextResponse.next();

  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname); // bounce back after sign-in
    return NextResponse.redirect(login);
  }

  if (!rule.roles.includes(session.role as string)) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}

function dashboardFor(role: string) {
  if (role === "ADMIN") return "/dashboard/admin";
  if (role === "AGENT") return "/dashboard/agent";
  return "/properties";
}

export const config = {
  matcher: ["/dashboard/:path*", "/favorites/:path*", "/login", "/register"],
};
