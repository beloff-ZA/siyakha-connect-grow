-- ============================================================
-- Cable routing: rack -> device, same floor, editable waypoints
-- ============================================================

CREATE TABLE public.portal_cable_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  floor_id uuid NOT NULL REFERENCES public.portal_floors(id) ON DELETE CASCADE,
  rack_marker_id uuid NOT NULL REFERENCES public.portal_floor_markers(id) ON DELETE CASCADE,
  device_marker_id uuid NOT NULL REFERENCES public.portal_floor_markers(id) ON DELETE CASCADE,
  route_label text NOT NULL,
  cable_type text NOT NULL DEFAULT 'Cat6 UTP',
  service_type text NOT NULL CHECK (service_type IN ('wifi_ap','camera')),
  status public.portal_marker_state NOT NULL DEFAULT 'planned'::public.portal_marker_state,
  waypoints jsonb NOT NULL DEFAULT '[]'::jsonb,
  client_visible boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portal_cable_routes_unique_pair UNIQUE (project_id, rack_marker_id, device_marker_id),
  CONSTRAINT portal_cable_routes_label_unique UNIQUE (project_id, route_label),
  CONSTRAINT portal_cable_routes_endpoints_differ CHECK (rack_marker_id <> device_marker_id)
);

CREATE INDEX idx_portal_cable_routes_project ON public.portal_cable_routes(project_id);
CREATE INDEX idx_portal_cable_routes_floor ON public.portal_cable_routes(floor_id);
CREATE INDEX idx_portal_cable_routes_rack ON public.portal_cable_routes(rack_marker_id);
CREATE INDEX idx_portal_cable_routes_device ON public.portal_cable_routes(device_marker_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_cable_routes TO authenticated;
GRANT ALL ON public.portal_cable_routes TO service_role;

ALTER TABLE public.portal_cable_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal cable routes admin manage"
  ON public.portal_cable_routes FOR ALL TO authenticated
  USING (private.portal_is_admin())
  WITH CHECK (private.portal_is_admin());

CREATE POLICY "portal cable routes client read"
  ON public.portal_cable_routes FOR SELECT TO authenticated
  USING (client_visible AND private.portal_can_read_project(project_id));

-- Clients may only reshape planned routes on their own project. Protected fields are
-- enforced by the update RPC; this policy is the last line of defence.
CREATE POLICY "portal cable routes client edit planned"
  ON public.portal_cable_routes FOR UPDATE TO authenticated
  USING (
    client_visible
    AND status = 'planned'::public.portal_marker_state
    AND private.portal_can_read_project(project_id)
  )
  WITH CHECK (
    client_visible
    AND status = 'planned'::public.portal_marker_state
    AND private.portal_can_read_project(project_id)
  );

CREATE TRIGGER trg_portal_cable_routes_updated
  BEFORE UPDATE ON public.portal_cable_routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------- history ----------------

CREATE TABLE public.portal_cable_route_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid REFERENCES public.portal_cable_routes(id) ON DELETE SET NULL,
  project_id uuid,
  floor_id uuid,
  actor_user_id uuid,
  actor_type text NOT NULL,
  actor_role text,
  action text NOT NULL,
  detail text,
  prev_waypoints jsonb,
  new_waypoints jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_portal_cable_route_history_route ON public.portal_cable_route_history(route_id);
CREATE INDEX idx_portal_cable_route_history_project ON public.portal_cable_route_history(project_id);

GRANT SELECT, INSERT ON public.portal_cable_route_history TO authenticated;
GRANT ALL ON public.portal_cable_route_history TO service_role;

ALTER TABLE public.portal_cable_route_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal cable route history admin read"
  ON public.portal_cable_route_history FOR SELECT TO authenticated
  USING (private.portal_is_admin());

CREATE POLICY "portal cable route history client read"
  ON public.portal_cable_route_history FOR SELECT TO authenticated
  USING (project_id IS NOT NULL AND private.portal_can_read_project(project_id));

-- ---------------- generation RPC ----------------

CREATE OR REPLACE FUNCTION public.portal_generate_missing_cable_routes(
  _project_id uuid,
  _floor_id uuid DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $function$
DECLARE
  v_is_admin boolean;
  v_actor_type text;
  v_count integer := 0;
  f record;
  rk record;
  dev record;
  v_label text;
  v_service text;
  v_wps jsonb;
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_is_admin := private.portal_is_admin();
  v_actor_type := CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END;

  IF NOT (v_is_admin OR private.portal_can_read_project(_project_id)) THEN
    RAISE EXCEPTION 'Not authorised to generate cable routes for this project';
  END IF;

  IF _floor_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.portal_floors WHERE id = _floor_id AND project_id = _project_id
  ) THEN
    RAISE EXCEPTION 'Floor does not belong to this project';
  END IF;

  FOR f IN
    SELECT id, level_number, display_name
    FROM public.portal_floors
    WHERE project_id = _project_id
      AND (_floor_id IS NULL OR id = _floor_id)
    ORDER BY level_number
  LOOP
    -- One rack per floor; floors without a rack (e.g. rooftop) are skipped entirely.
    SELECT m.id, m.x_norm, m.y_norm, m.label
      INTO rk
    FROM public.portal_floor_markers m
    WHERE m.floor_id = f.id
      AND m.marker_type = 'rack'::public.portal_marker_kind
    ORDER BY m.sort_order, m.created_at
    LIMIT 1;

    CONTINUE WHEN rk.id IS NULL;

    FOR dev IN
      SELECT m.id, m.x_norm, m.y_norm, m.label, m.marker_type
      FROM public.portal_floor_markers m
      WHERE m.floor_id = f.id
        AND m.marker_type IN ('wifi_ap'::public.portal_marker_kind, 'camera'::public.portal_marker_kind)
      ORDER BY m.marker_type, m.label
    LOOP
      CONTINUE WHEN EXISTS (
        SELECT 1 FROM public.portal_cable_routes r
        WHERE r.project_id = _project_id
          AND r.rack_marker_id = rk.id
          AND r.device_marker_id = dev.id
      );

      v_service := CASE WHEN dev.marker_type = 'camera'::public.portal_marker_kind THEN 'camera' ELSE 'wifi_ap' END;
      v_label := 'CBL-L' || lpad(f.level_number::text, 2, '0') || '-' || dev.label;

      CONTINUE WHEN EXISTS (
        SELECT 1 FROM public.portal_cable_routes r
        WHERE r.project_id = _project_id AND r.route_label = v_label
      );

      -- Preliminary orthogonal path: horizontal from the rack, then vertical to the device.
      v_wps := jsonb_build_array(
        jsonb_build_object('x', round(dev.x_norm, 4), 'y', round(rk.y_norm, 4))
      );

      INSERT INTO public.portal_cable_routes (
        project_id, floor_id, rack_marker_id, device_marker_id, route_label,
        cable_type, service_type, status, waypoints, client_visible, notes, created_by
      ) VALUES (
        _project_id, f.id, rk.id, dev.id, v_label,
        'Cat6 UTP', v_service, 'planned'::public.portal_marker_state, v_wps, true,
        'Preliminary route — confirm containment, ceiling access and measured cable length during the site survey.',
        auth.uid()
      ) RETURNING id INTO v_id;

      INSERT INTO public.portal_cable_route_history (
        route_id, project_id, floor_id, actor_user_id, actor_type, actor_role,
        action, detail, new_waypoints
      ) VALUES (
        v_id, _project_id, f.id, auth.uid(), v_actor_type,
        CASE WHEN v_is_admin THEN 'siyakha_admin' ELSE 'client_user' END,
        'route_created',
        format('%s generated from %s to %s on %s (Cat6 UTP, preliminary orthogonal path).',
               v_label, rk.label, dev.label, f.display_name),
        v_wps
      );

      v_count := v_count + 1;
    END LOOP;
  END LOOP;

  RETURN v_count;
END;
$function$;

REVOKE ALL ON FUNCTION public.portal_generate_missing_cable_routes(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.portal_generate_missing_cable_routes(uuid, uuid) TO authenticated;

-- ---------------- waypoint update RPC ----------------

CREATE OR REPLACE FUNCTION public.portal_update_cable_route_waypoints(
  _route_id uuid,
  _waypoints jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $function$
DECLARE
  v_is_admin boolean;
  v_actor_type text;
  r public.portal_cable_routes;
  wp jsonb;
  nx numeric;
  ny numeric;
  v_clean jsonb := '[]'::jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_is_admin := private.portal_is_admin();
  v_actor_type := CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END;

  SELECT * INTO r FROM public.portal_cable_routes WHERE id = _route_id;
  IF r.id IS NULL THEN
    RAISE EXCEPTION 'Cable route not found';
  END IF;

  IF NOT (v_is_admin OR (r.client_visible AND private.portal_can_read_project(r.project_id))) THEN
    RAISE EXCEPTION 'Not authorised to edit this cable route';
  END IF;

  IF r.status <> 'planned'::public.portal_marker_state THEN
    RAISE EXCEPTION 'Route % is locked because its status is %', r.route_label, r.status;
  END IF;

  IF jsonb_typeof(coalesce(_waypoints, '[]'::jsonb)) <> 'array' THEN
    RAISE EXCEPTION 'Waypoints must be an array';
  END IF;

  IF jsonb_array_length(coalesce(_waypoints, '[]'::jsonb)) > 24 THEN
    RAISE EXCEPTION 'A route may not have more than 24 intermediate waypoints';
  END IF;

  FOR wp IN SELECT value FROM jsonb_array_elements(coalesce(_waypoints, '[]'::jsonb)) LOOP
    nx := round((wp ->> 'x')::numeric, 4);
    ny := round((wp ->> 'y')::numeric, 4);
    IF nx IS NULL OR ny IS NULL OR nx < 0 OR nx > 1 OR ny < 0 OR ny > 1 THEN
      RAISE EXCEPTION 'Waypoints must lie within the plan image';
    END IF;
    v_clean := v_clean || jsonb_build_array(jsonb_build_object('x', nx, 'y', ny));
  END LOOP;

  IF v_clean = r.waypoints THEN
    RETURN 0;
  END IF;

  -- Only waypoints move; endpoints, labels, status and visibility are protected.
  UPDATE public.portal_cable_routes SET waypoints = v_clean WHERE id = r.id;

  INSERT INTO public.portal_cable_route_history (
    route_id, project_id, floor_id, actor_user_id, actor_type, actor_role,
    action, detail, prev_waypoints, new_waypoints
  ) VALUES (
    r.id, r.project_id, r.floor_id, auth.uid(), v_actor_type,
    CASE WHEN v_is_admin THEN 'siyakha_admin' ELSE 'client_user' END,
    'waypoints_updated',
    format('%s reshaped from %s to %s intermediate waypoint(s).',
           r.route_label, jsonb_array_length(r.waypoints), jsonb_array_length(v_clean)),
    r.waypoints, v_clean
  );

  RETURN 1;
END;
$function$;

REVOKE ALL ON FUNCTION public.portal_update_cable_route_waypoints(uuid, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.portal_update_cable_route_waypoints(uuid, jsonb) TO authenticated;