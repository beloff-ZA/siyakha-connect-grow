REVOKE EXECUTE ON FUNCTION public.portal_history_feed(text, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.portal_client_sites() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.portal_log_client_event(uuid, text, text, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.portal_place_cameras(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.portal_history_feed(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_client_sites() TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_log_client_event(uuid, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_place_cameras(jsonb) TO authenticated;