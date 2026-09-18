"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, Loader2, Eye, EyeOff } from "lucide-react";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string | null;
  inStock: boolean;
  featured: boolean;
  category: { name: string };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    setDeleting(id);
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("خطأ في حذف المنتج");
    }
    setDeleting(null);
  };

  const toggleStock = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inStock: !product.inStock }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, inStock: !p.inStock } : p
        )
      );
    }
  };

  const toggleFeatured = async (product: Product) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !product.featured }),
    });
    if (res.ok) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, featured: !p.featured } : p
        )
      );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">المنتجات</h1>
        <Link href="/admin/products/new" className="btn-primary !py-2 !px-4">
          <Plus size={18} />
          إضافة منتج
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-600" size={32} />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <p className="text-gray-500 mb-4">لا توجد منتجات بعد</p>
          <Link href="/admin/products/new" className="btn-primary">
            إضافة أول منتج
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">
                    المنتج
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">
                    الفئة
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">
                    السعر
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">
                    المخزون
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">
                    مميز
                  </th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {product.imageUrl ? (
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-[10px]">لا صورة</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 hidden sm:block">
                            {product.category.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                        {product.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900">
                        {product.price}
                      </span>
                      <span className="text-xs text-gray-400 mr-1">درهم</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleStock(product)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          product.inStock
                            ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                      >
                        {product.inStock ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <button
                        onClick={() => toggleFeatured(product)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          product.featured
                            ? "bg-brand-100 text-brand-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {product.featured ? "مميز" : "عادي"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id, product.name)}
                          disabled={deleting === product.id}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {deleting === product.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}