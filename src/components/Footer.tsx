"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  CreditCard,
  Truck,
  ShieldCheck,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16" id="contact">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-1">سوما ماركت</h3>
            <p className="text-[10px] tracking-widest text-gray-500 font-semibold mb-4">SuMa MarKet</p>
            <p className="text-sm leading-relaxed">
              متجرك الإلكتروني الموثوق لشراء أجود المنتجات بأسعار منافسة مع
              خدمة التوصيل لجميع المدن.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-brand-600 transition-colors">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-brand-600 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-brand-600 transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-brand-400">الرئيسية</Link></li>
              <li><Link href="/products" className="hover:text-brand-400">جميع المنتجات</Link></li>
              <li><Link href="/cart" className="hover:text-brand-400">سلة التسوق</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">خدمة العملاء</h4>
            <ul className="space-y-2 text-sm">
              <li>الدفع عند الاستلام</li>
              <li>التوصيل لجميع المدن</li>
              <li>الجودة مضمونة</li>
              <li>إرجاع سهل</li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} /> 0776668738
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} /> sumamarket17@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} /> سلا، المغرب
              </li>
              <li>
                <a
                  href="https://wa.me/212776668738"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-brand-400 transition-colors"
                >
                  <MessageCircle size={16} /> واتساب: 0776668738
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
            <span className="flex items-center gap-1.5 text-gray-400">
              <CreditCard size={16} /> الدفع عند الاستلام
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <Truck size={16} /> توصيل سريع
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <ShieldCheck size={16} /> منتجات أصلية 100%
            </span>
          </div>
          <p className="text-center text-sm mt-4 text-gray-500">
            © {new Date().getFullYear()} سوما ماركت SuMa MarKet. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  );
}