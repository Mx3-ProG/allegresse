create or replace function private.handle_new_user_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  candidate text := lower(coalesce(new.raw_user_meta_data->>'username', ''));
  fallback text := 'u_' || left(replace(new.id::text, '-', ''), 20);
begin
  if candidate !~ '^[a-z0-9_]{3,24}$' then candidate := fallback; end if;
  begin
    insert into public.user_profiles(user_id, username)
    values (new.id, candidate) on conflict (user_id) do nothing;
  exception when unique_violation then
    insert into public.user_profiles(user_id, username)
    values (new.id, fallback) on conflict (user_id) do nothing;
  end;
  return new;
end;
$$;
revoke all on function private.handle_new_user_profile() from public, anon, authenticated;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users
  for each row execute function private.handle_new_user_profile();
drop function if exists public.handle_new_user_profile();
