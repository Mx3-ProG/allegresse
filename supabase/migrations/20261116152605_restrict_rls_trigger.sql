-- The event trigger runs as its owner; API roles never need to invoke its function.
revoke all on function public.rls_auto_enable() from public, anon, authenticated;
