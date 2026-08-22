CREATE OR REPLACE FUNCTION private.portal_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','private' AS $function$
  SELECT private.has_role(auth.uid(), 'super_admin'::public.app_role)
      OR private.has_role(auth.uid(), 'siyakha_admin'::public.app_role)
      OR private.has_role(auth.uid(), 'admin'::public.app_role)
$function$;

CREATE OR REPLACE FUNCTION private.portal_is_project_manager()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','private' AS $function$
  SELECT private.has_role(auth.uid(), 'project_manager'::public.app_role)
$function$;

CREATE OR REPLACE FUNCTION private.portal_can_edit_floor(_floor_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','private' AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.portal_floors f
    WHERE f.id = _floor_id AND private.portal_can_edit_project(f.project_id)
  )
$function$;

REVOKE ALL ON FUNCTION private.portal_is_project_manager() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.portal_can_edit_floor(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.portal_is_project_manager() TO authenticated;
GRANT EXECUTE ON FUNCTION private.portal_can_edit_floor(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.portal_can_edit_project(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.portal_can_read_site(uuid) TO authenticated;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portal_client_users_status_check') THEN
    ALTER TABLE public.portal_client_users
      ADD CONSTRAINT portal_client_users_status_check
      CHECK (status IN ('active','invited','suspended','revoked'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portal_client_users_role_check') THEN
    ALTER TABLE public.portal_client_users
      ADD CONSTRAINT portal_client_users_role_check
      CHECK (portal_role IN ('client_admin','client_editor','client_viewer'));
  END IF;
END $$;

DROP POLICY IF EXISTS "director projects admin manage" ON public.director_projects;
CREATE POLICY "director projects admin manage"
  ON public.director_projects AS PERMISSIVE FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.director_projects TO authenticated;
GRANT ALL ON public.director_projects TO service_role;

DO $$
DECLARE r record; d text;
BEGIN
  FOR r IN
    SELECT p.oid FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname IN (
      'portal_add_floor_cameras','portal_move_floor_markers','portal_update_camera_optics',
      'portal_update_cable_route_waypoints','portal_generate_missing_cable_routes'
    )
  LOOP
    d := pg_get_functiondef(r.oid);
    d := replace(d, 'private.portal_can_read_floor(', 'private.portal_can_edit_floor(');
    d := replace(d, 'private.portal_can_read_project(', 'private.portal_can_edit_project(');
    d := replace(d, 'NOT IN (60, 90, 110)', 'NOT BETWEEN 10 AND 360');
    d := replace(d, 'NOT IN (60,90,110)', 'NOT BETWEEN 10 AND 360');
    d := replace(d, 'must be 60, 90 or 110 degrees', 'must be between 10 and 360 degrees');
    EXECUTE d;
  END LOOP;
END $$;

DROP POLICY IF EXISTS "portal cable routes client edit planned" ON public.portal_cable_routes;
CREATE POLICY "portal cable routes client edit planned"
  ON public.portal_cable_routes FOR UPDATE TO authenticated
  USING (client_visible AND status = 'planned'::public.portal_marker_state AND private.portal_can_edit_project(project_id))
  WITH CHECK (client_visible AND status = 'planned'::public.portal_marker_state AND private.portal_can_edit_project(project_id));

DROP POLICY IF EXISTS "portal activity insert" ON public.portal_activity;
CREATE POLICY "portal activity admin insert"
  ON public.portal_activity FOR INSERT TO authenticated
  WITH CHECK (private.portal_is_admin() AND actor_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.portal_log_client_activity(
  _project_id uuid, _entity_type text, _entity_id uuid, _action text, _detail text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','private' AS $function$
DECLARE v_client uuid; v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT private.portal_can_read_project(_project_id) THEN
    RAISE EXCEPTION 'Not authorised for this project';
  END IF;
  SELECT p.client_id INTO v_client FROM public.portal_projects p WHERE p.id = _project_id;

  INSERT INTO public.portal_activity (client_id, project_id, entity_type, entity_id, action, detail, actor_type, actor_user_id)
  VALUES (
    v_client, _project_id,
    left(coalesce(_entity_type, 'project'), 60),
    _entity_id,
    left(coalesce(_action, 'client_note'), 60),
    left(coalesce(_detail, ''), 2000),
    CASE WHEN private.portal_is_admin() THEN 'admin' ELSE 'client' END,
    auth.uid()
  ) RETURNING id INTO v_id;
  RETURN v_id;
END;
$function$;
REVOKE ALL ON FUNCTION public.portal_log_client_activity(uuid, text, uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.portal_log_client_activity(uuid, text, uuid, text, text) TO authenticated;