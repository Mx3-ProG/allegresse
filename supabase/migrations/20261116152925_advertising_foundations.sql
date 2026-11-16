create table public.ad_placements (
  key text primary key,
  enabled boolean not null default false,
  max_per_page integer not null default 1 check (max_per_page between 0 and 3)
);
insert into public.ad_placements(key) values ('home'),('search'),('resources'),('store'),('chapter_end')
  on conflict do nothing;
alter table public.ad_placements enable row level security;
create policy ad_placements_read on public.ad_placements for select to anon, authenticated using (true);
grant select on public.ad_placements to anon, authenticated;
revoke insert, update, delete on public.ad_placements from anon, authenticated;

create table public.ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  placement_key text not null references public.ad_placements(key),
  sponsor_name text not null,
  headline text not null,
  description text not null,
  destination_url text not null check (destination_url ~ '^https://'),
  starts_at timestamptz not null,
  ends_at timestamptz not null check (ends_at > starts_at),
  active boolean not null default false,
  created_at timestamptz not null default now()
);
create index ad_campaigns_active on public.ad_campaigns (placement_key, starts_at, ends_at) where active;
alter table public.ad_campaigns enable row level security;
create policy ad_campaigns_read on public.ad_campaigns for select to anon, authenticated
  using (active and starts_at <= now() and ends_at > now());
grant select on public.ad_campaigns to anon, authenticated;
revoke insert, update, delete on public.ad_campaigns from anon, authenticated;
