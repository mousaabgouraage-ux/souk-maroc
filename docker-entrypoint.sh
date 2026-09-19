#!/bin/sh
set -e

# مع قاعدة سحابية (PostgreSQL/Neon) لا نحتاج لإنشاء ملفات قاعدة محلية.
# ننتظر جاهزية قاعدة البيانات ثم نبدأ الخادم.
echo "Starting Next.js production server on port ${PORT:-3000}..."
exec node node_modules/.bin/next start