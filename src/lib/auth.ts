import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_token";
export { COOKIE_NAME };

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      // فشل مغلق: لا أسرار افتراضية في الإنتاج
      throw new Error(`Environment variable ${name} is required in production`);
    }
    return "";
  }
  return value;
}

function getSecret(): Uint8Array {
  const secret = requireEnv("AUTH_SECRET");
  if (secret) return new TextEncoder().encode(secret);
  const fallback = requireEnv("ADMIN_PASSWORD");
  return new TextEncoder().encode(fallback);
}

/** مقارنة سلسلة ثانية بطريقة آمنة ضد هجمات التوقيت */
function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) {
    diff |= ab[i] ^ bb[i];
  }
  return diff === 0;
}

const adminEmail = () => requireEnv("ADMIN_EMAIL");
const adminUsername = () => requireEnv("ADMIN_USERNAME");
const adminPassword = () => requireEnv("ADMIN_PASSWORD");

/**
 * التحقق من بيانات الدخول (بريد إلكتروني أو اسم مستخدم + كلمة مرور)
 * بطريقة آمنة ضد هجمات التوقيت. لا يكشف أي شيء عن البيانات الصحيحة.
 * تُؤخذ القيم دائمًا من البيئة (لا تُعرض في الواجهة أبدًا).
 */
export async function verifyAdminCredentials(
  identifier: string,
  password: string
): Promise<boolean> {
  const idNormalized = (identifier || "").toLowerCase().trim();
  const emailOk = timingSafeEqualStr(
    idNormalized,
    adminEmail().toLowerCase()
  );
  const userOk = timingSafeEqualStr(
    idNormalized,
    adminUsername().toLowerCase()
  );
  const idOk = emailOk || userOk;

  if (!idOk) {
    // استهلاك وقت مماثل لإخفاء الفارق
    await timingSafeEqualStr(password, adminPassword());
    return false;
  }
  return timingSafeEqualStr(password, adminPassword());
}

/** إنشاء توكن جلسة الأدمن (JWT صالح لمدة 7 أيام) */
export async function createAdminToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

/** هل جلسة الأدمن الحالية صالحة؟ (تقرأ الكوكي httpOnly) */
export async function getAdminSession(): Promise<boolean> {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) return false;
    return verifyAdminToken(token);
  } catch {
    return false;
  }
}

/** حماية صفحات الإدارة (Server Components) */
export async function requireAdmin() {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    redirect("/admin/login");
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

/**
 * حماية API Routes الإدارية:
 * - التحقق من صلاحية الجلسة (JWT في كوكي httpOnly).
 * - فحص Origin لمنع CSRF على جميع الطرق غير الآمنة (غير GET/HEAD/OPTIONS).
 * تُعيد null عند السماح، أو NextResponse بالرفض عند المنع.
 */
export async function requireAdminApi(
  request: NextRequest
): Promise<NextResponse | null> {
  const isAuth = await getAdminSession();
  if (!isAuth) {
    return NextResponse.json(
      { error: "غير مصرح به. يرجى تسجيل الدخول" },
      { status: 401 }
    );
  }

  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const origin = request.headers.get("origin");
    if (origin) {
      const host = request.headers.get("host");
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { error: "طلب غير مصرح به (منشأ مختلف)" },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "مصدر غير صالح" },
          { status: 400 }
        );
      }
    }
  }

  return null;
}