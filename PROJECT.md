# PROJECT.md — القرارات المعمارية وقواعد العمل

> هذا الملف مرجع ثابت. اقرأه كاملاً في بداية كل جلسة قبل أي تعديل، ولا تغيّر القرارات هنا دون موافقة صريحة.

## 1. قواعد للوكيل (AI Agent Rules)

1. نفّذ **المهمة الحالية فقط** من `TASKS.md` (المعلّمة بـ `← الحالية`).
2. عدّل **1 إلى 3 ملفات** كحد أقصى في كل مهمة.
3. لا تضف مكتبات جديدة دون ذكرها صراحة والسبب.
4. اكتب TypeScript صارماً (`strict: true`)، بدون `any` إلا لضرورة موثقة بتعليق.
5. أسماء المتغيرات والدوال بالإنجليزية، والتعليقات بالإنجليزية أو العربية.
6. نصوص الواجهة تُوضع في ملفات ترجمة (ar/en) ولا تُكتب مباشرة في المكونات.
7. كل ميزة جديدة تأتي مع اختبار واحد على الأقل.
8. عند الانتهاء: اشرح ما تغيّر بجملتين، وحدّث `TASKS.md` فقط إن طُلب منك.
9. إذا لم تكن متأكداً من واجهة MedusaJS 2.x، **لا تخمّن**: اطلب من المستخدم لصق الوثائق ذات الصلة (docs.medusajs.com).

## 2. المعمارية

- **Monorepo** بمجلدات `apps/` و`packages/`.
- **Backend واحد** (MedusaJS 2.x) تخدمه التطبيقات الأربعة عبر REST + WebSocket.
- **Modular**: كل منطق عمل مخصص في Medusa Module مستقل (`vendor`, `driver`, `delivery`, `flexible-pricing`, `alarm`).
- **أحداث**: Redis Streams + BullMQ للمهام غير المتزامنة (إسناد السائق، الإشعارات، المنبّه).
- **الصلاحيات**: Permify بأدوار `customer`, `driver`, `vendor_staff`, `vendor_owner`, `admin`.

## 3. دورة حياة الطلب (Order Lifecycle)

```
pending            ← العميل أنشأ الطلب (COD)
accepted           ← المطعم قبل
weighing           ← (فقط إن وُجد منتج بالوزن) المطعم يدخل الأوزان الفعلية
awaiting_customer  ← (اختياري) السعر تغيّر وننتظر تأكيد العميل
preparing          ← قيد التحضير
ready              ← جاهز للاستلام
driver_assigned    ← إسناد لأقرب سائق (PostGIS KNN)
picked_up          ← السائق استلم الطلب      ← يُرسل منبّه #1 للعميل
arrived            ← السائق وصل للموقع       ← يُرسل منبّه #2 للعميل
delivered          ← تم التسليم وتحصيل النقد
cancelled          ← ملغى (مع سبب)
```

## 4. نموذج البيانات المبدئي

- `users` (id, phone, name, role, locale, fcm_token)
- `addresses` (id, user_id, label, location geography(Point,4326), details)
- `vendors` (id, name, type[restaurant|grocery|pharmacy], location, is_open)
- `vendor_members` (vendor_id, user_id, role)
- `products` (id, vendor_id, name_ar, name_en, pricing_type[fixed|by_weight], unit_price, unit[kg|piece], min_weight, is_available)
- `orders` (id, customer_id, vendor_id, address_id, status, subtotal_estimated, subtotal_final, delivery_fee, payment_method='cod')
- `order_items` (id, order_id, product_id, quantity, estimated_weight, actual_weight, line_total_estimated, line_total_final)
- `drivers` (user_id, is_available, current_location geography(Point,4326), last_seen_at)
- `deliveries` (id, order_id, driver_id, status, assigned_at, picked_up_at, arrived_at, delivered_at)
- `alarms` (id, order_id, type[picked_up|arrived], sent_at, acknowledged_at)

## 5. قواعد العمل الأساسية

**السعر المرن**
- المنتج بالوزن: `line_total_estimated = unit_price × estimated_weight`.
- عند إدخال المطعم للوزن الفعلي: `line_total_final = unit_price × actual_weight`.
- إذا اختلف الإجمالي، يُرسل إشعار للعميل بالسعر النهائي. حدّ التسامح (مثلاً ±10%) يُحدد في الإعدادات.

**إسناد السائق**
```sql
SELECT user_id FROM drivers
WHERE is_available = true AND last_seen_at > now() - interval '2 minutes'
ORDER BY current_location <-> ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
LIMIT 5;
```
- يُرسل الطلب لأقرب سائق مع مهلة قبول (مثلاً 30 ثانية)، فإن رفض أو انتهت المهلة ينتقل للتالي.

**المنبّه**
- V1 على PWA: Web Push + شاشة تنبيه داخل التطبيق مع صوت. (الـ Full-Screen Intent الحقيقي يتطلب تطبيقاً أصلياً وهو في V2.)
- يُسجّل `acknowledged_at` عند ضغط "أنا بانتظار الطلب".

## 6. واجهات API (مسودة)

- `POST /store/orders` إنشاء طلب
- `GET /store/orders/:id` تفاصيل وحالة
- `GET /vendor/orders` طلبات المطعم (+ WebSocket للحي)
- `POST /vendor/orders/:id/accept`
- `POST /vendor/orders/:id/weights` إدخال الأوزان الفعلية
- `POST /driver/location` تحديث الموقع
- `POST /driver/deliveries/:id/accept|picked-up|arrived|delivered`
- `GET /admin/fleet` مواقع الأسطول
- WebSocket: `order:{id}` للتتبع، `vendor:{id}` للمطبخ، `driver:{id}` للسائق

## 7. معايير الجودة (Definition of Done)

- يعمل الكود محلياً دون أخطاء.
- الاختبار الخاص بالمهمة ينجح.
- لا أخطاء TypeScript أو ESLint.
- تم عمل `git commit` برسالة واضحة.

## 8. ملاحظات على الأدوات المحلية

- النماذج المحلية الصغيرة (7B) ضعيفة في أطر حديثة مثل MedusaJS 2.x. للمهام الصعبة (Modules، Workflows) استخدم نموذجاً أكبر أو الصق الوثائق في المحادثة.
- ابدأ محادثة جديدة لكل مهمة.
