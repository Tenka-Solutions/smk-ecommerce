# Auditoria Supabase - Hub Cafe / SMK Vending

Fecha: 2026-05-02

## Alcance

Auditoria previa al refactor de `server/cotizacion-server.js` para que Supabase sea la unica fuente de verdad del backend Express/cPanel.

No se implementaron cambios de logica en esta fase. No se crearon tablas, migraciones ni clientes nuevos.

## Archivos revisados

- `server/cotizacion-server.js`
- `server/orders-store.js`
- `server/data/orders.json`
- `server/data/products-stock.json`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/server.ts`
- `src/lib/env.ts`
- `src/modules/catalog/repository.ts`
- `src/modules/catalog/admin.ts`
- `src/modules/orders/service.ts`
- `src/modules/orders/admin.ts`
- `src/modules/payments/service.ts`
- `src/modules/payments/providers/flow/index.ts`
- `supabase/migrations/*.sql`
- `supabase/seed.sql`
- `scripts/check-last-payment.mjs`
- `scripts/test-flow-payment.mjs`

## Tablas que ya parecen existir

Segun las migraciones locales, el proyecto ya define estas tablas en `public`:

- `categories`
- `products`
- `product_images`
- `profiles`
- `roles`
- `user_roles`
- `orders`
- `order_items`
- `order_shipping_addresses`
- `payment_attempts`
- `order_events`
- `email_logs`
- `quote_requests`
- `quote_request_items`
- `payments`

Tambien existen enums relevantes:

- `availability_status`
- `publication_status`
- `order_status`
- `payment_status`
- `quote_status`
- `payment_domain_status`
- `payment_domain_provider`

## Modelo detectado en migraciones

### `categories`

Columnas base detectadas:

- `id text primary key`
- `name text`
- `slug text unique`
- `description text`
- `sort_order integer`
- `is_visible boolean`
- `seo_title text`
- `seo_description text`
- `created_at timestamptz`
- `updated_at timestamptz`

Columnas agregadas despues:

- `parent_id text references categories(id)`
- `is_active boolean`
- `image_url text`

### `products`

Columnas base detectadas:

- `id text primary key`
- `category_id text references categories(id)`
- `name text`
- `slug text unique`
- `sku text`
- `short_description text`
- `long_description text`
- `price_clp_tax_inc integer`
- `availability_status availability_status`
- `publication_status publication_status`
- `is_featured boolean`
- `sort_order integer`
- `seo_title text`
- `seo_description text`
- `primary_image_path text`
- `created_at timestamptz`
- `updated_at timestamptz`

Columnas agregadas despues:

- `net_price_clp integer`
- `gross_price_clp integer`
- `stock_quantity integer`
- `highlights jsonb`
- `gallery_images jsonb`
- `brand text`
- `ean text`

Stock real ya parece estar en `products.stock_quantity`. No crear una tabla `stock` sin confirmar necesidad.

### `orders`

Columnas base detectadas:

- `id uuid primary key`
- `order_number text unique`
- `user_id uuid references auth.users(id)`
- `customer_email text`
- `customer_name text`
- `phone text`
- `rut text`
- `company_name text`
- `business_name text`
- `business_activity text`
- `subtotal_tax_inc integer`
- `tax_amount integer`
- `shipping_label text`
- `shipping_amount integer`
- `total_tax_inc integer`
- `order_status order_status`
- `payment_status payment_status`
- `payment_provider text`
- `latest_payment_attempt_id uuid`
- `created_at timestamptz`
- `updated_at timestamptz`

Columnas agregadas despues:

- `archived_at timestamptz`
- `archived_by uuid references auth.users(id)`
- `internal_note text`

El backend JSON usa nombres distintos (`paymentStatus`, `managementStatus`, `paidAt`, `flowToken`, `flowPaymentId`, `stockDiscounted`, `paidEmailSent`). Para migrar sin duplicar, hay que mapear esos campos contra columnas existentes o agregar columnas puntuales con migraciones idempotentes solo si Supabase real no las tiene.

### `order_items`

Columnas detectadas:

- `id uuid primary key`
- `order_id uuid references orders(id)`
- `product_id text references products(id)`
- `product_snapshot jsonb`
- `sku_snapshot text`
- `name_snapshot text`
- `quantity integer`
- `unit_price_tax_inc integer`
- `line_total_tax_inc integer`
- `created_at timestamptz`

### `order_events`

Columnas detectadas:

- `id uuid primary key`
- `order_id uuid references orders(id)`
- `event_type text`
- `payload jsonb`
- `created_at timestamptz`

### `payment_attempts`

Columnas detectadas:

- `id uuid primary key`
- `order_id uuid references orders(id)`
- `provider text`
- `reference text unique`
- `provider_transaction_id text`
- `status payment_status`
- `request_payload jsonb`
- `response_payload jsonb`
- `redirect_url text`
- `confirmed_at timestamptz`
- `created_at timestamptz`

Esta tabla parece el mejor lugar para guardar token Flow, `commerceOrder`, payloads de Flow y estado de intento de pago, evitando columnas nuevas en `orders` si no son estrictamente necesarias.

### `payments`

Existe una segunda tabla de dominio:

- `id uuid`
- `order_id uuid`
- `amount integer`
- `currency text`
- `status payment_domain_status`
- `provider payment_domain_provider`
- `provider_reference text`
- `created_at timestamptz`
- `updated_at timestamptz`

Riesgo: `payments` y `payment_attempts` pueden duplicar responsabilidad. Antes de refactorizar Flow en Express hay que decidir si se mantiene `payment_attempts` como fuente operativa o si `payments` es la tabla canonica del dominio.

## Logica que hoy usa JSON

### `server/orders-store.js`

Persiste pedidos en `server/data/orders.json` con formato:

```json
{
  "orders": []
}
```

Funciones exportadas:

- `ensureStore()`
- `readOrders()`
- `saveOrders()`
- `createOrder()`
- `listOrders()`
- `getOrder()`
- `updateOrder()`
- `setManagementStatus()`
- `addOrderEvent()`
- `markOrderAsPaid()`

### `server/cotizacion-server.js`

Usa `orders-store.js` para:

- `POST /enviar-cotizacion`
- `POST /api/orders/create`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- Webhook Flow
- Alias Flow confirm
- Return Flow

Tambien usa `server/data/products-stock.json` para stock con funciones locales:

- `readStockData()`
- `saveStockData()`
- `findStockProduct()`
- `discountStockForOrder()`

Esa logica debe quedar deprecated y reemplazarse por consultas/updates contra `products.stock_quantity`.

## Endpoints Express existentes

- `GET /health`
- `POST /enviar-cotizacion`
- `POST /api/orders/create`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `POST /api/payments/flow/webhook`
- `POST /api/payments/flow/confirm`
- `GET /api/payments/flow/return`

## Integracion Flow actual en Express

Funciones detectadas en `server/cotizacion-server.js`:

- `isFlowConfigured()`
- `createFlowPayment(order)`
- `getFlowPaymentStatus(token)`
- `signFlowParams(params)`
- `requestFlow(endpoint, params, method)`
- `processFlowToken(token)`
- `paymentSummaryFromFlow(flowStatus)`
- `mapFlowPaymentStatus(status)`

El webhook valida el token consultando a Flow antes de marcar pago. Eso debe preservarse.

## Correo actual

El servidor usa `nodemailer` con:

- `createTransporter()`
- `sendMail()`
- `sendPaidOrderEmail(order)`
- `sendQuoteEmail(order)`

Debe mantenerse, pero alimentado desde datos Supabase. Para idempotencia se puede usar `email_logs` o una columna/flag existente si Supabase real ya la trae.

## Uso previo de Supabase en el proyecto

### Clientes existentes en Next

- `src/lib/supabase/admin.ts`: usa `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.
- `src/lib/supabase/server.ts`: usa cliente SSR con anon key.
- `src/lib/supabase/client.ts`: cliente browser.

El backend cPanel necesita un cliente CommonJS propio en `server/lib/supabase-client.js`, usando variables backend `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.

### Catalogo

`src/modules/catalog/repository.ts` lee:

- `categories`
- `products`

Tiene fallback a seed local si Supabase no esta configurado o falla.

### Admin catalogo

`src/modules/catalog/admin.ts` muta:

- `categories`
- `products`
- `product_images`

Valida relaciones con:

- `order_items`
- `quote_request_items`

### Pedidos

`src/modules/orders/service.ts` crea y lee:

- `orders`
- `order_items`
- `order_shipping_addresses`
- `payment_attempts`
- `order_events`

Tiene fallback mock si Supabase admin no esta configurado.

### Admin pedidos

`src/modules/orders/admin.ts` administra:

- `orders`
- `order_items`
- `order_shipping_addresses`
- `payment_attempts`
- `order_events`

### Pagos

`src/modules/payments/service.ts` usa:

- `payment_attempts`
- `orders`
- `order_events`

Tambien existe `src/modules/payments/providers/flow/index.ts` para Flow en Next, pero el flujo real cPanel debe permanecer en Express.

## Que se debe migrar

- Crear `server/lib/supabase-client.js` CommonJS.
- Reemplazar `orders-store.js` en el flujo Express por repositorio Supabase o funciones dentro del backend.
- `POST /api/orders/create` debe:
  - Validar cliente.
  - Buscar productos reales en `products`.
  - Validar `publication_status`, `availability_status` y `stock_quantity`.
  - Calcular total con `gross_price_clp` o `price_clp_tax_inc`.
  - Insertar en `orders`.
  - Insertar en `order_items`.
  - Insertar `order_events`.
  - Crear `payment_attempts` para Flow.
  - Guardar token/URL Flow en `payment_attempts.response_payload` o `request_payload`.
- Webhook Flow debe:
  - Consultar Flow.
  - Buscar pedido por `commerceOrder`/`order_number` o referencia en `payment_attempts`.
  - Actualizar `orders.payment_status` y `orders.order_status`.
  - Actualizar `payment_attempts`.
  - Descontar `products.stock_quantity` una sola vez.
  - Insertar `order_events`.
  - Enviar correo una sola vez.
- `GET /api/orders`, `GET /api/orders/:id` y `PATCH /api/orders/:id/status` deben leer/escribir Supabase.
- `/enviar-cotizacion` debe seguir funcionando. Si representa cotizaciones, revisar si debe usar `quote_requests`/`quote_request_items` en lugar de crear `orders`.

## Riesgos de duplicacion

- Crear otra tabla `stock` duplicaria `products.stock_quantity`.
- Crear nuevas `orders`/`order_items` duplicaria tablas ya presentes.
- Usar `server/data/orders.json` en paralelo con Supabase crea dos fuentes de verdad.
- `payments` y `payment_attempts` ya conviven; agregar otra tabla Flow crearia una tercera fuente para pagos.
- Los estados actuales del Express estan en espanol/mayusculas:
  - `PENDIENTE_PAGO`
  - `PAGADO`
  - `RECHAZADO`
  - `ANULADO`
  - `NUEVO`
  - `EN_PREPARACION`
  - `LISTO_PARA_DESPACHO`
  - `DESPACHADO`
  - `CANCELADO`
- Supabase usa enums en ingles:
  - `payment_status`: `pending`, `paid`, `rejected`, `cancelled`
  - `order_status`: `pending`, `paid`, `rejected`, `cancelled`, `preparing`, `shipped`, `delivered`, mas `processing`, `completed`
- Hay que definir un mapa de estados antes de refactorizar endpoints.
- El descuento de stock idempotente necesita una marca persistente. Hoy JSON usa `stockDiscounted`; en Supabase no se detecto columna equivalente en migraciones. Opciones a validar:
  - Registrar evento unico `stock_discounted` en `order_events` y verificar existencia antes de descontar.
  - Agregar columna idempotente a `orders` si no existe en Supabase real.
  - Usar `payment_attempts.confirmed_at` mas evento, con cuidado porque pago confirmado no equivale necesariamente a stock descontado.
- El correo idempotente necesita marca persistente. Hoy JSON usa `paidEmailSent`; Supabase tiene `email_logs`, que parece el destino natural para evitar duplicados por `template_key + order_id`.

## Queries SQL para ejecutar manualmente en Supabase

### 1. Tablas

```sql
select table_name
from information_schema.tables
where table_schema = 'public';
```

### 2. Columnas

```sql
select table_name, column_name, data_type
from information_schema.columns
where table_schema = 'public';
```

### 3. Relaciones

```sql
select
  tc.table_name,
  kcu.column_name,
  ccu.table_name as foreign_table
from information_schema.table_constraints tc
join information_schema.key_column_usage kcu
  on tc.constraint_name = kcu.constraint_name
join information_schema.constraint_column_usage ccu
  on ccu.constraint_name = tc.constraint_name
where tc.constraint_type = 'FOREIGN KEY';
```

### 4. Policies

```sql
select * from pg_policies where schemaname = 'public';
```

### 5. Recomendadas para confirmar enums

```sql
select
  t.typname as enum_name,
  e.enumlabel as enum_value
from pg_type t
join pg_enum e on e.enumtypid = t.oid
join pg_namespace n on n.oid = t.typnamespace
where n.nspname = 'public'
order by t.typname, e.enumsortorder;
```

### 6. Recomendadas para confirmar constraints e indices

```sql
select
  conrelid::regclass as table_name,
  conname,
  contype,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where connamespace = 'public'::regnamespace
order by conrelid::regclass::text, conname;
```

```sql
select
  schemaname,
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
order by tablename, indexname;
```

## Decision pendiente antes de implementar

No avanzar con Fases 3 a 5 hasta tener el resultado real de las queries anteriores.

Una vez confirmado Supabase real:

1. Adaptar el modelo final a tablas/columnas existentes.
2. Crear solo migraciones puntuales e idempotentes si falta una marca necesaria para Flow/idempotencia.
3. Refactorizar Express a Supabase sin borrar JSON todavia.
4. Marcar JSON como deprecated en docs y codigo.

## Estado de esta auditoria

- No se crearon tablas.
- No se modifico logica backend.
- No se genero `schema.sql`.
- No se cambio Flow.
- No se cambio correo.
- No se cambio UI/catalogo.
