import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: idRaw } = await context.params;
  const id = Number(idRaw);
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: { orderBy: [{ isMain: "desc" }, { position: "asc" }] },
    },
  });
  if (!product) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }
  return NextResponse.json(product);
}

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
    const {
      name,
      slug,
      description,
      price,
      oldPrice,
      imageUrl,
      stock,
      inStock,
      featured,
      isNew,
      isVisible,
      color,
      size,
      options,
      categoryId,
    } = body;

    const existing = await prisma.product.findFirst({
      where: { slug, id: { not: id } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "هذا الرابط مستخدم لمنتج آخر" },
        { status: 400 }
      );
    }

    const stockNum =
      stock !== undefined && stock !== "" ? Number(stock) : undefined;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        slug: slug !== undefined ? slug : undefined,
        description: description !== undefined ? description : undefined,
        price: price !== undefined ? Number(price) : undefined,
        oldPrice:
          oldPrice !== undefined && oldPrice !== null
            ? Number(oldPrice)
            : undefined,
        imageUrl:
          imageUrl !== undefined && imageUrl !== null ? imageUrl : undefined,
        stock:
          stockNum !== undefined && Number.isFinite(stockNum)
            ? stockNum
            : undefined,
        inStock: inStock !== undefined ? Boolean(inStock) : undefined,
        featured: featured !== undefined ? Boolean(featured) : undefined,
        isNew: isNew !== undefined ? Boolean(isNew) : undefined,
        isVisible: isVisible !== undefined ? Boolean(isVisible) : undefined,
        color: color !== undefined ? color : undefined,
        size: size !== undefined ? size : undefined,
        options: options !== undefined ? options : undefined,
        categoryId: categoryId ? Number(categoryId) : undefined,
      },
      include: { images: true },
    });

    if (imageUrl) {
      const existingImages = await prisma.productImage.findMany({
        where: { productId: id },
      });
      const alreadyExists = existingImages.some((img) => img.url === imageUrl);
      if (!alreadyExists || existingImages.length === 0) {
        await prisma.productImage.create({
          data: {
            url: imageUrl,
            isMain: existingImages.length === 0,
            productId: id,
          },
        });
      }
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطأ في تحديث المنتج" }, { status: 500 });
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

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
    }

    // Hard delete: removes the product and its images (cascade),
    // and removes its line items from past orders (cascade).
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطأ في حذف المنتج" }, { status: 500 });
  }
}