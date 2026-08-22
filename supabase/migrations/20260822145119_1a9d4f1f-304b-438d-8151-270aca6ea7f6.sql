-- ============================================================
-- WORKSTREAM B1 (b): transactional design engine
-- ============================================================

-- Helper: does this project have a usable draft design bill?
CREATE OR REPLACE FUNCTION private.portal_design_boq(_project_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
  SELECT design_boq_id FROM public.portal_projects WHERE id = _project_id
$$;

-- Helper: unique instance label on a floor, derived from a base label.
CREATE OR REPLACE FUNCTION private.portal_unique_marker_label(_floor_id uuid, _base text)
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
DECLARE v_try text; i integer := 1;
BEGIN
  v_try := left(btrim(_base), 60);
  WHILE EXISTS (
    SELECT 1 FROM public.portal_floor_markers
     WHERE floor_id = _floor_id AND lower(label) = lower(v_try)
  ) LOOP
    i := i + 1;
    v_try := left(btrim(_base), 55) || '-' || i::text;
    IF i > 999 THEN RAISE EXCEPTION 'Could not derive a unique label from %', _base; END IF;
  END LOOP;
  RETURN v_try;
END;
$$;

-- ------------------------------------------------------------
-- Commercial gate: reconcile or abort.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.portal_settle_design(_project_id uuid, _quantity_bearing boolean, _allow_unbilled boolean)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
DECLARE v_boq uuid; v_res jsonb;
BEGIN
  v_boq := private.portal_design_boq(_project_id);

  IF NOT _quantity_bearing THEN
    -- Geometry, aim and naming changes are commercially inert. Reconcile
    -- opportunistically, never block on the bill state.
    IF v_boq IS NULL THEN
      RETURN jsonb_build_object('reconciled', false, 'reason', 'no_design_boq', 'commercial', false);
    END IF;
    v_res := private.portal_reconcile_plan_boq(v_boq);
    RETURN v_res || jsonb_build_object('commercial', false);
  END IF;

  IF v_boq IS NULL THEN
    IF coalesce(_allow_unbilled, false) THEN
      INSERT INTO public.portal_activity (project_id, client_id, entity_type, entity_id, action, detail, actor_type, actor_user_id)
      SELECT p.id, p.client_id, 'project', p.id, 'unbilled_design_change',
             'A quantity-bearing design change was saved as an unbilled design because no draft bill of quantities is nominated.',
             CASE WHEN private.portal_is_admin() THEN 'admin' ELSE 'client' END, auth.uid()
        FROM public.portal_projects p WHERE p.id = _project_id;
      RETURN jsonb_build_object('reconciled', false, 'reason', 'unbilled_confirmed', 'commercial', true);
    END IF;
    RAISE EXCEPTION 'This change alters billable quantities but no draft design bill of quantities is nominated for the project. Select a draft bill, or confirm saving it as an unbilled design.'
      USING ERRCODE = 'P0001';
  END IF;

  v_res := private.portal_reconcile_plan_boq(v_boq);
  IF (v_res ->> 'reconciled') <> 'true' THEN
    RAISE EXCEPTION 'The nominated design bill of quantities could not take this quantity change (%). The change was rolled back — nominate a draft bill and try again.',
      coalesce(v_res ->> 'status', v_res ->> 'reason') USING ERRCODE = 'P0001';
  END IF;
  RETURN v_res || jsonb_build_object('commercial', true);
END;
$$;

-- ------------------------------------------------------------
-- Marker transaction: mutate + settle, or abort completely.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_marker_transaction(_action text, _payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
DECLARE
  v_action text := lower(coalesce(_action, 'save'));
  v_payload jsonb := coalesce(_payload, '{}'::jsonb);
  v_marker_id uuid := nullif(v_payload ->> 'id', '')::uuid;
  v_allow_unbilled boolean := coalesce((v_payload ->> 'allow_unbilled')::boolean, false);
  m public.portal_floor_markers;
  v_project uuid;
  v_product uuid;
  prod public.portal_product_catalog;
  v_is_admin boolean;
  v_qty boolean := false;
  v_res jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  v_is_admin := private.portal_is_admin();

  IF v_action NOT IN ('save', 'archive', 'restore', 'delete') THEN
    RAISE EXCEPTION 'Unsupported action %', v_action;
  END IF;

  IF v_marker_id IS NOT NULL THEN
    SELECT * INTO m FROM public.portal_floor_markers WHERE id = v_marker_id FOR UPDATE;
    IF m.id IS NULL THEN RAISE EXCEPTION 'Device not found'; END IF;
    v_project := m.project_id;
  ELSE
    SELECT f.project_id INTO v_project FROM public.portal_floors f
     WHERE f.id = nullif(v_payload ->> 'floor_id', '')::uuid;
    IF v_project IS NULL THEN RAISE EXCEPTION 'Floor not found'; END IF;
  END IF;

  IF NOT private.portal_can_edit_project(v_project) THEN
    RAISE EXCEPTION 'You do not have permission to change devices on this project';
  END IF;

  IF v_action = 'save' THEN
    IF v_payload ? 'product_id' THEN
      v_product := nullif(v_payload ->> 'product_id', '')::uuid;
    ELSE
      v_product := m.product_id;
    END IF;

    IF v_product IS NOT NULL AND v_product IS DISTINCT FROM m.product_id THEN
      -- New linkage must point at a live catalogue product.
      SELECT * INTO prod FROM public.portal_product_catalog
       WHERE id = v_product AND is_active AND archived_at IS NULL;
      IF prod.id IS NULL THEN
        RAISE EXCEPTION 'That catalogue product is archived or inactive and may not be linked to a device';
      END IF;
      v_payload := v_payload || jsonb_build_object('product_id', v_product, 'discipline', prod.discipline);
      IF prod.default_marker_type IS NOT NULL AND NOT (v_payload ? 'marker_type') THEN
        v_payload := v_payload || jsonb_build_object('marker_type', prod.default_marker_type::text);
      END IF;
      IF prod.default_fov_deg IS NOT NULL AND NOT (v_payload ? 'fov_deg') AND m.id IS NULL THEN
        v_payload := v_payload || jsonb_build_object('fov_deg', least(360, greatest(10, prod.default_fov_deg)));
      END IF;
    END IF;

    -- Quantity-bearing when catalogue linkage appears, changes or is cleared.
    v_qty := (coalesce(v_product::text, '') IS DISTINCT FROM coalesce(m.product_id::text, ''));

    v_marker_id := public.portal_save_floor_marker(v_payload);

  ELSIF v_action = 'archive' THEN
    IF m.archived_at IS NULL THEN
      v_qty := m.product_id IS NOT NULL;
      UPDATE public.portal_floor_markers
         SET archived_at = now(), archived_by = auth.uid() WHERE id = v_marker_id;
      INSERT INTO public.portal_floor_marker_history (
        marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail
      ) VALUES (
        v_marker_id, m.floor_id, auth.uid(),
        CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END,
        CASE WHEN v_is_admin THEN 'siyakha_admin' ELSE 'client_user' END,
        'device_archived',
        format('%s archived — the record is retained and removed from billable plan quantities', m.label)
      );
    END IF;

  ELSIF v_action = 'restore' THEN
    IF m.archived_at IS NOT NULL THEN
      v_qty := m.product_id IS NOT NULL;
      UPDATE public.portal_floor_markers
         SET archived_at = NULL, archived_by = NULL WHERE id = v_marker_id;
      INSERT INTO public.portal_floor_marker_history (
        marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail
      ) VALUES (
        v_marker_id, m.floor_id, auth.uid(),
        CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END,
        CASE WHEN v_is_admin THEN 'siyakha_admin' ELSE 'client_user' END,
        'device_restored', format('%s restored to the active design', m.label)
      );
    END IF;

  ELSE
    IF m.status <> 'planned'::public.portal_marker_state THEN
      RAISE EXCEPTION 'Device % is % — archive it instead of deleting it', m.label, m.status;
    END IF;
    IF EXISTS (SELECT 1 FROM public.portal_assets a WHERE a.marker_id = m.id) THEN
      RAISE EXCEPTION 'Device % has asset records — archive it instead of deleting it', m.label;
    END IF;
    v_qty := m.product_id IS NOT NULL AND m.archived_at IS NULL;
    PERFORM public.portal_delete_floor_marker(v_marker_id);
    v_marker_id := NULL;
  END IF;

  v_res := private.portal_settle_design(v_project, v_qty, v_allow_unbilled);

  RETURN jsonb_build_object('action', v_action, 'marker_id', v_marker_id,
                            'project_id', v_project, 'quantity_bearing', v_qty,
                            'reconciliation', v_res);
END;
$$;

-- ------------------------------------------------------------
-- Duplicate: full metadata fidelity, one settlement.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_duplicate_marker(_marker_id uuid, _payload jsonb DEFAULT '{}'::jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
DECLARE
  m public.portal_floor_markers;
  v_payload jsonb := coalesce(_payload, '{}'::jsonb);
  v_allow_unbilled boolean := coalesce((v_payload ->> 'allow_unbilled')::boolean, false);
  v_label text;
  v_sort integer;
  v_id uuid;
  nx numeric; ny numeric;
  v_is_admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  v_is_admin := private.portal_is_admin();

  SELECT * INTO m FROM public.portal_floor_markers WHERE id = _marker_id FOR UPDATE;
  IF m.id IS NULL THEN RAISE EXCEPTION 'Device not found'; END IF;
  IF NOT private.portal_can_edit_project(m.project_id) THEN
    RAISE EXCEPTION 'You do not have permission to change devices on this project';
  END IF;
  IF NOT v_is_admin AND NOT m.client_visible THEN
    RAISE EXCEPTION 'Device not found';
  END IF;

  v_label := private.portal_unique_marker_label(m.floor_id,
    coalesce(nullif(btrim(v_payload ->> 'label'), ''), m.label || '-COPY'));

  IF m.is_placed THEN
    nx := least(1, greatest(0, round(coalesce((v_payload ->> 'x_norm')::numeric, m.x_norm + 0.02), 4)));
    ny := least(1, greatest(0, round(coalesce((v_payload ->> 'y_norm')::numeric, m.y_norm + 0.02), 4)));
  END IF;

  SELECT coalesce(max(sort_order), 0) + 1 INTO v_sort
    FROM public.portal_floor_markers WHERE floor_id = m.floor_id;

  INSERT INTO public.portal_floor_markers (
    floor_id, project_id, marker_type, label, area, equipment, model, status,
    client_visible, notes, description, is_placed, x_norm, y_norm,
    direction_deg, fov_deg, coverage_range, coverage_radius_m,
    nvr_id, nvr_channel, mounting_height_m, environment, lens_model,
    design_hold, sort_order, created_by, product_id, discipline
  ) VALUES (
    m.floor_id, m.project_id, m.marker_type, v_label, m.area, m.equipment, m.model,
    'planned'::public.portal_marker_state,
    m.client_visible, m.notes, m.description, m.is_placed, nx, ny,
    m.direction_deg, m.fov_deg, m.coverage_range, m.coverage_radius_m,
    m.nvr_id, NULL, m.mounting_height_m, m.environment, m.lens_model,
    m.design_hold, v_sort, auth.uid(), m.product_id, m.discipline
  ) RETURNING id INTO v_id;

  INSERT INTO public.portal_floor_marker_history (
    marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail, new_x_norm, new_y_norm
  ) VALUES (
    v_id, m.floor_id, auth.uid(),
    CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END,
    CASE WHEN v_is_admin THEN 'siyakha_admin' ELSE 'client_user' END,
    'device_created', format('%s duplicated from %s with the same product, discipline and optics', v_label, m.label),
    nx, ny
  );

  RETURN jsonb_build_object(
    'marker_id', v_id, 'label', v_label, 'project_id', m.project_id,
    'quantity_bearing', m.product_id IS NOT NULL,
    'reconciliation', private.portal_settle_design(m.project_id, m.product_id IS NOT NULL, v_allow_unbilled));
END;
$$;

-- ------------------------------------------------------------
-- Bulk create: all inserts plus a single settlement, atomically.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_bulk_create_markers(_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
DECLARE
  v_floor uuid := nullif(_payload ->> 'floor_id', '')::uuid;
  v_project uuid;
  v_product uuid := nullif(_payload ->> 'product_id', '')::uuid;
  v_allow_unbilled boolean := coalesce((_payload ->> 'allow_unbilled')::boolean, false);
  v_kind public.portal_marker_kind;
  v_status public.portal_marker_state := 'planned';
  v_prefix text := upper(coalesce(nullif(btrim(_payload ->> 'label_prefix'), ''), 'DEV'));
  v_count integer := coalesce((_payload ->> 'count')::integer, 0);
  v_client_visible boolean := coalesce((_payload ->> 'client_visible')::boolean, true);
  prod public.portal_product_catalog;
  v_discipline text;
  v_sort integer;
  v_label text;
  v_id uuid;
  v_ids uuid[] := '{}';
  i integer;
  v_is_admin boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  v_is_admin := private.portal_is_admin();

  IF v_count < 1 OR v_count > 200 THEN
    RAISE EXCEPTION 'Choose between 1 and 200 devices to create';
  END IF;

  SELECT f.project_id INTO v_project FROM public.portal_floors f WHERE f.id = v_floor;
  IF v_project IS NULL THEN RAISE EXCEPTION 'Floor not found'; END IF;
  IF NOT private.portal_can_edit_project(v_project) THEN
    RAISE EXCEPTION 'You do not have permission to change devices on this project';
  END IF;

  IF v_product IS NOT NULL THEN
    SELECT * INTO prod FROM public.portal_product_catalog
     WHERE id = v_product AND is_active AND archived_at IS NULL;
    IF prod.id IS NULL THEN
      RAISE EXCEPTION 'That catalogue product is archived or inactive and may not be linked to a device';
    END IF;
    v_discipline := prod.discipline;
    v_kind := coalesce(nullif(_payload ->> 'marker_type', '')::public.portal_marker_kind,
                       prod.default_marker_type, 'other'::public.portal_marker_kind);
  ELSE
    IF NOT v_allow_unbilled THEN
      RAISE EXCEPTION 'Bulk devices without a catalogue product carry no quantities. Confirm creating them as an unbilled design, or select a product.'
        USING ERRCODE = 'P0001';
    END IF;
    v_discipline := nullif(btrim(_payload ->> 'discipline'), '');
    v_kind := coalesce(nullif(_payload ->> 'marker_type', '')::public.portal_marker_kind, 'other'::public.portal_marker_kind);
  END IF;

  SELECT coalesce(max(sort_order), 0) INTO v_sort
    FROM public.portal_floor_markers WHERE floor_id = v_floor;

  FOR i IN 1..v_count LOOP
    v_sort := v_sort + 1;
    v_label := private.portal_unique_marker_label(v_floor, v_prefix || '-' || lpad(i::text, 2, '0'));

    INSERT INTO public.portal_floor_markers (
      floor_id, project_id, marker_type, label, status, client_visible,
      is_placed, direction_deg, fov_deg, coverage_range, coverage_radius_m,
      sort_order, created_by, product_id, discipline, equipment, model, notes
    ) VALUES (
      v_floor, v_project, v_kind, v_label, v_status, v_client_visible,
      false, 0,
      least(360, greatest(10, coalesce(prod.default_fov_deg, 90))),
      coalesce(prod.default_coverage_range, 'medium'),
      prod.default_coverage_radius_m,
      v_sort, auth.uid(), v_product, v_discipline,
      prod.manufacturer, prod.model,
      nullif(btrim(_payload ->> 'notes'), '')
    ) RETURNING id INTO v_id;

    v_ids := v_ids || v_id;

    INSERT INTO public.portal_floor_marker_history (
      marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail
    ) VALUES (
      v_id, v_floor, auth.uid(),
      CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END,
      CASE WHEN v_is_admin THEN 'siyakha_admin' ELSE 'client_user' END,
      'device_created',
      format('%s created in a bulk register batch (%s)', v_label,
             CASE WHEN v_product IS NULL THEN 'unbilled, no catalogue product' ELSE 'catalogue linked' END)
    );
  END LOOP;

  RETURN jsonb_build_object('created', array_length(v_ids, 1), 'marker_ids', to_jsonb(v_ids),
    'project_id', v_project, 'quantity_bearing', v_product IS NOT NULL,
    'reconciliation', private.portal_settle_design(v_project, v_product IS NOT NULL, v_allow_unbilled));
END;
$$;

-- ------------------------------------------------------------
-- Copy layout: validate, build, replace/merge, routes, settle —
-- all inside one transaction, or nothing at all.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_copy_floor_layout(_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
DECLARE
  v_source uuid := nullif(_payload ->> 'source_floor_id', '')::uuid;
  v_targets uuid[] := coalesce((SELECT array_agg((value #>> '{}')::uuid)
                                  FROM jsonb_array_elements(coalesce(_payload -> 'target_floor_ids', '[]'::jsonb))), '{}');
  v_mode text := lower(coalesce(nullif(_payload ->> 'mode', ''), 'merge'));
  v_routes boolean := coalesce((_payload ->> 'include_routes')::boolean, false);
  v_allow_unbilled boolean := coalesce((_payload ->> 'allow_unbilled')::boolean, false);
  v_project uuid;
  v_is_admin boolean;
  v_qty boolean := false;
  v_copied integer := 0;
  v_removed integer := 0;
  v_routes_made integer := 0;
  v_protected integer := 0;
  t uuid;
  src record;
  v_sort integer;
  v_label text;
  v_id uuid;
  v_target_level integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  v_is_admin := private.portal_is_admin();

  IF v_mode NOT IN ('merge', 'replace') THEN
    RAISE EXCEPTION 'Copy mode must be merge or replace';
  END IF;
  IF v_source IS NULL OR array_length(v_targets, 1) IS NULL THEN
    RAISE EXCEPTION 'Choose a source floor and at least one target floor';
  END IF;
  IF v_source = ANY (v_targets) THEN
    RAISE EXCEPTION 'The source floor cannot also be a target floor';
  END IF;

  SELECT f.project_id INTO v_project FROM public.portal_floors f WHERE f.id = v_source FOR UPDATE;
  IF v_project IS NULL THEN RAISE EXCEPTION 'Source floor not found'; END IF;
  IF NOT private.portal_can_edit_project(v_project) THEN
    RAISE EXCEPTION 'You do not have permission to change devices on this project';
  END IF;
  IF NOT v_is_admin AND NOT EXISTS (SELECT 1 FROM public.portal_floors WHERE id = v_source AND client_visible) THEN
    RAISE EXCEPTION 'Source floor not found';
  END IF;

  -- Lock every target and keep them inside the same project.
  FOREACH t IN ARRAY v_targets LOOP
    PERFORM 1 FROM public.portal_floors WHERE id = t AND project_id = v_project FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Every target floor must belong to the same project as the source floor';
    END IF;
    IF NOT v_is_admin AND NOT EXISTS (SELECT 1 FROM public.portal_floors WHERE id = t AND client_visible) THEN
      RAISE EXCEPTION 'Target floor not found';
    END IF;
  END LOOP;

  FOREACH t IN ARRAY v_targets LOOP
    SELECT level_number INTO v_target_level FROM public.portal_floors WHERE id = t;

    IF v_mode = 'replace' THEN
      -- Commissioned or asset-bearing devices are never replaced.
      SELECT count(*) INTO v_protected
        FROM public.portal_floor_markers m
       WHERE m.floor_id = t
         AND (m.status <> 'planned'::public.portal_marker_state
              OR EXISTS (SELECT 1 FROM public.portal_assets a WHERE a.marker_id = m.id));

      WITH doomed AS (
        SELECT m.id FROM public.portal_floor_markers m
         WHERE m.floor_id = t
           AND m.status = 'planned'::public.portal_marker_state
           AND NOT EXISTS (SELECT 1 FROM public.portal_assets a WHERE a.marker_id = m.id)
           AND (v_is_admin OR m.client_visible)
      ), r AS (
        DELETE FROM public.portal_cable_routes WHERE device_marker_id IN (SELECT id FROM doomed)
      ), d AS (
        DELETE FROM public.portal_floor_markers WHERE id IN (SELECT id FROM doomed) RETURNING id, product_id
      )
      SELECT count(*), bool_or(product_id IS NOT NULL) FROM d INTO v_removed, v_qty;
      v_qty := coalesce(v_qty, false);
    END IF;

    SELECT coalesce(max(sort_order), 0) INTO v_sort
      FROM public.portal_floor_markers WHERE floor_id = t;

    FOR src IN
      SELECT * FROM public.portal_floor_markers
       WHERE floor_id = v_source
         AND archived_at IS NULL
         AND (v_is_admin OR client_visible)
       ORDER BY sort_order, created_at
    LOOP
      v_sort := v_sort + 1;
      v_label := private.portal_unique_marker_label(
        t,
        CASE
          WHEN src.label ~ '-L\d+-' THEN regexp_replace(src.label, '-L\d+-', '-L' || lpad(v_target_level::text, 2, '0') || '-')
          ELSE src.label
        END);

      INSERT INTO public.portal_floor_markers (
        floor_id, project_id, marker_type, label, area, equipment, model, status,
        client_visible, notes, description, is_placed, x_norm, y_norm,
        direction_deg, fov_deg, coverage_range, coverage_radius_m,
        mounting_height_m, environment, lens_model, design_hold,
        sort_order, created_by, product_id, discipline
      ) VALUES (
        t, v_project, src.marker_type, v_label, src.area, src.equipment, src.model,
        'planned'::public.portal_marker_state,
        src.client_visible, src.notes, src.description, src.is_placed, src.x_norm, src.y_norm,
        src.direction_deg, src.fov_deg, src.coverage_range, src.coverage_radius_m,
        src.mounting_height_m, src.environment, src.lens_model, src.design_hold,
        v_sort, auth.uid(), src.product_id, src.discipline
      ) RETURNING id INTO v_id;

      IF src.product_id IS NOT NULL THEN v_qty := true; END IF;
      v_copied := v_copied + 1;

      INSERT INTO public.portal_floor_marker_history (
        marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail, new_x_norm, new_y_norm
      ) VALUES (
        v_id, t, auth.uid(),
        CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END,
        CASE WHEN v_is_admin THEN 'siyakha_admin' ELSE 'client_user' END,
        'device_created',
        format('%s copied from %s (%s mode), product, discipline and optics preserved', v_label, src.label, v_mode),
        src.x_norm, src.y_norm
      );
    END LOOP;

    IF v_routes THEN
      v_routes_made := v_routes_made + public.portal_generate_missing_cable_routes(v_project, t);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'copied', v_copied, 'removed', v_removed, 'routes_created', v_routes_made,
    'protected', v_protected, 'mode', v_mode, 'project_id', v_project,
    'quantity_bearing', v_qty,
    'reconciliation', private.portal_settle_design(v_project, v_qty, v_allow_unbilled));
END;
$$;

-- ------------------------------------------------------------
-- Client-safe catalogue projection. No supplier, cost, markup,
-- client rate or internal notes ever leave the server.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_client_catalogue(_project_id uuid)
RETURNS TABLE (
  id uuid,
  sku text,
  name text,
  manufacturer text,
  model text,
  specification text,
  default_marker_type public.portal_marker_kind,
  discipline text,
  default_fov_deg integer,
  default_coverage_range text,
  default_coverage_radius_m numeric,
  unit text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT private.portal_can_edit_project(_project_id) THEN
    RAISE EXCEPTION 'Not authorised to design on this project';
  END IF;

  RETURN QUERY
  SELECT p.id, p.sku, p.name, p.manufacturer, p.model, p.specification,
         p.default_marker_type, p.discipline, p.default_fov_deg,
         p.default_coverage_range, p.default_coverage_radius_m, p.unit
    FROM public.portal_product_catalog p
   WHERE p.is_active AND p.archived_at IS NULL
   ORDER BY p.discipline NULLS LAST, p.name;
END;
$$;

REVOKE ALL ON FUNCTION public.portal_client_catalogue(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.portal_client_catalogue(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.portal_client_catalogue(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.portal_duplicate_marker(uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.portal_duplicate_marker(uuid, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.portal_duplicate_marker(uuid, jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.portal_bulk_create_markers(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.portal_bulk_create_markers(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.portal_bulk_create_markers(jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.portal_copy_floor_layout(jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.portal_copy_floor_layout(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.portal_copy_floor_layout(jsonb) TO authenticated;