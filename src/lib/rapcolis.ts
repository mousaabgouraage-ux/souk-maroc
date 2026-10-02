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
 * - مخطط RapColis: رمز العميل يُرسل كمعامل query داخل URL (?token=...)،
 *   والسر في header X-Webhook-Secret.
 * - بدون RAPCOLIS_WEBHOOK_URL تعيد ok=false دون أي شبكة.
 * - لا تُخفق أبداً على مستوى الرمي (يُمسك داخلياً).
 */
export async function sendOrderToRapColis(
  order: RapColisOrder
): Promise<RapColisSendResult> {
  const baseUrl = webhookUrl();
  if (!baseUrl) {
    return { ok: false, error: "متغير RAPCOLIS_WEBHOOK_URL غير معرّف" };
  }

  // رمز العميل يُحقن في URL نفسه إن لم يكن موجوداً (نمط RapColis)
  const tokenClient = (process.env.RAPCOLIS_TOKEN_CLIENT || "").trim();

  try {
    const targetUrl = new URL(baseUrl);
    if (tokenClient && !targetUrl.searchParams.has("token")) {
      targetUrl.searchParams.set("token", tokenClient);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const webhookSecret = (process.env.RAPCOLIS_WEBHOOK_SECRET || "").trim();
    const apiKey = (process.env.RAPCOLIS_API_KEY || "").trim();
    const apiSecret = (process.env.RAPCOLIS_API_SECRET || "").trim();
    if (webhookSecret) headers["X-Webhook-Secret"] = webhookSecret;
    if (apiKey) headers["X-Api-Key"] = apiKey;
    if (apiSecret) headers["X-Api-Secret"] = apiSecret;

    const res = await fetch(targetUrl.toString(), {
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
      const snippet = (typeof data === "string" ? data : JSON.stringify(data))
        .replace(/[\r\n\t]+/g, " ")
        .slice(0, 250);
      const missing: string[] = [];
      if (!process.env.RAPCOLIS_TOKEN_CLIENT?.trim())
        missing.push("RAPCOLIS_TOKEN_CLIENT");
      if (!process.env.RAPCOLIS_WEBHOOK_SECRET?.trim())
        missing.push("RAPCOLIS_WEBHOOK_SECRET");
      const details = [missing.length ? `ناقص: ${missing.join("، ")}` : ""]
        .filter(Boolean)
        .concat(snippet ? `رد الخادم: ${snippet}` : [])
        .join(" — ");
      return {
        ok: false,
        status: res.status,
        error: `فشل إرسال الشحنة إلى RapColis (${res.status})${
          details ? ` — ${details}` : ""
        }`,
      };
    }
    return { ok: true, status: res.status, data };
  } catch (error) {
    console.error("RapColis webhook error:", error);
    return { ok: false, error: "تعذّر الاتصال بخدمة RapColis" };
  }
}