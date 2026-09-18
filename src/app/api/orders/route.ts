import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { CartItem } from "@/lib/cart";
import { getStoreSettings, getDeliveryFeeForCity } from "@/lib/settings";

export async function GET(request: NextRequest) {
  const orders = await prisma.order.findMany({
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerName, phone, address, city, notes, paymentMethod, items } =
      body;

    if (!customerName || !phone || !address || !city || !items?.length) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة مع منتج واحد على الأقل" },
        { status: 400 }
      );
    }

    const itemDetails: { id: number; name: string; price: number }[] = [];
    for (const item of items as CartItem[]) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });
      if (product) {
        itemDetails.push({
          id: product.id,
          name: product.name,
          price: product.price,
        });
      }
    }

    if (itemDetails.length === 0) {
      return NextResponse.json(
        { error: "لا توجد منتجات صالحة في الطلب" },
        { status: 400 }
      );
    }

    const settings = await getStoreSettings();
    const deliveryFee = getDeliveryFeeForCity(settings, city);

    const subtotal = itemDetails.reduce(
      (sum, { id, price }) => {
        const qty =
          (items as CartItem[]).find((i) => i.id === id)?.quantity || 1;
        return sum + price * qty;
      },
      0
    );

    const total = subtotal + deliveryFee;

    const order = await prisma.order.create({
      data: {
        customerName,
        phone,
        address,
        city,
        notes: notes || null,
        status: "PENDING",
        total,
        deliveryFee,
        paymentMethod: paymentMethod || "COD",
        items: {
          create: itemDetails.map(({ id, price }) => ({
            productId: id,
            price,
            quantity:
              (items as CartItem[]).find((i) => i.id === id)?.quantity || 1,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "خطأ في إنشاء الطلب" }, { status: 500 });
  }
}