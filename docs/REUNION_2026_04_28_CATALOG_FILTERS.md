# Reunion 2026-04-28 - Auditoria catalogo y filtros comerciales

Fecha de auditoria: 2026-05-02

## Alcance

Auditoria documental del catalogo publico y del modulo admin para preparar una barra unica de filtros en la vista comercial de "Cafe e insumos":

```txt
[Todos] [Mokador] [Schoppe] [Laqtia] [Cafes] [Leches] [Capuchinos] [Chocolates] [Chai]
```

No se modifico codigo funcional, backend, `hubcafe-backend/`, `server/` ni schema de Supabase.

## Archivos revisados

- `src/modules/catalog/types.ts`
- `src/modules/catalog/repository.ts`
- `src/modules/catalog/admin.ts`
- `src/modules/catalog/admin-schema.ts`
- `src/components/catalog/CatalogFilters.tsx`
- `src/components/catalog/ProductCard.tsx`
- `src/components/catalog/AvailabilityBadge.tsx`
- `src/components/catalog/AddToCartButton.tsx`
- `src/components/catalog/PriceTag.tsx`
- `src/components/home/CategoriesGrid.tsx`
- `src/app/(store)/tienda/page.tsx`
- `src/app/(store)/categorias/[slug]/page.tsx`
- `src/components/admin/ProductForm.tsx`
- `src/components/admin/CategoryForm.tsx`

Tambien se hizo una consulta de resumen a Supabase, sin imprimir claves, para confirmar categorias, marcas y estados visibles.

## Estado actual del catalogo

El storefront carga el catalogo desde Supabase mediante `src/modules/catalog/repository.ts`.

La lectura principal ocurre en `readCatalogFromSupabase()`:

- Lee `categories` ordenadas por `sort_order`.
- Lee `products` ordenados por `sort_order`.
- Mapea columnas snake_case de Supabase a tipos frontend en camelCase.
- No usa `src/modules/catalog/seed.ts`; ese fallback ya no existe.
- Si Supabase no esta disponible, devuelve arreglos vacios, no productos hardcodeados.

La pagina `/tienda` usa:

- `getCatalogCategories()`
- `getCatalogProducts({ query, category, sort })`
- `CatalogFilters`
- `ProductCard`

La pagina `/categorias/[slug]` usa:

- `getCatalogCategoryBySlug(slug)`
- `getCatalogProductsByCategory(slug)`

El filtro publico actual no es la barra comercial solicitada. Hoy tiene:

- Busqueda por texto `q`.
- Select de categoria `categoria`.
- Select de orden `sort`.

## Reglas actuales de visibilidad

`applyFilters()` solo muestra productos que cumplen:

- `publicationStatus === "published"`.
- `priceClpTaxInc > 0`.
- La categoria del producto pertenece a categorias publicas.

Una categoria publica debe cumplir:

- `isVisible === true`.
- `isActive !== false`.

Esto protege contra productos incompletos o de preparacion. Los productos en `draft`, `archived`, con precio 0 o en categorias inactivas no aparecen en la tienda.

## Campos disponibles para filtrar

### Producto

Campos reales mapeados desde Supabase y disponibles en frontend:

- `id`
- `slug`
- `sku`
- `ean`
- `categoryId` desde `products.category_id`
- `categorySlug` resuelto desde la categoria asociada
- `name`
- `shortDescription`
- `longDescription`
- `netPriceClp` desde `net_price_clp`
- `grossPriceClp` desde `gross_price_clp`
- `priceClpTaxInc` desde `gross_price_clp` o `price_clp_tax_inc`
- `image` desde `primary_image_path`
- `gallery` desde `gallery_images`
- `publicationStatus` desde `publication_status`
- `availabilityStatus` desde `availability_status`
- `isFeatured` desde `is_featured`
- `brand`
- `stockQuantity` desde `stock_quantity`
- `seoTitle`
- `seoDescription`
- `sortOrder` desde `sort_order`
- `highlights`

Campos especialmente utiles para la barra solicitada:

