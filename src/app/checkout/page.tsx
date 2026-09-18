"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CreditCard,
  User,
  Phone,
  MapPin,
  Building2,
  StickyNote,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { getCart, clearCart } from "@/lib/cart";
import type { CartItem } from "@/lib/cart";

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
  });

  useEffect(() => {
    const items = getCart();
    if (items.length === 0) {
      router.replace("/cart");
      return;
    }
    setItems(items);
  }, [router]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "حدث خطأ ما. حاول مرة أخرى.");
        setLoading(false);
        return;
      }

      clearCart();
      router.push(`/order/${data.id}`);
    } catch {
      alert("حدث خطأ ما. حاول مرة أخرى.");
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">إتمام الطلب</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-brand-50 text-brand-700 p-2 rounded-lg">
                <User size={18} />
              </span>
              معلومات الشحن
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  name="customerName"
                  required
                  value={form.customerName}
                  onChange={handleChange}
                  placeholder="أدخل اسمك الكامل"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  dir="ltr"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="06XXXXXXXX"
                  className="input-field text-left"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  العنوان الكامل *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={form.address}
                  onChange={handleChange}
                  placeholder="الشارع، رقم المنزل، الحي..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  المدينة *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={form.city}
                  onChange={handleChange}
                  placeholder="اسم المدينة"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  ملاحظات (اختياري)
                </label>
                <input
                  type="text"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="أي ملاحظات إضافية"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-brand-50 text-brand-700 p-2 rounded-lg">
                <CreditCard size={18} />
              </span>
              طريقة الدفع
            </h2>
            <div className="border-2 border-brand-600 rounded-lg p-4 bg-brand-50/50 flex items-center gap-3">
              <div className="p-2 bg-brand-600 text-white rounded-lg">
                <CreditCard size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  الدفع عند الاستلام
                </p>
                <p className="text-sm text-gray-600">
                  ستدفع نقداً عند استلام طلبك
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              ملخص الطلب
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-[10px]">لا صورة</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} × {item.price} درهم
                    </p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {(item.price * item.quantity).toFixed(0)} درهم
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{total.toFixed(2)} درهم</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>التوصيل</span>
                <span className="text-brand-600">عند الاستلام*</span>
              </div>
              <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-3">
                <span>الإجمالي</span>
                <span>{total.toFixed(2)} درهم</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  جاري إرسال الطلب...
                </>
              ) : (
                <>
                  <CreditCard size={20} />
                  تأكيد الطلب - الدفع عند الاستلام
                </>
              )}
            </button>
            <Link
              href="/cart"
              className="inline-flex items-center gap-2 text-gray-500 text-sm mt-4 hover:text-brand-600 transition-colors"
            >
              <ArrowLeft size={16} /> العودة إلى السلة
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}