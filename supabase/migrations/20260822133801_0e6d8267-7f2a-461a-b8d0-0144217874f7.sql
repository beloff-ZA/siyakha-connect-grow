REVOKE ALL ON FUNCTION public.portal_next_pack_revision(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.portal_next_pack_revision(uuid, text) TO authenticated, service_role;