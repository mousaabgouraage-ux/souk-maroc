import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
} from "lucide-react";

// تُقدَّم عند الطلب (لا أثناء البناء) لتفادي الاعتماد على قاعدة البيانات وقت التوليد
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [totalProducts, totalOrders, pendingOrders, deliveredOrders, orders] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { items: true },
      }),
    ]);

  const totalRevenue = orders
    .filter((o) => o.status === "DELIVERED")
    .reduce((sum, o) => sum + o.total, 0);

  const statusLabels: Record<string, string> = {
    PENDING: "قيد الانتظار",
    CONFIRMED: "تم التأكيد",
    SHIPPED: "شحن",
    DELIVERED: "تم التوصيل",
    CANCELLED: "ملغي",
  };

  const statusIcons: Record<string, typeof Clock> = {
    PENDING: Clock,
    CONFIRMED: CheckCircle2,
    SHIPPED: Truck,
    DELIVERED: CheckCircle2,
    CANCELLED: XCircle,
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-50 text-yellow-700",
    CONFIRMED: "bg-blue-50 text-blue-700",
    SHIPPED: "bg-purple-50 text-purple-700",
    DELIVERED: "bg-brand-50 text-brand-700",
    CANCELLED: "bg-red-50 text-red-600",
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">لوحة التحكم</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">المنتجات</span>
            <Package size={20} className="text-brand-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">الطلبات الكلية</span>
            <ShoppingCart size={20} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">قيد الانتظار</span>
            <Clock size={20} className="text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">الطلبات المكتملة</span>
            <CheckCircle2 size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{deliveredOrders}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            آخر الطلبات
          </h2>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد طلبات بعد</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const StatusIcon = statusIcons[order.status] || Clock;
                return (
                  <Link
                    key={order.id}
                    href={`/admin/orders`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-1.5 rounded-lg ${statusColors[order.status]}`}
                      >
                        <StatusIcon size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          #{order.id} - {order.customerName}
                        </p>
                        <p className="text-xs text-gray-500">{order.city}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-900 text-sm">
                        {order.total.toFixed(0)} درهم
                      </p>
                      <p className="text-xs text-gray-400">
                        {statusLabels[order.status]}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">روابط سريعة</h2>
          <div className="space-y-3">
            <Link
              href="/admin/products/new"
              className="block p-4 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors text-brand-800 font-medium"
            >
              + إضافة منتج جديد
            </Link>
            <Link
              href="/admin/products"
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              إدارة المنتجات ({totalProducts})
            </Link>
            <Link
              href="/admin/categories"
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              إدارة الفئات
            </Link>
            <Link
              href="/admin/orders"
              className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              إدارة الطلبات ({pendingOrders} بانتظار)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}