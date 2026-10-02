export interface RapColisOrderItem {
  productId: number;
  quantity: number;
  price: number;
  product?: { name: string | null } | null;
}

export interface RapColisOrder {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string | null;
  status: string;
  total: number;
  deliveryFee: number;
  paymentMethod: string;
  items?: RapColisOrderItem[];
}

export interface RapColisSendResult {
  ok: boolean;
  status?: number;
  error?: string;
  data?: unknown;
}

function webhookUrl(): string {
  return (process.env.RAPCOLIS_WEBHOOK_URL || "").trim();
}

export function isRapColisConfigured(): boolean {
  return Boolean(webhookUrl());
}

/** بناء الحمولة JSON المرسلة إلى RapColis (بيانات الطلب فقط، دون أي أسرار). */
function buildPayload(order: RapColisOrder): Record<string, unknown> {
  return {
    event: "order_created",
    source: "SaMu-MarKet",
    order: {
      id: order.id,
      customerName: order.customerName,
      phone: order.phone,
      address: order.address,
      city: order.city,
      notes: order.notes || "",
      total: order.total,
      deliveryFee: order.deliveryFee,
      paymentMethod: order.paymentMethod,
      status: order.status,
      items: (order.items || []).map((item) => ({
        productId: item.productId,
        productName: item.product?.name || null,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
      })),
    },
  };
}

/**
 * إرسال طلب إلى RapColis عبر Webhook (POST JSON خادمي فقط).
 * - تُقرأ الأسرار من البيئة فقط، ولا تُسجَّل ولا تُرسل في الحمولة.
 * - بدون RAPCOLIS_WEBHOOK_URL تعيد ok=false دون أي شبكة.
 * - لا تُخفق أبداً على مستوى الرمي (يُمسك داخلياً).
 */
export async function sendOrderToRapColis(
  order: RapColisOrder
): Promise<RapColisSendResult> {
  const url = webhookUrl();
  if (!url) {
    return { ok: false, error: "متغير RAPCOLIS_WEBHOOK_URL غير معرّف" };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const apiKey = (process.env.RAPCOLIS_API_KEY || "").trim();
  const apiSecret = (process.env.RAPCOLIS_API_SECRET || "").trim();
  if (apiKey) headers["X-Api-Key"] = apiKey;
  if (apiSecret) headers["X-Api-Secret"] = apiSecret;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(buildPayload(order)),
      signal: AbortSignal.timeout(15000),
    });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text || null;
    }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: `فشل إرسال الشحنة إلى RapColis (${res.status})`,
      };
    }
    return { ok: true, status: res.status, data };
  } catch (error) {
    console.error("RapColis webhook error:", error);
    return { ok: false, error: "تعذّر الاتصال بخدمة RapColis" };
  }
}