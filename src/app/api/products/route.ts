import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const visibleOnly = searchParams.get("visible") === "1";

  const products = await prisma.product.findMany({
    where: {
      ...(category ? { categoryId: Number(category) } : {}),
      ...(featured ? { featured: true } : {}),
      ...(visibleOnly ? { isVisible: true } : {}),
    },
    include: {
      category: true,
      images: { orderBy: [{ isMain: "desc" }, { position: "asc" }] },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi(request);
  if (denied) return denied;

  try {
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

    if (!name || !slug || !price || !categoryId) {
      return NextResponse.json(
        { error: "الاسم، السعر، والفئة مطلوبة" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "هذا الرابط موجود بالفعل" },
        { status: 400 }
      );
    }

    const stockNum =
      stock !== undefined && stock !== "" ? Number(stock) : 0;
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: description || null,
        price: Number(price),
        oldPrice: oldPrice ? Number(oldPrice) : null,
        imageUrl: imageUrl || null,
        stock: Number.isFinite(stockNum) ? stockNum : 0,
        inStock:
          inStock !== undefined
            ? Boolean(inStock)
            : stockNum > 0,
        featured: Boolean(featured),
        isNew: Boolean(isNew),
        isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
        color: color || null,
        size: size || null,
        options: options || null,
        categoryId: Number(categoryId),
      },
      include: { images: true },
    });

    if (imageUrl) {
      await prisma.productImage.create({
        data: { url: imageUrl, isMain: true, productId: product.id },
      });
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطأ في إنشاء المنتج" }, { status: 500 });
  }
}