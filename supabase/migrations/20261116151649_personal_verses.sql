-- Personal verse data uses the stable reference from the bundled Gospel corpus.
create table public.personal_verses (
  user_id uuid not null references auth.users(id) on delete cascade,
  reference text not null check (reference ~ '^(matthieu|marc|luc|jean)-[1-9][0-9]*-[1-9][0-9]*$'),
  favorite boolean not null default false,
  highlight text check (highlight in ('gold','blue','green','rose')),
  note text check (note is null or length(note) <= 20000),
  updated_at timestamptz not null default now(),
  primary key (user_id, reference)
);
alter table public.personal_verses enable row level security;
create policy personal_verses_select on public.personal_verses for select to authenticated
  using (user_id = (select auth.uid()));
create policy personal_verses_insert on public.personal_verses for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy personal_verses_update on public.personal_verses for update to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy personal_verses_delete on public.personal_verses for delete to authenticated
  using (user_id = (select auth.uid()));
grant select, insert, update, delete on public.personal_verses to authenticated;
