alter function public.redeem_virtual_item(text,uuid) set schema private;
revoke all on function private.redeem_virtual_item(text,uuid) from public, anon, authenticated;
grant execute on function private.redeem_virtual_item(text,uuid) to authenticated;

create function public.redeem_virtual_item(p_item_id text, p_request_id uuid)
returns void language sql security invoker set search_path = '' as $$
  select private.redeem_virtual_item(p_item_id, p_request_id)
$$;
revoke all on function public.redeem_virtual_item(text,uuid) from public, anon, authenticated;
grant execute on function public.redeem_virtual_item(text,uuid) to authenticated;
