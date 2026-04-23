insert into public.roles (name, slug)
values
  ('Super Admin', 'super_admin'),
  ('Catalog Editor', 'catalog_editor'),
  ('Sales Manager', 'sales_manager')
on conflict (slug) do update
set name = excluded.name;

insert into public.categories (
  id,
  name,
  slug,
  description,
  sort_order,
  is_visible,
  seo_title,
  seo_description
)
values
  (
    'cat-maquinas',
    'Maquinas',
    'maquinas',
    'Equipos automaticos y semiautomaticos para oficinas, retail, cafeterias y alto flujo.',
    1,
    true,
    'Maquinas | SMK Vending',
    'Equipos automaticos y semiautomaticos para oficinas, retail, cafeterias y alto flujo.'
  ),
  (
    'cat-grano',
    'Cafe en grano',
    'cafe-grano',
    'Blends italianos y perfiles espresso para operacion diaria y venta profesional.',
    2,
    true,
    'Cafe en grano | SMK Vending',
    'Blends italianos y perfiles espresso para operacion diaria y venta profesional.'
  ),
  (
    'cat-instantaneo',
    'Cafe instantaneo',
    'cafe-instantaneo',
    'Opciones liofilizadas y solubles para vending, autoservicio y reposicion agil.',
    3,
    true,
    'Cafe instantaneo | SMK Vending',
    'Opciones liofilizadas y solubles para vending, autoservicio y reposicion agil.'
  ),
  (
    'cat-accesorios',
    'Accesorios y vasos',
    'accesorios-vasos',
    'Vasos, tapas, sachets y consumibles para cafeteria, take away y vending.',
    4,
    true,
    'Accesorios y vasos | SMK Vending',
    'Vasos, tapas, sachets y consumibles para cafeteria, take away y vending.'
  )
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_visible = excluded.is_visible,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description;

