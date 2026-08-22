-- ============================================================
-- WORKSTREAM B1 (c): atomic plan revisions
-- One transaction for label allocation, current-flag movement,
-- floor image pointer and preview attachment.
-- ============================================================
CREATE OR REPLACE FUNCTION public.portal_plan_revision_transaction(_action text, _payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
DECLARE
  v_action text := lower(coalesce(_action, ''));
  p jsonb := coalesce(_payload, '{}'::jsonb);
  v_floor uuid := nullif(p ->> 'floor_id', '')::uuid;
  v_rev uuid := nullif(p ->> 'revision_id', '')::uuid;
  v_project uuid;
  r public.portal_plan_revisions;
  v_source text := nullif(btrim(p ->> 'source_path'), '');
  v_preview text := nullif(btrim(p ->> 'image_path'), '');
  v_mime text := nullif(btrim(p ->> 'mime_type'), '');
  v_size bigint := (nullif(p ->> 'file_size', ''))::bigint;
  v_next integer;
  v_label text;
  v_id uuid;
  v_make_current boolean := coalesce((p ->> 'make_current')::boolean, true);
  ALLOWED_MIME text[] := ARRAY['application/pdf','image/png','image/jpeg','image/webp','image/svg+xml'];
  MAX_BYTES bigint := 52428800; -- 50 MB
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF v_action NOT IN ('create', 'attach_preview', 'make_current', 'archive') THEN
    RAISE EXCEPTION 'Unsupported plan revision action %', _action;
  END IF;

  IF v_rev IS NOT NULL THEN
    SELECT * INTO r FROM public.portal_plan_revisions WHERE id = v_rev FOR UPDATE;
    IF r.id IS NULL THEN RAISE EXCEPTION 'Plan revision not found'; END IF;
    v_floor := r.floor_id;
    v_project := r.project_id;
  END IF;

  IF v_project IS NULL THEN
    SELECT f.project_id INTO v_project FROM public.portal_floors f WHERE f.id = v_floor;
    IF v_project IS NULL THEN RAISE EXCEPTION 'Floor not found'; END IF;
  END IF;

  IF NOT private.portal_can_edit_project(v_project) THEN
    RAISE EXCEPTION 'You do not have permission to manage plans on this project';
  END IF;

  -- Lock the floor so the current-revision pointer can only move once at a time.
  PERFORM 1 FROM public.portal_floors WHERE id = v_floor FOR UPDATE;

  IF v_action = 'create' THEN
    IF v_source IS NULL AND v_preview IS NULL THEN
      RAISE EXCEPTION 'A revision needs at least a source document or an interactive preview';
    END IF;
    IF v_source IS NOT NULL AND v_source NOT LIKE 'projects/%' THEN
      RAISE EXCEPTION 'Plan files must be stored under the project prefix';
    END IF;
    IF v_preview IS NOT NULL AND v_preview NOT LIKE 'projects/%' THEN
      RAISE EXCEPTION 'Plan files must be stored under the project prefix';
    END IF;
    IF v_mime IS NOT NULL AND NOT (v_mime = ANY (ALLOWED_MIME)) THEN
      RAISE EXCEPTION 'Plan files must be PDF, PNG, JPEG, WEBP or SVG';
    END IF;
    IF v_size IS NOT NULL AND v_size > MAX_BYTES THEN
      RAISE EXCEPTION 'Plan files may not exceed 50 MB';
    END IF;

    SELECT coalesce(max(coalesce(nullif(regexp_replace(revision_label, '\D', '', 'g'), ''), '0')::integer), 0) + 1
      INTO v_next
      FROM public.portal_plan_revisions WHERE floor_id = v_floor;
    v_label := coalesce(nullif(btrim(p ->> 'revision_label'), ''), 'R' || lpad(v_next::text, 2, '0'));

    IF v_make_current THEN
      UPDATE public.portal_plan_revisions SET is_current = false
       WHERE floor_id = v_floor AND is_current;
    END IF;

    INSERT INTO public.portal_plan_revisions (
      project_id, floor_id, revision_label, page_number, page_count, rotation_deg,
      source_path, image_path, original_filename, mime_type, file_size, checksum,
      review_status, client_visible, is_current, notes, uploaded_by
    ) VALUES (
      v_project, v_floor, v_label,
      coalesce((p ->> 'page_number')::integer, 1),
      coalesce((p ->> 'page_count')::integer, 1),
      coalesce((p ->> 'rotation_deg')::integer, 0),
      v_source, v_preview,
      nullif(btrim(p ->> 'original_filename'), ''), v_mime, v_size,
      nullif(btrim(p ->> 'checksum'), ''),
      coalesce(nullif(btrim(p ->> 'review_status'), ''),
               CASE WHEN private.portal_is_admin() THEN 'approved' ELSE 'pending_review' END),
      coalesce((p ->> 'client_visible')::boolean, true),
      v_make_current,
      nullif(btrim(p ->> 'notes'), ''), auth.uid()
    ) RETURNING id INTO v_id;

    IF v_make_current AND v_preview IS NOT NULL THEN
      UPDATE public.portal_floors SET plan_image_path = v_preview WHERE id = v_floor;
    END IF;

    RETURN jsonb_build_object('action', v_action, 'revision_id', v_id, 'revision_label', v_label,
                              'floor_id', v_floor, 'is_current', v_make_current);

  ELSIF v_action = 'attach_preview' THEN
    IF v_preview IS NULL THEN RAISE EXCEPTION 'An interactive preview path is required'; END IF;
    IF v_preview NOT LIKE 'projects/%' THEN
      RAISE EXCEPTION 'Plan files must be stored under the project prefix';
    END IF;
    IF r.image_path IS NOT NULL AND r.image_path <> v_preview THEN
      RAISE EXCEPTION 'Revision % already has an interactive preview. Create a new revision instead of replacing an existing file.', r.revision_label;
    END IF;

    UPDATE public.portal_plan_revisions
       SET image_path = v_preview,
           rotation_deg = coalesce((p ->> 'rotation_deg')::integer, rotation_deg)
     WHERE id = r.id;

    IF r.is_current THEN
      UPDATE public.portal_floors SET plan_image_path = v_preview WHERE id = v_floor;
    END IF;

    RETURN jsonb_build_object('action', v_action, 'revision_id', r.id, 'floor_id', v_floor);

  ELSIF v_action = 'make_current' THEN
    IF r.archived_at IS NOT NULL THEN
      RAISE EXCEPTION 'Revision % is archived — restore it before making it current', r.revision_label;
    END IF;
    IF r.image_path IS NULL THEN
      RAISE EXCEPTION 'Revision % has no interactive preview yet, so it cannot become the plan the design sits on', r.revision_label;
    END IF;

    UPDATE public.portal_plan_revisions SET is_current = false
     WHERE floor_id = v_floor AND is_current AND id <> r.id;
    UPDATE public.portal_plan_revisions SET is_current = true WHERE id = r.id;
    UPDATE public.portal_floors SET plan_image_path = r.image_path WHERE id = v_floor;

    RETURN jsonb_build_object('action', v_action, 'revision_id', r.id, 'floor_id', v_floor,
                              'revision_label', r.revision_label);

  ELSE
    IF r.is_current THEN
      RAISE EXCEPTION 'Revision % is current. Make another revision current before archiving this one.', r.revision_label;
    END IF;
    UPDATE public.portal_plan_revisions SET archived_at = now() WHERE id = r.id;
    RETURN jsonb_build_object('action', v_action, 'revision_id', r.id, 'floor_id', v_floor);
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.portal_plan_revision_transaction(text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.portal_plan_revision_transaction(text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.portal_plan_revision_transaction(text, jsonb) TO authenticated;

-- Client calls to route generation must never traverse hidden floors or devices.
CREATE OR REPLACE FUNCTION public.portal_generate_missing_cable_routes(_project_id uuid, _floor_id uuid DEFAULT NULL::uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
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
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  v_is_admin := private.portal_is_admin();
  v_actor_type := CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END;

  IF NOT private.portal_can_edit_project(_project_id) THEN
    RAISE EXCEPTION 'Not authorised to generate cable routes for this project';
  END IF;

  IF _floor_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.portal_floors
     WHERE id = _floor_id AND project_id = _project_id
       AND (v_is_admin OR client_visible)
  ) THEN
    RAISE EXCEPTION 'Floor does not belong to this project';
  END IF;

  FOR f IN
    SELECT id, level_number, display_name
      FROM public.portal_floors
     WHERE project_id = _project_id
       AND (_floor_id IS NULL OR id = _floor_id)
       AND (v_is_admin OR client_visible)
     ORDER BY level_number
  LOOP
    SELECT m.id, m.x_norm, m.y_norm, m.label INTO rk
      FROM public.portal_floor_markers m
     WHERE m.floor_id = f.id
       AND m.marker_type = 'rack'::public.portal_marker_kind
       AND m.archived_at IS NULL
       AND (v_is_admin OR m.client_visible)
     ORDER BY m.sort_order, m.created_at
     LIMIT 1;

    CONTINUE WHEN rk.id IS NULL;

    FOR dev IN
      SELECT m.id, m.x_norm, m.y_norm, m.label, m.marker_type
        FROM public.portal_floor_markers m
       WHERE m.floor_id = f.id
         AND m.marker_type IN ('wifi_ap'::public.portal_marker_kind, 'camera'::public.portal_marker_kind)
         AND m.archived_at IS NULL
         AND (v_is_admin OR m.client_visible)
       ORDER BY m.marker_type, m.label
    LOOP
      CONTINUE WHEN EXISTS (
        SELECT 1 FROM public.portal_cable_routes r
         WHERE r.project_id = _project_id AND r.rack_marker_id = rk.id AND r.device_marker_id = dev.id
      );

      v_service := CASE WHEN dev.marker_type = 'camera'::public.portal_marker_kind THEN 'camera' ELSE 'wifi_ap' END;
      v_label := 'CBL-L' || lpad(f.level_number::text, 2, '0') || '-' || dev.label;

      CONTINUE WHEN EXISTS (
        SELECT 1 FROM public.portal_cable_routes r
         WHERE r.project_id = _project_id AND r.route_label = v_label
      );

      v_wps := jsonb_build_array(jsonb_build_object('x', round(dev.x_norm, 4), 'y', round(rk.y_norm, 4)));

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
$$;