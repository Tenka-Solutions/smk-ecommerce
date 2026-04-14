create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'availability_status'
  ) then
    create type public.availability_status as enum (
      'available',
      'check_availability',
      'sold_out'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'publication_status'
  ) then
    create type public.publication_status as enum (
      'draft',
      'published',
      'archived'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'order_status'
  ) then
    create type public.order_status as enum (
      'pending',
      'paid',
      'rejected',
      'cancelled',
      'preparing',
      'shipped',
      'delivered'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'payment_status'
  ) then
    create type public.payment_status as enum (
      'pending',
      'paid',
      'rejected',
      'cancelled'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'quote_status'
  ) then
    create type public.quote_status as enum (
      'new',
      'reviewed',
      'closed'
    );
  end if;
end
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.categories (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text default ''::text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id text primary key,
  category_id text not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  sku text,
  short_description text default ''::text,
  long_description text default ''::text,
  price_clp_tax_inc integer not null default 0,
  availability_status public.availability_status not null default 'available',
  publication_status public.publication_status not null default 'draft',
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  seo_title text,
  seo_description text,
  primary_image_path text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  company_name text,
  rut text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, role_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  phone text not null,
  rut text,
  company_name text,
  business_name text,
  business_activity text,
  subtotal_tax_inc integer not null default 0,
  tax_amount integer not null default 0,
  shipping_label text not null default 'Por confirmar',
  shipping_amount integer,
  total_tax_inc integer not null default 0,
  order_status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  payment_provider text,
  latest_payment_attempt_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_snapshot jsonb not null default '{}'::jsonb,
  sku_snapshot text,
  name_snapshot text not null,
  quantity integer not null check (quantity > 0),
  unit_price_tax_inc integer not null default 0,
  line_total_tax_inc integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_shipping_addresses (
  order_id uuid primary key references public.orders(id) on delete cascade,
  region text not null,
  comuna text not null,
  street text not null,
  number text not null,
  apartment text,
  references text,
  delivery_notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'getnet',
  reference text not null unique,
  provider_transaction_id text,
  status public.payment_status not null default 'pending',
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  redirect_url text,
  confirmed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  quote_request_id uuid,
  template_key text not null,
  recipient text not null,
  provider_message_id text,
  status text not null,
  error_message text,
  sent_at timestamptz,
  payload_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  company text,
  message text not null,
  status public.quote_status not null default 'new',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.quote_request_items (
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.orders
  add constraint orders_latest_payment_attempt_id_fkey
  foreign key (latest_payment_attempt_id)
  references public.payment_attempts(id)
  on delete set null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      ''
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.has_role(role_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and r.slug = role_slug
  );
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists quote_requests_set_updated_at on public.quote_requests;
create trigger quote_requests_set_updated_at
before update on public.quote_requests
for each row
execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_shipping_addresses enable row level security;
alter table public.payment_attempts enable row level security;
alter table public.order_events enable row level security;
alter table public.email_logs enable row level security;
alter table public.quote_requests enable row level security;
alter table public.quote_request_items enable row level security;

create policy "Public can read visible categories"
on public.categories
for select
using (is_visible = true);

create policy "Public can read published products"
on public.products
for select
using (publication_status = 'published');

create policy "Public can read images of published products"
on public.product_images
for select
using (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and p.publication_status = 'published'
  )
);

create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can read own roles"
on public.user_roles
for select
using (auth.uid() = user_id);

create policy "Users can read own orders"
on public.orders
for select
using (auth.uid() = user_id);

create policy "Users can read own order items"
on public.order_items
for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

create policy "Users can read own shipping addresses"
on public.order_shipping_addresses
for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_shipping_addresses.order_id
      and o.user_id = auth.uid()
  )
);

create policy "Admins manage categories"
on public.categories
for all
using (
  public.has_role('super_admin')
  or public.has_role('catalog_editor')
)
with check (
  public.has_role('super_admin')
  or public.has_role('catalog_editor')
);

create policy "Admins manage products"
on public.products
for all
using (
  public.has_role('super_admin')
  or public.has_role('catalog_editor')
)
with check (
  public.has_role('super_admin')
  or public.has_role('catalog_editor')
);

create policy "Admins manage product images"
on public.product_images
for all
using (
  public.has_role('super_admin')
  or public.has_role('catalog_editor')
)
with check (
  public.has_role('super_admin')
  or public.has_role('catalog_editor')
);

create policy "Admins manage orders"
on public.orders
for all
using (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
)
with check (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
);

create policy "Admins manage order items"
on public.order_items
for all
using (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
)
with check (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
);

create policy "Admins manage shipping addresses"
on public.order_shipping_addresses
for all
using (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
)
with check (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
);

create policy "Admins manage payment attempts"
on public.payment_attempts
for all
using (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
)
with check (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
);

create policy "Admins manage order events"
on public.order_events
for all
using (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
)
with check (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
);

create policy "Admins manage quote requests"
on public.quote_requests
for all
using (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
)
with check (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
);

create policy "Admins manage quote request items"
on public.quote_request_items
for all
using (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
)
with check (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
);

create policy "Admins manage roles"
on public.roles
for all
using (public.has_role('super_admin'))
with check (public.has_role('super_admin'));

create policy "Admins manage user roles"
on public.user_roles
for all
using (public.has_role('super_admin'))
with check (public.has_role('super_admin'));

create policy "Admins manage email logs"
on public.email_logs
for all
using (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
)
with check (
  public.has_role('super_admin')
  or public.has_role('sales_manager')
);

insert into storage.buckets (id, name, public)
values ('catalog', 'catalog', true)
on conflict (id) do nothing;
