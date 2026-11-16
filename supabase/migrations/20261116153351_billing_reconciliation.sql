create or replace function public.billing_reconciliation_candidates()
returns table(user_id uuid, subscription_id text)
language sql stable security definer set search_path = '' as $$
  select s.user_id, s.stripe_subscription_id
  from private.subscriptions s where s.stripe_subscription_id is not null
$$;
revoke all on function public.billing_reconciliation_candidates() from public, anon, authenticated;
grant execute on function public.billing_reconciliation_candidates() to service_role;
