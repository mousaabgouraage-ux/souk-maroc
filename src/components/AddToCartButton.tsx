"use client";

import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/lib/cart";
import { useState } from "react";
import type { Product } from "@/lib/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
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
    <button
      onClick={handleClick}
      disabled={!product.inStock}
      className="btn-primary w-full sm:w-auto !px-10 text-lg"
    >
      <ShoppingCart size={22} />
      {added ? "تمت الإضافة ✓" : "أضف إلى السلة"}
    </button>
  );
}