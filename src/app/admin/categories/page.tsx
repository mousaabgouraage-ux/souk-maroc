"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Save,
  Tag,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
  _count: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

  const openNew = () => {
    setEditingId(null);
    setForm({ name: "", slug: "" });
    setShowForm(true);
  };

  const openEdit = (cat: Category) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, slug: cat.slug });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
    };

    try {
      if (editingId) {
        const res = await fetch(`/api/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.error || "خطأ في التحديث");
        }
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json();
          alert(data.error || "خطأ في الإنشاء");
        }
      }
      setShowForm(false);
      loadCategories();
    } catch {
      alert("حدث خطأ");
    }
    setSaving(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;

    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadCategories();
    } else {
      const data = await res.json();
      alert(data.error || "خطأ في الحذف");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">الفئات</h1>
        <button onClick={openNew} className="btn-primary !py-2 !px-4">
          <Plus size={18} />
          إضافة فئة
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-brand-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">
              {editingId ? "تعديل الفئة" : "إضافة فئة جديدة"}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="اسم الفئة"
                required
                value={form.name}
                onChange={(e) => {
                  setForm({
                    name: e.target.value,
                    slug:
                      editingId === null
                        ? generateSlug(e.target.value)
                        : form.slug,
                  });
                }}
                className="input-field"
              />
            </div>
            <div className="w-full sm:w-48">
              <input
                type="text"
                placeholder="الرابط"
                required
                dir="ltr"
                value={form.slug}
                onChange={(e) =>
                  setForm({ ...form, slug: e.target.value })
                }
                className="input-field text-left text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary !py-2.5"
            >
              {saving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {editingId ? "تحديث" : "إضافة"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-brand-600" size={32} />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm">
          <Tag className="text-gray-300 mx-auto" size={48} />
          <p className="text-gray-500 mt-4">لا توجد فئات بعد</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right px-6 py-3 font-semibold text-gray-700">
                    الاسم
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-gray-700 hidden sm:table-cell">
                    الرابط
                  </th>
                  <th className="text-center px-6 py-3 font-semibold text-gray-700">
                    عدد المنتجات
                  </th>
                  <th className="text-center px-6 py-3 font-semibold text-gray-700">
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{cat.name}</span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {cat.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {cat._count.products}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <Trash2 size={16} />
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