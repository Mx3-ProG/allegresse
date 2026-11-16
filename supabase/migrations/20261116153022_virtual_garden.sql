create table public.light_point_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null,
  amount integer not null check (amount <> 0),
  created_at timestamptz not null default now(),
  unique(user_id, event_key)
);
alter table public.light_point_events enable row level security;
create policy light_points_owner_read on public.light_point_events for select to authenticated
  using (user_id = (select auth.uid()));
grant select on public.light_point_events to authenticated;
revoke insert, update, delete on public.light_point_events from anon, authenticated;

create table public.virtual_items (
  id text primary key,
  name text not null,
  emoji text not null,
  price_points integer not null check (price_points > 0),
  active boolean not null default false
);
alter table public.virtual_items enable row level security;
create policy virtual_items_read on public.virtual_items for select to anon, authenticated using (active);
grant select on public.virtual_items to anon, authenticated;
revoke insert, update, delete on public.virtual_items from anon, authenticated;
insert into public.virtual_items(id,name,emoji,price_points,active) values
  ('fleur','Fleur de lumière','🌼',10,true),
  ('arbre','Jeune arbre','🌳',30,true),
  ('etoile','Étoile du jardin','✨',20,true)
on conflict do nothing;

create table public.user_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null references public.virtual_items(id),
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key(user_id,item_id)
);
alter table public.user_inventory enable row level security;
create policy inventory_owner_read on public.user_inventory for select to authenticated
  using (user_id = (select auth.uid()));
grant select on public.user_inventory to authenticated;
revoke insert, update, delete on public.user_inventory from anon, authenticated;

create or replace function private.award_chapter_light_points()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.light_point_events(user_id,event_key,amount)
  values (new.user_id,'chapter:' || new.book || ':' || new.chapter,2)
  on conflict(user_id,event_key) do nothing;
  return new;
end;
$$;
revoke all on function private.award_chapter_light_points() from public, anon, authenticated;
create trigger award_chapter_light_points after insert on public.user_chapter_progress
  for each row execute function private.award_chapter_light_points();

create or replace function public.redeem_virtual_item(p_item_id text, p_request_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
  v_price integer;
  v_balance integer;
  v_event_key text := 'redeem:' || p_request_id::text;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(v_user_id::text));
  if exists(select 1 from public.light_point_events where user_id=v_user_id and event_key=v_event_key) then return; end if;
  select price_points into v_price from public.virtual_items where id=p_item_id and active;
  if not found then raise exception 'Item unavailable'; end if;
  select coalesce(sum(amount),0)::integer into v_balance from public.light_point_events where user_id=v_user_id;
  if v_balance < v_price then raise exception 'Insufficient points'; end if;
  insert into public.light_point_events(user_id,event_key,amount) values(v_user_id,v_event_key,-v_price);
  insert into public.user_inventory(user_id,item_id,quantity) values(v_user_id,p_item_id,1)
  on conflict(user_id,item_id) do update set quantity=public.user_inventory.quantity+1,updated_at=now();
end;
$$;
revoke all on function public.redeem_virtual_item(text,uuid) from public, anon, authenticated;
grant execute on function public.redeem_virtual_item(text,uuid) to authenticated;
