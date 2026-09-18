import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, createAdminToken, adminCookieOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني أو اسم المستخدم وكلمة المرور مطلوبان" },
        { status: 400 }
      );
    }

    const ok = await verifyAdminCredentials(identifier, password);
    if (!ok) {
      return NextResponse.json(
        { error: "المعلومات غير صحيحة" },
        { status: 401 }
      );
    }

    const token = await createAdminToken();
    const res = NextResponse.json({ success: true });
    res.cookies.set("admin_token", token, adminCookieOptions());

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطأ في تسجيل الدخول" }, { status: 500 });
  }
}