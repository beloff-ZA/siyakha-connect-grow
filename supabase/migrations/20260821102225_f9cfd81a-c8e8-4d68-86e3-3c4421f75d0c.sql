ALTER TABLE public.portal_floor_markers
  ADD COLUMN IF NOT EXISTS direction_deg integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fov_deg integer NOT NULL DEFAULT 90,
  ADD COLUMN IF NOT EXISTS coverage_range text NOT NULL DEFAULT 'medium';

ALTER TABLE public.portal_floor_markers
  DROP CONSTRAINT IF EXISTS portal_floor_markers_direction_chk,
  DROP CONSTRAINT IF EXISTS portal_floor_markers_fov_chk,
  DROP CONSTRAINT IF EXISTS portal_floor_markers_range_chk;

ALTER TABLE public.portal_floor_markers
  ADD CONSTRAINT portal_floor_markers_direction_chk CHECK (direction_deg >= 0 AND direction_deg <= 359),
  ADD CONSTRAINT portal_floor_markers_fov_chk CHECK (fov_deg IN (60, 90, 110)),
  ADD CONSTRAINT portal_floor_markers_range_chk CHECK (coverage_range IN ('small','medium','large'));

-- Batch creation of planned CCTV cameras (server-generated labels, admin or assigned client)
CREATE OR REPLACE FUNCTION public.portal_add_floor_cameras(_floor_id uuid, _cameras jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_is_admin boolean;
  v_actor_type text;
  v_project uuid;
  v_level integer;
  v_next integer;
  v_count integer := 0;
  cam jsonb;
  nx numeric;
  ny numeric;
  ndir integer;
  nfov integer;
  nrange text;
  v_label text;
  v_sort integer;
  v_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_is_admin := private.portal_is_admin();
  v_actor_type := CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END;

  SELECT f.project_id, f.level_number INTO v_project, v_level
  FROM public.portal_floors f WHERE f.id = _floor_id;

  IF v_project IS NULL THEN
    RAISE EXCEPTION 'Floor not found';
  END IF;

  IF NOT (v_is_admin OR private.portal_can_read_floor(_floor_id)) THEN
    RAISE EXCEPTION 'Not authorised to add devices to this floor';
  END IF;

  SELECT coalesce(max(sort_order), 0) INTO v_sort
  FROM public.portal_floor_markers WHERE floor_id = _floor_id;

  FOR cam IN SELECT value FROM jsonb_array_elements(coalesce(_cameras, '[]'::jsonb)) LOOP
    nx := round((cam ->> 'x')::numeric, 4);
    ny := round((cam ->> 'y')::numeric, 4);
    IF nx IS NULL OR ny IS NULL OR nx < 0 OR nx > 1 OR ny < 0 OR ny > 1 THEN
      RAISE EXCEPTION 'Camera coordinates must be within the plan image';
    END IF;

    ndir := coalesce((cam ->> 'direction_deg')::integer, 0);
    IF ndir < 0 OR ndir > 359 THEN
      RAISE EXCEPTION 'Direction must be between 0 and 359 degrees';
    END IF;

    nfov := coalesce((cam ->> 'fov_deg')::integer, 90);
    IF nfov NOT IN (60, 90, 110) THEN
      RAISE EXCEPTION 'Field of view must be 60, 90 or 110 degrees';
    END IF;

    nrange := lower(coalesce(cam ->> 'coverage_range', 'medium'));
    IF nrange NOT IN ('small','medium','large') THEN
      RAISE EXCEPTION 'Range must be small, medium or large';
    END IF;

    -- server-side unique sequential label per floor, resilient to concurrent saves
    LOOP
      SELECT coalesce(max((regexp_replace(label, '^CAM-L\d+-', ''))::integer), 0) + 1
        INTO v_next
      FROM public.portal_floor_markers
      WHERE floor_id = _floor_id
        AND marker_type = 'camera'::public.portal_marker_kind
        AND label ~ ('^CAM-L' || lpad(v_level::text, 2, '0') || '-\d+$');

      v_label := 'CAM-L' || lpad(v_level::text, 2, '0') || '-' || lpad(v_next::text, 2, '0');

      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.portal_floor_markers
        WHERE floor_id = _floor_id AND label = v_label
      );
    END LOOP;

    v_sort := v_sort + 1;

    INSERT INTO public.portal_floor_markers (
      floor_id, project_id, marker_type, x_norm, y_norm, label,
      status, client_visible, direction_deg, fov_deg, coverage_range,
      sort_order, created_by
    ) VALUES (
      _floor_id, v_project, 'camera'::public.portal_marker_kind, nx, ny, v_label,
      'planned'::public.portal_marker_state, true, ndir, nfov, nrange,
      v_sort, auth.uid()
    ) RETURNING id INTO v_id;

    INSERT INTO public.portal_floor_marker_history (
      marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail,
      new_x_norm, new_y_norm
    ) VALUES (
      v_id, _floor_id, auth.uid(), v_actor_type,
      CASE WHEN v_is_admin THEN 'siyakha_admin' ELSE 'client_user' END,
      'camera_created',
      format('%s placed at (%s, %s) facing %s deg, %s deg FOV, %s range', v_label, nx, ny, ndir, nfov, nrange),
      nx, ny
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.portal_add_floor_cameras(uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.portal_add_floor_cameras(uuid, jsonb) TO authenticated;

-- Update aim/coverage of planned cameras only
CREATE OR REPLACE FUNCTION public.portal_update_camera_optics(_updates jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_is_admin boolean;
  v_actor_type text;
  v_count integer := 0;
  up jsonb;
  m public.portal_floor_markers;
  ndir integer;
  nfov integer;
  nrange text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_is_admin := private.portal_is_admin();
  v_actor_type := CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END;

  FOR up IN SELECT value FROM jsonb_array_elements(coalesce(_updates, '[]'::jsonb)) LOOP
    SELECT * INTO m FROM public.portal_floor_markers WHERE id = (up ->> 'id')::uuid;
    IF m.id IS NULL THEN
      CONTINUE;
    END IF;

    IF m.marker_type <> 'camera'::public.portal_marker_kind THEN
      RAISE EXCEPTION 'Only cameras have direction and field of view';
    END IF;

    IF NOT (v_is_admin OR (m.client_visible AND private.portal_can_read_floor(m.floor_id))) THEN
      RAISE EXCEPTION 'Not authorised to update this camera';
    END IF;

    IF m.status <> 'planned'::public.portal_marker_state THEN
      RAISE EXCEPTION 'Camera % is locked because its status is %', m.label, m.status;
    END IF;

    ndir := coalesce((up ->> 'direction_deg')::integer, m.direction_deg);
    nfov := coalesce((up ->> 'fov_deg')::integer, m.fov_deg);
    nrange := lower(coalesce(up ->> 'coverage_range', m.coverage_range));

    IF ndir < 0 OR ndir > 359 THEN
      RAISE EXCEPTION 'Direction must be between 0 and 359 degrees';
    END IF;
    IF nfov NOT IN (60, 90, 110) THEN
      RAISE EXCEPTION 'Field of view must be 60, 90 or 110 degrees';
    END IF;
    IF nrange NOT IN ('small','medium','large') THEN
      RAISE EXCEPTION 'Range must be small, medium or large';
    END IF;

    IF ndir = m.direction_deg AND nfov = m.fov_deg AND nrange = m.coverage_range THEN
      CONTINUE;
    END IF;

    UPDATE public.portal_floor_markers
      SET direction_deg = ndir, fov_deg = nfov, coverage_range = nrange
      WHERE id = m.id;

    INSERT INTO public.portal_floor_marker_history (
      marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail
    ) VALUES (
      m.id, m.floor_id, auth.uid(), v_actor_type,
      CASE WHEN v_is_admin THEN 'siyakha_admin' ELSE 'client_user' END,
      'camera_optics_updated',
      format('%s aim changed from %s deg/%s deg/%s to %s deg/%s deg/%s',
             m.label, m.direction_deg, m.fov_deg, m.coverage_range, ndir, nfov, nrange)
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

REVOKE ALL ON FUNCTION public.portal_update_camera_optics(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.portal_update_camera_optics(jsonb) TO authenticated;