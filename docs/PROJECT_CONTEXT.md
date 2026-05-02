# ☕ Hub Café Ecommerce / SMK Vending
Sistema Ecommerce para venta de productos vending (café, insumos y máquinas)

---

## 🎯 VISIÓN DEL PROYECTO

Construir una plataforma ecommerce profesional que permita:

- Vender productos de vending (café, insumos, máquinas)
- Gestionar pedidos de forma automatizada
- Administrar productos sin intervención técnica
- Escalar a operación real (B2B y B2C)

---

## 🧱 STACK TECNOLÓGICO

Frontend:
- Next.js 16 (App Router)
- React 19
- TypeScript

UI:
- Tailwind CSS 4

Backend:
- Supabase
  - Auth
  - PostgreSQL Database
  - Storage (imágenes productos)

Deploy:
- Netlify

---

## 🧠 ARQUITECTURA

- Frontend desacoplado
- Backend 100% en Supabase
- API layer mediante funciones internas (Next.js / server actions)
- Panel Admin protegido por autenticación

---

## 📦 MÓDULOS PRINCIPALES

### 1. Catálogo de Productos
- Listado por categorías
- Productos dinámicos desde Supabase
- Filtros y búsqueda

### 2. Carrito de Compra
- Persistencia local
- Manejo de cantidades
- Cálculo de totales

### 3. Checkout
- Formulario cliente
- Validaciones
- Creación de pedido

### 4. Gestión de Pedidos
- Registro en base de datos
- Estados del pedido
- Historial

### 5. Panel Admin (CRÍTICO)
CRUD completo:

- Productos
- Categorías
- Imágenes
- Activación/desactivación

---

## 🛒 FLUJO DE PEDIDOS (CORE DEL NEGOCIO)

1. Cliente agrega productos al carrito
2. Cliente completa checkout
3. Sistema crea pedido en Supabase:

Tabla: `orders`

Campos mínimos:
- id
- customer_name
- customer_email
- customer_phone
- address
- total_amount
- status
- created_at

Tabla: `order_items`
- order_id
- product_id
- quantity
- price

---

## 🔄 ESTADOS DEL PEDIDO

- pending (pendiente)
- paid (pagado)
- processing (en preparación)
- shipped (enviado)
- delivered (entregado)
- cancelled (cancelado)

---

## 🔔 NOTIFICACIONES (NUEVO REQUERIMIENTO)

Debe implementarse:

- Notificación interna (panel admin)
- Notificación por correo:
  - Nuevo pedido recibido
  - Confirmación al cliente

Email destino:
→ DEFINIR (ej: ventas@hubcafe.cl)

---

## 💳 PAGOS (ROADMAP INMEDIATO)

Integración futura:

- MercadoPago (Chile)
- Webpay (Transbank)

Estados deben sincronizar con:
→ status = paid

---

## 📁 MODELO DE DATOS (SIMPLIFICADO)

### products
- id
- name
- description
- price
- category_id
- image_url
- stock
- active

### categories
- id
- name

### orders
- id
- customer_name
- email
- phone
- address
- total
- status
- created_at

### order_items
- id
- order_id
- product_id
- quantity
- price

---

## 🧑‍💻 REGLAS DE DESARROLLO (OBLIGATORIAS)

- ❌ NO trabajar en `main` directamente
- ✅ usar ramas por feature
- ❌ NO hardcodear datos
- ✅ TODO debe venir desde Supabase
- ✅ Tipado estricto con TypeScript
- ✅ Componentes reutilizables
- ✅ Separación UI / lógica / datos

---

## 🎨 UI / UX

- Diseño profesional (no prototipo)
- 100% responsive
- Optimizado para conversión
- Scroll fluido
- Carga rápida

---

## ⚙️ OBJETIVO ACTUAL (FASE ACTIVA)

- Finalizar CRUD de productos
- Integrar imágenes correctamente
- Implementar flujo completo de pedidos
- Crear panel admin funcional

---

## 🚀 OBJETIVO SIGUIENTE

- Integración de pagos
- Emails automáticos
- Dashboard de ventas
- Optimización SEO

---

## 🧠 NOTA PARA AGENTES (CODEX / IA)

Este proyecto NO es un prototipo.

Es un sistema productivo que debe:

- Escalar
- Ser mantenible
- Ser seguro
- Permitir operación diaria sin desarrolladores

Toda implementación debe respetar esta base.