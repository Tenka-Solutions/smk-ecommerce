import { addVat } from "@/lib/format/currency";
import {
  CatalogCategory,
  CatalogProduct,
  AvailabilityStatus,
  CatalogCategorySlug,
} from "@/modules/catalog/types";

type ProductSeedInput = {
  id: string;
  slug: string;
  sku?: string | null;
  categorySlug: CatalogCategorySlug;
  name: string;
  shortDescription: string;
  longDescription?: string;
  netPriceClp: number;
  image: string;
  availabilityStatus?: AvailabilityStatus;
  isFeatured?: boolean;
  sortOrder: number;
  highlights?: string[];
};

function category(
  id: string,
  slug: CatalogCategorySlug,
  name: string,
  description: string,
  sortOrder: number
): CatalogCategory {
  return {
    id,
    slug,
    name,
    description,
    sortOrder,
    isVisible: true,
    seoTitle: `${name} | SMK Vending`,
    seoDescription: description,
  };
}

function product(input: ProductSeedInput): CatalogProduct {
  return {
    id: input.id,
    slug: input.slug,
    sku: input.sku ?? null,
    categorySlug: input.categorySlug,
    name: input.name,
    shortDescription: input.shortDescription,
    longDescription: input.longDescription ?? input.shortDescription,
    priceClpTaxInc: addVat(input.netPriceClp),
    image: input.image,
    gallery: [input.image],
    publicationStatus: "published",
    availabilityStatus: input.availabilityStatus ?? "available",
    isFeatured: input.isFeatured ?? false,
    seoTitle: `${input.name} | SMK Vending`,
    seoDescription: input.shortDescription,
    sortOrder: input.sortOrder,
    highlights: input.highlights ?? [],
  };
}

export const catalogSeedCategories: CatalogCategory[] = [
  category(
    "cat-maquinas",
    "maquinas",
    "Máquinas",
    "Equipos automáticos y semiautomáticos para oficinas, retail, cafeterías y alto flujo.",
    1
  ),
  category(
    "cat-grano",
    "cafe-grano",
    "Café en grano",
    "Blends italianos y perfiles espresso para operación diaria y venta profesional.",
    2
  ),
  category(
    "cat-instantaneo",
    "cafe-instantaneo",
    "Café instantáneo",
    "Opciones liofilizadas y solubles para vending, autoservicio y reposición ágil.",
    3
  ),
  category(
    "cat-accesorios",
    "accesorios-vasos",
    "Accesorios y vasos",
    "Vasos, tapas, sachets y consumibles para cafetería, take away y vending.",
    4
  ),
];

