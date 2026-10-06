import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم اختيار ملف" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "صيغة الملف غير مدعومة. استخدم JPG, PNG, WEBP أو GIF" },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "حجم الملف يجب أن يكون أقل من 5 ميجابايت" },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucket = process.env.SUPABASE_BUCKET_PRODUCTS || "product-images";

    if (!supabaseUrl || !supabaseKey) {
      console.error("Supabase env vars missing");
      return NextResponse.json(
        { error: "متغيرات Supabase غير مُعدة" },
        { status: 500 }
      );
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const fileName = Date.now().toString() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
    const path = "products/" + fileName;

    const arrayBuffer = await file.arrayBuffer();
    const apiUrl = supabaseUrl.replace(/\/$/, "") + "/storage/v1/object/" + bucket + "/" + path;
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + supabaseKey,
        "Content-Type": file.type,
        "x-upsert": "false",
      },
      body: arrayBuffer,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Supabase upload failed:", res.status, txt);
      return NextResponse.json(
        { error: "فشل رفع الصورة إلى Supabase Storage" },
        { status: 500 }
      );
    }

    const publicUrl = supabaseUrl.replace(/\/$/, "") + "/storage/v1/object/public/" + bucket + "/" + path;
    return NextResponse.json({ url: publicUrl, publicId: path }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "خطأ في رفع الملف" }, { status: 500 });
  }
}
