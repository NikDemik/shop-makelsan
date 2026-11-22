import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "makelsan_session";

const secret = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-secret-fallback");

export const config = {
  matcher: ["/account/:path*", "/admin/:path*", "/checkout"],
};

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const token = req.cookies.get(COOKIE_NAME)?.value;

  let role: string | null = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret());
      role = (payload as { role?: string }).role ?? null;
    } catch {
      role = null;
    }
  }

  if (!role) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = `next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    const url = req.nextUrl.clone();
    url.pathname = "/account";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
