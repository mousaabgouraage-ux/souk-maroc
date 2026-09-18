"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getCart,
  removeFromCart,
  updateQuantity,
  cartTotal,
} from "@/lib/cart";
import type { CartItem } from "@/lib/cart";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const load = () => setItems(getCart());
    load();
    window.addEventListener("cart-updated", load);
    return () => window.removeEventListener("cart-updated", load);
  }, []);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="p-6 bg-brand-50 w-fit mx-auto rounded-full mb-6">
          <ShoppingBag className="text-brand-600" size={48} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          سلتك فارغة
        </h1>
        <p className="text-gray-500 mb-8">
          تصفح المنتجات وأضف ما يعجبك إلى السلة
        </p>
        <Link href="/products" className="btn-primary">
          تسوق الآن
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">سلة التسوق</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm p-4 flex gap-4"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-50 shrink-0"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <span className="text-xs">لا صورة</span>
                  </div>
                )}
              </Link>

              <div className="flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-semibold text-gray-900 hover:text-brand-600"
                    >
                      {item.name}
                    </Link>
                    <p className="text-brand-700 font-bold mt-1">
                      {item.price} <span className="text-xs">درهم</span>
                    </p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                    aria-label="حذف"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-gray-600 hover:text-brand-600"
                      aria-label="زيادة"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="w-10 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-gray-600 hover:text-brand-600"
                      aria-label="نقصان"
                    >
                      <Minus size={16} />
                    </button>
                  </div>
                  <span className="font-bold text-gray-900">
                    {(item.price * item.quantity).toFixed(2)} درهم
                  </span>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-brand-600 font-medium hover:underline"
          >
            <ArrowLeft size={16} /> مواصلة التسوق
          </Link>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ملخص الطلب</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>عدد المنتجات</span>
                <span>{items.reduce((s, i) => s + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{total.toFixed(2)} درهم</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>التوصيل</span>
                <span className="text-brand-600 font-medium">عند الاستلام*</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-lg text-gray-900">
                <span>الإجمالي</span>
                <span>{total.toFixed(2)} درهم</span>
              </div>
            </div>
            <Link href="/checkout" className="btn-primary w-full mt-6">
              إتمام الطلب
            </Link>
            <p className="text-xs text-gray-400 mt-3 text-center">
              * التوصيل يُحدد حسب المدينة عند إتمام الطلب
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}