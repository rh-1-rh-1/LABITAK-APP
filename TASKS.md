# TASKS.md

> القاعدة: مهمة واحدة في كل مرة، وكل مهمة تعدّل 1-3 ملفات ولها نتيجة قابلة للتحقق. بعد كل مهمة ناجحة: `git commit`.
> علّم المهمة الحالية بـ `← الحالية`.

## Sprint 0 — تجهيز البيئة

- [ ] تثبيت Node.js 20 وDocker Desktop وGit والتأكد منها بأوامر `--version` ← الحالية
- [ ] إنشاء مستودع Git وملف `.gitignore` (node_modules, .env, dist)
- [ ] إنشاء `.env.example` بالمتغيرات: DATABASE_URL, REDIS_URL, JWT_SECRET, FCM_KEY
- [ ] إنشاء `docker-compose.yml` يشغّل PostgreSQL+PostGIS وRedis فقط
- [ ] إنشاء `infra/postgres/init.sql` لتفعيل `CREATE EXTENSION postgis;`
- [ ] التحقق: `docker compose up -d` ثم الاتصال بقاعدة البيانات و`SELECT PostGIS_Version();`

## Sprint 1 — الخلفية (Backend) الأساسية

- [ ] إنشاء مشروع MedusaJS 2.x داخل `apps/backend` وربطه بقاعدة البيانات
- [ ] تشغيل الخادم والتأكد من صفحة الصحة (health) ولوحة Medusa Admin
- [ ] إعداد TypeScript صارم وESLint وPrettier
- [ ] إنشاء `packages/shared-types` بأنواع OrderStatus وPricingType وUserRole

## Sprint 2 — المستخدمون والمصادقة

- [ ] Module `users`: جدول المستخدمين بالحقول (phone, role, locale, fcm_token)
- [ ] مسار `POST /auth/otp/request` (ببيئة تطوير: OTP ثابت للتجربة)
- [ ] مسار `POST /auth/otp/verify` يُرجع JWT
- [ ] Middleware للتحقق من JWT والدور
- [ ] ربط Firebase Auth الحقيقي بدل OTP التجريبي
- [ ] اختبارات المصادقة

## Sprint 3 — البائعون والمنتجات

- [ ] Module `vendor`: جداول vendors وvendor_members مع الموقع الجغرافي
- [ ] مسارات إدارة البائع (إنشاء/تعديل/فتح-إغلاق) للأدمن
- [ ] جدول المنتجات مع `pricing_type` وحقول الوزن
- [ ] مسارات CRUD للمنتجات لموظفي المطعم
- [ ] مسار تصفح عام: `GET /store/vendors` و`GET /store/vendors/:id/products`
- [ ] إدخال بيانات تجريبية (seed) لـ 3 بائعين و20 منتجاً

## Sprint 4 — الطلبات (بدون وزن مرن بعد)

- [ ] جدول العناوين ومسارات إدارتها
- [ ] Module `order` المخصص: جداول orders وorder_items
- [ ] مسار `POST /store/orders` مع حساب الإجمالي والتحقق
- [ ] آلة الحالات (State Machine) لانتقالات الطلب مع رفض الانتقالات غير المسموحة
- [ ] مسارات المطعم: عرض الطلبات، `accept`، `preparing`، `ready`
- [ ] اختبارات دورة حياة الطلب

## Sprint 5 — السعر المرن

- [ ] دالة حساب `line_total` للمنتجات بالوزن (مع اختبارات وحدة)
- [ ] مسار `POST /vendor/orders/:id/weights` لإدخال الأوزان الفعلية
- [ ] إعادة حساب الإجمالي النهائي وحفظه
- [ ] حالة `awaiting_customer` عند تجاوز حدّ التسامح
- [ ] مسار تأكيد/رفض العميل للسعر الجديد
- [ ] اختبارات السيناريوهات (وزن أقل، أكثر، ضمن التسامح، خارجه)

## Sprint 6 — السائقون والإسناد

- [ ] Module `driver`: جدول drivers مع `geography(Point,4326)` وفهرس GIST
- [ ] مسار `POST /driver/location` وتحديث `last_seen_at`
- [ ] مسار تفعيل/تعطيل توفر السائق
- [ ] دالة `findNearestDrivers(lat, lng, limit)` بـ PostGIS KNN
- [ ] Module `delivery`: جدول deliveries
- [ ] مهمة BullMQ للإسناد: إرسال للأقرب، مهلة 30 ثانية، ثم التالي
- [ ] مسارات السائق: accept, picked-up, arrived, delivered
- [ ] اختبارات الإسناد (سائق واحد، عدة سائقين، لا أحد متاح)

