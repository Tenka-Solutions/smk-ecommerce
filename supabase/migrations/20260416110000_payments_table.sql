create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'payment_domain_status'
  ) then
    create type public.payment_domain_status as enum (
      'pending',
      'paid',
      'failed'
    );
  end if;

  if not exists (
    select 1 from pg_type where typname = 'payment_domain_provider'
  ) then
    create type public.payment_domain_provider as enum (
      'mock',
      'mercadopago',
      'flow',
      'santander'
    );
  end if;
end
$$;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  amount integer not null check (amount >= 0),
  currency text not null default 'CLP' check (currency = 'CLP'),
  status public.payment_domain_status not null default 'pending',
  provider public.payment_domain_provider not null,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_order_id_idx
  on public.payments (order_id);

create index if not exists payments_status_idx
  on public.payments (status);

create or replace function public.payments_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists payments_set_updated_at on public.payments;
create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.payments_set_updated_at();

alter table public.payments enable row level security;

drop policy if exists "service role manages payments" on public.payments;
create policy "service role manages payments"
  on public.payments
  for all
  to service_role
  using (true)
  with check (true);
