import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "admin_token";

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || "";
  if (!secret && process.env.NODE_ENV === "production") {
    // فشل مغلق: لا أسرار افتراضية في الإنتاج
    return new TextEncoder().encode("");
  }
  return new TextEncoder().encode(secret);
}

async function isTokenValid(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // حماية صفحات الإدارة
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const valid = await isTokenValid(token || "");

    // صفحة تسجيل الدخول
    if (pathname === "/admin/login") {
      if (valid) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // أي صفحة إدارة أخرى
    if (!valid) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};