## Sprint 7 — التتبع اللحظي

- [ ] إعداد WebSocket في الخلفية مع المصادقة
- [ ] قنوات `order:{id}` و`vendor:{id}` و`driver:{id}`
- [ ] بث تحديثات الحالة عند كل انتقال
- [ ] بث موقع السائق للعميل صاحب الطلب فقط
- [ ] تحديد معدل إرسال الموقع (Throttle) كل 3-5 ثوانٍ

## Sprint 8 — الصلاحيات (Permify)

- [ ] إضافة Permify في `docker-compose.yml`
- [ ] كتابة مخطط الصلاحيات للأدوار الخمسة
- [ ] Middleware للتحقق عبر Permify في المسارات الحساسة
- [ ] اختبارات (عميل لا يرى طلب غيره، مطعم لا يرى طلبات بائع آخر)

## Sprint 9 — تطبيق المطعم (Restaurant PWA)

- [ ] إنشاء مشروع Next.js في `apps/restaurant-pwa` مع RTL وترجمة ar/en
- [ ] صفحة تسجيل الدخول
- [ ] شاشة المطبخ الحية (Kitchen Display) عبر WebSocket
- [ ] أزرار قبول/تحضير/جاهز
- [ ] نموذج إدخال الأوزان الفعلية
- [ ] صفحة إدارة المنتجات
- [ ] تفعيل PWA (manifest وservice worker)

## Sprint 10 — تطبيق العميل (Customer PWA)

- [ ] إنشاء مشروع Next.js في `apps/customer-pwa` مع RTL وترجمة
- [ ] تسجيل الدخول بالهاتف وOTP
- [ ] صفحة قائمة البائعين وصفحة المنتجات
- [ ] السلة (مع اختيار الوزن التقديري للمنتجات بالوزن)
- [ ] شاشة العناوين واختيار الموقع على الخريطة (Leaflet)
- [ ] إتمام الطلب (COD)
- [ ] صفحة تتبع الطلب مع خريطة السائق اللحظية
- [ ] شاشة تأكيد السعر الجديد (السعر المرن)

## Sprint 11 — المنبّه

- [ ] Module `alarm` وجدول alarms
- [ ] إرسال Web Push عند `picked_up` و`arrived`
- [ ] شاشة المنبّه بملء الشاشة مع صوت وزر "أنا بانتظار الطلب"
- [ ] تسجيل `acknowledged_at`
- [ ] إعادة المنبّه إن لم يُؤكَّد خلال مدة محددة

## Sprint 12 — تطبيق السائق (Android)

- [ ] إنشاء مشروع React Native في `apps/driver-app`
- [ ] تسجيل الدخول
- [ ] شاشة التوفر (متصل/غير متصل)
- [ ] تتبع الموقع في الخلفية وإرساله للخلفية
- [ ] شاشة استقبال الطلب مع العد التنازلي للقبول
- [ ] شاشة الطلب الحالي والملاحة (OSRM) وأزرار الحالات
- [ ] اختبار على جهاز Android حقيقي

## Sprint 13 — الخرائط والبنية المفتوحة

- [ ] إضافة Protomaps/Photon/OSRM لـ `docker-compose.yml` ببيانات الأردن
- [ ] ربط البحث عن العناوين بـ Photon
- [ ] ربط حساب المسار والوقت بـ OSRM

## Sprint 14 — لوحة الإدارة

- [ ] إنشاء مشروع Next.js في `apps/admin-pwa`
- [ ] خريطة الأسطول الحية (Fleet Map)
- [ ] إدارة المستخدمين والبائعين والسائقين
- [ ] قائمة الطلبات مع الفلترة

## Sprint 15 — الاختبار والإطلاق

- [ ] اختبار شامل لرحلة الطلب من البداية للنهاية
- [ ] مراجعة الأمان (المصادقة، الصلاحيات، تحديد المعدل)
- [ ] إعداد النشر (VPS أو سحابة) وملفات Docker للإنتاج
- [ ] نسخ احتياطي لقاعدة البيانات
- [ ] إطلاق تجريبي مع بائع وسائقين محدودين
