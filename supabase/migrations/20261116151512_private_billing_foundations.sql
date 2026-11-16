-- Keep subscriptions and billing records outside the exposed Data API.
alter table private.subscriptions
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists last_stripe_event_created bigint not null default 0;

create table if not exists private.stripe_events (
  event_id text primary key,
  event_type text not null,
  received_at timestamptz not null default now()
);
alter table private.stripe_events enable row level security;
revoke all on private.stripe_events from public, anon, authenticated;

-- Service-only gateway: no private schema is exposed to browser clients.
create or replace function public.billing_subscription_for_user(p_user_id uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select to_jsonb(s) from private.subscriptions s where s.user_id = p_user_id
$$;
revoke all on function public.billing_subscription_for_user(uuid) from public, anon, authenticated;
grant execute on function public.billing_subscription_for_user(uuid) to service_role;

create or replace function public.billing_register_customer(p_user_id uuid, p_customer_id text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into private.subscriptions(user_id, stripe_customer_id)
  values (p_user_id, p_customer_id)
  on conflict (user_id) do update set
    stripe_customer_id = excluded.stripe_customer_id,
    updated_at = now()
  where private.subscriptions.stripe_customer_id is null;
end;
$$;
revoke all on function public.billing_register_customer(uuid,text) from public, anon, authenticated;
grant execute on function public.billing_register_customer(uuid,text) to service_role;

create or replace function public.apply_plus_subscription(
  p_event_id text, p_event_type text, p_event_created bigint,
  p_user_id uuid, p_customer_id text, p_subscription_id text,
  p_status text, p_period_end timestamptz, p_cancel_at_period_end boolean
) returns void language plpgsql security definer set search_path = '' as $$
begin
  insert into private.stripe_events(event_id, event_type)
  values (p_event_id, p_event_type) on conflict do nothing;
  if not found then return; end if;

  insert into private.subscriptions(
    user_id, stripe_customer_id, stripe_subscription_id, status,
    current_period_end, cancel_at_period_end, last_stripe_event_created, updated_at
  ) values (
    p_user_id, p_customer_id, p_subscription_id, p_status,
    p_period_end, p_cancel_at_period_end, p_event_created, now()
  ) on conflict (user_id) do update set
    stripe_customer_id = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    status = excluded.status,
    current_period_end = excluded.current_period_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    last_stripe_event_created = excluded.last_stripe_event_created,
    updated_at = now()
  where private.subscriptions.last_stripe_event_created <= excluded.last_stripe_event_created;
end;
$$;
revoke all on function public.apply_plus_subscription(text,text,bigint,uuid,text,text,text,timestamptz,boolean) from public, anon, authenticated;
grant execute on function public.apply_plus_subscription(text,text,bigint,uuid,text,text,text,timestamptz,boolean) to service_role;
