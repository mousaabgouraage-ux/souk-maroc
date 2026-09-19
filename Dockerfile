# ---- مرحلة التثبيت ----
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ---- مرحلة البناء ----
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

# متغيرات تُحقن وقت البناء من المنصة (مثلاً Railway) لاستخدامها أثناء
# توليد الصفحات الساكنة التي تلمس قاعدة البيانات. لا توجد أسرار في الصورة.
ARG DATABASE_URL
ARG DIRECT_URL
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# إنشاء عميل Prisma وتوليد البناء النهائي (لا يشمل الأسرار من .env)
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---- المرحلة النهائية (نسخة خفيفة) ----
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl

ENV NODE_ENV=production
ENV PORT=3000
ENV NEXT_TELEMETRY_DISABLED=1

# لا ننسخ الأسرار: المتغيرات ستُحقن عبر compose/env وقت التشغيل
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# تطبيق مخطط قاعدة البيانات على المزود السحابي عند أول تشغيل
# (آمن على البيانات: يضيف/يحدّث الجداول دون حذفها)
RUN mkdir -p /app/.prisma-bootstrap && cp -r /app/prisma/. /app/.prisma-bootstrap/

# دليل قابل للتخزين الدائم للصور المرفوعة
VOLUME ["/app/public/uploads"]

COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]