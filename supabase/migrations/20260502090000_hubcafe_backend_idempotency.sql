-- Hub Cafe backend idempotency support.
-- Reuses existing products, orders, order_items, order_events and email_logs.

with duplicated_stock_events as (
  select
    id,
    row_number() over (
      partition by order_id, event_type
      order by created_at asc, id asc
    ) as rn
  from public.order_events
  where event_type = 'stock_discounted'
)
update public.order_events as oe
set
  event_type = 'stock_discounted_duplicate',
  payload = coalesce(oe.payload, '{}'::jsonb) || jsonb_build_object(
    'duplicateOf', 'stock_discounted',
    'migratedBy', '20260502090000_hubcafe_backend_idempotency'
  )
from duplicated_stock_events as dse
where oe.id = dse.id
  and dse.rn > 1;

create unique index if not exists order_events_stock_discounted_once_idx
  on public.order_events (order_id, event_type)
  where event_type = 'stock_discounted';

with duplicated_email_logs as (
  select
    id,
    row_number() over (
      partition by order_id, template_key
      order by created_at asc, id asc
    ) as rn
  from public.email_logs
  where order_id is not null
    and status in ('sending', 'sent')
)
update public.email_logs as el
set
  status = 'duplicate',
  error_message = coalesce(error_message, 'Marcado como duplicado por migracion Hub Cafe.')
from duplicated_email_logs as del
where el.id = del.id
  and del.rn > 1;

create unique index if not exists email_logs_order_template_active_once_idx
  on public.email_logs (order_id, template_key)
  where order_id is not null
    and status in ('sending', 'sent');
    
create or replace function public.hubcafe_discount_order_stock_once(p_order_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_item record;
  v_product record;
  v_previous_stock integer;
  v_next_stock integer;
  v_changes jsonb := '[]'::jsonb;
  v_warnings jsonb := '[]'::jsonb;
  v_result jsonb;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_order_id::text, 0));

  if exists (
    select 1
    from public.order_events
    where order_id = p_order_id
      and event_type = 'stock_discounted'
  ) then
    return jsonb_build_object(
      'discounted', false,
      'changes', jsonb_build_array(),
      'warnings', jsonb_build_array('Stock ya descontado para este pedido.')
    );
  end if;

  insert into public.order_events (order_id, event_type, payload)
  values (
    p_order_id,
    'stock_discounted',
    jsonb_build_object(
      'status', 'started',
      'source', 'hubcafe-backend'
    )
  )
  on conflict do nothing
  returning id into v_event_id;

  if v_event_id is null then
    return jsonb_build_object(
      'discounted', false,
      'changes', jsonb_build_array(),
      'warnings', jsonb_build_array('Stock ya descontado para este pedido.')
    );
  end if;

  for v_item in
    select *
    from public.order_items
    where order_id = p_order_id
    order by created_at asc
  loop
    if v_item.product_id is null then
      v_warnings := v_warnings || jsonb_build_array(
        format('Item %s sin product_id.', coalesce(v_item.name_snapshot, v_item.id::text))
      );
      continue;
    end if;

    select id, sku, name, stock_quantity
    into v_product
    from public.products
    where id = v_item.product_id
    for update;

    if not found then
      v_warnings := v_warnings || jsonb_build_array(
        format('Producto %s no existe al descontar stock.', v_item.product_id)
      );
      continue;
    end if;

    if v_product.stock_quantity is null then
      v_warnings := v_warnings || jsonb_build_array(
        format('Producto %s sin stock_quantity controlado.', coalesce(v_product.name, v_item.name_snapshot))
      );
      continue;
    end if;

    v_previous_stock := v_product.stock_quantity;
    v_next_stock := greatest(0, v_previous_stock - coalesce(v_item.quantity, 0));

    if v_previous_stock < coalesce(v_item.quantity, 0) then
      v_warnings := v_warnings || jsonb_build_array(
        format('Stock insuficiente al descontar %s. Disponible: %s.', coalesce(v_product.name, v_item.name_snapshot), v_previous_stock)
      );
    end if;

    update public.products
    set stock_quantity = v_next_stock
    where id = v_product.id;

    v_changes := v_changes || jsonb_build_array(
      jsonb_build_object(
        'productId', v_product.id,
        'sku', v_product.sku,
        'name', coalesce(v_product.name, v_item.name_snapshot),
        'previousStock', v_previous_stock,
        'nextStock', v_next_stock,
        'quantity', coalesce(v_item.quantity, 0)
      )
    );
  end loop;

  v_result := jsonb_build_object(
    'discounted', true,
    'changes', v_changes,
    'warnings', v_warnings
  );

  update public.order_events
  set payload = v_result
  where id = v_event_id;

  if jsonb_array_length(v_warnings) > 0 then
    insert into public.order_events (order_id, event_type, payload)
    values (
      p_order_id,
      'stock_discount_warning',
      jsonb_build_object('warnings', v_warnings)
    );
  end if;

  return v_result;
exception
  when others then
    raise;
end;
$$;
