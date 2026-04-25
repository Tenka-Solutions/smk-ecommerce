-- Restore Spanish accents in seeded categories and products.
-- Idempotent: safe to run multiple times. Each replacement only fires when
-- the unaccented form is still present in the row.

-- Apply each replacement to categories and products
do $$
declare
  r record;
begin
  for r in (
    select 'Cafe ' as s, 'Café ' as t union all
    select 'cafe ', 'café ' union all
    select 'Cafes ', 'Cafés ' union all
    select 'cafes ', 'cafés ' union all
    select 'Cafeteria', 'Cafetería' union all
    select 'cafeteria', 'cafetería' union all
    select 'Cafeterias', 'Cafeterías' union all
    select 'cafeterias', 'cafeterías' union all
    select 'Maquinas', 'Máquinas' union all
    select 'Maquina', 'Máquina' union all
    select 'maquinas', 'máquinas' union all
    select 'maquina', 'máquina' union all
    select 'automaticos', 'automáticos' union all
    select 'automaticas', 'automáticas' union all
    select 'automatico', 'automático' union all
    select 'automatica', 'automática' union all
    select 'semiautomaticos', 'semiautomáticos' union all
    select 'semiautomaticas', 'semiautomáticas' union all
    select 'instantaneo', 'instantáneo' union all
    select 'instantanea', 'instantánea' union all
    select 'Solucion', 'Solución' union all
    select 'solucion', 'solución' union all
    select 'Configuracion', 'Configuración' union all
    select 'configuracion', 'configuración' union all
    select 'Operacion', 'Operación' union all
    select 'operacion', 'operación' union all
    select 'Atencion', 'Atención' union all
    select 'atencion', 'atención' union all
    select 'hoteleria', 'hotelería' union all
    select 'Hoteleria', 'Hotelería' union all
    select 'caracter', 'carácter' union all
    select 'versatiles', 'versátiles' union all
    select 'versatil', 'versátil' union all
    select 'Version', 'Versión' union all
    select 'version', 'versión' union all
    select 'tactil', 'táctil' union all
    select 'disenos', 'diseños' union all
    select 'diseno', 'diseño' union all
    select 'Diseno', 'Diseño' union all
    select 'pequenas', 'pequeñas' union all
    select 'pequenos', 'pequeños' union all
    select 'pequena', 'pequeña' union all
    select 'pequeno', 'pequeño' union all
    select 'rapida', 'rápida' union all
    select 'rapido', 'rápido' union all
    select 'agil', 'ágil' union all
    select 'unico', 'único' union all
    select 'unica', 'única' union all
    select 'economica', 'económica' union all
    select 'economico', 'económico' union all
    select 'Azucar', 'Azúcar' union all
    select 'azucar', 'azúcar' union all
    select 'Estacion', 'Estación' union all
    select 'estacion', 'estación' union all
    select 'tambien', 'también' union all
    select 'despues', 'después' union all
    select 'segun', 'según' union all
    select 'Catalogo', 'Catálogo' union all
    select 'catalogo', 'catálogo' union all
    select 'arabica', 'arábica' union all
    select 'brasilena', 'brasileña' union all
    select 'cappuccinos', 'cappuccinos'
  ) loop
    update public.categories
      set
        name = replace(name, r.s, r.t),
        description = replace(description, r.s, r.t),
        seo_title = replace(seo_title, r.s, r.t),
        seo_description = replace(seo_description, r.s, r.t)
      where
        name like '%' || r.s || '%'
        or description like '%' || r.s || '%'
        or seo_title like '%' || r.s || '%'
        or seo_description like '%' || r.s || '%';

    update public.products
      set
        name = replace(name, r.s, r.t),
        short_description = replace(short_description, r.s, r.t),
        long_description = replace(long_description, r.s, r.t),
        seo_title = replace(seo_title, r.s, r.t),
        seo_description = replace(seo_description, r.s, r.t)
      where
        name like '%' || r.s || '%'
        or short_description like '%' || r.s || '%'
        or long_description like '%' || r.s || '%'
        or seo_title like '%' || r.s || '%'
        or seo_description like '%' || r.s || '%';
  end loop;
end
$$;