- `brand`: ideal para Mokador, Schoppe y Laqtia.
- `categoryId` / `categorySlug`: ideal para Cafes, Leches, Capuchinos, Chocolates y Chai.
- `name`, `shortDescription`, `longDescription`, `highlights`: utiles solo como fallback de busqueda, no como fuente principal de filtro comercial.
- `publicationStatus` y precio: necesarios para no mostrar productos incompletos.

### Categoria

Campos reales mapeados desde Supabase:

- `id`
- `parentId` desde `parent_id`
- `slug`
- `name`
- `description`
- `imageUrl`
- `sortOrder`
- `isVisible`
- `isActive`
- `seoTitle`
- `seoDescription`

## Datos reales observados en Supabase

Resumen de auditoria:

- Categorias: 18.
- Productos: 51.
- Marcas detectadas: `Caprimo`, `Laqtia`, `Mokador`, `Regilait`, `Schoppe`, `Van Houten`.

Categorias publicas relevantes para "Cafe e insumos":

- `cafe-insumos` - Cafe e insumos.
- `cafe-en-grano` - Cafe en grano, hija de `cafe-insumos`.
- `capuchinos` - Capuchinos, hija de `cafe-insumos`.
- `mokachinos` - Mokachinos, hija de `cafe-insumos`.
- `chocolates` - Chocolates, hija de `cafe-insumos`.
- `chai-te-instantaneo` - Chai / Te instantaneo, hija de `cafe-insumos`.
- `leches-toppings` - Leches / Toppings, hija de `cafe-insumos`.

Tambien existen categorias legacy/publicas:

- `cafe-grano`
- `cafe-instantaneo`
- `accesorios-vasos`

El repositorio ya tiene aliases para mapear:

- `cafe-grano` -> `cafe-en-grano`
- `cafe-instantaneo` -> `cafe-insumos`
- `accesorios-vasos` -> `vasos-accesorios`

## Categorias o datos de prueba visibles

No se detecto fallback local activo de catalogo. La tienda depende de Supabase.

En Supabase hay productos de marcas nuevas con precio 0, `publication_status = draft` y `availability_status = sold_out`, por ejemplo:

- Mokador.
- Schoppe.
- Laqtia.
- Caprimo.
- Regilait.
- Van Houten.

Hoy no deberian verse en tienda porque `applyFilters()` exige `published` y precio mayor a 0.

Riesgo: si un producto incompleto se publica con precio mayor a 0, aparecera. El admin ya advierte que para aparecer debe estar publicado y tener precio bruto mayor a 0, pero la calidad de datos sigue dependiendo de la operacion.

## Propuesta de filtro unico

La UI debe mostrar una sola barra simple, sin separar marcas y familias:

```txt
Todos | Mokador | Schoppe | Laqtia | Cafes | Leches | Capuchinos | Chocolates | Chai
```

Internamente se recomienda modelarla como una lista estatica de opciones comerciales:

| Label visible | Tipo interno | Criterio recomendado |
| --- | --- | --- |
| Todos | all | Productos visibles dentro de Cafe e insumos |
| Mokador | brand | `brand = "Mokador"` |
| Schoppe | brand | `brand = "Schoppe"` |
| Laqtia | brand | `brand = "Laqtia"` |
| Cafes | family/category | categorias `cafe-en-grano`, `cafe-grano` y, si aplica, cafe soluble dentro de `cafe-insumos` |
| Leches | family/category | categoria `leches-toppings` |
| Capuchinos | family/category | categoria `capuchinos` |
| Chocolates | family/category | categoria `chocolates` |
| Chai | family/category | categoria `chai-te-instantaneo` |

El usuario no debe ver si el filtro es marca o familia. Solo debe ver una barra de chips/tabs con los textos anteriores.

## Recomendacion de mapeo

### Marcas

Usar `products.brand` normalizado:

- Mokador -> `brand = "Mokador"`
- Schoppe -> `brand = "Schoppe"`
- Laqtia -> `brand = "Laqtia"`

La comparacion debe ser tolerante:

- trim.
- lower-case.
- sin acentos si se decide soportar variaciones futuras.

### Familias

Usar categorias por slug, no por texto libre:

- Cafes:
  - `cafe-en-grano`
  - `cafe-grano`
  - evaluar si incluir productos de `cafe-instantaneo` legacy cuando pertenezcan comercialmente a cafe soluble.
