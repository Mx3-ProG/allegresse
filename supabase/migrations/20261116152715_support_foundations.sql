create table private.contributions (
  stripe_checkout_session_id text primary key,
  stripe_payment_intent_id text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  amount_minor bigint not null check (amount_minor between 200 and 50000),
  currency text not null check (currency = 'eur'),
  status text not null check (status in ('paid','refunded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table private.contributions enable row level security;
revoke all on private.contributions from public, anon, authenticated;

create or replace function public.record_contribution(
  p_session_id text, p_payment_intent_id text, p_user_id uuid,
  p_amount_minor bigint, p_currency text
) returns void language plpgsql security definer set search_path = '' as $$
begin
  if p_amount_minor < 200 or p_amount_minor > 50000 or p_currency <> 'eur' then
    raise exception 'Invalid contribution amount';
  end if;
  insert into private.contributions(
    stripe_checkout_session_id, stripe_payment_intent_id, user_id,
    amount_minor, currency, status
  ) values (p_session_id, p_payment_intent_id, p_user_id,
    p_amount_minor, p_currency, 'paid') on conflict do nothing;
end;
$$;
revoke all on function public.record_contribution(text,text,uuid,bigint,text) from public, anon, authenticated;
grant execute on function public.record_contribution(text,text,uuid,bigint,text) to service_role;

create or replace function public.refund_contribution(p_payment_intent_id text)
returns void language sql security definer set search_path = '' as $$
  update private.contributions set status = 'refunded', updated_at = now()
  where stripe_payment_intent_id = p_payment_intent_id and status = 'paid'
$$;
revoke all on function public.refund_contribution(text) from public, anon, authenticated;
grant execute on function public.refund_contribution(text) to service_role;
