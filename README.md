# نظام التوصيل متعدد البائعين (Multi-Vendor Delivery System)

منظومة توصيل متكاملة تجمع المطاعم والبقالة والصيدليات في مكان واحد، موجّهة للسوق العربي (الأردن والشرق الأوسط)، وتعمل بالعربية أولاً (RTL) مع دعم الإنجليزية.

## المشكلة التي يحلها

- **تعدد المصادر**: العميل يطلب طعاماً وبقالة وأدوية من مكان واحد.
- **التسعير المرن (Flexible Price)**: المنتجات التي تُباع بالوزن (أسماك، لحوم) يطلبها العميل بوزن تقديري، ثم يُدخل المتجر الوزن الفعلي ويُعاد حساب السعر تلقائياً مع إشعار العميل.
- **إزعاج الاتصال الهاتفي**: بدل اتصال السائق بالعميل، يصل العميل **منبّه (Alarm)** بملء الشاشة عند استلام الطلب وعند الوصول، مع زر تأكيد "أنا بانتظار الطلب".

## التطبيقات الأربعة

| التطبيق | النوع | المستخدم | الوظيفة |
|---|---|---|---|
| Customer | PWA (Next.js) | العميل | تصفح، سلة، طلب (COD)، تتبع السائق، استقبال المنبّه |
| Driver | تطبيق أصلي (React Native، Android أولاً) | السائق | استقبال الطلبات، ملاحة، تتبع الموقع في الخلفية |
| Restaurant | PWA (Next.js) | المطعم/المتجر | شاشة مطبخ حية، إدارة القوائم، إدخال الأوزان الفعلية |
| Admin | PWA (Next.js) | الإدارة | خريطة الأسطول، إدارة المستخدمين والصلاحيات |

## ميزات النسخة الأولى (V1)

1. رحلة الطلب الكاملة (سلة ← دفع عند الاستلام ← تتبع مباشر على الخريطة).
2. نظام السعر المرن بالوزن.
3. نظام المنبّه بملء الشاشة للعميل.
4. إسناد تلقائي لأقرب سائق متاح (PostGIS KNN).
5. شاشة مطبخ حية للمطعم.

## مؤجل لـ V2 وما بعده

- الدفع الإلكتروني (Stripe/Moyasar).
- تطبيق عميل أصلي (Expo) لمنبّهات أقوى.
- تطبيق iOS.
- التقارير المتقدمة وبرامج الولاء والكوبونات.

## التقنيات

- **Backend**: MedusaJS 2.x (Node.js/TypeScript) + واجهات API مخصصة
- **قاعدة البيانات**: PostgreSQL + PostGIS
- **الطوابير والأحداث**: Redis Streams + BullMQ
- **الصلاحيات**: Permify
- **الواجهات**: Next.js (PWA)
- **تطبيق السائق**: React Native + `react-native-nitro-location-tracking`
- **الخرائط**: Leaflet + Protomaps + Photon + OSRM (مفتوحة المصدر)
- **المصادقة**: رقم الهاتف + OTP (Firebase Auth)
- **الإشعارات**: FCM

## هيكل المجلدات

```
delivery-system/
├── README.md
├── PROJECT.md              # القرارات المعمارية وقواعد العمل (يقرؤه Aider)
├── TASKS.md                # قائمة المهام بالترتيب
├── docker-compose.yml      # Postgres+PostGIS, Redis, Permify, OSRM, Photon
├── .env.example
├── .gitignore
├── apps/
│   ├── backend/            # MedusaJS 2.x
│   │   └── src/
│   │       ├── modules/    # vendor, delivery, driver, flexible-pricing, alarm
│   │       ├── api/        # مسارات API المخصصة
│   │       ├── workflows/  # سير عمل الطلب والإسناد
│   │       ├── subscribers/# مستمعو الأحداث
│   │       └── jobs/       # مهام BullMQ
│   ├── customer-pwa/       # Next.js
│   ├── restaurant-pwa/    # Next.js
│   ├── admin-pwa/          # Next.js
│   └── driver-app/         # React Native
├── packages/
│   ├── shared-types/       # أنواع TypeScript المشتركة
│   ├── api-client/         # عميل API مشترك
│   └── ui/                 # مكونات واجهة مشتركة (RTL)
├── infra/
│   ├── postgres/init.sql   # تفعيل PostGIS
│   ├── osrm/
│   └── photon/
└── docs/
    ├── api.md
    └── order-lifecycle.md
```

## التشغيل المحلي

المتطلبات: Windows، Node.js 20+، Docker Desktop، Git، وذاكرة 16GB RAM على الأقل (يُفضّل 32GB).

```
git clone <رابط المستودع>
cd delivery-system
copy .env.example .env
docker compose up -d
```

ثم شغّل كل تطبيق حسب ملف README داخل مجلده (تُضاف مع تنفيذ المهام).

## خارطة الطريق

راجع `TASKS.md` للمهام التفصيلية مقسمة إلى Sprints.

## مواصفات جهاز التطوير

- نظام التشغيل: Windows
- RAM: ___ (أكمل هذه المعلومة)
- المعالج: ___
- كرت الشاشة: ___
