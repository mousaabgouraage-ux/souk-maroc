import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  Truck,
  ShieldCheck,
  BadgePercent,
  CreditCard,
  ArrowLeft,
  Search,
} from "lucide-react";

// تُقدَّم عند الطلب (لا أثناء البناء) لتفادي الاعتماد على قاعدة البيانات وقت التوليد
export const dynamic = "force-dynamic";

function HomeSection({
  title,
  href,
  tone = "white",
  children,
}: {
  title: string;
  href?: string;
  tone?: "white" | "gray";
  children: ReactNode;
}) {
  return (
    <section className={`${tone === "gray" ? "bg-gray-50" : ""} py-12`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {href && (
            <Link
              href={href}
              className="text-brand-600 font-medium hover:underline inline-flex items-center gap-1"
            >
              عرض الكل <ArrowLeft size={16} />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {children}
        </div>
      </div>
    </section>
  );
}

async function getCategorySection(slug: string, take = 4) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { inStock: true },
        include: { category: true },
        take,
      },
    },
  });
}

export default async function HomePage() {
  const [discounted, bestSellerRows, newArrivals, featuredProducts, homeCat, clothingCat, accessoriesCat] =
    await Promise.all([
      prisma.product.findMany({
        where: { inStock: true, oldPrice: { gt: 0 } },
        include: { category: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 8,
      }),
      prisma.product.findMany({
        where: { inStock: true },
        include: { category: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.product.findMany({
        where: { featured: true, inStock: true },
        include: { category: true },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      getCategorySection("home-kitchen"),
      getCategorySection("clothing"),
      getCategorySection("accessories"),
    ]);

  const bestSellerIds = bestSellerRows.map((r) => r.productId);
  const bestSellerQty = new Map(
    bestSellerRows.map((r) => [r.productId, r._sum.quantity || 0])
  );
  const bestSellers = bestSellerIds.length
    ? (
        await prisma.product.findMany({
          where: { id: { in: bestSellerIds }, inStock: true },
          include: { category: true },
        })
      ).sort(
        (a, b) => (bestSellerQty.get(b.id) || 0) - (bestSellerQty.get(a.id) || 0)
      )
    : [];

  const productSection = (
    title: string,
    href: string,
    tone: "white" | "gray",
    products: typeof discounted
  ) =>
    products.length ? (
      <HomeSection title={title} href={href} tone={tone}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </HomeSection>
    ) : null;

  const categorySection = (
    title: string,
    slug: string,
    category: typeof homeCat
  ) =>
    category && category.products.length ? (
      <HomeSection title={title} href={`/products?category=${slug}`}>
        {category.products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </HomeSection>
    ) : null;

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

      {/* 🔥 عروض اليوم */}
      {productSection("🔥 عروض اليوم", "/products", "gray", discounted)}

      {/* ⭐ الأكثر مبيعًا */}
      {productSection("⭐ الأكثر مبيعًا", "/products", "white", bestSellers)}

      {/* 🆕 وصل حديثًا */}
      {productSection("🆕 وصل حديثًا", "/products", "gray", newArrivals)}

      {/* 🏠 للمنزل */}
      {categorySection("🏠 للمنزل", "home-kitchen", homeCat)}

      {/* 👕 الملابس */}
      {categorySection("👕 الملابس", "clothing", clothingCat)}

      {/* 🎧 الإكسسوارات */}
      {categorySection("🎧 الإكسسوارات", "accessories", accessoriesCat)}

      {/* 🔍 خانة البحث عن المنتجات */}
      <section className="bg-brand-50 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            🔍 ابحث عن منتجك
          </h2>
          <p className="text-gray-500 mt-2">
            اكتب اسم المنتج واضغط بحث للعثور عليه مباشرة
          </p>
          <form
            action="/products"
            method="get"
            className="mt-6 flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              name="search"
              placeholder="مثال: سماعات، ساعة، حقيبة..."
              className="input-field flex-1 text-right"
            />
            <button
              type="submit"
              className="bg-brand-600 text-white px-6 py-3 rounded-lg hover:bg-brand-700 transition-colors inline-flex items-center justify-center gap-2 font-medium"
            >
              <Search size={18} /> بحث
            </button>
          </form>
        </div>
      </section>

      {/* ❤️ اختيارات SaMu-MarKet */}
      {productSection("❤️ اختيارات SaMu-MarKet", "/products", "white", featuredProducts)}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-14">
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