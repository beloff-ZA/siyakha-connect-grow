-- 1. Helper: who may edit devices on a project
CREATE OR REPLACE FUNCTION private.portal_can_edit_project(_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
  SELECT private.portal_is_admin()
      OR EXISTS (
        SELECT 1
        FROM public.portal_project_assignments a
        JOIN public.portal_client_users cu ON cu.id = a.client_user_id
        WHERE a.project_id = _project_id
          AND cu.id IN (SELECT private.portal_my_client_user_ids())
          AND cu.portal_role IN ('client_admin', 'client_editor')
      )
$$;

CREATE OR REPLACE FUNCTION public.portal_can_manage_project(_project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
  SELECT private.portal_can_edit_project(_project_id)
$$;

REVOKE ALL ON FUNCTION public.portal_can_manage_project(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.portal_can_manage_project(uuid) TO authenticated, service_role;

-- 2. Tenant-safe write policies on device markers (read policies unchanged)
DROP POLICY IF EXISTS "editors insert floor markers" ON public.portal_floor_markers;
CREATE POLICY "editors insert floor markers"
ON public.portal_floor_markers FOR INSERT TO authenticated
WITH CHECK (
  private.portal_can_edit_project(project_id)
  AND EXISTS (
    SELECT 1 FROM public.portal_floors f
    WHERE f.id = floor_id AND f.project_id = portal_floor_markers.project_id
  )
);

DROP POLICY IF EXISTS "editors update floor markers" ON public.portal_floor_markers;
CREATE POLICY "editors update floor markers"
ON public.portal_floor_markers FOR UPDATE TO authenticated
USING (private.portal_can_edit_project(project_id))
WITH CHECK (private.portal_can_edit_project(project_id));

DROP POLICY IF EXISTS "editors delete floor markers" ON public.portal_floor_markers;
CREATE POLICY "editors delete floor markers"
ON public.portal_floor_markers FOR DELETE TO authenticated
USING (private.portal_can_edit_project(project_id));

-- 3. Audited upsert for a single device marker
CREATE OR REPLACE FUNCTION public.portal_save_floor_marker(_payload jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
DECLARE
  v_is_admin boolean;
  v_actor_type text;
  v_actor_role text;
  v_id uuid := nullif(_payload ->> 'id', '')::uuid;
  v_floor uuid := nullif(_payload ->> 'floor_id', '')::uuid;
  v_project uuid;
  v_existing public.portal_floor_markers;
  v_label text;
  v_kind public.portal_marker_kind;
  v_status public.portal_marker_state;
  v_placed boolean;
  nx numeric;
  ny numeric;
  ndir integer;
  nfov integer;
  nrange text;
  v_sort integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_is_admin := private.portal_is_admin();
  v_actor_type := CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END;
  v_actor_role := CASE WHEN v_is_admin THEN 'siyakha_admin' ELSE 'client_user' END;

  IF v_id IS NOT NULL THEN
    SELECT * INTO v_existing FROM public.portal_floor_markers WHERE id = v_id;
    IF v_existing.id IS NULL THEN
      RAISE EXCEPTION 'Device not found';
    END IF;
    v_floor := coalesce(v_floor, v_existing.floor_id);
    v_project := v_existing.project_id;
  END IF;

  IF v_floor IS NULL THEN
    RAISE EXCEPTION 'A floor is required';
  END IF;

  SELECT f.project_id INTO v_project FROM public.portal_floors f WHERE f.id = v_floor;
  IF v_project IS NULL THEN
    RAISE EXCEPTION 'Floor not found';
  END IF;
  IF v_existing.id IS NOT NULL AND v_existing.project_id <> v_project THEN
    RAISE EXCEPTION 'A device may not be moved to another project';
  END IF;

  IF NOT private.portal_can_edit_project(v_project) THEN
    RAISE EXCEPTION 'You do not have permission to manage devices on this project';
  END IF;

  v_label := btrim(coalesce(_payload ->> 'label', v_existing.label, ''));
  IF v_label = '' OR length(v_label) > 60 THEN
    RAISE EXCEPTION 'A device label of 1 to 60 characters is required';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.portal_floor_markers m
    WHERE m.floor_id = v_floor
      AND lower(m.label) = lower(v_label)
      AND (v_id IS NULL OR m.id <> v_id)
  ) THEN
    RAISE EXCEPTION 'Label % is already used on this floor', v_label;
  END IF;

  v_kind := coalesce(nullif(_payload ->> 'marker_type', ''), v_existing.marker_type::text, 'camera')::public.portal_marker_kind;
  v_status := coalesce(nullif(_payload ->> 'status', ''), v_existing.status::text, 'planned')::public.portal_marker_state;

  v_placed := coalesce((_payload ->> 'is_placed')::boolean, v_existing.is_placed, false);
  IF v_placed THEN
    nx := round(coalesce((_payload ->> 'x_norm')::numeric, v_existing.x_norm), 4);
    ny := round(coalesce((_payload ->> 'y_norm')::numeric, v_existing.y_norm), 4);
    IF nx IS NULL OR ny IS NULL OR nx < 0 OR nx > 1 OR ny < 0 OR ny > 1 THEN
      RAISE EXCEPTION 'Device coordinates must lie within the plan image';
    END IF;
  ELSE
    nx := NULL;
    ny := NULL;
  END IF;

  ndir := coalesce((_payload ->> 'direction_deg')::integer, v_existing.direction_deg, 0);
  IF ndir < 0 OR ndir > 359 THEN
    RAISE EXCEPTION 'Direction must be between 0 and 359 degrees';
  END IF;
  nfov := coalesce((_payload ->> 'fov_deg')::integer, v_existing.fov_deg, 90);
  IF nfov NOT IN (60, 90, 110) THEN
    RAISE EXCEPTION 'Field of view must be 60, 90 or 110 degrees';
  END IF;
  nrange := lower(coalesce(nullif(_payload ->> 'coverage_range', ''), v_existing.coverage_range, 'medium'));
  IF nrange NOT IN ('small', 'medium', 'large') THEN
    RAISE EXCEPTION 'Range must be small, medium or large';
  END IF;

  IF v_id IS NULL THEN
    SELECT coalesce(max(sort_order), 0) + 1 INTO v_sort
    FROM public.portal_floor_markers WHERE floor_id = v_floor;

    INSERT INTO public.portal_floor_markers (
      floor_id, project_id, marker_type, label, area, equipment, model, status,
      client_visible, notes, description, is_placed, x_norm, y_norm,
      direction_deg, fov_deg, coverage_range, coverage_radius_m,
      nvr_id, nvr_channel, mounting_height_m, environment, lens_model,
      design_hold, sort_order, created_by
    ) VALUES (
      v_floor, v_project, v_kind, v_label,
      nullif(btrim(coalesce(_payload ->> 'area', '')), ''),
      nullif(btrim(coalesce(_payload ->> 'equipment', '')), ''),
      nullif(btrim(coalesce(_payload ->> 'model', '')), ''),
      v_status,
      coalesce((_payload ->> 'client_visible')::boolean, true),
      nullif(btrim(coalesce(_payload ->> 'notes', '')), ''),
      nullif(btrim(coalesce(_payload ->> 'description', '')), ''),
      v_placed, nx, ny, ndir, nfov, nrange,
      (nullif(_payload ->> 'coverage_radius_m', ''))::numeric,
      (nullif(_payload ->> 'nvr_id', ''))::uuid,
      (nullif(_payload ->> 'nvr_channel', ''))::integer,
      (nullif(_payload ->> 'mounting_height_m', ''))::numeric,
      nullif(btrim(coalesce(_payload ->> 'environment', '')), ''),
      nullif(btrim(coalesce(_payload ->> 'lens_model', '')), ''),
      nullif(btrim(coalesce(_payload ->> 'design_hold', '')), ''),
      v_sort, auth.uid()
    ) RETURNING id INTO v_id;

    INSERT INTO public.portal_floor_marker_history (
      marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail,
      new_x_norm, new_y_norm
    ) VALUES (
      v_id, v_floor, auth.uid(), v_actor_type, v_actor_role,
      CASE WHEN v_kind = 'camera' THEN 'camera_created' ELSE 'device_created' END,
      format('%s created (%s)', v_label, CASE WHEN v_placed THEN 'placed on plan' ELSE 'unplaced register record' END),
      nx, ny
    );

    RETURN v_id;
  END IF;

  UPDATE public.portal_floor_markers SET
    label = v_label,
    marker_type = v_kind,
    status = v_status,
    area = coalesce(nullif(btrim(coalesce(_payload ->> 'area', '')), ''), CASE WHEN _payload ? 'area' THEN NULL ELSE area END),
    equipment = coalesce(nullif(btrim(coalesce(_payload ->> 'equipment', '')), ''), CASE WHEN _payload ? 'equipment' THEN NULL ELSE equipment END),
    model = coalesce(nullif(btrim(coalesce(_payload ->> 'model', '')), ''), CASE WHEN _payload ? 'model' THEN NULL ELSE model END),
    notes = coalesce(nullif(btrim(coalesce(_payload ->> 'notes', '')), ''), CASE WHEN _payload ? 'notes' THEN NULL ELSE notes END),
    environment = coalesce(nullif(btrim(coalesce(_payload ->> 'environment', '')), ''), CASE WHEN _payload ? 'environment' THEN NULL ELSE environment END),
    lens_model = coalesce(nullif(btrim(coalesce(_payload ->> 'lens_model', '')), ''), CASE WHEN _payload ? 'lens_model' THEN NULL ELSE lens_model END),
    nvr_id = CASE WHEN _payload ? 'nvr_id' THEN (nullif(_payload ->> 'nvr_id', ''))::uuid ELSE nvr_id END,
    nvr_channel = CASE WHEN _payload ? 'nvr_channel' THEN (nullif(_payload ->> 'nvr_channel', ''))::integer ELSE nvr_channel END,
    mounting_height_m = CASE WHEN _payload ? 'mounting_height_m' THEN (nullif(_payload ->> 'mounting_height_m', ''))::numeric ELSE mounting_height_m END,
    coverage_radius_m = CASE WHEN _payload ? 'coverage_radius_m' THEN (nullif(_payload ->> 'coverage_radius_m', ''))::numeric ELSE coverage_radius_m END,
    is_placed = v_placed,
    x_norm = nx,
    y_norm = ny,
    direction_deg = ndir,
    fov_deg = nfov,
    coverage_range = nrange
  WHERE id = v_id;

  INSERT INTO public.portal_floor_marker_history (
    marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail,
    prev_x_norm, prev_y_norm, new_x_norm, new_y_norm
  ) VALUES (
    v_id, v_floor, auth.uid(), v_actor_type, v_actor_role,
    CASE
      WHEN v_existing.is_placed AND NOT v_placed THEN 'device_unplaced'
      WHEN NOT v_existing.is_placed AND v_placed THEN 'device_placed'
      WHEN v_placed AND (v_existing.x_norm IS DISTINCT FROM nx OR v_existing.y_norm IS DISTINCT FROM ny) THEN 'position_moved'
      ELSE 'device_updated'
    END,
    format('%s updated (status %s, %s)', v_label, v_status,
           CASE WHEN v_placed THEN format('placed at (%s, %s) facing %s deg', nx, ny, ndir) ELSE 'unplaced' END),
    v_existing.x_norm, v_existing.y_norm, nx, ny
  );

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.portal_save_floor_marker(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.portal_save_floor_marker(jsonb) TO authenticated, service_role;

-- 4. Audited delete
CREATE OR REPLACE FUNCTION public.portal_delete_floor_marker(_marker_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
DECLARE
  m public.portal_floor_markers;
  v_is_admin boolean;
  v_client uuid;
  v_site uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO m FROM public.portal_floor_markers WHERE id = _marker_id;
  IF m.id IS NULL THEN
    RETURN false;
  END IF;

  IF NOT private.portal_can_edit_project(m.project_id) THEN
    RAISE EXCEPTION 'You do not have permission to delete devices on this project';
  END IF;

  v_is_admin := private.portal_is_admin();

  SELECT p.client_id, p.site_id INTO v_client, v_site
  FROM public.portal_projects p WHERE p.id = m.project_id;

  DELETE FROM public.portal_cable_routes WHERE device_marker_id = _marker_id;
  DELETE FROM public.portal_floor_markers WHERE id = _marker_id;

  INSERT INTO public.portal_activity (
    client_id, site_id, project_id, entity_type, entity_id, action, detail,
    actor_user_id, actor_type
  ) VALUES (
    v_client, v_site, m.project_id, 'floor_marker', _marker_id, 'device_deleted',
    format('%s (%s) deleted from the plan register', m.label, m.marker_type),
    auth.uid(), CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END
  );

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.portal_delete_floor_marker(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.portal_delete_floor_marker(uuid) TO authenticated, service_role;