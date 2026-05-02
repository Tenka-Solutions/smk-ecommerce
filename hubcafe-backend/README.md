# Hub Cafe Backend

Backend Express CommonJS independiente para Hub Cafe. Usa Supabase como fuente unica de verdad y no depende de `public_html/server/`.

## Importante

No subir este backend a `public_html/server/`. Esa carpeta ya pertenece a SMK Vending.

Destino correcto en cPanel:

```txt
public_html/hubcafe-backend/
```

Rutas publicas recomendadas:

```txt
https://smkvending.cl/hubcafe-api/health
https://smkvending.cl/hubcafe-api/orders/create
https://smkvending.cl/hubcafe-api/orders
https://smkvending.cl/hubcafe-api/orders/:id
https://smkvending.cl/hubcafe-api/orders/:id/status
https://smkvending.cl/hubcafe-api/payments/flow/webhook
https://smkvending.cl/hubcafe-api/payments/flow/confirm
https://smkvending.cl/hubcafe-api/payments/flow/return
https://smkvending.cl/hubcafe-api/quotes/send
```

La app monta rutas en raiz y tambien bajo `/hubcafe-api`, para tolerar configuraciones de cPanel que preserven o retiren el prefijo.

## Tablas reutilizadas

Segun `docs/SUPABASE_AUDIT.md`, este backend reutiliza tablas existentes:

- `products`
- `orders`
- `order_items`
- `order_shipping_addresses`
- `payment_attempts`
- `order_events`
- `email_logs`
- `quote_requests`
- `quote_request_items`

No crea `products_new`, `orders_new`, `stock`, `flow_payments`, `orders_json`, `orders.json` ni `products-stock.json`.

## Instalacion local

```bash
cd hubcafe-backend
npm install
cp .env.example .env
npm start
```

Node.js requerido: 18 o superior.

## Variables

```env
PORT=3002
ALLOWED_ORIGIN=https://hubcafe.cl

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_API_KEY=

SMTP_HOST=
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
QUOTE_FROM_EMAIL=
QUOTE_TO_EMAIL=

FLOW_API_KEY=
FLOW_SECRET_KEY=
FLOW_BASE_URL=https://www.flow.cl/api
FLOW_CONFIRMATION_URL=https://smkvending.cl/hubcafe-api/payments/flow/webhook
FLOW_RETURN_URL=https://hubcafe.cl/pago-confirmado

ADMIN_PANEL_URL=https://hubcafe.cl/admin/pedidos
```

Nunca subir `.env` real. `SUPABASE_SERVICE_ROLE_KEY` es solo backend.

## Flow

Confirmation URL:

```txt
https://smkvending.cl/hubcafe-api/payments/flow/webhook
```

Return URL:

```txt
https://hubcafe.cl/pago-confirmado
```

El frontend nunca marca pagos como confirmados. El backend consulta Flow con el token y actualiza Supabase.

## cPanel

Opcion directa si cPanel permite asignar ruta/base path:

1. Subir la carpeta a `public_html/hubcafe-backend/`.
2. Crear `public_html/hubcafe-backend/.env`.
3. En "Setup Node.js App", seleccionar Node.js 18+.
4. App root: `public_html/hubcafe-backend`.
5. Startup file: `app.js`.
6. Ejecutar `npm install`.
7. Reiniciar la Node App.
8. Probar `https://smkvending.cl/hubcafe-api/health`.

Alternativa con rewrite/proxy si cPanel publica la app en un puerto interno:

```apache
RewriteEngine On
RewriteRule ^hubcafe-api/(.*)$ http://127.0.0.1:3002/hubcafe-api/$1 [P,L]
```

El soporte exacto de proxy depende del hosting. Si no permite `[P]`, configurar la Node App desde cPanel con el Application URL apuntando a `/hubcafe-api`.

## Pruebas

Health:

```bash
curl http://localhost:3002/health
curl http://localhost:3002/hubcafe-api/health
```

