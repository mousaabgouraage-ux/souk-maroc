export interface Category {
  id: number;
  name: string;
  slug: string;
  imageUrl?: string | null;
  isVisible: boolean;
  createdAt: Date;
  _count?: { products: number };
}

export interface ProductImage {
  id: number;
  url: string;
  isMain: boolean;
  position: number;
  productId: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string | null;
  stock: number;
  inStock: boolean;
  featured: boolean;
  isNew: boolean;
  isVisible: boolean;
  color?: string | null;
  size?: string | null;
  options?: string | null;
  categoryId: number;
  category?: Category;
  images?: ProductImage[];
  createdAt: Date;
}

export interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  productId: number;
  product?: Product;
  orderId: number;
}

export const ORDER_STATUSES = [
  { value: "PENDING", label: "جديد" },
  { value: "CONFIRMED", label: "تم التأكيد" },
  { value: "PROCESSING", label: "قيد التجهيز" },
  { value: "SHIPPED", label: "تم الشحن" },
  { value: "DELIVERED", label: "تم التسليم" },
  { value: "CANCELLED", label: "ملغي" },
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number]["value"];

export function orderStatusLabel(status: string): string {
  return ORDER_STATUSES.find((s) => s.value === status)?.label || status;
}

export interface Order {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string | null;
  status: string;
  total: number;
  deliveryFee: number;
  paymentMethod: string;
  createdAt: Date;
  items?: OrderItem[];
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
  cities: { name: string; fee: number | null }[];
  facebook?: string;
  instagram?: string;
  twitter?: string;
}

export interface CityOption {
  name: string;
  fee: number | null;
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