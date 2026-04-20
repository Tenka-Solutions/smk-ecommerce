# Homepage Restyle — Design Spec

## Summary

Restyle the SMK Vending homepage from warm-cream aesthetic to a **dark & bold** direction with a draggable product carousel hero. Navbar transitions from transparent (over dark hero) to solid on scroll. Page sections: Hero → Categories → Trust Signals → CTA Banner.

## Color Palette

| Token | Hex | Role |
|-------|-----|------|
| `--color-dark` | `#232D2F` | Primary dark (hero bg, nav bg on scroll, CTA banner) |
| `--color-warm` | `#E4C3AD` | Warm beige (categories section bg, muted text on dark) |
| `--color-mauve` | `#5B484E` | Secondary text, subtle accents |
| `--color-copper` | `#A17B68` | Copper — secondary accent, category subtitles |
| `--color-gold` | `#CC8328` | Gold — primary CTA buttons, kicker text, price text |

## Navbar

**Component:** `SiteHeader.tsx` (rewrite)

**Behavior:**
- Position: sticky top-0
- Default state (top of page): fully transparent background, white text links, logo "SMK" white + "Vending" gold (`#CC8328`)
- Scrolled state (after ~80px): solid `#232D2F` background with subtle backdrop-blur, thin bottom border `rgba(228,195,173,0.08)`
- Transition: 200ms ease on background-color

**Layout:**
- Left: Logo
- Center: Nav links (Tienda, Máquinas, Café en grano, Cotizar, Nosotros, Contacto) — from `publicNavigation`
- Right: "Mi cuenta" text link + Cart icon button (circle, gold border hint, badge)
- Mobile: hamburger menu (existing pattern or new slide-out)

**Link styling:**
- Default: `rgba(255,255,255,0.8)`, hover: `white`
- Active: `#CC8328`
- Cart icon: circle with `rgba(204,131,40,0.15)` bg, gold border, gold cart SVG
- Badge: gold bg, white text (same as current)

## Hero Section

**Container:** Full-width dark `#232D2F` background. No rounded card — bleeds edge to edge. Internal content uses `page-shell` for max-width.

**Layout (desktop):**
- Top row: Kicker ("Ecommerce oficial" in gold uppercase) + headline + subtitle left, CTA buttons right
- Bottom: Draggable product carousel

**Headline:** "Máquinas de café, café e insumos para tu negocio" — white, bold, `text-3xl` sm:`text-4xl` lg:`text-5xl`

**Subtitle:** "Precios con IVA incluido · Despacho Chile" — `rgba(228,195,173,0.6)`

**CTAs:**
- Primary: "Comprar productos" — gold `#CC8328` bg, white text, pill shape
- Secondary: "Solicitar cotización" — transparent, white border `rgba(255,255,255,0.2)`, white text

### Draggable Product Carousel

**Data source:** `getFeaturedCatalogProducts(8)` — increase from 6 to 8 for better scroll feel.

**Implementation:** CSS scroll-snap with touch/mouse drag. No external library (keep bundle lean). Use `overflow-x: auto` with `scroll-snap-type: x mandatory`, hide scrollbar. Add JS for mouse drag (pointer events).

**Card design (each item):**
- Container: `rgba(255,255,255,0.04)` bg, `1px solid rgba(228,195,173,0.1)` border, `border-radius: 1.25rem`, padding
- Image: product image in rounded container with subtle copper-tinted bg placeholder
- Name: white, semibold, small
- Price: gold `#CC8328`, bold
- Button: gold pill "Agregar" — triggers `addItem` from cart store

**Edge behavior:**
- Last visible card fades to ~40% opacity (CSS mask-image gradient on scroll container right edge)
- Hint text: "← arrastra para ver más →" centered below in muted warm text

**Mobile:** Cards are `min-w-[280px]` so ~1.2 visible at a time. Desktop: `min-w-[220px]`, shows ~4.

## Categories Section

**Background transition:** Warm beige `#E4C3AD` with `border-radius: 2rem 2rem 0 0` at top to create smooth visual break from dark hero.

**Data:** `getCatalogCategories()` (existing)

**Layout:** 4-col grid (desktop), 2-col (tablet), 1-col scroll (mobile)

**Card design:**
- White bg, rounded-2xl, soft shadow `0 4px 12px rgba(35,45,47,0.06)`
- Category name in dark `#232D2F`, semibold
- Description in copper `#A17B68`
- Hover: slight lift (`-translate-y-0.5`)
- Links to `/categorias/${slug}`

**Section header:** "Categorías" kicker + "Explora por tipo de producto" subtitle in dark text.

## Trust Signals Strip

**Background:** Lighter beige `#f5ede6` (or `--color-surface-strong` equivalent)

**Layout:** 4 items in a horizontal flex row, evenly spaced. Centered text.

**Each item:**
- Icon (SVG, not emoji — will use simple outlined icons)
- Label text: dark `#232D2F`, small, semibold

**Items (from `siteConfig.trustSignals`):**
1. Lock icon — "Pago seguro"
2. Tag icon — "IVA incluido"
3. Truck icon — "Despacho Chile"
4. Cart icon — "Compra directa"

**Mobile:** 2x2 grid instead of 4-col row.

## CTA Banner

**Background:** Dark `#232D2F`

**Layout:** Centered text + button, generous vertical padding.

**Content:**
- Headline: "¿Necesitas una cotización?" — white, bold, lg
- Subtitle: "Te armamos una propuesta a medida para tu negocio" — warm muted
- Button: Gold pill → links to `/cotizar`

## Global CSS Changes

Update `globals.css`:
- Add new palette tokens (`--color-dark`, `--color-warm`, `--color-gold`, `--color-copper`, `--color-mauve`)
- Keep existing tokens for other pages (cart, checkout, etc.) — homepage uses new tokens
- Add `.button-gold` utility (gold bg, white text, pill)
- Keep `--color-page` as `#E4C3AD` for sections below hero (or introduce section-level bg)

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/app/globals.css` | Add new color tokens, `.button-gold` |
| `src/components/layout/SiteHeader.tsx` | Rewrite — transparent→solid scroll behavior |
| `src/app/(store)/page.tsx` | Rewrite — new sections structure |
| `src/components/home/HeroCarousel.tsx` | **New** — draggable carousel client component |
| `src/components/home/TrustSignals.tsx` | **New** — trust strip |
| `src/components/home/CtaBanner.tsx` | **New** — CTA banner |
| `src/components/home/CategoriesGrid.tsx` | **New** — categories section |

## Technical Notes

- **Carousel drag:** Pointer events (pointerdown/move/up) for mouse drag. Touch natively supported via overflow scroll. No library needed.
- **Scroll-snap:** `scroll-snap-type: x mandatory` on container, `scroll-snap-align: start` on cards.
- **Edge fade:** `mask-image: linear-gradient(to right, black 85%, transparent 100%)` on carousel container.
- **Nav scroll detection:** `useEffect` with scroll listener + state toggle. Debounce not needed — just track `scrollY > 80`.
- **Server vs Client:** Page itself remains async server component. `HeroCarousel` and `SiteHeader` are client components (need interactivity). `TrustSignals`, `CtaBanner`, `CategoriesGrid` are server components.
- **No new dependencies.** Pure CSS + vanilla pointer events for drag.

## Out of Scope

- Other pages (tienda, productos, etc.) — palette/card changes don't cascade
- Footer restyle
- Mobile hamburger menu redesign (keep functional, adapt colors)
- Product images (using placeholders)
- Animations beyond hover transitions and nav bg transition
