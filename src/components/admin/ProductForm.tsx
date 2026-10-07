"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Loader2, Upload, X } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductData {
  id?: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  oldPrice: string;
  imageUrl: string;
  inStock: boolean;
  featured: boolean;
  categoryId: string;
}

export default function ProductForm({ initialData }: { initialData?: ProductData }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState<ProductData>(
    initialData || {
      name: "",
      slug: "",
      description: "",
      price: "",
      oldPrice: "",
      imageUrl: "",
      inStock: true,
      featured: false,
      categoryId: "",
    }
  );

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data));
  }, []);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\u0600-\u06FF\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setForm((prev) => {
      const updated: ProductData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "name" && !initialData) {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, imageUrl: data.url }));
      } else {
        alert(data.error || "Ø®Ø·Ø£ ÙÙŠ Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©");
      }
    } catch {
      alert("Ø®Ø·Ø£ ÙÙŠ Ø±ÙØ¹ Ø§Ù„ØµÙˆØ±Ø©");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      description: form.description,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      imageUrl: form.imageUrl || null,
      inStock: form.inStock,
      featured: form.featured,
      categoryId: Number(form.categoryId),
    };

    try {
      const url = initialData?.id
        ? `/api/products/${initialData.id}`
        : "/api/products";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Ø­Ø¯Ø« Ø®Ø·Ø£");
        setLoading(false);
        return;
      }

      router.push("/admin/products");
    } catch {
      alert("Ø­Ø¯Ø« Ø®Ø·Ø£ Ù…Ø§");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ù…Ù†ØªØ¬</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ø§Ø³Ù… Ø§Ù„Ù…Ù†ØªØ¬ *
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Ù…Ø«Ø§Ù„: Ø³Ù…Ø§Ø¹Ø§Øª Ø¨Ù„ÙˆØªÙˆØ« Ù„Ø§Ø³Ù„ÙƒÙŠØ©"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ø§Ù„Ø±Ø§Ø¨Ø· (Slug) *
            </label>
            <input
              type="text"
              name="slug"
              required
              dir="ltr"
              value={form.slug}
              onChange={handleChange}
              placeholder="auto-generated-from-name"
              className="input-field text-left text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ø§Ù„ÙØ¦Ø© *
            </label>
            <select
              name="categoryId"
              required
              value={form.categoryId}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Ø§Ø®ØªØ± Ø§Ù„ÙØ¦Ø©</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ø§Ù„Ø³Ø¹Ø± (Ø¯Ø±Ù‡Ù…) *
            </label>
            <input
              type="number"
              name="price"
              required
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0.00"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ù‚Ø¯ÙŠÙ… (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)
            </label>
            <input
              type="number"
              name="oldPrice"
              min="0"
              step="0.01"
              value={form.oldPrice}
              onChange={handleChange}
              placeholder="0.00"
              className="input-field"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ø§Ù„ÙˆØµÙ (Ø§Ø®ØªÙŠØ§Ø±ÙŠ)
            </label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="ÙˆØµÙ Ø§Ù„Ù…Ù†ØªØ¬..."
              className="input-field resize-none"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="inStock"
              checked={form.inStock}
              onChange={handleChange}
              className="w-4 h-4 text-brand-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Ù…ØªÙˆÙØ± ÙÙŠ Ø§Ù„Ù…Ø®Ø²ÙˆÙ†
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="w-4 h-4 text-brand-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Ù…Ù†ØªØ¬ Ù…Ù…ÙŠØ² (ÙŠØ¸Ù‡Ø± ÙÙŠ Ø§Ù„ØµÙØ­Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©)
            </span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">ØµÙˆØ±Ø© Ø§Ù„Ù…Ù†ØªØ¬</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ø±ÙØ¹ ØµÙˆØ±Ø©
            </label>
            <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-500 hover:bg-brand-50/30 transition-colors">
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                {uploading ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø±ÙØ¹..." : "Ø§Ø¶ØºØ· Ù„Ø§Ø®ØªÙŠØ§Ø± ØµÙˆØ±Ø©"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Ø£Ùˆ Ø£Ø¯Ø®Ù„ Ø±Ø§Ø¨Ø· Ø§Ù„ØµÙˆØ±Ø©
            </label>
            <input
              type="url"
              name="imageUrl"
              dir="ltr"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="input-field text-left text-sm"
            />
          </div>
        </div>
        {form.imageUrl && (
          <div className="mt-4 relative inline-block">
            <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-200">
              <Image
                src={form.imageUrl}
                alt="Ù…Ø¹Ø§ÙŠÙ†Ø©"
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
            <button
              type="button"
              onClick={() => setForm((prev) => ({ ...prev, imageUrl: "" }))}
              className="absolute -top-2 -left-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {initialData ? "Ø¬Ø§Ø±ÙŠ Ø§Ù„ØªØ­Ø¯ÙŠØ«..." : "Ø¬Ø§Ø±ÙŠ Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡..."}
            </>
          ) : initialData ? (
            "ØªØ­Ø¯ÙŠØ« Ø§Ù„Ù…Ù†ØªØ¬"
          ) : (
            "Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ù…Ù†ØªØ¬"
          )}
        </button>
        <Link href="/admin/products" className="btn-secondary">
          <ArrowRight size={18} />
          Ø¥Ù„ØºØ§Ø¡
        </Link>
      </div>
    </form>
  );
}
