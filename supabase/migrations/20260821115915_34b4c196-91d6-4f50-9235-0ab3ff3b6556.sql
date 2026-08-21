REVOKE ALL ON FUNCTION public.portal_generate_missing_cable_routes(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.portal_update_cable_route_waypoints(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.portal_generate_missing_cable_routes(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_update_cable_route_waypoints(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.portal_generate_missing_cable_routes(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.portal_update_cable_route_waypoints(uuid, jsonb) TO service_role;