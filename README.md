# 🛍️ سوما ماركت — SuMa MarKet

متجر إلكتروني متكامل بالأدمن **SuMa MarKet** مبنٍ بـ **Next.js 14 (App Router)** + **TypeScript** + **Tailwind CSS** + **Prisma** مع قاعدة بيانات **PostgreSQL** سحابية (Neon).

> مشروع مغربي للتجارة الإلكترونية بخيار **الدفع عند الاستلام (COD)** ولوحة تحكم إدارية كاملة بالعربية.

---

## ✨ المميزات

| الواجهة (Storefront) | لوحة الإدارة (Admin) |
|----------------------|----------------------|
| 🏠 صفحة رئيسية مع المنتجات المميزة | 🔐 دخول آمن (JWT + كوكي httpOnly) |
| 🗂️ تصفح حسب التصنيفات | 📦 إدارة المنتجات (إضافة/تعديل/حذف نهائي) |
| 🖼️ صور متعددة للمنتج + ألوان ومقاسات | 🗃️ إدارة التصنيفات |
| 🛒 سلة تسوق على المتصفح | 📋 إدارة الطلبات وتحديث الحالة |
| 🚚 صفحة طلب بالدفع عند الاستلام (COD) | ⚙️ إعدادات المتجر (الشحن/المدن) |
| 📱 تصميم متجاوب (موبايل/حاسوب) | 🖼️ رفع صور مرفوعات |

---

## 🧑‍💻 التقنيات

- **Next.js 14** (App Router) — React 18, Server Components
- **TypeScript** 5.x
- **Tailwind CSS** 3.x
- **Prisma ORM** 5.x + **PostgreSQL** (Neon)
- **jose** — JWT للتوقيع الآمن (HS256, صلاحية 7 أيام)
- **Zod** — التحقق من صحة النماذج
- **bcryptjs** — (متوفر) تشفير كلمات المرور
- **Docker** — نشر حاويات متعدد المراحل

---

## 📁 هيكل المشروع

```
.
├── prisma/
│   ├── schema.prisma      # مخطط قاعدة البيانات
│   └── seed.ts            # بيانات أولية (تصنيفات ومنتجات تجريبية)
├── public/uploads/        # الصور المرفوعة (حجم دائم في Docker)
├── src/
│   ├── app/
│   │   ├── (storefront)   # الصفحة الرئيسية، المنتجات، السلة، الطلب
│   │   ├── admin/         # لوحة الإدارة (protected)
│   │   └── api/           # REST endpoints (protected)
│   ├── components/        # مكونات الواجهة ولوحة الإدارة
│   └── lib/
│       ├── auth.ts        # مصادقة الأدمن (JWT, CSRF, fail-closed)
│       ├── prisma.ts      # اتصال Prisma (مفرد عبر dev/prod)
│       ├── settings.ts    # إعدادات المتجر
│       └── types.ts       # الأنواع المشتركة
├── Dockerfile            # صورة نشر متعددة المراحل
├── docker-compose.yml    # تشغيل محلي بالحاوية
└── .env.example          # قالب الإعدادات (بدون أسرار)
```

---

## 🚀 التشغيل المحلي

### 1) المتطلبات
- Node.js **20+**
- حساب على [Neon](https://neon.tech) (PostgreSQL مجاني) — أو أي PostgreSQL

### 2) الإعداد
```bash
# تثبيت الاعتمادات
npm install

# إنشاء ملف الإعدادات من القالب
cp .env.example .env
```

ثم املأ `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST-POOLER.region.neon.tech/DB?sslmode=require&connection_limit=1"
DIRECT_URL="postgresql://USER:PASSWORD@HOST-DIRECT.region.neon.tech/DB?sslmode=require"

ADMIN_EMAIL="admin@sumamarket.com"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="كلمة-مرور-قوية"

# مفتاح توقيع الجلسات (ولّد قيماً عشوائية)
AUTH_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('hex'))")"

NODE_ENV="development"
```

> ⚠️ **لا ترفع `.env` أبداً إلى git** — إنه مستبعد تلقائياً.

### 3) تجهيز قاعدة البيانات
```bash
# توليد Prisma Client + إنشاء الجداول + البيانات الأولية
npm run setup
```

### 4) التشغيل
```bash
npm run dev        # التطوير على http://localhost:3000
npm run build && npm start   # الإنتاج
```

**لوحة الإدارة:** http://localhost:3000/admin (باستخدام `ADMIN_EMAIL`/`ADMIN_USERNAME` + `ADMIN_PASSWORD`)

---

## 📦 النشر

### الخيار أ — Railway / Render (موصى به)
المشروع جاهز للرفع كحاوية Docker. تحتاج فقط إلى:

1. ربط المستودع في المنصة (GitHub).
2. ضبط env vars: `DATABASE_URL`, `DIRECT_URL`, `ADMIN_EMAIL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `AUTH_SECRET`.
3. إضافة **Volume** دائم إلى مسار `/app/public/uploads` (للصور المرفوعة).
4. ترقية المشروع — ستحصل على رابط HTTPS عام دائم.

### الخيار ب — Docker محلياً
```bash
docker compose up -d --build
# المتجر على http://localhost:3000
```

> تقوم الحاوية بتطبيق مخطط قاعدة البيانات وتشغيل خادم `next start` في الإنتاج مع استقبال الإعدادات من متغيرات البيئة.

---

## 🔐 الأمان

- **لا أسرار في الملفات منشورة** — جميع الإعدادات من متغيرات البيئة.
- **فشل مضمون (Fail-closed)** في الإنتاج: النظام يتوقف إن غاب أي متغير أساسي.
- مصادقة **JWT** في كوكي `httpOnly` + `SameSite=Lax` + `Secure` في الإنتاج.
- حماية **CSRF** عبر فحص `Origin` على طرق الكتابة.
- مقارنة كلمات مرور مقاومة لهجمات التوقيت (`timingSafeEqualStr`).
- `AUTH_SECRET` مستقل عن كلمة المرور، مولّد عشوائياً لكل نشر.

---

## 🗄️ قاعدة البيانات

- بُنية البيانات في `prisma/schema.prisma`: التصنيفات، المنتجات (بصور متعددة)، الطلبات (بنود + COD)، الإعدادات.
- الترحيل: `npm run db:push` / عبر `npx prisma migrate dev` للمشاريع الجديدة.
- البيانات الأولية: `npm run db:seed`.
- النسخة الاحتياطية المحلية من SQLite القديمة (اختياري): موجودة بعيداً عن المستودع.

---

## 📝 الترخيص
مشروع خاص — غير مصرح بإعادة التوزيع دون إذن مسبق.

---

⚡ **SuMa MarKet** — متجرك المغربي من المحل إلى الباب، مع الدفع عند الاستلام.