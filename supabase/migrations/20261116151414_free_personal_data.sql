-- Personal reading data belongs to the account, regardless of subscription.
drop policy if exists notes_owner on public.user_notes;
drop policy if exists highlights_owner on public.user_highlights;
drop policy if exists favorites_owner on public.user_favorites;
drop policy if exists progress_owner on public.reading_progress;

create policy notes_owner on public.user_notes for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy highlights_owner on public.user_highlights for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy favorites_owner on public.user_favorites for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy progress_owner on public.reading_progress for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