- Leches:
  - `leches-toppings`
- Capuchinos:
  - `capuchinos`
- Chocolates:
  - `chocolates`
- Chai:
  - `chai-te-instantaneo`

Para Mokachinos hay una decision pendiente:

- Opcion A: incluir `mokachinos` dentro de Capuchinos por afinidad comercial.
- Opcion B: dejarlo solo bajo Todos hasta que exista un chip "Mokachinos".

Recomendacion: incluir `mokachinos` dentro de Capuchinos si el negocio quiere mantener una barra corta.

## Como evitar mostrar categorias de prueba

Mantener y respetar estas reglas:

- No reintroducir fallback local tipo `seed.ts`.
- No mostrar categorias con `is_visible = false`.
- No mostrar categorias con `is_active = false`.
- No mostrar productos con `publication_status !== "published"`.
- No mostrar productos con precio bruto/final menor o igual a 0.
- No usar nombres de productos como fuente primaria de visibilidad.

Para la barra comercial:

- Renderizar solo en la vista "Cafe e insumos" o cuando el contexto de categoria sea `cafe-insumos` y sus descendientes.
- Si un chip no tiene productos visibles, se puede ocultar o dejarlo visible con resultado vacio. Recomendacion comercial: ocultar chips sin resultados solo si genera una barra mas limpia, pero mantener el orden fijo cuando haya datos.

## Riesgos

1. Mezcla de categorias legacy y nuevas.
   - Existen `cafe-grano` y `cafe-en-grano`.
   - Ya hay aliases, pero la barra nueva debe reutilizar esa logica o centralizar el mapeo.

2. Campo `brand` incompleto.
   - Productos antiguos como Navarino, Garibaldi, Cruzeiro y Ristora aparecen con `brand = null`.
   - Filtros por marca solo funcionaran para productos que tengan marca cargada.

3. Familias no equivalen 1:1 a marcas.
   - La barra mezcla marcas y categorias.
   - Esto esta bien para el usuario, pero el codigo debe modelarlo explicitamente para evitar condicionales dispersos.

4. Productos draft con precio 0.
   - Hoy no se muestran.
   - Si alguien publica sin completar datos, podria aparecer si tiene precio.

5. Categoria `mokachinos`.
   - No existe chip visible solicitado.
   - Se debe decidir si cae en Capuchinos o solo en Todos.

6. UI actual usa select de categorias.
   - La implementacion futura no deberia simplemente agregar otro select.
   - Debe reemplazar o complementar el selector con una barra unica de chips para esta seccion.

## Orden recomendado de implementacion

1. Crear un helper puro de filtros comerciales, por ejemplo `src/modules/catalog/commercial-filters.ts`.
2. Definir una lista estatica ordenada:
   - `all`
   - `mokador`
   - `schoppe`
   - `laqtia`
   - `cafes`
   - `leches`
   - `capuchinos`
   - `chocolates`
   - `chai`
3. Extender `CatalogFilters` o crear un componente especifico para "Cafe e insumos" que renderice una sola fila de chips.
4. Extender `CatalogFilters`/`CatalogProducts` con un parametro nuevo, por ejemplo `comercial`, sin romper `categoria`, `q` ni `sort`.
5. Implementar el filtro en `applyFilters()` o en un helper previo que reciba productos y categorias.
6. Probar con productos reales:
   - Marcas con `brand`.
   - Familias por `categorySlug`.
   - Productos antiguos con marca nula.
   - Productos draft/precio 0.
7. Mantener URLs simples:
   - `/categorias/cafe-insumos?filtro=mokador`
   - `/categorias/cafe-insumos?filtro=capuchinos`
8. Validar visualmente desktop/mobile que sea una sola barra scrolleable horizontal si no cabe.

## Conclusion

La base actual permite implementar la barra unica sin cambios de schema ni backend. Los campos `brand`, `category_id`, `slug`, `publication_status`, `availability_status`, `sort_order` y precios ya estan disponibles.

La implementacion debe ser una capa de presentacion/composicion comercial sobre los datos existentes de Supabase, no una nueva estructura de categorias ni un segundo sistema de filtros.
