import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "إلكترونيات", slug: "electronics" },
    { name: "ملابس", slug: "clothing" },
    { name: "أحذية", slug: "shoes" },
    { name: "منزل ومطبخ", slug: "home-kitchen" },
    { name: "إكسسوارات", slug: "accessories" },
    { name: "جمال وعناية", slug: "beauty" },
  ];

  for (const c of categories) {
    const existing = await prisma.category.findUnique({
      where: { slug: c.slug },
    });
    if (!existing) {
      await prisma.category.create({ data: c });
    }
  }

  console.log("Categories seeded!");

  const productData = [
    {
      name: "سماعات بلوتوث لاسلكية",
      slug: "wireless-bluetooth-earbuds",
      description:
        "سماعات أذن لاسلكية عالية الجودة مع علبة شحن، صوت نقي وبطارية تدوم طويلاً.",
      price: 199,
      oldPrice: 299,
      imageUrl: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=600&h=600&fit=crop",
      categorySlug: "electronics",
      featured: true,
      inStock: true,
    },
    {
      name: "ساعة ذكية",
      slug: "smart-watch",
      description:
        "ساعة ذكية بتصميم أنيق، شاشة تعمل باللمس، تتبع اللياقة ونبضات القلب.",
      price: 450,
      oldPrice: 599,
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop",
      categorySlug: "electronics",
      featured: true,
      inStock: true,
    },
    {
      name: "حقيبة ظهر عصرية",
      slug: "modern-backpack",
      description:
        "حقيبة ظهر أنيقة وعملية، مقاومة للماء مع جيوب متعددة للكمبيوتر المحمول والأغراض الشخصية.",
      price: 350,
      oldPrice: 450,
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop",
      categorySlug: "accessories",
      featured: true,
      inStock: true,
    },
    {
      name: "نظارات شمسية كلاسيكية",
      slug: "classic-sunglasses",
      description:
        "نظارات شمسية عصرية بحماية كاملة من الأشعة فوق البنفسجية، إطار متين وعدسات عالية الجودة.",
      price: 150,
      imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&h=600&fit=crop",
      categorySlug: "accessories",
      featured: true,
      inStock: true,
    },
    {
      name: "قميص قطني كلاسيكي",
      slug: "classic-cotton-shirt",
      description: "قميص قطني مريح وعالي الجودة، متوفر بعدة ألوان ومقاسات.",
      price: 120,
      oldPrice: 160,
      imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
      categorySlug: "clothing",
      featured: false,
      inStock: true,
    },
    {
      name: "حذاء رياضي مريح",
      slug: "comfortable-sports-shoes",
      description: "حذاء رياضي خفيف ومريح مثالي للجري والاستخدام اليومي.",
      price: 280,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
      categorySlug: "shoes",
      featured: true,
      inStock: true,
    },
    {
      name: "طقم أواني مطبخ",
      slug: "kitchen-pots-set",
      description: "طقم أواني مطبخ من الفولاذ المقاوم للصدأ، يشمل جميع القطع الأساسية.",
      price: 550,
      oldPrice: 700,
      imageUrl: "https://images.unsplash.com/photo-1584990347449-a1d5b2f3c5e1?w=600&h=600&fit=crop",
      categorySlug: "home-kitchen",
      featured: false,
      inStock: true,
    },
    {
      name: "عطر فاخر 100 مل",
      slug: "luxury-perfume",
      description: "عطر فاخر برائحة جذابة تدوم طويلاً، مثالي للمناسبات الخاصة.",
      price: 320,
      imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&h=600&fit=crop",
      categorySlug: "beauty",
      featured: true,
      inStock: true,
    },
    {
      name: "شاحن لاسلكي سريع",
      slug: "fast-wireless-charger",
      description: "شاحن لاسلكي سريع متوافق مع جميع الهواتف الذكية الحديثة.",
      price: 89,
      imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&h=600&fit=crop",
      categorySlug: "electronics",
      featured: false,
      inStock: true,
    },
    {
      name: "محفظة جلدية فاخرة",
      slug: "luxury-leather-wallet",
      description: "محفظة جلدية طبيعية بتصميم أنيق، متعددة الجيوب ومقاومة للاهتراء.",
      price: 140,
      imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&h=600&fit=crop",
      categorySlug: "accessories",
      featured: false,
      inStock: true,
    },
    {
      name: "فستان سهرة أنيق",
      slug: "elegant-evening-dress",
      description: "فستان سهرة أنيق بتصميم عصري يناسب جميع المناسبات.",
      price: 420,
      oldPrice: 520,
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop",
      categorySlug: "clothing",
      featured: true,
      inStock: true,
    },
    {
      name: "ماكينة قهوة إسبريسو",
      slug: "espresso-machine",
      description: "ماكينة قهوة إسبريسو احترافية للاستخدام المنزلي، تحضير قهوة رائعة بضغطة زر.",
      price: 890,
      imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&h=600&fit=crop",
      categorySlug: "home-kitchen",
      featured: true,
      inStock: true,
    },
  ];

  for (const p of productData) {
    const existing = await prisma.product.findUnique({
      where: { slug: p.slug },
    });
    if (!existing) {
      const category = await prisma.category.findUnique({
        where: { slug: p.categorySlug },
      });
      if (category) {
        const { categorySlug, ...data } = p;
        await prisma.product.create({
          data: {
            ...data,
            categoryId: category.id,
          },
        });
      }
    }
  }

  console.log("Products seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });