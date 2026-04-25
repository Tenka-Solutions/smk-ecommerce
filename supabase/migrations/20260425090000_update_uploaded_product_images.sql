update public.products
set
  primary_image_path = updates.primary_image_path,
  long_description = replace(long_description, ' [PENDIENTE CARGAR IMAGEN]', '')
from (
  values
    ('mokador-100-arabica-bio', '/catalog/cutouts/arabicabio.png'),
    ('mokador-brio-100', '/catalog/cutouts/brio.png'),
    ('mokador-extra-cream', '/catalog/cutouts/extracream.png'),
    ('schoppe-caramel-302', '/catalog/cutouts/302.png'),
    ('schoppe-vainilla-301', '/catalog/cutouts/301.svg'),
    ('schoppe-noisete-303', '/catalog/cutouts/303.svg'),
    ('schoppe-choco-107', '/catalog/cutouts/107.png'),
    ('schoppe-instant-tea-505', '/catalog/cutouts/505.svg'),
    ('laqtia-natur-basic', '/catalog/cutouts/laqtia-natur-basic.png')
) as updates(id, primary_image_path)
where public.products.id = updates.id;

delete from public.product_images
where product_id in (
  'mokador-100-arabica-bio',
  'mokador-brio-100',
  'mokador-extra-cream',
  'schoppe-caramel-302',
  'schoppe-vainilla-301',
  'schoppe-noisete-303',
  'schoppe-choco-107',
  'schoppe-instant-tea-505',
  'laqtia-natur-basic'
);

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
where id in (
  'mokador-100-arabica-bio',
  'mokador-brio-100',
  'mokador-extra-cream',
  'schoppe-caramel-302',
  'schoppe-vainilla-301',
  'schoppe-noisete-303',
  'schoppe-choco-107',
  'schoppe-instant-tea-505',
  'laqtia-natur-basic'
);
