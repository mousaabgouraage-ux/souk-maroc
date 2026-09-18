"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { useState } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string | null;
  slug: string;
  inStock: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (!product.inStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      slug: product.slug,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="card group">
      <Link href={`/products/${product.slug}`} className="block relative">
        <div className="relative aspect-square bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span>لا توجد صورة</span>
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
              <span className="bg-white text-gray-900 font-semibold px-4 py-2 rounded-lg">
                نفذت الكمية
              </span>
            </div>
          )}
        </div>
        {product.oldPrice && product.oldPrice > product.price && (
          <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            تخفيض {Math.round((1 - product.price / product.oldPrice) * 100)}%
          </span>
        )}
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-brand-700 font-bold text-lg">
              {product.price} <span className="text-xs">درهم</span>
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-gray-400 text-sm line-through">
                {product.oldPrice}
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="p-2 bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-600 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="أضف إلى السلة"
          >
            {added ? (
              <span className="text-xs font-bold px-1">تم ✓</span>
            ) : (
              <ShoppingCart size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}