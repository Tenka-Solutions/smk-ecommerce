do $$
begin
  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'availability_status'
      and e.enumlabel = 'draft'
  ) then
    alter type public.availability_status add value 'draft';
  end if;

  if not exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'availability_status'
      and e.enumlabel = 'hidden'
  ) then
    alter type public.availability_status add value 'hidden';
  end if;
end
$$;

alter table public.products
  add column if not exists net_price_clp integer,
  add column if not exists gross_price_clp integer,
  add column if not exists stock_quantity integer,
  add column if not exists highlights text[] not null default '{}'::text[],
  add column if not exists brand text,
  add column if not exists gallery_images text[] not null default '{}'::text[];

update public.products
set
  gross_price_clp = coalesce(gross_price_clp, price_clp_tax_inc),
  net_price_clp = coalesce(net_price_clp, round(price_clp_tax_inc / 1.19))
where gross_price_clp is null
   or net_price_clp is null;

alter table public.categories
  add column if not exists image_url text,
  add column if not exists is_active boolean;

update public.categories
set is_active = coalesce(is_active, is_visible)
where is_active is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_net_price_clp_non_negative'
  ) then
    alter table public.products
      add constraint products_net_price_clp_non_negative
      check (net_price_clp is null or net_price_clp >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_gross_price_clp_non_negative'
  ) then
    alter table public.products
      add constraint products_gross_price_clp_non_negative
      check (gross_price_clp is null or gross_price_clp >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'products_stock_quantity_non_negative'
  ) then
    alter table public.products
      add constraint products_stock_quantity_non_negative
      check (stock_quantity is null or stock_quantity >= 0);
  end if;
end
$$;

drop policy if exists "Public can read published products" on public.products;

create policy "Public can read published products"
on public.products
for select
using (
  publication_status = 'published'
  and availability_status::text not in ('draft', 'hidden')
);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can read product images'
  ) then
    create policy "Public can read product images"
    on storage.objects
    for select
    using (bucket_id = 'product-images');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Admins manage product images'
  ) then
    create policy "Admins manage product images"
    on storage.objects
    for all
    using (
      bucket_id = 'product-images'
      and (
        public.has_role('super_admin')
        or public.has_role('catalog_editor')
      )
    )
    with check (
      bucket_id = 'product-images'
      and (
        public.has_role('super_admin')
        or public.has_role('catalog_editor')
      )
    );
  end if;
end
$$;
