"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  MapPin,
  Phone,
  Package,
  Eye,
} from "lucide-react";

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product?: { name: string };
}

interface Order {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
  trackingCode?: string | null;
  deliveryRef?: string | null;
  deliveryStatus?: string | null;
}

const statusOptions = [
  { value: "PENDING", label: "قيد الانتظار", icon: Clock, color: "bg-yellow-50 text-yellow-700" },
  { value: "CONFIRMED", label: "تم التأكيد", icon: CheckCircle2, color: "bg-blue-50 text-blue-700" },
  { value: "SHIPPED", label: "شحن", icon: Truck, color: "bg-purple-50 text-purple-700" },
  { value: "DELIVERED", label: "تم التوصيل", icon: CheckCircle2, color: "bg-brand-50 text-brand-700" },
  { value: "CANCELLED", label: "ملغي", icon: XCircle, color: "bg-red-50 text-red-600" },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [rapColisNotice, setRapColisNotice] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (orderId: number, status: string) => {
    setUpdatingId(orderId);
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } else {
      alert("خطأ في تحديث الحالة");
    }
    setUpdatingId(null);
  };

  const getStatusConfig = (status: string) =>
    statusOptions.find((s) => s.value === status) || statusOptions[0];

  const rapColisPending = () =>
    setRapColisNotice(
      "بانتظار تفعيل RapColis: سنفعّل الإرسال فور استلام وثائق الـ API من الدعم."
    );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">الطلبات</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-600" size={32} />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <Package className="text-gray-300 mx-auto" size={48} />
          <p className="text-gray-500 mt-4">لا توجد طلبات بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusCfg = getStatusConfig(order.status);
            const StatusIcon = statusCfg.icon;
            const isExpanded = expandedId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : order.id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${statusCfg.color}`}
                    >
                      <StatusIcon size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        طلب #{order.id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customerName} - {order.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left hidden sm:block">
                      <p className="font-bold text-gray-900">
                        {order.total.toFixed(0)} درهم
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("ar-MA")}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={18} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t p-4 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          معلومات العميل
                        </h4>
                        <p className="flex items-center gap-2 text-sm text-gray-700">
                          <Package size={14} className="text-brand-600" />
                          {order.customerName}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-gray-700" dir="ltr">
                          <Phone size={14} className="text-brand-600" />
                          <span className="text-right">{order.phone}</span>
                        </p>
                        <p className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin size={14} className="text-brand-600" />
                          {order.address}، {order.city}
                        </p>
                        {order.notes && (
                          <p className="text-sm text-gray-600 pr-6">
                            ملاحظات: {order.notes}
                          </p>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="font-semibold text-gray-900 text-sm mb-2">
                          المنتجات ({order.items.length})
                        </h4>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-gray-700">
                                {item.product?.name || "منتج"} × {item.quantity}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {(item.price * item.quantity).toFixed(0)} درهم
                              </span>
                            </div>
                          ))}
                          <div className="border-t pt-2 flex justify-between text-sm">
                            <span className="font-bold text-gray-900">
                              الإجمالي
                            </span>
                            <span className="font-bold text-brand-700">
                              {order.total.toFixed(0)} درهم
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm mb-2">
                        تحديث الحالة
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => updateStatus(order.id, s.value)}
                            disabled={updatingId === order.id}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              order.status === s.value
                                ? s.color + " ring-2 ring-offset-1 ring-current"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {updatingId === order.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              s.label
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          التوصيل عبر RapColis
                        </h4>
                        {rapColisNotice && (
                          <span className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 max-w-[60%] text-left">
                            {rapColisNotice}
                          </span>
                        )}
                      </div>

                      {order.trackingCode ? (
                        <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                          <p className="flex items-center gap-2 text-gray-700">
                            <Package size={14} className="text-brand-600" />
                            رقم التتبع:
                            <span
                              className="font-semibold text-gray-900"
                              dir="ltr"
                            >
                              {order.trackingCode}
                            </span>
                          </p>
                          {order.deliveryRef && (
                            <p className="text-gray-500 pr-6">
                              مرجع الشركة: {order.deliveryRef}
                            </p>
                          )}
                          {order.deliveryStatus && (
                            <p className="flex items-center gap-2 text-gray-700">
                              <Truck size={14} className="text-brand-600" />
                              حالة التوصيل:{" "}
                              <span className="text-gray-900">
                                {order.deliveryStatus}
                              </span>
                            </p>
                          )}
                          <button
                            onClick={rapColisPending}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-600 hover:bg-gray-200"
                          >
                            تحديث حالة الشحنة
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-500">
                            لم تُرسل هذه الشحنة إلى RapColis بعد.
                          </p>
                          <button
                            onClick={rapColisPending}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-brand-600 text-white hover:bg-brand-700"
                          >
                            إرسال إلى RapColis
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}