#!/bin/sh
set -e

# كل أول مرة: إن اعتمد حجم الدائم على مجلد prisma بحجم فارغ (منصات مثل
# Railway/Render تنشئ الحجم فارغاً عند التثبيت)، نعيد جدولة schema من
# النسخة الاحتياطية إلى مكانه.
if [ -d /app/.prisma-bootstrap ] && [ ! -f /app/prisma/schema.prisma ]; then
  echo "Bootstrap: restoring prisma files into volume..."
  cp -r /app/.prisma-bootstrap/. /app/prisma/
fi

# أنشئ قاعدة البيانات فقط عند أول تشغيل (إن لم تكن موجودة).
# لا يلمس قاعدة موجودة: يحافظ على المنتجات والطلبات.
if [ ! -f /app/prisma/dev.db ]; then
  echo "First run: creating database schema from Prisma..."
  npx prisma db push --schema /app/prisma/schema.prisma --skip-generate || true
else
  echo "Database already present - leaving existing data intact."
fi

echo "Starting Next.js production server on port ${PORT:-3000}..."
exec node node_modules/.bin/next start