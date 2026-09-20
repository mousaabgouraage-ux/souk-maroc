"use client";

import Link from "next/link";
import { ShoppingCart, Menu, X, Store } from "lucide-react";
import { useState, useEffect } from "react";
import { getCart, cartCount } from "@/lib/cart";

export default function Header() {
  const [cartCountVal, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => setCartCount(cartCount());
    update();
    window.addEventListener("cart-updated", update);
    return () => window.removeEventListener("cart-updated", update);
  }, []);

  const navItems = [
    { label: "الرئيسية", href: "/" },
    { label: "المنتجات", href: "/products" },
    { label: "الفئات", href: "/products" },
    { label: "تواصل معنا", href: "/#contact" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button
            className="lg:hidden text-gray-600 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="القائمة"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="bg-brand-600 text-white p-2 rounded-lg">
              <Store size={22} />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold text-gray-900">
                سامو <span className="text-brand-600">ماركت</span>
              </span>
              <span className="text-[10px] tracking-widest text-gray-500 font-semibold">SaMu MarKet</span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-brand-600 font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-brand-600 transition-colors"
              aria-label="سلة التسوق"
            >
              <ShoppingCart size={24} />
              {cartCountVal > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCountVal}
                </span>
              )}
            </Link>
            <Link href="/cart" className="btn-primary hidden sm:inline-flex !py-2 !px-4">
              اطلب الآن
            </Link>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="py-3 text-gray-700 hover:text-brand-600 font-medium border-b border-gray-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}