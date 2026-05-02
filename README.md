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

## Backend real cPanel

El flujo real de produccion para Hub Cafe / SMK Vending esta en `server/cotizacion-server.js`. Es un backend Express CommonJS pensado para ejecutarse en cPanel bajo `public_html/server/cotizacion-server.js`.

Para esta etapa, `src/app/api/**` y `src/modules/**` quedan como implementaciones anteriores/respaldo. El frontend publico `https://hubcafe.cl` debe llamar a la API real de `https://smkvending.cl`.

Ver instrucciones completas en `server/README.md`.
