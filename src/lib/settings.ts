import { prisma } from "@/lib/prisma";

export interface CityOption {
  name: string;
  fee: number | null;
}

export interface StoreSettings {
  name: string;
  logo?: string | null;
  tagline?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address?: string;
  description: string;
  deliveryFee: number;
  cities: CityOption[];
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface HomepageSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  heroButtonText: string;
  heroButtonLink: string;
  featuredProductIds: number[];
  categoryIds: number[];
  latestLimit: number;
  showNewProducts: boolean;
  newProductsLimit: number;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  name: "سوما ماركت",
  logo: null,
  tagline: "SuMa MarKet",
  phone: "0776668738",
  whatsapp: "0776668738",
  email: "sumamarket17@gmail.com",
  address: "سلا، المغرب",
  description:
    "متجرك الموثوق لشراء أجود المنتجات بأسعار منافسة مع توصيل سريع لجميع المدن المغربية.",
  deliveryFee: 30,
  cities: [],
};

export const DEFAULT_HOMEPAGE_SETTINGS: HomepageSettings = {
  heroTitle: "تسوق بأفضل الأسعار",
  heroSubtitle: "اكتشف تشكيلة واسعة من المنتجات عالية الجودة مع توصيل سريع وآمن.",
  heroImage: "/uploads/suma-hero.jpg",
  heroButtonText: "تسوق الآن",
  heroButtonLink: "/products",
  featuredProductIds: [],
  categoryIds: [],
  latestLimit: 8,
  showNewProducts: true,
  newProductsLimit: 4,
};

function merge<T extends object>(defaults: T, saved: unknown): T {
  if (!saved || typeof saved !== "object") return defaults;
  const data = saved as Record<string, unknown>;
  const result: Record<string, unknown> = { ...(defaults as object) };

  for (const key of Object.keys(result)) {
    const dflt = (defaults as Record<string, unknown>)[key];
    const val = data[key];
    if (Array.isArray(dflt)) {
      const arr = Array.isArray(val) ? val : [];
      if (dflt.length === 0) {
        // city array — normalize
        result[key] = arr
          .map((c: unknown) => {
            const city = c as CityOption;
            return {
              name: String(city?.name || "").trim(),
              fee: city?.fee != null ? Number(city.fee) : null,
            };
          })
          .filter((c) => c.name);
      } else {
        result[key] = arr.map((n) => Number(n)).filter((n) => !isNaN(n));
      }
    } else if (typeof dflt === "boolean") {
      result[key] = Boolean(val);
    } else if (typeof dflt === "number") {
      result[key] = val !== undefined ? Number(val) : dflt;
    } else if (val !== undefined) {
      result[key] = val;
    }
  }
  return result as T;
}

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const row = await prisma.storeSetting.findUnique({ where: { key: "store" } });
    if (!row?.value) return DEFAULT_STORE_SETTINGS;
    return merge(DEFAULT_STORE_SETTINGS, JSON.parse(row.value));
  } catch {
    return DEFAULT_STORE_SETTINGS;
  }
}

export async function saveStoreSettings(
  data: StoreSettings
): Promise<StoreSettings> {
  const merged = merge(DEFAULT_STORE_SETTINGS, {
    ...DEFAULT_STORE_SETTINGS,
    ...data,
  });
  await prisma.storeSetting.upsert({
    where: { key: "store" },
    update: { value: JSON.stringify(merged) },
    create: { key: "store", value: JSON.stringify(merged) },
  });
  return merged;
}

export async function getHomepageSettings(): Promise<HomepageSettings> {
  try {
    const row = await prisma.storeSetting.findUnique({
      where: { key: "homepage" },
    });
    if (!row?.value) return DEFAULT_HOMEPAGE_SETTINGS;
    return merge(DEFAULT_HOMEPAGE_SETTINGS, JSON.parse(row.value));
  } catch {
    return DEFAULT_HOMEPAGE_SETTINGS;
  }
}

export async function saveHomepageSettings(
  data: HomepageSettings
): Promise<HomepageSettings> {
  const merged = merge(DEFAULT_HOMEPAGE_SETTINGS, {
    ...DEFAULT_HOMEPAGE_SETTINGS,
    ...data,
  });
  await prisma.storeSetting.upsert({
    where: { key: "homepage" },
    update: { value: JSON.stringify(merged) },
    create: { key: "homepage", value: JSON.stringify(merged) },
  });
  return merged;
}

/** حساب رسوم التوصيل حسب المدينة (إن وجدت) وإلا الرسوم الافتراضية. */
export function getDeliveryFeeForCity(
  settings: StoreSettings,
  city: string
): number {
  const trimmed = (city || "").trim();
  if (!trimmed || !settings.cities?.length) {
    return Number(settings.deliveryFee) || 0;
  }
  const found = settings.cities.find(
    (c) => c.name.trim().toLowerCase() === trimmed.toLowerCase()
  );
  if (found) {
    return found.fee != null ? Number(found.fee) : Number(settings.deliveryFee) || 0;
  }
  return Number(settings.deliveryFee) || 0;
}