insert into public.products (
  id,
  category_id,
  name,
  slug,
  sku,
  short_description,
  long_description,
  price_clp_tax_inc,
  availability_status,
  publication_status,
  is_featured,
  sort_order,
  seo_title,
  seo_description,
  primary_image_path
)
values
  ('barista-200', 'cat-maquinas', 'Barista 200', 'barista-200', '102030200090', 'Maquina profesional italiana para cafeterias, locales al paso y negocios de alto flujo.', 'Equipo automatico pensado para velocidad, consistencia y rentabilidad en barras con servicio continuo.', round(4326000 * 1.19), 'available', 'published', true, 1, 'Barista 200 | SMK Vending', 'Maquina profesional italiana para cafeterias, locales al paso y negocios de alto flujo.', '/catalog/cutouts/image1.png'),
  ('krea-touch-5', 'cat-maquinas', 'Krea Touch 5 contenedores', 'krea-touch-5-contenedores', '102030200071', 'Solucion premium para cafes, cappuccinos, chocolates y bebidas de leche.', 'Configuracion orientada a hoteleria, retail y autoservicio con una carta amplia de bebidas.', round(6027500 * 1.19), 'check_availability', 'published', true, 2, 'Krea Touch 5 contenedores | SMK Vending', 'Solucion premium para cafes, cappuccinos, chocolates y bebidas de leche.', '/catalog/cutouts/image2.png'),
  ('krea-touch-4', 'cat-maquinas', 'Krea Touch 4 contenedores', 'krea-touch-4-contenedores', '102030200073', 'Version eficiente de la familia Krea para operacion profesional y autoservicio.', 'Alternativa para cafeterias, hoteles y puntos de atencion que necesitan rendimiento sin sobredimensionar el equipo.', round(5570770 * 1.19), 'check_availability', 'published', false, 3, 'Krea Touch 4 contenedores | SMK Vending', 'Version eficiente de la familia Krea para operacion profesional y autoservicio.', '/catalog/cutouts/image2.png'),
  ('kometa', 'cat-maquinas', 'Kometa', 'kometa', '102030200086', 'Maquina super automatica con pantalla tactil y bebidas de hasta 14 oz.', 'Combina diseno compacto, operacion intuitiva y calidad de taza para empresas y cafeterias.', round(5197500 * 1.19), 'available', 'published', true, 4, 'Kometa | SMK Vending', 'Maquina super automatica con pantalla tactil y bebidas de hasta 14 oz.', '/catalog/cutouts/image3.png'),
  ('phedra-evo', 'cat-maquinas', 'Phedra Evo', 'phedra-evo', '106010100023', 'Equipo table-top para oficinas, lobbys y flujo medio.', 'Entrega bebidas con cafe, leche y chocolate, ademas de agua caliente para infusiones.', round(3468000 * 1.19), 'available', 'published', false, 5, 'Phedra Evo | SMK Vending', 'Equipo table-top para oficinas, lobbys y flujo medio.', '/catalog/cutouts/image4.png'),
  ('iper', 'cat-maquinas', 'Iper', 'iper', null, 'Modelo compacto y versatil para espacios pequenos con hasta 8 bebidas.', 'Compatible con red o bidon, ideal para autoservicio en espacios acotados.', round(2905500 * 1.19), 'check_availability', 'published', false, 6, 'Iper | SMK Vending', 'Modelo compacto y versatil para espacios pequenos con hasta 8 bebidas.', '/catalog/cutouts/image5.png'),
  ('ventus-gaia-4s', 'cat-maquinas', 'Ventus Gaia 4S', 'ventus-gaia-4s', null, 'Maquina soluble con 4 sabores y panel amigable para operacion comercial.', 'Muy util para minimarkets y conveniencia por su facil programacion y rapida recuperacion de inversion.', round(394000 * 1.19), 'available', 'published', true, 7, 'Ventus Gaia 4S | SMK Vending', 'Maquina soluble con 4 sabores y panel amigable para operacion comercial.', '/catalog/cutouts/image6.png'),
  ('navarino-dos', 'cat-grano', 'Cafe Navarino Dos 1 kg', 'cafe-navarino-dos-1kg', null, 'Blend 80% robusta y 20% arabica con intensidad alta y crema consistente.', 'Ideal para espresso de caracter fuerte y bebidas con leche que necesitan estructura.', round(27535 * 1.19), 'available', 'published', true, 8, 'Cafe Navarino Dos 1 kg | SMK Vending', 'Blend 80% robusta y 20% arabica con intensidad alta y crema consistente.', '/catalog/cutouts/image7.png'),
  ('navarino-uno', 'cat-grano', 'Cafe Navarino Uno 1 kg', 'cafe-navarino-uno-1kg', null, 'Blend equilibrado de 70% arabica y 30% robusta con perfil suave y cuerpo medio.', 'Alternativa versatil para consumo diario en oficinas, cafeterias y operacion continua.', round(34412 * 1.19), 'available', 'published', false, 9, 'Cafe Navarino Uno 1 kg | SMK Vending', 'Blend equilibrado de 70% arabica y 30% robusta con perfil suave y cuerpo medio.', '/catalog/cutouts/image8.png'),
  ('garibaldi-intenso', 'cat-grano', 'Cafe Garibaldi Intenso 1 kg', 'cafe-garibaldi-intenso-1kg', null, 'Cafe equilibrado con ligera acidez, notas de chocolate y tabaco.', 'Perfil italiano intenso y aterciopelado para espresso y barra diaria.', round(28990 * 1.19), 'available', 'published', true, 10, 'Cafe Garibaldi Intenso 1 kg | SMK Vending', 'Cafe equilibrado con ligera acidez, notas de chocolate y tabaco.', '/catalog/cutouts/image9.png'),
  ('garibaldi-espresso-bar', 'cat-grano', 'Cafe Garibaldi Espresso Bar 1 kg', 'cafe-garibaldi-espresso-bar-1kg', null, 'Blend 80% robusta vietnamita y 20% arabica brasilena con crema persistente.', 'Pensado para barras que buscan un espresso con notas de caramelo y postgusto largo.', round(32500 * 1.19), 'available', 'published', false, 11, 'Cafe Garibaldi Espresso Bar 1 kg | SMK Vending', 'Blend 80% robusta vietnamita y 20% arabica brasilena con crema persistente.', '/catalog/cutouts/image10.png'),
  ('cruzeiro-clasico', 'cat-instantaneo', 'Cafe soluble Cruzeiro 2 x 500 g', 'cafe-soluble-cruzeiro-2x500g', null, 'Formato rendidor para maquinas automaticas de cafe soluble y autoservicio.', 'Solucion economica y constante para conveniencia, minimarkets y puntos de atencion.', round(44270 * 1.19), 'available', 'published', true, 12, 'Cafe soluble Cruzeiro 2 x 500 g | SMK Vending', 'Formato rendidor para maquinas automaticas de cafe soluble y autoservicio.', '/catalog/cutouts/image11.png'),
  ('ristora-instantaneo', 'cat-instantaneo', 'Cafe soluble Ristora 200 g', 'cafe-soluble-ristora-200g', null, 'Cafe liofilizado para oficinas, vending y preparacion manual rapida.', 'Destaca por su preparacion agil, buen cuerpo y conservacion de aromas.', round(14500 * 1.19), 'available', 'published', true, 13, 'Cafe soluble Ristora 200 g | SMK Vending', 'Cafe liofilizado para oficinas, vending y preparacion manual rapida.', '/catalog/cutouts/image12.png'),
  ('azucar-sachet-1000', 'cat-accesorios', 'Caja Sachet de Azucar 1.000 un', 'caja-sachet-azucar-1000', '301010100010', 'Caja con 1.000 sachets para estaciones de cafe, oficinas y autoservicio.', 'Caja con 1.000 sachets para estaciones de cafe, oficinas y autoservicio.', round(21750 * 1.19), 'sold_out', 'published', false, 14, 'Caja Sachet de Azucar 1.000 un | SMK Vending', 'Caja con 1.000 sachets para estaciones de cafe, oficinas y autoservicio.', '/catalog/cutouts/image13.png'),
  ('sucralosa-sachet-1000', 'cat-accesorios', 'Caja Sachet de Sucralosa 1.000 un', 'caja-sachet-sucralosa-1000', '301010100011', 'Caja con 1.000 sachets de sucralosa para complementar la estacion de cafe.', 'Caja con 1.000 sachets de sucralosa para complementar la estacion de cafe.', round(30000 * 1.19), 'available', 'published', false, 15, 'Caja Sachet de Sucralosa 1.000 un | SMK Vending', 'Caja con 1.000 sachets de sucralosa para complementar la estacion de cafe.', '/catalog/cutouts/image14.png'),
  ('tapa-eco-12oz', 'cat-accesorios', 'Tapa Eco 12 oz Horeca PLA Biodegradable', 'tapa-eco-12oz-horeca-1000', '303030200002', 'Caja de 1.000 tapas compostables para vasos horeca de 12 oz.', 'Caja de 1.000 tapas compostables para vasos horeca de 12 oz.', round(88000 * 1.19), 'available', 'published', false, 16, 'Tapa Eco 12 oz Horeca PLA Biodegradable | SMK Vending', 'Caja de 1.000 tapas compostables para vasos horeca de 12 oz.', '/catalog/cutouts/image15.png'),
  ('tapa-eco-8oz', 'cat-accesorios', 'Tapa Eco 8 oz Horeca PLA Biodegradable', 'tapa-eco-8oz-horeca-1000', '303030200001', 'Caja de 1.000 tapas compostables para vasos horeca de 8 oz.', 'Caja de 1.000 tapas compostables para vasos horeca de 8 oz.', round(78300 * 1.19), 'available', 'published', false, 17, 'Tapa Eco 8 oz Horeca PLA Biodegradable | SMK Vending', 'Caja de 1.000 tapas compostables para vasos horeca de 8 oz.', '/catalog/cutouts/image15.png'),
  ('vaso-polipapel-7-5oz-cafeteria', 'cat-accesorios', 'Vaso Polipapel 7.5 oz Diseno Cafeteria', 'vaso-polipapel-7-5oz-diseno-cafeteria', '302520200041', 'Caja de 2.700 vasos para espresso largo, americano y bebidas pequenas.', 'Caja de 2.700 vasos para espresso largo, americano y bebidas pequenas.', round(161200 * 1.19), 'available', 'published', true, 18, 'Vaso Polipapel 7.5 oz Diseno Cafeteria | SMK Vending', 'Caja de 2.700 vasos para espresso largo, americano y bebidas pequenas.', '/catalog/cutouts/image16.png'),
  ('vaso-vending-flo-200cc', 'cat-accesorios', 'Vaso Vending Flo DA 200 cc Thermo Marron', 'vaso-vending-flo-200cc-caja-3000', '303020100007', 'Caja de 3.000 vasos termicos pensados para operacion vending.', 'Caja de 3.000 vasos termicos pensados para operacion vending.', round(158600 * 1.19), 'available', 'published', false, 19, 'Vaso Vending Flo DA 200 cc Thermo Marron | SMK Vending', 'Caja de 3.000 vasos termicos pensados para operacion vending.', '/catalog/cutouts/image17.png'),
  ('vaso-polipapel-horeca-12oz-metocup', 'cat-accesorios', 'Vaso Polipapel Horeca 12 oz Metocup', 'vaso-polipapel-horeca-12oz-metocup', '302520200033', 'Caja de 2.160 vasos de 12 oz para bebidas grandes y take away.', 'Caja de 2.160 vasos de 12 oz para bebidas grandes y take away.', round(210000 * 1.19), 'available', 'published', false, 20, 'Vaso Polipapel Horeca 12 oz Metocup | SMK Vending', 'Caja de 2.160 vasos de 12 oz para bebidas grandes y take away.', '/catalog/cutouts/image18.png'),
  ('vaso-vending-maori-12oz', 'cat-accesorios', 'Vaso Vending Diseno Maori 12 oz', 'vaso-vending-diseno-maori-12oz', '303020200007', 'Caja de 1.000 vasos con diseno distintivo para bebidas calientes o frias.', 'Caja de 1.000 vasos con diseno distintivo para bebidas calientes o frias.', round(117000 * 1.19), 'sold_out', 'published', true, 21, 'Vaso Vending Diseno Maori 12 oz | SMK Vending', 'Caja de 1.000 vasos con diseno distintivo para bebidas calientes o frias.', '/catalog/cutouts/image19.png'),
  ('vaso-eco-8oz-blanco', 'cat-accesorios', 'Vaso Eco 1 capa 8 oz Blanco', 'vaso-eco-8oz-blanco', '303030100010', 'Caja de vasos biodegradables de 8 oz para operaciones con foco sustentable.', 'Caja de vasos biodegradables de 8 oz para operaciones con foco sustentable.', round(90000 * 1.19), 'sold_out', 'published', false, 22, 'Vaso Eco 1 capa 8 oz Blanco | SMK Vending', 'Caja de vasos biodegradables de 8 oz para operaciones con foco sustentable.', '/catalog/cutouts/image20.png'),
  ('vaso-eco-12oz-blanco', 'cat-accesorios', 'Vaso Eco 1 capa 12 oz Blanco', 'vaso-eco-12oz-blanco', '303030100011', 'Version de 12 oz para bebidas grandes con presentacion simple y sustentable.', 'Version de 12 oz para bebidas grandes con presentacion simple y sustentable.', round(113000 * 1.19), 'available', 'published', false, 23, 'Vaso Eco 1 capa 12 oz Blanco | SMK Vending', 'Version de 12 oz para bebidas grandes con presentacion simple y sustentable.', '/catalog/cutouts/image20.png'),
  ('vaso-eco-ripple-8oz-kraft', 'cat-accesorios', 'Vaso Eco Ripple 8 oz Kraft', 'vaso-eco-ripple-8oz-kraft', '303030100030', 'Caja de 500 vasos ripple biodegradables con acabado kraft.', 'Caja de 500 vasos ripple biodegradables con acabado kraft.', round(76000 * 1.19), 'sold_out', 'published', false, 24, 'Vaso Eco Ripple 8 oz Kraft | SMK Vending', 'Caja de 500 vasos ripple biodegradables con acabado kraft.', '/catalog/cutouts/image21.png'),
  ('manga-vaso-12oz-cafeteria', 'cat-accesorios', 'Manga Vaso 12 oz Diseno Cafeteria', 'manga-vaso-12oz-diseno-cafeteria', '302520200047', 'Pack de 60 vasos para reposicion agil en barra o autoservicio.', 'Pack de 60 vasos para reposicion agil en barra o autoservicio.', round(12800 * 1.19), 'sold_out', 'published', false, 25, 'Manga Vaso 12 oz Diseno Cafeteria | SMK Vending', 'Pack de 60 vasos para reposicion agil en barra o autoservicio.', '/catalog/cutouts/image22.png'),
  ('manga-vaso-9oz-cafeteria', 'cat-accesorios', 'Manga Vaso 9 oz Diseno Cafeteria', 'manga-vaso-9oz-diseno-cafeteria', '302520200046', 'Pack de 60 vasos de 9 oz para operaciones con reposicion flexible.', 'Pack de 60 vasos de 9 oz para operaciones con reposicion flexible.', round(9200 * 1.19), 'sold_out', 'published', false, 26, 'Manga Vaso 9 oz Diseno Cafeteria | SMK Vending', 'Pack de 60 vasos de 9 oz para operaciones con reposicion flexible.', '/catalog/cutouts/image22.png'),
  ('vaso-polipapel-9oz-cafeteria', 'cat-accesorios', 'Vaso Polipapel 9 oz Diseno Cafeteria', 'vaso-polipapel-9oz-diseno-cafeteria', '302520200043', 'Caja de 2.460 vasos para operacion diaria y servicio continuo.', 'Caja de 2.460 vasos para operacion diaria y servicio continuo.', round(189000 * 1.19), 'sold_out', 'published', false, 27, 'Vaso Polipapel 9 oz Diseno Cafeteria | SMK Vending', 'Caja de 2.460 vasos para operacion diaria y servicio continuo.', '/catalog/cutouts/image16.png'),
  ('vaso-polipapel-12oz-cafeteria', 'cat-accesorios', 'Vaso Polipapel 12 oz Diseno Cafeteria', 'vaso-polipapel-12oz-diseno-cafeteria', '302520200049', 'Caja de vasos de 12 oz para bebidas grandes y take away.', 'Caja de vasos de 12 oz para bebidas grandes y take away.', round(137700 * 1.19), 'sold_out', 'published', false, 28, 'Vaso Polipapel 12 oz Diseno Cafeteria | SMK Vending', 'Caja de vasos de 12 oz para bebidas grandes y take away.', '/catalog/cutouts/image16.png'),
  ('vaso-eco-ripple-12oz-kraft', 'cat-accesorios', 'Vaso Eco Ripple 12 oz Kraft', 'vaso-eco-ripple-12oz-kraft', '303030100031', 'Caja de 500 vasos ripple de gran formato para bebidas calientes.', 'Caja de 500 vasos ripple de gran formato para bebidas calientes.', round(99000 * 1.19), 'sold_out', 'published', false, 29, 'Vaso Eco Ripple 12 oz Kraft | SMK Vending', 'Caja de 500 vasos ripple de gran formato para bebidas calientes.', '/catalog/cutouts/image21.png'),
  ('mokador-100-arabica-bio', 'cat-grano', 'Mokador 100% Arabica Bio', 'mokador-100-arabica-bio', '[PENDIENTE DEFINIR SKU]', 'Mokador 100% Arabica Bio. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe en grano. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 30, 'Mokador 100% Arabica Bio | SMK Vending', 'Mokador 100% Arabica Bio. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/mokador-100-arabica-bio.svg'),
  ('mokador-oro-blend', 'cat-grano', 'Mokador Oro Blend', 'mokador-oro-blend', '[PENDIENTE DEFINIR SKU]', 'Mokador Oro Blend. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe en grano. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 31, 'Mokador Oro Blend | SMK Vending', 'Mokador Oro Blend. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/mokador-oro-blend.svg'),
  ('mokador-brio-100', 'cat-grano', 'Mokador Brio 100', 'mokador-brio-100', '[PENDIENTE DEFINIR SKU]', 'Mokador Brio 100. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe en grano. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 32, 'Mokador Brio 100 | SMK Vending', 'Mokador Brio 100. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/mokador-brio-100.svg'),
  ('mokador-extra-cream', 'cat-grano', 'Mokador Extra Cream', 'mokador-extra-cream', '[PENDIENTE DEFINIR SKU]', 'Mokador Extra Cream. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe en grano. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 33, 'Mokador Extra Cream | SMK Vending', 'Mokador Extra Cream. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/mokador-extra-cream.svg'),
  ('schoppe-caramel-302', 'cat-instantaneo', 'Schoppe Caramel 302', 'schoppe-caramel-302', '[PENDIENTE DEFINIR SKU]', 'Schoppe Caramel 302. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe instantaneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 34, 'Schoppe Caramel 302 | SMK Vending', 'Schoppe Caramel 302. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/schoppe-caramel-302.svg'),
  ('schoppe-vainilla-301', 'cat-instantaneo', 'Schoppe Vainilla 301', 'schoppe-vainilla-301', '[PENDIENTE DEFINIR SKU]', 'Schoppe Vainilla 301. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe instantaneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 35, 'Schoppe Vainilla 301 | SMK Vending', 'Schoppe Vainilla 301. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/schoppe-vainilla-301.svg'),
  ('schoppe-noisete-303', 'cat-instantaneo', 'Schoppe Noisete 303', 'schoppe-noisete-303', '[PENDIENTE DEFINIR SKU]', 'Schoppe Noisete 303. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe instantaneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 36, 'Schoppe Noisete 303 | SMK Vending', 'Schoppe Noisete 303. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/schoppe-noisete-303.svg'),
  ('schoppe-choco-107', 'cat-instantaneo', 'Schoppe Choco 107', 'schoppe-choco-107', '[PENDIENTE DEFINIR SKU]', 'Schoppe Choco 107. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe instantaneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 37, 'Schoppe Choco 107 | SMK Vending', 'Schoppe Choco 107. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/schoppe-choco-107.svg'),
  ('schoppe-instant-tea-505', 'cat-instantaneo', 'Schoppe Instant Tea 505', 'schoppe-instant-tea-505', '[PENDIENTE DEFINIR SKU]', 'Schoppe Instant Tea 505. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe instantaneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 38, 'Schoppe Instant Tea 505 | SMK Vending', 'Schoppe Instant Tea 505. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/schoppe-instant-tea-505.svg'),
  ('laqtia-mocacino', 'cat-instantaneo', 'Laqtia Mocacino', 'laqtia-mocacino', '[PENDIENTE DEFINIR SKU]', 'Laqtia Mocacino. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe instantaneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 39, 'Laqtia Mocacino | SMK Vending', 'Laqtia Mocacino. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/laqtia-mocacino.svg'),
  ('laqtia-capuccino', 'cat-instantaneo', 'Laqtia Capuccino', 'laqtia-capuccino', '[PENDIENTE DEFINIR SKU]', 'Laqtia Capuccino. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe instantaneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 40, 'Laqtia Capuccino | SMK Vending', 'Laqtia Capuccino. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/laqtia-capuccino.svg'),
  ('laqtia-french-vainilla', 'cat-instantaneo', 'Laqtia French Vainilla', 'laqtia-french-vainilla', '[PENDIENTE DEFINIR SKU]', 'Laqtia French Vainilla. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe instantaneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 41, 'Laqtia French Vainilla | SMK Vending', 'Laqtia French Vainilla. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/laqtia-french-vainilla.svg'),
  ('laqtia-leche-topping', 'cat-instantaneo', 'Laqtia Leche Topping', 'laqtia-leche-topping', '[PENDIENTE DEFINIR SKU]', 'Laqtia Leche Topping. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe instantaneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 42, 'Laqtia Leche Topping | SMK Vending', 'Laqtia Leche Topping. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/laqtia-leche-topping.svg'),
  ('laqtia-chocolate-22-cacao-q15', 'cat-instantaneo', 'Laqtia Chocolate 22% Cacao Q15', 'laqtia-chocolate-22-cacao-q15', '[PENDIENTE DEFINIR SKU]', 'Laqtia Chocolate 22% Cacao Q15. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe instantaneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 43, 'Laqtia Chocolate 22% Cacao Q15 | SMK Vending', 'Laqtia Chocolate 22% Cacao Q15. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/laqtia-chocolate-22-cacao-q15.svg'),
  ('laqtia-natur-basic', 'cat-instantaneo', 'Laqtia Natur Basic', 'laqtia-natur-basic', '[PENDIENTE DEFINIR SKU]', 'Laqtia Natur Basic. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', 'Producto agregado al catalogo en la categoria cafe instantaneo. [PENDIENTE COMPLETAR DESCRIPCION] [PENDIENTE CARGAR IMAGEN]', 0, 'sold_out', 'published', false, 44, 'Laqtia Natur Basic | SMK Vending', 'Laqtia Natur Basic. [PENDIENTE DEFINIR PRECIO] [PENDIENTE DEFINIR SKU]', '/catalog/cutouts/placeholders/laqtia-natur-basic.svg')
on conflict (id) do update
set
  category_id = excluded.category_id,
  name = excluded.name,
  slug = excluded.slug,
  sku = excluded.sku,
  short_description = excluded.short_description,
  long_description = excluded.long_description,
  price_clp_tax_inc = excluded.price_clp_tax_inc,
  availability_status = excluded.availability_status,
  publication_status = excluded.publication_status,
  is_featured = excluded.is_featured,
  sort_order = excluded.sort_order,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description,
  primary_image_path = excluded.primary_image_path;

delete from public.product_images;

insert into public.product_images (
  product_id,
  storage_path,
  alt_text,
  sort_order,
  is_primary
)
select
  id,
  primary_image_path,
  name,
  0,
  true
from public.products
where primary_image_path is not null;
