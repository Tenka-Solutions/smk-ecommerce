# Backend cPanel SMK Vending

Este directorio es el backend real para subir a `public_html/server`.

## Archivos

```txt
public_html/server/
├─ cotizacion-server.js
├─ orders-store.js
├─ README.md
└─ data/
   ├─ orders.json
   └─ products-stock.json
```

## Comando de inicio

```bash
node cotizacion-server.js
```

## Webhook Flow

Configurar en Flow:

```txt
https://smkvending.cl/api/payments/flow/webhook
```

Si cPanel monta la app bajo `/server`, probar salud con:

```txt
https://smkvending.cl/server/health
```
