"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Store,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "لوحة التحكم", href: "/admin", icon: LayoutDashboard },
  { label: "المنتجات", href: "/admin/products", icon: Package },
  { label: "الفئات", href: "/admin/categories", icon: Tag },
  { label: "الطلبات", href: "/admin/orders", icon: ShoppingCart },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`w-64 bg-gray-900 text-white shrink-0 fixed lg:sticky top-0 h-screen z-50 transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-gray-800">
          <Link href="/admin" className="flex items-center gap-2">
            <Store size={22} className="text-brand-400" />
            <span className="font-bold">سامو ماركت</span>
          </Link>
          <p className="text-gray-400 text-xs mt-1">لوحة التحكم</p>
        </div>
        <nav className="p-4">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800 mt-auto">
          <a
            href="/"
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            العودة للمتجر
          </a>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="bg-white border-b p-4 lg:hidden flex items-center gap-3 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-700"
            aria-label="القائمة"
          >
            <Menu size={24} />
          </button>
          <Link href="/admin" className="flex items-center gap-2">
            <Store size={20} className="text-brand-600" />
            <span className="font-bold">لوحة التحكم</span>
          </Link>
        </header>
        <div className="p-4 lg:p-8 max-w-7xl">{children}</div>
      </div>
    </div>
  );
}