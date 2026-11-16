create table public.xp_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null,
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now(),
  unique (user_id, event_key)
);
alter table public.xp_events enable row level security;
create policy xp_events_owner_read on public.xp_events for select to authenticated
  using (user_id = (select auth.uid()));
grant select on public.xp_events to authenticated;
revoke insert, update, delete on public.xp_events from anon, authenticated;

create or replace function private.award_chapter_xp()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.xp_events (user_id, event_key, amount)
  values (new.user_id, 'chapter:' || new.book || ':' || new.chapter, 10)
  on conflict (user_id, event_key) do nothing;
  return new;
end;
$$;
revoke all on function private.award_chapter_xp() from public, anon, authenticated;
create trigger award_chapter_xp after insert on public.user_chapter_progress
  for each row execute function private.award_chapter_xp();
