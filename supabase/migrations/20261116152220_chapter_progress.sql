create table public.user_chapter_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  book text not null check (book in ('matthieu','marc','luc','jean')),
  chapter integer not null check (chapter between 1 and 28),
  completed_at timestamptz not null default now(),
  primary key (user_id, book, chapter)
);
alter table public.user_chapter_progress enable row level security;
create policy chapter_progress_select on public.user_chapter_progress for select to authenticated
  using (user_id = (select auth.uid()));
create policy chapter_progress_insert on public.user_chapter_progress for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy chapter_progress_delete on public.user_chapter_progress for delete to authenticated
  using (user_id = (select auth.uid()));
grant select, insert, delete on public.user_chapter_progress to authenticated;