export const catalogSeedProducts: CatalogProduct[] = [
  product({ id: "barista-200", slug: "barista-200", sku: "102030200090", categorySlug: "maquinas", name: "Barista 200", shortDescription: "Máquina profesional italiana para cafeterías, locales al paso y negocios de alto flujo.", longDescription: "Equipo automático pensado para velocidad, consistencia y rentabilidad en barras con servicio continuo.", netPriceClp: 4326000, image: "/catalog/cutouts/image1.png", isFeatured: true, sortOrder: 1, highlights: ["Tecnología italiana", "Preparación automática", "Ideal para alto flujo"] }),
  product({ id: "krea-touch-5", slug: "krea-touch-5-contenedores", sku: "102030200071", categorySlug: "maquinas", name: "Krea Touch 5 contenedores", shortDescription: "Solución premium para cafés, cappuccinos, chocolates y bebidas de leche.", longDescription: "Configuración orientada a hotelería, retail y autoservicio con una carta amplia de bebidas.", netPriceClp: 6027500, image: "/catalog/cutouts/image2.png", availabilityStatus: "check_availability", isFeatured: true, sortOrder: 2, highlights: ["5 contenedores", "Pantalla táctil", "Amplia variedad"] }),
  product({ id: "krea-touch-4", slug: "krea-touch-4-contenedores", sku: "102030200073", categorySlug: "maquinas", name: "Krea Touch 4 contenedores", shortDescription: "Versión eficiente de la familia Krea para operación profesional y autoservicio.", longDescription: "Alternativa para cafeterías, hoteles y puntos de atención que necesitan rendimiento sin sobredimensionar el equipo.", netPriceClp: 5570770, image: "/catalog/cutouts/image2.png", availabilityStatus: "check_availability", sortOrder: 3, highlights: ["4 contenedores", "Diseño elegante", "Servicio estable"] }),
  product({ id: "kometa", slug: "kometa", sku: "102030200086", categorySlug: "maquinas", name: "Kometa", shortDescription: "Máquina súper automática con pantalla táctil y bebidas de hasta 14 oz.", longDescription: "Combina diseño compacto, operación intuitiva y calidad de taza para empresas y cafeterías.", netPriceClp: 5197500, image: "/catalog/cutouts/image3.png", isFeatured: true, sortOrder: 4, highlights: ["Pantalla táctil", "Formato compacto", "Bebidas de hasta 14 oz"] }),
  product({ id: "phedra-evo", slug: "phedra-evo", sku: "106010100023", categorySlug: "maquinas", name: "Phedra Evo", shortDescription: "Equipo table-top para oficinas, lobbys y flujo medio.", longDescription: "Entrega bebidas con café, leche y chocolate, además de agua caliente para infusiones.", netPriceClp: 3468000, image: "/catalog/cutouts/image4.png", sortOrder: 5, highlights: ["Formato table-top", "Ideal para oficinas", "Agua caliente para infusiones"] }),
  product({ id: "iper", slug: "iper", categorySlug: "maquinas", name: "Iper", shortDescription: "Modelo compacto y versátil para espacios pequeños con hasta 8 bebidas.", longDescription: "Compatible con red o bidón, ideal para autoservicio en espacios acotados.", netPriceClp: 2905500, image: "/catalog/cutouts/image5.png", availabilityStatus: "check_availability", sortOrder: 6, highlights: ["Hasta 8 bebidas", "Estanque interno", "Compatible con red o bidón"] }),
  product({ id: "ventus-gaia-4s", slug: "ventus-gaia-4s", categorySlug: "maquinas", name: "Ventus Gaia 4S", shortDescription: "Máquina soluble con 4 sabores y panel amigable para operación comercial.", longDescription: "Muy útil para minimarkets y conveniencia por su fácil programación y rápida recuperación de inversión.", netPriceClp: 394000, image: "/catalog/cutouts/image6.png", isFeatured: true, sortOrder: 7, highlights: ["4 bebidas", "Compatible con soluble", "Limpieza automática"] }),
  product({ id: "navarino-dos", slug: "cafe-navarino-dos-1kg", categorySlug: "cafe-grano", name: "Café Navarino Dos 1 kg", shortDescription: "Blend 80% robusta y 20% arábica con intensidad alta y crema consistente.", longDescription: "Ideal para espresso de carácter fuerte y bebidas con leche que necesitan estructura.", netPriceClp: 27535, image: "/catalog/cutouts/image7.png", isFeatured: true, sortOrder: 8, highlights: ["80% robusta / 20% arábica", "Tueste italiano", "Formato 1 kg"] }),
  product({ id: "navarino-uno", slug: "cafe-navarino-uno-1kg", categorySlug: "cafe-grano", name: "Café Navarino Uno 1 kg", shortDescription: "Blend equilibrado de 70% arábica y 30% robusta con perfil suave y cuerpo medio.", longDescription: "Alternativa versátil para consumo diario en oficinas, cafeterías y operación continua.", netPriceClp: 34412, image: "/catalog/cutouts/image8.png", sortOrder: 9, highlights: ["70% arábica / 30% robusta", "Perfil suave", "Buena crema"] }),
  product({ id: "garibaldi-intenso", slug: "cafe-garibaldi-intenso-1kg", categorySlug: "cafe-grano", name: "Café Garibaldi Intenso 1 kg", shortDescription: "Café equilibrado con ligera acidez, notas de chocolate y tabaco.", longDescription: "Perfil italiano intenso y aterciopelado para espresso y barra diaria.", netPriceClp: 28990, image: "/catalog/cutouts/image9.png", isFeatured: true, sortOrder: 10, highlights: ["Notas de chocolate y tabaco", "Ligera acidez", "Bolsa de 1 kg"] }),
  product({ id: "garibaldi-espresso-bar", slug: "cafe-garibaldi-espresso-bar-1kg", categorySlug: "cafe-grano", name: "Café Garibaldi Espresso Bar 1 kg", shortDescription: "Blend 80% robusta vietnamita y 20% arábica brasileña con crema persistente.", longDescription: "Pensado para barras que buscan un espresso con notas de caramelo y postgusto largo.", netPriceClp: 32500, image: "/catalog/cutouts/image10.png", sortOrder: 11, highlights: ["80% robusta / 20% arábica", "Notas de caramelo", "Crema dorada"] }),
  product({ id: "cruzeiro-clasico", slug: "cafe-soluble-cruzeiro-2x500g", categorySlug: "cafe-instantaneo", name: "Café soluble Cruzeiro 2 x 500 g", shortDescription: "Formato rendidor para máquinas automáticas de café soluble y autoservicio.", longDescription: "Solución económica y constante para conveniencia, minimarkets y puntos de atención.", netPriceClp: 44270, image: "/catalog/cutouts/image11.png", isFeatured: true, sortOrder: 12, highlights: ["2 bolsas de 500 g", "Ideal para máquinas Ventus", "Perfil constante"] }),
  product({ id: "ristora-instantaneo", slug: "cafe-soluble-ristora-200g", categorySlug: "cafe-instantaneo", name: "Café soluble Ristora 200 g", shortDescription: "Café liofilizado para oficinas, vending y preparación manual rápida.", longDescription: "Destaca por su preparación ágil, buen cuerpo y conservación de aromas.", netPriceClp: 14500, image: "/catalog/cutouts/image12.png", isFeatured: true, sortOrder: 13, highlights: ["Formato de 200 g", "Rinde hasta 100 tazas", "Disolución instantánea"] }),
  product({ id: "azucar-sachet-1000", slug: "caja-sachet-azucar-1000", sku: "301010100010", categorySlug: "accesorios-vasos", name: "Caja Sachet de Azúcar 1.000 un", shortDescription: "Caja con 1.000 sachets para estaciones de café, oficinas y autoservicio.", netPriceClp: 21750, image: "/catalog/cutouts/image13.png", availabilityStatus: "sold_out", sortOrder: 14, highlights: ["1.000 unidades", "Reposición operativa"] }),
  product({ id: "sucralosa-sachet-1000", slug: "caja-sachet-sucralosa-1000", sku: "301010100011", categorySlug: "accesorios-vasos", name: "Caja Sachet de Sucralosa 1.000 un", shortDescription: "Caja con 1.000 sachets de sucralosa para complementar la estación de café.", netPriceClp: 30000, image: "/catalog/cutouts/image14.png", sortOrder: 15, highlights: ["1.000 unidades", "Formato de fácil almacenamiento"] }),
  product({ id: "tapa-eco-12oz", slug: "tapa-eco-12oz-horeca-1000", sku: "303030200002", categorySlug: "accesorios-vasos", name: "Tapa Eco 12 oz Horeca PLA Biodegradable", shortDescription: "Caja de 1.000 tapas compostables para vasos horeca de 12 oz.", netPriceClp: 88000, image: "/catalog/cutouts/image15.png", sortOrder: 16, highlights: ["1.000 unidades", "PLA biodegradable"] }),
  product({ id: "tapa-eco-8oz", slug: "tapa-eco-8oz-horeca-1000", sku: "303030200001", categorySlug: "accesorios-vasos", name: "Tapa Eco 8 oz Horeca PLA Biodegradable", shortDescription: "Caja de 1.000 tapas compostables para vasos horeca de 8 oz.", netPriceClp: 78300, image: "/catalog/cutouts/image15.png", sortOrder: 17, highlights: ["1.000 unidades", "PLA biodegradable"] }),
  product({ id: "vaso-polipapel-7-5oz-cafeteria", slug: "vaso-polipapel-7-5oz-diseno-cafeteria", sku: "302520200041", categorySlug: "accesorios-vasos", name: "Vaso Polipapel 7.5 oz Diseño Cafetería", shortDescription: "Caja de 2.700 vasos para espresso largo, americano y bebidas pequeñas.", netPriceClp: 161200, image: "/catalog/cutouts/image16.png", isFeatured: true, sortOrder: 18, highlights: ["Caja de 2.700 unidades", "Diseño cafetería"] }),
  product({ id: "vaso-vending-flo-200cc", slug: "vaso-vending-flo-200cc-caja-3000", sku: "303020100007", categorySlug: "accesorios-vasos", name: "Vaso Vending Flo DA 200 cc Thermo Marrón", shortDescription: "Caja de 3.000 vasos térmicos pensados para operación vending.", netPriceClp: 158600, image: "/catalog/cutouts/image17.png", sortOrder: 19, highlights: ["Caja de 3.000 unidades", "Formato 200 cc"] }),
  product({ id: "vaso-polipapel-horeca-12oz-metocup", slug: "vaso-polipapel-horeca-12oz-metocup", sku: "302520200033", categorySlug: "accesorios-vasos", name: "Vaso Polipapel Horeca 12 oz Metocup", shortDescription: "Caja de 2.160 vasos de 12 oz para bebidas grandes y take away.", netPriceClp: 210000, image: "/catalog/cutouts/image18.png", sortOrder: 20, highlights: ["Caja de 2.160 unidades", "Formato 12 oz"] }),
  product({ id: "vaso-vending-maori-12oz", slug: "vaso-vending-diseno-maori-12oz", sku: "303020200007", categorySlug: "accesorios-vasos", name: "Vaso Vending Diseño Maori 12 oz", shortDescription: "Caja de 1.000 vasos con diseño distintivo para bebidas calientes o frías.", netPriceClp: 117000, image: "/catalog/cutouts/image19.png", availabilityStatus: "sold_out", isFeatured: true, sortOrder: 21, highlights: ["Caja de 1.000 unidades", "Formato 12 oz"] }),
  product({ id: "vaso-eco-8oz-blanco", slug: "vaso-eco-8oz-blanco", sku: "303030100010", categorySlug: "accesorios-vasos", name: "Vaso Eco 1 capa 8 oz Blanco", shortDescription: "Caja de vasos biodegradables de 8 oz para operaciones con foco sustentable.", netPriceClp: 90000, image: "/catalog/cutouts/image20.png", availabilityStatus: "sold_out", sortOrder: 22, highlights: ["PLA biodegradable", "Formato 8 oz"] }),
  product({ id: "vaso-eco-12oz-blanco", slug: "vaso-eco-12oz-blanco", sku: "303030100011", categorySlug: "accesorios-vasos", name: "Vaso Eco 1 capa 12 oz Blanco", shortDescription: "Versión de 12 oz para bebidas grandes con presentación simple y sustentable.", netPriceClp: 113000, image: "/catalog/cutouts/image20.png", sortOrder: 23, highlights: ["PLA biodegradable", "Formato 12 oz"] }),
  product({ id: "vaso-eco-ripple-8oz-kraft", slug: "vaso-eco-ripple-8oz-kraft", sku: "303030100030", categorySlug: "accesorios-vasos", name: "Vaso Eco Ripple 8 oz Kraft", shortDescription: "Caja de 500 vasos ripple biodegradables con acabado kraft.", netPriceClp: 76000, image: "/catalog/cutouts/image21.png", availabilityStatus: "sold_out", sortOrder: 24, highlights: ["500 unidades", "Acabado kraft"] }),
  product({ id: "manga-vaso-12oz-cafeteria", slug: "manga-vaso-12oz-diseno-cafeteria", sku: "302520200047", categorySlug: "accesorios-vasos", name: "Manga Vaso 12 oz Diseño Cafetería", shortDescription: "Pack de 60 vasos para reposición ágil en barra o autoservicio.", netPriceClp: 12800, image: "/catalog/cutouts/image22.png", availabilityStatus: "sold_out", sortOrder: 25, highlights: ["60 unidades", "Reposición rápida"] }),
  product({ id: "manga-vaso-9oz-cafeteria", slug: "manga-vaso-9oz-diseno-cafeteria", sku: "302520200046", categorySlug: "accesorios-vasos", name: "Manga Vaso 9 oz Diseño Cafetería", shortDescription: "Pack de 60 vasos de 9 oz para operaciones con reposición flexible.", netPriceClp: 9200, image: "/catalog/cutouts/image22.png", availabilityStatus: "sold_out", sortOrder: 26, highlights: ["60 unidades", "Formato 9 oz"] }),
  product({ id: "vaso-polipapel-9oz-cafeteria", slug: "vaso-polipapel-9oz-diseno-cafeteria", sku: "302520200043", categorySlug: "accesorios-vasos", name: "Vaso Polipapel 9 oz Diseño Cafetería", shortDescription: "Caja de 2.460 vasos para operación diaria y servicio continuo.", netPriceClp: 189000, image: "/catalog/cutouts/image16.png", availabilityStatus: "sold_out", sortOrder: 27, highlights: ["Caja de 2.460 unidades", "Formato 9 oz"] }),
  product({ id: "vaso-polipapel-12oz-cafeteria", slug: "vaso-polipapel-12oz-diseno-cafeteria", sku: "302520200049", categorySlug: "accesorios-vasos", name: "Vaso Polipapel 12 oz Diseño Cafetería", shortDescription: "Caja de vasos de 12 oz para bebidas grandes y take away.", netPriceClp: 137700, image: "/catalog/cutouts/image16.png", availabilityStatus: "sold_out", sortOrder: 28, highlights: ["Formato 12 oz", "Diseño cafetería"] }),
  product({ id: "vaso-eco-ripple-12oz-kraft", slug: "vaso-eco-ripple-12oz-kraft", sku: "303030100031", categorySlug: "accesorios-vasos", name: "Vaso Eco Ripple 12 oz Kraft", shortDescription: "Caja de 500 vasos ripple de gran formato para bebidas calientes.", netPriceClp: 99000, image: "/catalog/cutouts/image21.png", availabilityStatus: "sold_out", sortOrder: 29, highlights: ["500 unidades", "Formato 12 oz"] }),
  product({ id: "mokador-100-arabica-bio", slug: "mokador-100-arabica-bio", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-grano", name: "Mokador 100% Arabica Bio", shortDescription: "Mokador 100% Arabica Bio. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café en grano. [PENDIENTE COMPLETAR DESCRIPCION]", netPriceClp: 0, image: "/catalog/cutouts/arabicabio.png", availabilityStatus: "sold_out", sortOrder: 30, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]"] }),
  product({ id: "mokador-oro-blend", slug: "mokador-oro-blend", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-grano", name: "Mokador Oro Blend", shortDescription: "Mokador Oro Blend. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café en grano. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]", netPriceClp: 0, image: "/catalog/cutouts/placeholders/mokador-oro-blend.svg", availabilityStatus: "sold_out", sortOrder: 31, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]", "[PENDIENTE CARGAR IMAGEN]"] }),
  product({ id: "mokador-brio-100", slug: "mokador-brio-100", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-grano", name: "Mokador Brio 100", shortDescription: "Mokador Brio 100. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café en grano. [PENDIENTE COMPLETAR DESCRIPCION]", netPriceClp: 0, image: "/catalog/cutouts/brio.png", availabilityStatus: "sold_out", sortOrder: 32, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]"] }),
  product({ id: "mokador-extra-cream", slug: "mokador-extra-cream", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-grano", name: "Mokador Extra Cream", shortDescription: "Mokador Extra Cream. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café en grano. [PENDIENTE COMPLETAR DESCRIPCION]", netPriceClp: 0, image: "/catalog/cutouts/extracream.png", availabilityStatus: "sold_out", sortOrder: 33, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]"] }),
  product({ id: "schoppe-caramel-302", slug: "schoppe-caramel-302", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-instantaneo", name: "Schoppe Caramel 302", shortDescription: "Schoppe Caramel 302. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café instantáneo. [PENDIENTE COMPLETAR DESCRIPCION]", netPriceClp: 0, image: "/catalog/cutouts/302.png", availabilityStatus: "sold_out", sortOrder: 34, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]"] }),
  product({ id: "schoppe-vainilla-301", slug: "schoppe-vainilla-301", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-instantaneo", name: "Schoppe Vainilla 301", shortDescription: "Schoppe Vainilla 301. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café instantáneo. [PENDIENTE COMPLETAR DESCRIPCION]", netPriceClp: 0, image: "/catalog/cutouts/301.svg", availabilityStatus: "sold_out", sortOrder: 35, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]"] }),
  product({ id: "schoppe-noisete-303", slug: "schoppe-noisete-303", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-instantaneo", name: "Schoppe Noisete 303", shortDescription: "Schoppe Noisete 303. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café instantáneo. [PENDIENTE COMPLETAR DESCRIPCION]", netPriceClp: 0, image: "/catalog/cutouts/303.svg", availabilityStatus: "sold_out", sortOrder: 36, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]"] }),
  product({ id: "schoppe-choco-107", slug: "schoppe-choco-107", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-instantaneo", name: "Schoppe Choco 107", shortDescription: "Schoppe Choco 107. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café instantáneo. [PENDIENTE COMPLETAR DESCRIPCION]", netPriceClp: 0, image: "/catalog/cutouts/107.png", availabilityStatus: "sold_out", sortOrder: 37, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]"] }),
  product({ id: "schoppe-instant-tea-505", slug: "schoppe-instant-tea-505", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-instantaneo", name: "Schoppe Instant Tea 505", shortDescription: "Schoppe Instant Tea 505. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café instantáneo. [PENDIENTE COMPLETAR DESCRIPCION]", netPriceClp: 0, image: "/catalog/cutouts/505.svg", availabilityStatus: "sold_out", sortOrder: 38, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]"] }),
  product({ id: "laqtia-mocacino", slug: "laqtia-mocacino", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-instantaneo", name: "Laqtia Mocacino", shortDescription: "Laqtia Mocacino. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café instantáneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]", netPriceClp: 0, image: "/catalog/cutouts/placeholders/laqtia-mocacino.svg", availabilityStatus: "sold_out", sortOrder: 39, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]", "[PENDIENTE CARGAR IMAGEN]"] }),
  product({ id: "laqtia-capuccino", slug: "laqtia-capuccino", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-instantaneo", name: "Laqtia Capuccino", shortDescription: "Laqtia Capuccino. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café instantáneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]", netPriceClp: 0, image: "/catalog/cutouts/placeholders/laqtia-capuccino.svg", availabilityStatus: "sold_out", sortOrder: 40, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]", "[PENDIENTE CARGAR IMAGEN]"] }),
  product({ id: "laqtia-french-vainilla", slug: "laqtia-french-vainilla", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-instantaneo", name: "Laqtia French Vainilla", shortDescription: "Laqtia French Vainilla. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café instantáneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]", netPriceClp: 0, image: "/catalog/cutouts/placeholders/laqtia-french-vainilla.svg", availabilityStatus: "sold_out", sortOrder: 41, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]", "[PENDIENTE CARGAR IMAGEN]"] }),
  product({ id: "laqtia-leche-topping", slug: "laqtia-leche-topping", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-instantaneo", name: "Laqtia Leche Topping", shortDescription: "Laqtia Leche Topping. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café instantáneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]", netPriceClp: 0, image: "/catalog/cutouts/placeholders/laqtia-leche-topping.svg", availabilityStatus: "sold_out", sortOrder: 42, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]", "[PENDIENTE CARGAR IMAGEN]"] }),
  product({ id: "laqtia-chocolate-22-cacao-q15", slug: "laqtia-chocolate-22-cacao-q15", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-instantaneo", name: "Laqtia Chocolate 22% Cacao Q15", shortDescription: "Laqtia Chocolate 22% Cacao Q15. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café instantáneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]", netPriceClp: 0, image: "/catalog/cutouts/placeholders/laqtia-chocolate-22-cacao-q15.svg", availabilityStatus: "sold_out", sortOrder: 43, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]", "[PENDIENTE CARGAR IMAGEN]"] }),
  product({ id: "laqtia-natur-basic", slug: "laqtia-natur-basic", sku: "[PENDIENTE DEFINIR SKU]", categorySlug: "cafe-instantaneo", name: "Laqtia Natur Basic", shortDescription: "Laqtia Natur Basic. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]", longDescription: "Producto agregado al catálogo en la categoría café instantáneo. [PENDIENTE COMPLETAR DESCRIPCION]", netPriceClp: 0, image: "/catalog/cutouts/laqtia-natur-basic.png", availabilityStatus: "sold_out", sortOrder: 44, highlights: ["[PENDIENTE DEFINIR PRECIO]", "[PENDIENTE DEFINIR SKU]"] }),
];
