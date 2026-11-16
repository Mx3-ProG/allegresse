create table public.store_products (
  id text primary key check (id ~ '^[a-z][a-z0-9_]{2,63}$'),
  name text not null,
  description text not null,
  category text not null,
  payment_mode text not null check (payment_mode in ('free','one_time')),
  amount_minor bigint check (amount_minor >= 0),
  currency text check (currency ~ '^[a-z]{3}$'),
  stripe_price_id text unique,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  check ((payment_mode = 'free' and amount_minor is null and stripe_price_id is null)
    or (payment_mode = 'one_time' and amount_minor is not null and currency is not null and stripe_price_id is not null))
);
alter table public.store_products enable row level security;
create policy store_products_read on public.store_products for select to anon, authenticated using (published);
grant select on public.store_products to anon, authenticated;
revoke insert, update, delete on public.store_products from anon, authenticated;

create table private.product_orders (
  stripe_checkout_session_id text primary key,
  stripe_payment_intent_id text unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.store_products(id),
  amount_minor bigint not null,
  currency text not null,
  status text not null check (status in ('paid','refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table private.product_orders enable row level security;
revoke all on private.product_orders from public, anon, authenticated;

create table public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.store_products(id),
  source text not null check (source in ('purchase','promotion','admin')),
  source_id text not null,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, product_id, source, source_id)
);
create index user_entitlements_lookup on public.user_entitlements (user_id, product_id)
  where revoked_at is null;
alter table public.user_entitlements enable row level security;
create policy user_entitlements_owner on public.user_entitlements for select to authenticated
  using (user_id = (select auth.uid()));
grant select on public.user_entitlements to authenticated;
revoke insert, update, delete on public.user_entitlements from anon, authenticated;

create or replace function public.apply_product_purchase(
  p_session_id text, p_payment_intent_id text, p_user_id uuid,
  p_product_id text, p_price_id text, p_amount_minor bigint, p_currency text
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (
    select 1 from public.store_products p where p.id = p_product_id and p.published
      and p.payment_mode = 'one_time' and p.stripe_price_id = p_price_id
      and p.amount_minor = p_amount_minor and p.currency = p_currency
  ) then raise exception 'Product price mismatch'; end if;
  insert into private.product_orders(
    stripe_checkout_session_id, stripe_payment_intent_id, user_id,
    product_id, amount_minor, currency, status
  ) values (p_session_id, p_payment_intent_id, p_user_id,
    p_product_id, p_amount_minor, p_currency, 'paid')
  on conflict (stripe_checkout_session_id) do nothing;
  insert into public.user_entitlements(user_id, product_id, source, source_id)
  values (p_user_id, p_product_id, 'purchase', p_session_id)
  on conflict do nothing;
end;
$$;
revoke all on function public.apply_product_purchase(text,text,uuid,text,text,bigint,text) from public, anon, authenticated;
grant execute on function public.apply_product_purchase(text,text,uuid,text,text,bigint,text) to service_role;

create or replace function public.refund_product_purchase(p_payment_intent_id text)
returns void language plpgsql security definer set search_path = '' as $$
declare order_row private.product_orders%rowtype;
begin
  select * into order_row from private.product_orders where stripe_payment_intent_id = p_payment_intent_id for update;
  if not found then return; end if;
  update private.product_orders set status = 'refunded', updated_at = now()
    where stripe_checkout_session_id = order_row.stripe_checkout_session_id;
  update public.user_entitlements set revoked_at = coalesce(revoked_at, now())
    where source = 'purchase' and source_id = order_row.stripe_checkout_session_id;
end;
$$;
revoke all on function public.refund_product_purchase(text) from public, anon, authenticated;
grant execute on function public.refund_product_purchase(text) to service_role;
