ALTER TABLE public.portal_cable_routes DROP CONSTRAINT IF EXISTS portal_cable_routes_service_type_check;
ALTER TABLE public.portal_cable_routes ADD CONSTRAINT portal_cable_routes_service_type_check
  CHECK (service_type IN ('wifi_ap','camera','data','access_control','fibre','backbone','other'));
ALTER TABLE public.portal_cable_routes DROP CONSTRAINT IF EXISTS portal_cable_routes_route_kind_check;
ALTER TABLE public.portal_cable_routes ADD CONSTRAINT portal_cable_routes_route_kind_check
  CHECK (route_kind IN ('copper','fibre','containment'));