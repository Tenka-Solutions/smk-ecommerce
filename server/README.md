# Backend cPanel Hub Cafe / SMK Vending

Este directorio contiene el backend real de produccion para pedidos, pagos Flow y administracion. El flujo cPanel usa `server/cotizacion-server.js` y no depende de `src/app/api` ni de `src/modules`.

## Estructura para cPanel

Subir estos archivos a `public_html/server/`:

```txt
public_html/server/
├─ cotizacion-server.js
├─ orders-store.js
├─ README.md
└─ data/
   ├─ orders.json
   └─ products-stock.json
```

## Instalacion local

```bash
npm install
npm run start:cotizacion
```

El backend escucha por defecto en `http://localhost:3001`.

## Variables server/.env

Crear `server/.env` en cPanel. No subir secretos al repositorio.

```env
PORT=3001
ALLOWED_ORIGIN=https://hubcafe.cl

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
FLOW_CONFIRMATION_URL=https://smkvending.cl/api/payments/flow/webhook
FLOW_RETURN_URL=https://hubcafe.cl/pago-confirmado

ADMIN_PANEL_URL=https://hubcafe.cl/admin/pedidos
```

En desarrollo se puede usar `ALLOWED_ORIGIN=*` o incluir localhost. En produccion debe quedar `https://hubcafe.cl`.

## Configuracion Flow

Confirmation URL:

```txt
https://smkvending.cl/api/payments/flow/webhook
```

Return URL:

```txt
https://hubcafe.cl/pago-confirmado
```

El servidor consulta Flow con `FLOW_API_KEY` y `FLOW_SECRET_KEY`. Nunca marca un pedido como pagado usando datos del frontend.

## Rutas

```txt
GET    /health
POST   /enviar-cotizacion
POST   /api/orders/create
GET    /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id/status
POST   /api/payments/flow/webhook
POST   /api/payments/flow/confirm
GET    /api/payments/flow/return
```

## Pruebas locales

Health:

```bash
curl http://localhost:3001/health
```

Crear pedido:

```bash
curl -X POST http://localhost:3001/api/orders/create \
  -H "Content-Type: application/json" \
  -d "{\"customer\":{\"name\":\"Cliente Demo\",\"email\":\"cliente@example.com\",\"phone\":\"+56912345678\"},\"cart\":[{\"id\":\"CAFE-1\",\"sku\":\"CAFE-1\",\"name\":\"Cafe demo\",\"quantity\":1,\"price\":1000}]}"
```

Listar pedidos:

```bash
curl http://localhost:3001/api/orders
```

Webhook con token real de Flow:

```bash
curl -X POST http://localhost:3001/api/payments/flow/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "token=TOKEN_REAL_DE_FLOW"
```

Para verificar idempotencia, repetir el webhook con el mismo token real. El pedido debe seguir `PAGADO`, `stockDiscounted` debe quedar en `true` una sola vez y `paidEmailSent` debe quedar en `true` una sola vez.

## cPanel

1. Subir `cotizacion-server.js`, `orders-store.js`, `README.md` y `data/` a `public_html/server/`.
2. Crear `public_html/server/.env` con las variables de produccion.
3. En "Setup Node.js App", seleccionar Node.js 18 o superior.
4. Configurar el startup file como `server/cotizacion-server.js` o `cotizacion-server.js` segun el document root elegido.
5. Ejecutar `npm install` desde la app Node.
6. Reiniciar la Node App desde cPanel.
7. Probar `https://smkvending.cl/api/health` o `https://smkvending.cl/health` segun el proxy configurado.

Si cPanel publica la app bajo otra ruta base, ajustar el proxy para que las rutas finales queden en `https://smkvending.cl/api/...`.
