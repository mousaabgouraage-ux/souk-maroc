import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import {
  Truck,
  ShieldCheck,
  CreditCard,
  Package,
  ChevronLeft,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    take: 4,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-brand-600">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-brand-600">المنتجات</Link>
        <span className="mx-2">/</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-brand-600"
        >
          {product.category.name}
        </Link>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              لا توجد صورة
            </div>
          )}
          {product.oldPrice && product.oldPrice > product.price && (
            <span className="absolute top-4 right-4 bg-red-600 text-white text-sm font-bold px-4 py-1.5 rounded-full">
              تخفيض {Math.round((1 - product.price / product.oldPrice) * 100)}%
            </span>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1 rounded-full">
              {product.category.name}
            </span>
            {!product.inStock && (
              <span className="bg-red-50 text-red-600 text-sm font-medium px-3 py-1 rounded-full">
                نفذت الكمية
              </span>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-brand-700 text-4xl font-bold">
              {product.price}
            </span>
            <span className="text-gray-500 text-lg">درهم</span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-gray-400 text-xl line-through">
                {product.oldPrice} درهم
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-gray-600 leading-relaxed mb-8 whitespace-pre-line">
              {product.description}
            </p>
          )}

          <AddToCartButton product={product} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
            <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl p-4 text-center">
              <CreditCard className="text-brand-600" size={24} />
              <span className="text-sm font-medium text-gray-700">
                الدفع عند الاستلام
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl p-4 text-center">
              <Truck className="text-brand-600" size={24} />
              <span className="text-sm font-medium text-gray-700">
                توصيل سريع بمجرد الاستلام
              </span>
            </div>
            <div className="flex flex-col items-center gap-2 bg-gray-50 rounded-xl p-4 text-center">
              <ShieldCheck className="text-brand-600" size={24} />
              <span className="text-sm font-medium text-gray-700">
                جودة مضمونة
              </span>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            منتجات ذات صلة
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}