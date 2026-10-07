import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import ProductCard from "@/components/ProductCard";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let product: any = null;
  const num = Number(slug);

  if (!isNaN(num)) {
    product = await prisma.product.findUnique({
      where: { id: num },
      include: { category: true },
    });
  }

  const decoded = decodeURIComponent(slug);

  if (!product) {
    product = await prisma.product.findUnique({
      where: { slug: decoded },
      include: { category: true },
    });
  }

  if (!product) {
    product = await prisma.product.findFirst({
      where: { slug: decoded },
      include: { category: true },
    });
  }

  if (!product) {
    product = await prisma.product.findUnique({
      where: { slug: slug },
      include: { category: true },
    });
  }

  if (!product) {
    product = await prisma.product.findFirst({
      where: { slug: slug },
      include: { category: true },
    });
  }

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
        <Link href="/">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href="/products">المنتجات</Link>
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
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-brand-700 text-4xl font-bold">{product.price}</span>
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
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">منتجات ذات صلة</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
