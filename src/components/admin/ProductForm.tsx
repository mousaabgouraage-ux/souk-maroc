"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Loader2, Upload, X } from "lucide-react";

const MAX_IMAGES = 6;

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
  images?: string[];
  inStock: boolean;
  featured: boolean;
  categoryId: string;
}

export default function ProductForm({ initialData }: { initialData?: ProductData }) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

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

  const [images, setImages] = useState<string[]>(() => {
    if (initialData?.images && initialData.images.length > 0) {
      return initialData.images.filter(Boolean);
    }
    if (initialData?.imageUrl) return [initialData.imageUrl];
    return [];
  });

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
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      alert(`الحد الأقصى ${MAX_IMAGES} صور`);
      return;
    }
    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      alert(`سيتم رفع ${remaining} صور فقط (الحد الأقصى ${MAX_IMAGES})`);
    }

    setUploading(true);
    const uploaded: string[] = [];

    for (const file of toUpload) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          uploaded.push(data.url);
        } else {
          alert(data.error || "خطأ في رفع الصورة");
        }
      } catch {
        alert("خطأ في رفع الصورة");
      }
    }

    if (uploaded.length > 0) {
      setImages((prev) => [...prev, ...uploaded].slice(0, MAX_IMAGES));
    }
    setUploading(false);
  };

  const addImageUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (images.length >= MAX_IMAGES) {
      alert(`الحد الأقصى ${MAX_IMAGES} صور`);
      return;
    }
    setImages((prev) => [...prev, url]);
    setUrlInput("");
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const makeMain = (index: number) => {
    setImages((prev) => {
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      return [item, ...copy];
    });
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
      imageUrl: images[0] || null,
      images: images,
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
        alert(data.error || "حدث خطأ");
        setLoading(false);
        return;
      }

      router.push("/admin/products");
    } catch {
      alert("حدث خطأ ما");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">معلومات المنتج</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              اسم المنتج *
            </label>
            <input
              type="text"
              name="name"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="مثال: سماعات بلوتوث لاسلكية"
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              الرابط (Slug) *
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
              الفئة *
            </label>
            <select
              name="categoryId"
              required
              value={form.categoryId}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">اختر الفئة</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              السعر (درهم) *
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
              السعر القديم (اختياري)
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
              الوصف (اختياري)
            </label>
            <textarea
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="وصف المنتج..."
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
              متوفر في المخزون
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
              منتج مميز (يظهر في الصفحة الرئيسية)
            </span>
          </label>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">صور المنتج</h2>
        <p className="text-sm text-gray-500 mb-4">
          حتى {MAX_IMAGES} صور ({images.length}/{MAX_IMAGES}) — الصورة الأولى هي الرئيسية
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              رفع صور
            </label>
            <label className="flex items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-brand-500 hover:bg-brand-50/30 transition-colors">
              <Upload size={20} className="text-gray-400" />
              <span className="text-sm text-gray-500">
                {uploading ? "جاري الرفع..." : "اضغط لاختيار عدة صور"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading || images.length >= MAX_IMAGES}
              />
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              أو أدخل رابط صورة
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                dir="ltr"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="input-field text-left text-sm"
              />
              <button
                type="button"
                onClick={addImageUrl}
                className="btn-secondary whitespace-nowrap"
              >
                إضافة
              </button>
            </div>
          </div>
        </div>

        {images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-4">
            {images.map((img, index) => (
              <div key={`${img}-${index}`} className="relative">
                <div
                  className={`relative w-32 h-32 rounded-lg overflow-hidden border-2 ${
                    index === 0 ? "border-brand-600" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`صورة ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>
                {index === 0 ? (
                  <span className="absolute bottom-1 right-1 bg-brand-600 text-white text-xs px-2 py-0.5 rounded">
                    رئيسية
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeMain(index)}
                    className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded hover:bg-black/80"
                  >
                    جعلها رئيسية
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -left-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || uploading}
          className="btn-primary"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {initialData ? "جاري التحديث..." : "جاري الإنشاء..."}
            </>
          ) : initialData ? (
            "تحديث المنتج"
          ) : (
            "إنشاء المنتج"
          )}
        </button>
        <Link href="/admin/products" className="btn-secondary">
          <ArrowRight size={18} />
          إلغاء
        </Link>
      </div>
    </form>
  );
}