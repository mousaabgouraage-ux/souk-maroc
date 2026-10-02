import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/auth";
import { sendOrderToRapColis } from "@/lib/rapcolis";

/**
 * إرسال طلب إلى RapColis يدوياً من لوحة الأدمن.
 * - محمي بـ requireAdminApi.
 * - يمنع إرسال نفس الطلب مرتين (deliverySent).
 * - لا يُسرب أي أسرار أو عنوان الـ Webhook في الاستجابة.
 */
export async function POST(
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

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    if (order.deliverySent) {
      return NextResponse.json(
        { error: "تم إرسال هذه الشحنة إلى RapColis من قبل" },
        { status: 400 }
      );
    }

    const result = await sendOrderToRapColis(order);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || "فشل الإرسال إلى RapColis" },
        { status: 502 }
      );
    }

    await prisma.order.update({
      where: { id },
      data: { deliverySent: true, deliveryStatus: "SENT" },
    });

    return NextResponse.json({ ok: true, id: order.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "خطأ في الإرسال إلى RapColis" },
      { status: 500 }
    );
  }
}