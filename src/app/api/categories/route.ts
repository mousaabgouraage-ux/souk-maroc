import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const visibleOnly = searchParams.get("visible") === "1";

  const categories = await prisma.category.findMany({
    where: visibleOnly ? { isVisible: true } : {},
    include: {
      _count: { select: { products: { where: { isVisible: true } } } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi(request);
  if (denied) return denied;

  try {
    const body = await request.json();
    const { name, slug, imageUrl, isVisible } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "الاسم والرابط مطلوبان" },
        { status: 400 }
      );
    }

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "هذا الرابط موجود بالفعل" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        imageUrl: imageUrl || null,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
      },
    });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطأ في إنشاء الفئة" }, { status: 500 });
  }
}