Crear pedido:

```bash
curl -X POST http://localhost:3002/orders/create \
  -H "Content-Type: application/json" \
  -d "{\"customer\":{\"name\":\"Cliente Demo\",\"email\":\"cliente@example.com\",\"phone\":\"+56912345678\"},\"cart\":[{\"id\":\"PRODUCT_ID_REAL\",\"quantity\":1}]}"
```

Listar pedidos:

```bash
curl "http://localhost:3002/orders?payment_status=pending" \
  -H "x-admin-api-key: TU_ADMIN_API_KEY"
```

Ver pedido:

```bash
curl http://localhost:3002/orders/SMK-YYYYMMDD-XXXXXXXX \
  -H "x-admin-api-key: TU_ADMIN_API_KEY"
```

Actualizar estado operativo:

```bash
curl -X PATCH http://localhost:3002/orders/ORDER_ID/status \
  -H "Content-Type: application/json" \
  -H "x-admin-api-key: TU_ADMIN_API_KEY" \
  -d "{\"orderStatus\":\"EN_PREPARACION\"}"
```

Webhook Flow con token real:

```bash
curl -X POST http://localhost:3002/payments/flow/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=TOKEN_REAL_DE_FLOW"
```

Cotizacion:

```bash
curl -X POST http://localhost:3002/quotes/send \
  -H "Content-Type: application/json" \
  -d "{\"customer\":{\"name\":\"Cliente Demo\",\"email\":\"cliente@example.com\",\"phone\":\"+56912345678\"},\"cart\":[{\"id\":\"PRODUCT_ID_REAL\",\"quantity\":1}],\"message\":\"Necesito cotizar\"}"
```

## Idempotencia

Stock:

- Se descuenta desde `products.stock_quantity`.
- El descuento se ejecuta con la RPC transaccional `hubcafe_discount_order_stock_once`.
- La migracion `20260502090000_hubcafe_backend_idempotency.sql` agrega un indice unico parcial para `order_events(order_id, event_type)` cuando `event_type = 'stock_discounted'`.
- Si Flow llama dos veces, el segundo webhook no descuenta stock de nuevo.

Correo:

- Antes de enviar correo de pedido pagado, reserva `email_logs` con `status = 'sending'`.
- La misma migracion agrega un indice unico parcial para `email_logs(order_id, template_key)` cuando el estado esta en `sending` o `sent`.
- Despues de enviar, actualiza `email_logs` a `sent`.
- Si Flow llama dos veces, el segundo webhook no duplica correo.

## Endpoints publicos y admin

Publicos:

```txt
POST /orders/create
POST /quotes/send
POST /payments/flow/webhook
POST /payments/flow/confirm
GET  /payments/flow/return
GET  /health
```

Admin protegidos con `ADMIN_API_KEY`:

```txt
GET   /orders
GET   /orders/:id
PATCH /orders/:id/status
```

Enviar la API key como:

```txt
x-admin-api-key: TU_ADMIN_API_KEY
```

Tambien se acepta `Authorization: Bearer TU_ADMIN_API_KEY`.

## Migracion requerida

Ejecutar en Supabase antes de produccion:

```txt
supabase/migrations/20260502090000_hubcafe_backend_idempotency.sql
```

Esta migracion no crea tablas nuevas. Agrega indices unicos parciales y la RPC transaccional para descontar stock una sola vez.

## Seguridad

- CORS debe quedar en produccion como `ALLOWED_ORIGIN=https://hubcafe.cl`.
- Los precios se calculan desde Supabase, nunca desde el frontend.
- Los pagos se confirman solo consultando Flow.
- No se guardan datos sensibles de tarjetas.
- No se exponen secretos en respuestas.

## JSON deprecated

El backend viejo en `server/` y sus JSON quedan como referencia tecnica de SMK Vending. Hub Cafe no usa JSON como persistencia principal.
