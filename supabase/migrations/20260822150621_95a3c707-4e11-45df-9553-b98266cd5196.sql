-- 1. Internal project-manager assignments ---------------------------------
CREATE TABLE IF NOT EXISTS public.portal_pm_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  can_view_commercial boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);

GRANT SELECT ON public.portal_pm_assignments TO authenticated;
GRANT ALL ON public.portal_pm_assignments TO service_role;
ALTER TABLE public.portal_pm_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "pm assignments admin manage" ON public.portal_pm_assignments;
CREATE POLICY "pm assignments admin manage" ON public.portal_pm_assignments
  FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());

DROP POLICY IF EXISTS "pm assignments read own" ON public.portal_pm_assignments;
CREATE POLICY "pm assignments read own" ON public.portal_pm_assignments
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION private.portal_pm_assigned(_project_id uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','private'
AS $$
  SELECT private.has_role(auth.uid(), 'project_manager'::public.app_role)
     AND EXISTS (
       SELECT 1 FROM public.portal_pm_assignments a
        WHERE a.project_id = _project_id AND a.user_id = auth.uid()
     )
$$;

CREATE OR REPLACE FUNCTION private.portal_can_view_commercial(_project_id uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','private'
AS $$
  SELECT private.portal_is_admin()
      OR (private.has_role(auth.uid(), 'project_manager'::public.app_role)
          AND EXISTS (
            SELECT 1 FROM public.portal_pm_assignments a
             WHERE a.project_id = _project_id AND a.user_id = auth.uid()
               AND a.can_view_commercial
          ))
$$;

CREATE OR REPLACE FUNCTION private.portal_can_read_project(_project_id uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','private'
AS $$
  SELECT private.portal_is_admin()
      OR private.portal_pm_assigned(_project_id)
      OR EXISTS (
        SELECT 1 FROM public.portal_project_assignments a
        WHERE a.project_id = _project_id
          AND a.client_user_id IN (SELECT private.portal_my_client_user_ids())
      )
$$;

CREATE OR REPLACE FUNCTION private.portal_can_edit_project(_project_id uuid)
 RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','private'
AS $$
  SELECT private.portal_is_admin()
      OR private.portal_pm_assigned(_project_id)
      OR EXISTS (
        SELECT 1
        FROM public.portal_project_assignments a
        JOIN public.portal_client_users cu ON cu.id = a.client_user_id
        WHERE a.project_id = _project_id
          AND cu.id IN (SELECT private.portal_my_client_user_ids())
          AND cu.portal_role IN ('client_admin', 'client_editor')
      )
$$;

-- 2. Private costing: administrators and commercially cleared PMs only -----
DROP POLICY IF EXISTS "pm read boq costs" ON public.portal_boq_item_costs;
CREATE POLICY "pm read boq costs" ON public.portal_boq_item_costs
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.portal_boq_items i
      JOIN public.portal_boqs b ON b.id = i.boq_id
     WHERE i.id = portal_boq_item_costs.item_id
       AND private.portal_can_view_commercial(b.project_id)
  ));

-- 3. Internal audit trails are not client-readable -------------------------
DROP POLICY IF EXISTS "clients read boq activity" ON public.portal_boq_activity;
DROP POLICY IF EXISTS "clients read own floor marker history" ON public.portal_floor_marker_history;
DROP POLICY IF EXISTS "portal cable route history client read" ON public.portal_cable_route_history;
DROP POLICY IF EXISTS "portal rack equipment history client read" ON public.portal_rack_equipment_history;

DROP POLICY IF EXISTS "portal activity client read" ON public.portal_activity;
CREATE POLICY "portal activity client read" ON public.portal_activity
  FOR SELECT TO authenticated
  USING (
    project_id IS NOT NULL
    AND private.portal_can_read_project(project_id)
    AND (private.portal_is_admin()
         OR (entity_type IN ('floor_marker', 'share_link', 'project', 'document', 'query')
             AND action NOT IN ('unbilled_design_change')))
  );

-- Allowlisted history feed for a single visible object.
CREATE OR REPLACE FUNCTION public.portal_history_feed(_scope text, _id uuid)
 RETURNS TABLE (id uuid, action text, detail text, created_at timestamptz, actor text)
 LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','private'
AS $$
DECLARE v_scope text := lower(coalesce(_scope, '')); v_project uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  IF v_scope = 'marker' THEN
    SELECT m.project_id INTO v_project FROM public.portal_floor_markers m
      JOIN public.portal_floors f ON f.id = m.floor_id
     WHERE m.id = _id
       AND (private.portal_is_admin() OR (m.client_visible AND f.client_visible AND m.archived_at IS NULL));
    IF v_project IS NULL OR NOT private.portal_can_read_project(v_project) THEN RETURN; END IF;
    RETURN QUERY
      SELECT h.id, h.action, h.detail, h.created_at,
             CASE WHEN h.actor_type = 'admin' THEN 'Siyakha' ELSE 'Client' END
        FROM public.portal_floor_marker_history h
       WHERE h.marker_id = _id ORDER BY h.created_at DESC LIMIT 100;

  ELSIF v_scope = 'route' THEN
    SELECT r.project_id INTO v_project FROM public.portal_cable_routes r
     WHERE r.id = _id
       AND (private.portal_is_admin() OR (r.client_visible AND r.archived_at IS NULL));
    IF v_project IS NULL OR NOT private.portal_can_read_project(v_project) THEN RETURN; END IF;
    RETURN QUERY
      SELECT h.id, h.action, h.detail, h.created_at,
             CASE WHEN h.actor_type = 'admin' THEN 'Siyakha' ELSE 'Client' END
        FROM public.portal_cable_route_history h
       WHERE h.route_id = _id ORDER BY h.created_at DESC LIMIT 100;

  ELSIF v_scope = 'rack_equipment' THEN
    SELECT e.project_id INTO v_project FROM public.portal_rack_equipment e
     WHERE e.id = _id
       AND (private.portal_is_admin() OR (e.client_visible AND e.archived_at IS NULL));
    IF v_project IS NULL OR NOT private.portal_can_read_project(v_project) THEN RETURN; END IF;
    RETURN QUERY
      SELECT h.id, h.action, h.detail, h.created_at,
             CASE WHEN h.actor_type = 'admin' THEN 'Siyakha' ELSE 'Client' END
        FROM public.portal_rack_equipment_history h
       WHERE h.equipment_id = _id ORDER BY h.created_at DESC LIMIT 100;
  ELSE
    RAISE EXCEPTION 'Unsupported history scope';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_history_feed(text, uuid) TO authenticated;

-- 4. Safe client site projection ------------------------------------------
DROP POLICY IF EXISTS "portal sites client read" ON public.portal_sites;

CREATE OR REPLACE FUNCTION public.portal_client_sites()
 RETURNS TABLE (
   id uuid, client_id uuid, name text, address text, city text, province text,
   postal_code text, venue_type text, status text, sort_order integer
 )
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','private'
AS $$
  SELECT s.id, s.client_id, s.name, s.address, s.city, s.province,
         s.postal_code, s.venue_type, s.status, s.sort_order
    FROM public.portal_sites s
   WHERE s.archived_at IS NULL
     AND private.portal_can_read_site(s.id)
   ORDER BY s.sort_order, s.name
$$;

GRANT EXECUTE ON FUNCTION public.portal_client_sites() TO authenticated;

-- 5. Typed client events replace the arbitrary activity writer -------------
CREATE OR REPLACE FUNCTION public.portal_log_client_event(_project_id uuid, _kind text, _detail text, _entity_id uuid DEFAULT NULL)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','private'
AS $$
DECLARE
  v_kind text := lower(coalesce(_kind, ''));
  v_client uuid; v_id uuid; v_entity text; v_action text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT private.portal_can_read_project(_project_id) THEN
    RAISE EXCEPTION 'Not authorised for this project';
  END IF;

  IF v_kind = 'comment' THEN v_entity := 'project'; v_action := 'client_comment';
  ELSIF v_kind = 'query' THEN v_entity := 'query'; v_action := 'client_query';
  ELSIF v_kind = 'placement_saved' THEN v_entity := 'floor_marker'; v_action := 'placement_saved';
  ELSE RAISE EXCEPTION 'Unsupported client event';
  END IF;

  IF v_kind = 'placement_saved' THEN
    IF _entity_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.portal_floor_markers m
       WHERE m.id = _entity_id AND m.project_id = _project_id
    ) THEN
      RAISE EXCEPTION 'That device does not belong to this project';
    END IF;
  ELSIF v_kind = 'query' AND _entity_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.portal_queries q WHERE q.id = _entity_id AND q.project_id = _project_id) THEN
      RAISE EXCEPTION 'That query does not belong to this project';
    END IF;
  END IF;

  SELECT p.client_id INTO v_client FROM public.portal_projects p WHERE p.id = _project_id;

  INSERT INTO public.portal_activity (client_id, project_id, entity_type, entity_id, action, detail, actor_type, actor_user_id)
  VALUES (v_client, _project_id, v_entity,
          CASE WHEN v_kind = 'comment' THEN _project_id ELSE _entity_id END,
          v_action, left(coalesce(_detail, ''), 2000),
          CASE WHEN private.portal_is_admin() THEN 'admin' ELSE 'client' END, auth.uid())
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_log_client_event(uuid, text, text, uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.portal_log_client_activity(uuid, text, uuid, text, text) FROM authenticated, anon, PUBLIC;

-- 6. Transactional camera placement ---------------------------------------
CREATE OR REPLACE FUNCTION public.portal_place_cameras(_payload jsonb)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','private'
AS $$
DECLARE
  v_floor uuid := nullif(_payload ->> 'floor_id', '')::uuid;
  v_cams jsonb := coalesce(_payload -> 'cameras', '[]'::jsonb);
  v_allow boolean := coalesce((_payload ->> 'allow_unbilled')::boolean, true);
  v_is_admin boolean;
  v_project uuid;
  v_count integer;
  v_res jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  v_is_admin := private.portal_is_admin();

  SELECT f.project_id INTO v_project FROM public.portal_floors f
   WHERE f.id = v_floor AND (v_is_admin OR f.client_visible);
  IF v_project IS NULL THEN RAISE EXCEPTION 'Floor not found'; END IF;
  IF NOT private.portal_can_edit_project(v_project) THEN
    RAISE EXCEPTION 'You do not have permission to place cameras on this project';
  END IF;
  IF jsonb_typeof(v_cams) <> 'array' OR jsonb_array_length(v_cams) = 0 THEN
    RAISE EXCEPTION 'At least one camera position is required';
  END IF;
  IF jsonb_array_length(v_cams) > 200 THEN
    RAISE EXCEPTION 'No more than 200 cameras may be placed at once';
  END IF;

  v_count := public.portal_add_floor_cameras(v_floor, v_cams);
  v_res := private.portal_settle_design(v_project, false, v_allow);

  RETURN jsonb_build_object('created', v_count, 'project_id', v_project, 'reconciliation', v_res);
END;
$$;

GRANT EXECUTE ON FUNCTION public.portal_place_cameras(jsonb) TO authenticated;