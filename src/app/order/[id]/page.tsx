import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Phone, MapPin, Package, Truck } from "lucide-react";

const statusLabels: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "تم التأكيد",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-brand-50 text-brand-700",
  CANCELLED: "bg-red-50 text-red-600",
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: { id: string };
}) {
  const orderId = parseInt(params.id);
  if (isNaN(orderId)) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  const statusIndex = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"].indexOf(
    order.status
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-brand-50 rounded-full mb-4">
          <CheckCircle2 className="text-brand-600" size={48} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          تم استلام طلبك بنجاح!
        </h1>
        <p className="text-gray-500">
          شكراً لطلبك! سيتصل بك فريقنا قريباً لتأكيد الطلب.
          <br />
          رقم الطلب: <span className="font-bold text-gray-900">#{order.id}</span>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Truck size={20} className="text-brand-600" />
          حالة الطلب
        </h2>

        <div className="flex items-center justify-between mb-4">
          {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"].map(
            (status, i) => (
              <div key={status} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                    i <= statusIndex
                      ? "bg-brand-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < statusIndex ? "✓" : i + 1}
                </div>
                <span
                  className={`text-[11px] font-medium ${
                    i <= statusIndex ? "text-brand-700" : "text-gray-400"
                  }`}
                >
                  {statusLabels[status]}
                </span>
              </div>
            )
          )}
        </div>
        <p className="text-center">
          <span
            className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${statusColors[order.status]}`}
          >
            الحالة الحالية: {statusLabels[order.status]}
          </span>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">تفاصيل الطلب</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 border-b border-gray-50"
            >
              <div className="flex items-center gap-2">
                <span className="bg-brand-50 text-brand-700 text-xs font-bold px-2 py-1 rounded">
                  {item.quantity}×
                </span>
                <span className="text-gray-800">
                  {item.product?.name || "منتج"}
                </span>
              </div>
              <span className="font-semibold text-gray-900">
                {(item.price * item.quantity).toFixed(2)} درهم
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2">
            <span className="font-bold text-gray-900">الإجمالي</span>
            <span className="font-bold text-brand-700 text-xl">
              {order.total.toFixed(2)} درهم
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          معلومات التوصيل
        </h2>
        <div className="space-y-3 text-sm">
          <p className="flex items-center gap-3 text-gray-700">
            <Package size={16} className="text-brand-600 shrink-0" />
            {order.customerName}
          </p>
          <p className="flex items-center gap-3 text-gray-700" dir="ltr">
            <Phone size={16} className="text-brand-600 shrink-0" />
            <span className="text-right">{order.phone}</span>
          </p>
          <p className="flex items-center gap-3 text-gray-700">
            <MapPin size={16} className="text-brand-600 shrink-0" />
            {order.address}، {order.city}
          </p>
          {order.notes && (
            <p className="text-gray-600 pr-9">{order.notes}</p>
          )}
        </div>
      </div>

      <div className="text-center">
        <Link href="/products" className="btn-primary">
          مواصلة التسوق
        </Link>
      </div>
    </div>
  );
}