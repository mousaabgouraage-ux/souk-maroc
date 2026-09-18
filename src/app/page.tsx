import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import {
  Truck,
  ShieldCheck,
  BadgePercent,
  CreditCard,
  ArrowLeft,
} from "lucide-react";

export default async function HomePage() {
  const [featuredProducts, categories, allProducts] = await Promise.all([
    prisma.product.findMany({
      where: { featured: true, inStock: true },
      include: { category: true },
      take: 8,
    }),
    prisma.category.findMany({ include: { _count: { select: { products: true } } } }),
    prisma.product.findMany({
      where: { inStock: true },
      include: { category: true },
      take: 4,
    }),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-l from-brand-700 to-brand-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-block bg-white/20 text-sm px-4 py-1.5 rounded-full mb-5">
              الدفع عند الاستلام
            </span>
            <h1 className="text-4xl lg:text-5xl font-bold mb-5 leading-tight">
              كل ما تحتاجه
              <br /> في مكان واحد
            </h1>
            <p className="text-white/80 text-lg mb-8 max-w-lg">
              اكتشف تشكيلة واسعة من المنتجات المتنوعة بأفضل الأسعار. جودة مضمونة
              وتوصيل سريع لجميع المدن.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="bg-white text-brand-700 font-semibold px-8 py-3.5 rounded-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                تسوق الآن <ArrowLeft size={18} />
              </Link>
              <Link
                href="/#categories"
                className="bg-white/10 border border-white/30 font-semibold px-8 py-3.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                تصفح الفئات
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1557821552-17105176677c?w=800&h=600&fit=crop"
                  alt="تشكيلة منتجات"
                  width={800}
                  height={600}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: CreditCard, title: "الدفع عند الاستلام", desc: "ادفع عند وصول طلبك" },
            { icon: Truck, title: "توصيل سريع", desc: "لجميع المدن المغربية" },
            { icon: ShieldCheck, title: "منتجات أصلية", desc: "جودة مضمونة 100%" },
            { icon: BadgePercent, title: "أسعار منافسة", desc: "عروض وتخفيضات يومية" },
          ].map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl shadow-sm p-5 flex flex-col gap-2 items-center text-center"
            >
              <div className="p-3 bg-brand-50 rounded-lg text-brand-700">
                <f.icon size={24} />
              </div>
              <h3 className="font-bold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">الفئات</h2>
          <Link href="/products" className="text-brand-600 font-medium hover:underline inline-flex items-center gap-1">
            عرض الكل <ArrowLeft size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 text-center group"
            >
              <div className="text-3xl mb-2">{c._count.products}</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                {c.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1">منتج</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-14">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">منتجات مميزة</h2>
            <Link href="/products" className="text-brand-600 font-medium hover:underline inline-flex items-center gap-1">
              عرض الكل <ArrowLeft size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">أحدث المنتجات</h2>
          <Link href="/products" className="text-brand-600 font-medium hover:underline inline-flex items-center gap-1">
            عرض الكل <ArrowLeft size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="bg-gradient-to-l from-brand-600 to-brand-800 rounded-2xl p-8 lg:p-14 text-white text-center">
          <h2 className="text-3xl font-bold mb-3">جاهز للطلب؟</h2>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            اطلب الآن وادفع عند الاستلام. سهولة تامة وتوصيل سريع لعنوانك.
          </p>
          <Link
            href="/products"
            className="bg-white text-brand-700 font-semibold px-8 py-3.5 rounded-lg hover:bg-gray-100 transition-colors inline-block"
          >
            تسوق الآن
          </Link>
        </div>
      </section>
    </div>
  );
}