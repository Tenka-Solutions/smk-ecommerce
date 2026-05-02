# SMK Vending Ecommerce

Base de ecommerce profesional construida con Next.js 16, React 19, TypeScript y Tailwind CSS 4.

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4
- Supabase para backend, auth y persistencia
- Getnet como gateway de pago preparado para integración
- Resend como proveedor de correos transaccionales

## Puesta en marcha

1. Instala dependencias:

```bash
npm install
```

2. Crea tu archivo local de variables:

```bash
cp .env.example .env.local
```

3. Si usarás Supabase, crea el esquema:

```bash
supabase db reset
```

4. Inicia el proyecto:

```bash
npm run dev
```

## Modos de integración

- `PAYMENTS_MODE=mock`: flujo local listo para demo y QA visual.
- `PAYMENTS_MODE=getnet`: preparado para conectar la integración final del comercio.
- `EMAIL_MODE=log`: registra correos en consola.
- `EMAIL_MODE=resend`: envía correos reales usando Resend.

## Estructura

- `src/app`: rutas, layouts y handlers
- `src/components`: componentes reutilizables
- `src/modules`: dominio, repositorios y casos de uso
- `src/lib`: clientes externos, configuración y utilidades
- `supabase`: migraciones y seed inicial

## Backend real Hub Cafe en cPanel

El flujo real de produccion de pedidos, pagos Flow, webhook, stock y correos de Hub Cafe vive en `hubcafe-backend/`.

Destino correcto en cPanel:

```txt
public_html/hubcafe-backend/
```

No usar `public_html/server/` para Hub Cafe. Esa carpeta queda reservada para el backend viejo de SMK Vending y no debe modificarse como parte de este despliegue.

El frontend publico `https://hubcafe.cl` debe usar:

```env
NEXT_PUBLIC_API_BASE_URL=https://smkvending.cl/hubcafe-api
```

URLs Flow:

- Confirmation URL: `https://smkvending.cl/hubcafe-api/payments/flow/webhook`
- Return URL: `https://hubcafe.cl/pago-confirmado`

Antes de pagos reales ejecutar la migracion:

```txt
supabase/migrations/20260502090000_hubcafe_backend_idempotency.sql
```

`src/app/api/payments/**` y el flujo de pagos dentro de Next quedan como legado/respaldo. El flujo operativo real para cPanel usa `hubcafe-backend/app.js`.

Ver instrucciones completas en `hubcafe-backend/README.md`.
