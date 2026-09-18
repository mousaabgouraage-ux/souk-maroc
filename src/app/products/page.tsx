import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Search } from "lucide-react";

interface Props {
  searchParams: { category?: string; search?: string };
}

export default async function ProductsPage({ searchParams }: Props) {
  const category = searchParams.category || "";
  const search = searchParams.search || "";

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const where: any = {};
  if (category) {
    where.category = { slug: category };
  }
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const products = await prisma.product.findMany({
    where,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">جميع المنتجات</h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/products"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !category
                ? "bg-brand-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border"
            }`}
          >
            الكل
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                category === c.slug
                  ? "bg-brand-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        <form action="/products" method="get" className="md:mr-auto flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="ابحث عن منتج..."
            className="input-field !w-56"
          />
          <button
            type="submit"
            className="bg-brand-600 text-white p-3 rounded-lg hover:bg-brand-700 transition-colors"
            aria-label="بحث"
          >
            <Search size={18} />
          </button>
        </form>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">لا توجد منتجات مطابقة</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}