-- Phase 1: schema support for admin catalog hierarchy, product metadata and order archiving.
-- The current categories.id column is text, so parent_id must also be text to
-- keep a real foreign key without changing existing category ids.

alter table public.categories
  add column if not exists parent_id text,
  add column if not exists is_active boolean,
  add column if not exists image_url text,
  add column if not exists sort_order integer;

alter table public.categories
  alter column is_active set default true,
  alter column sort_order set default 0;

update public.categories
set
  is_active = coalesce(is_active, is_visible, true),
  sort_order = coalesce(sort_order, 0)
where is_active is null
   or sort_order is null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'categories'
      and column_name = 'parent_id'
      and data_type = 'text'
  ) then
    if not exists (
      select 1
      from pg_constraint
      where conname = 'categories_parent_id_fkey'
    ) then
      alter table public.categories
        add constraint categories_parent_id_fkey
        foreign key (parent_id)
        references public.categories(id)
        on delete set null;
    end if;

    if not exists (
      select 1
      from pg_constraint
      where conname = 'categories_parent_id_not_self'
    ) then
      alter table public.categories
        add constraint categories_parent_id_not_self
        check (parent_id is null or parent_id <> id)
        not valid;
    end if;
  end if;
end
$$;

create index if not exists categories_parent_id_idx
  on public.categories (parent_id);

alter table public.products
  add column if not exists brand text,
  add column if not exists ean text,
  add column if not exists net_price_clp integer,
  add column if not exists gross_price_clp integer,
  add column if not exists stock_quantity integer;

alter table public.products
  alter column net_price_clp set default 0,
  alter column gross_price_clp set default 0;

update public.products
set
  gross_price_clp = coalesce(gross_price_clp, price_clp_tax_inc, 0),
  net_price_clp = coalesce(
    net_price_clp,
    case
      when price_clp_tax_inc is null then 0
      else round(price_clp_tax_inc / 1.19)::integer
    end
  )
where gross_price_clp is null
   or net_price_clp is null;

do $$
declare
  highlights_type text;
  gallery_images_type text;
begin
  select udt_name
  into highlights_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'products'
    and column_name = 'highlights';

  if highlights_type is null then
    alter table public.products
      add column highlights jsonb default '[]'::jsonb;
  elsif highlights_type = '_text' then
    alter table public.products
      alter column highlights drop default;

    alter table public.products
      alter column highlights type jsonb
      using coalesce(to_jsonb(highlights), '[]'::jsonb);
  end if;

  select udt_name
  into highlights_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'products'
    and column_name = 'highlights';

  if highlights_type = 'jsonb' then
    alter table public.products
      alter column highlights set default '[]'::jsonb;

    update public.products
    set highlights = '[]'::jsonb
    where highlights is null;
  end if;

  select udt_name
  into gallery_images_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'products'
    and column_name = 'gallery_images';

  if gallery_images_type is null then
    alter table public.products
      add column gallery_images jsonb default '[]'::jsonb;
  elsif gallery_images_type = '_text' then
    alter table public.products
      alter column gallery_images drop default;

    alter table public.products
      alter column gallery_images type jsonb
      using coalesce(to_jsonb(gallery_images), '[]'::jsonb);
  end if;

  select udt_name
  into gallery_images_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'products'
    and column_name = 'gallery_images';

  if gallery_images_type = 'jsonb' then
    alter table public.products
      alter column gallery_images set default '[]'::jsonb;

    update public.products
    set gallery_images = '[]'::jsonb
    where gallery_images is null;
  end if;
end
$$;

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

create index if not exists products_brand_idx
  on public.products (brand);

create index if not exists products_ean_idx
  on public.products (ean);

alter table public.orders
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid,
  add column if not exists internal_note text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_archived_by_fkey'
  ) then
    alter table public.orders
      add constraint orders_archived_by_fkey
      foreign key (archived_by)
      references auth.users(id)
      on delete set null;
  end if;
end
$$;

create index if not exists orders_archived_at_idx
  on public.orders (archived_at);

do $$
begin
  if exists (
    select 1
    from pg_type
    where typnamespace = 'public'::regnamespace
      and typname = 'order_status'
      and typtype = 'e'
  ) then
    if not exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typnamespace = 'public'::regnamespace
        and t.typname = 'order_status'
        and e.enumlabel = 'processing'
    ) then
      alter type public.order_status add value 'processing';
    end if;

    if not exists (
      select 1
      from pg_enum e
      join pg_type t on t.oid = e.enumtypid
      where t.typnamespace = 'public'::regnamespace
        and t.typname = 'order_status'
        and e.enumlabel = 'completed'
    ) then
      alter type public.order_status add value 'completed';
    end if;
  end if;
end
$$;
