import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi(request);
  if (denied) return denied;

  try {
    const { id: idRaw } = await context.params;
    const id = parseInt(idRaw);
    if (isNaN(id)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
    }

    const body = await request.json();
    const { name, slug, imageUrl, isVisible } = body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        slug: slug !== undefined ? slug : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطأ في تحديث الفئة" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdminApi(request);
  if (denied) return denied;

  try {
    const { id: idRaw } = await context.params;
    const id = parseInt(idRaw);
    if (isNaN(id)) {
      return NextResponse.json({ error: "معرّف غير صالح" }, { status: 400 });
    }

    const productCount = await prisma.product.count({
      where: { categoryId: id, isVisible: true },
    });
    if (productCount > 0) {
      return NextResponse.json(
        { error: "لا يمكن حذف فئة تحتوي على منتجات" },
        { status: 400 }
      );
    }

    await prisma.category.update({
      where: { id },
      data: { isVisible: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطأ في إخفاء الفئة" }, { status: 500 });
  }
}