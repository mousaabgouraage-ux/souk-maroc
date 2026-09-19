"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { Loader2 } from "lucide-react";

interface ProductData {
  id: number;
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

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: paramId } = use(params);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        const found = data.find(
          (p: { id: number }) => p.id === parseInt(paramId)
        );
        if (!found) {
          alert("المنتج غير موجود");
          router.push("/admin/products");
          return;
        }
        setProduct({
          id: found.id,
          name: found.name,
          slug: found.slug,
          description: found.description || "",
          price: String(found.price),
          oldPrice: found.oldPrice ? String(found.oldPrice) : "",
          imageUrl: found.imageUrl || "",
          inStock: found.inStock,
          featured: found.featured,
          categoryId: String(found.categoryId),
        });
        setLoading(false);
      });
  }, [paramId, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">تعديل المنتج</h1>
      <ProductForm initialData={product!} />
    </div>
  );
}