-- 1. Archive support for design dependencies -------------------------------
ALTER TABLE public.portal_cable_routes
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid;

ALTER TABLE public.portal_rack_equipment
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid;

DROP POLICY IF EXISTS "portal cable routes client read" ON public.portal_cable_routes;
CREATE POLICY "portal cable routes client read"
  ON public.portal_cable_routes FOR SELECT TO authenticated
  USING (client_visible AND archived_at IS NULL AND private.portal_can_read_project(project_id));

DROP POLICY IF EXISTS "portal rack equipment client read" ON public.portal_rack_equipment;
CREATE POLICY "portal rack equipment client read"
  ON public.portal_rack_equipment FOR SELECT TO authenticated
  USING (client_visible AND archived_at IS NULL AND private.portal_can_read_project(project_id));

-- 2. No direct client DML on design tables ---------------------------------
DROP POLICY IF EXISTS "editors insert floor markers" ON public.portal_floor_markers;
DROP POLICY IF EXISTS "editors update floor markers" ON public.portal_floor_markers;
DROP POLICY IF EXISTS "editors delete floor markers" ON public.portal_floor_markers;
DROP POLICY IF EXISTS "portal cable routes client edit planned" ON public.portal_cable_routes;

REVOKE INSERT, UPDATE, DELETE ON public.portal_floor_markers FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.portal_cable_routes FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.portal_rack_equipment FROM authenticated;

-- 3. Legacy mutators become internal helpers only --------------------------
REVOKE EXECUTE ON FUNCTION public.portal_save_floor_marker(jsonb) FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.portal_delete_floor_marker(uuid) FROM authenticated, anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.portal_add_floor_cameras(uuid, jsonb) FROM authenticated, anon, PUBLIC;

-- 4. Transactional marker API: authorisation + dependency safety -----------
CREATE OR REPLACE FUNCTION public.portal_marker_transaction(_action text, _payload jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
DECLARE
  v_action text := lower(coalesce(_action, 'save'));
  v_payload jsonb := coalesce(_payload, '{}'::jsonb);
  v_marker_id uuid := nullif(v_payload ->> 'id', '')::uuid;
  v_allow_unbilled boolean := coalesce((v_payload ->> 'allow_unbilled')::boolean, false);
  m public.portal_floor_markers;
  v_floor uuid;
  v_project uuid;
  v_product uuid;
  prod public.portal_product_catalog;
  v_is_admin boolean;
  v_actor_type text;
  v_actor_role text;
  v_qty boolean := false;
  v_res jsonb;
  v_dep integer := 0;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  v_is_admin := private.portal_is_admin();
  v_actor_type := CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END;
  v_actor_role := CASE WHEN v_is_admin THEN 'siyakha_admin' ELSE 'client_user' END;

  IF v_action NOT IN ('save', 'archive', 'restore', 'delete') THEN
    RAISE EXCEPTION 'Unsupported action %', v_action;
  END IF;

  IF v_marker_id IS NOT NULL THEN
    SELECT * INTO m FROM public.portal_floor_markers WHERE id = v_marker_id FOR UPDATE;
    IF m.id IS NULL THEN RAISE EXCEPTION 'Device not found'; END IF;
    v_project := m.project_id;
    v_floor := m.floor_id;
  ELSE
    v_floor := nullif(v_payload ->> 'floor_id', '')::uuid;
    SELECT f.project_id INTO v_project FROM public.portal_floors f WHERE f.id = v_floor;
    IF v_project IS NULL THEN RAISE EXCEPTION 'Floor not found'; END IF;
  END IF;

  IF NOT private.portal_can_edit_project(v_project) THEN
    RAISE EXCEPTION 'You do not have permission to change devices on this project';
  END IF;

  -- Client editors: only client-visible, active, planned objects. Hidden rows
  -- must be indistinguishable from rows that do not exist.
  IF NOT v_is_admin THEN
    IF v_action = 'delete' THEN
      RAISE EXCEPTION 'Devices may not be deleted. Archive the device instead.';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM public.portal_floors f
       WHERE f.id = v_floor AND f.project_id = v_project AND f.client_visible
    ) THEN
      RAISE EXCEPTION 'Floor not found';
    END IF;
    IF m.id IS NOT NULL THEN
      IF NOT m.client_visible THEN RAISE EXCEPTION 'Device not found'; END IF;
      IF m.status <> 'planned'::public.portal_marker_state THEN
        RAISE EXCEPTION 'Device % is locked because its status is %', m.label, m.status;
      END IF;
    END IF;
    -- Clients may never change visibility, status or archive state semantics.
    v_payload := v_payload - 'client_visible' - 'status' - 'design_hold';
  END IF;

  IF v_action = 'save' THEN
    IF v_payload ? 'product_id' THEN
      v_product := nullif(v_payload ->> 'product_id', '')::uuid;
    ELSE
      v_product := m.product_id;
    END IF;

    IF v_product IS NOT NULL THEN
      SELECT * INTO prod FROM public.portal_product_catalog WHERE id = v_product;
      IF prod.id IS NULL THEN
        RAISE EXCEPTION 'That catalogue product does not exist';
      END IF;
      IF v_product IS DISTINCT FROM m.product_id AND NOT (prod.is_active AND prod.archived_at IS NULL) THEN
        RAISE EXCEPTION 'That catalogue product is archived or inactive and may not be linked to a device';
      END IF;
      -- Product-derived classification is authoritative: a caller may not link a
      -- camera product while claiming another device type or discipline.
      v_payload := v_payload || jsonb_build_object('product_id', v_product, 'discipline', prod.discipline);
      IF prod.default_marker_type IS NOT NULL THEN
        v_payload := v_payload || jsonb_build_object('marker_type', prod.default_marker_type::text);
      END IF;
      IF prod.default_fov_deg IS NOT NULL AND NOT (v_payload ? 'fov_deg') AND m.id IS NULL THEN
        v_payload := v_payload || jsonb_build_object('fov_deg', least(360, greatest(10, prod.default_fov_deg)));
      END IF;
    END IF;

    v_qty := (coalesce(v_product::text, '') IS DISTINCT FROM coalesce(m.product_id::text, ''));

    v_marker_id := public.portal_save_floor_marker(v_payload);

  ELSIF v_action = 'archive' THEN
    IF m.archived_at IS NULL THEN
      v_qty := m.product_id IS NOT NULL;
      UPDATE public.portal_floor_markers
         SET archived_at = now(), archived_by = auth.uid() WHERE id = v_marker_id;

      -- Dependency-safe: cabling and rack equipment bound to this device are
      -- archived in the same transaction so no visible orphans remain.
      WITH r AS (
        UPDATE public.portal_cable_routes
           SET archived_at = now(), archived_by = auth.uid()
         WHERE (device_marker_id = v_marker_id OR rack_marker_id = v_marker_id)
           AND archived_at IS NULL
        RETURNING id, project_id, floor_id, route_label, waypoints
      ), h AS (
        INSERT INTO public.portal_cable_route_history (
          route_id, project_id, floor_id, actor_user_id, actor_type, actor_role,
          action, detail, prev_waypoints
        )
        SELECT r.id, r.project_id, r.floor_id, auth.uid(), v_actor_type, v_actor_role,
               'route_archived',
               format('%s archived with device %s and hidden from the client view.', r.route_label, m.label),
               r.waypoints
          FROM r
        RETURNING 1
      )
      SELECT count(*) INTO v_dep FROM h;

      UPDATE public.portal_rack_equipment
         SET archived_at = now(), archived_by = auth.uid()
       WHERE rack_marker_id = v_marker_id AND archived_at IS NULL;

      INSERT INTO public.portal_floor_marker_history (
        marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail
      ) VALUES (
        v_marker_id, m.floor_id, auth.uid(), v_actor_type, v_actor_role,
        'device_archived',
        format('%s archived — record retained, %s dependent route(s) archived and billable plan quantity released', m.label, v_dep)
      );
    END IF;

  ELSIF v_action = 'restore' THEN
    IF m.archived_at IS NOT NULL THEN
      v_qty := m.product_id IS NOT NULL;
      UPDATE public.portal_floor_markers
         SET archived_at = NULL, archived_by = NULL WHERE id = v_marker_id;

      WITH r AS (
        UPDATE public.portal_cable_routes
           SET archived_at = NULL, archived_by = NULL
         WHERE (device_marker_id = v_marker_id OR rack_marker_id = v_marker_id)
           AND archived_at IS NOT NULL
        RETURNING id, project_id, floor_id, route_label, waypoints
      ), h AS (
        INSERT INTO public.portal_cable_route_history (
          route_id, project_id, floor_id, actor_user_id, actor_type, actor_role,
          action, detail, new_waypoints
        )
        SELECT r.id, r.project_id, r.floor_id, auth.uid(), v_actor_type, v_actor_role,
               'route_restored',
               format('%s restored with device %s.', r.route_label, m.label), r.waypoints
          FROM r
        RETURNING 1
      )
      SELECT count(*) INTO v_dep FROM h;

      UPDATE public.portal_rack_equipment
         SET archived_at = NULL, archived_by = NULL
       WHERE rack_marker_id = v_marker_id AND archived_at IS NOT NULL;

      INSERT INTO public.portal_floor_marker_history (
        marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail
      ) VALUES (
        v_marker_id, m.floor_id, auth.uid(), v_actor_type, v_actor_role,
        'device_restored',
        format('%s restored to the active design with %s dependent route(s)', m.label, v_dep)
      );
    END IF;

  ELSE
    -- Hard delete: global administrators only, planned, unarchived, unreferenced.
    IF NOT private.portal_is_admin() THEN
      RAISE EXCEPTION 'Only Siyakha administrators may delete a device';
    END IF;
    IF m.status <> 'planned'::public.portal_marker_state THEN
      RAISE EXCEPTION 'Device % is % — archive it instead of deleting it', m.label, m.status;
    END IF;
    IF m.archived_at IS NOT NULL THEN
      RAISE EXCEPTION 'Device % is archived and is retained as design history', m.label;
    END IF;
    IF EXISTS (SELECT 1 FROM public.portal_assets a WHERE a.marker_id = m.id) THEN
      RAISE EXCEPTION 'Device % has asset records — archive it instead of deleting it', m.label;
    END IF;
    IF EXISTS (SELECT 1 FROM public.portal_rack_equipment e WHERE e.rack_marker_id = m.id) THEN
      RAISE EXCEPTION 'Device % has rack equipment records — archive it instead of deleting it', m.label;
    END IF;
    IF EXISTS (
      SELECT 1 FROM public.portal_cable_routes r
       WHERE (r.device_marker_id = m.id OR r.rack_marker_id = m.id)
         AND r.status <> 'planned'::public.portal_marker_state
    ) THEN
      RAISE EXCEPTION 'Device % has installed cabling — archive it instead of deleting it', m.label;
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
$function$;

-- 5. Never lose a negotiated rate or private cost --------------------------
CREATE OR REPLACE FUNCTION private.portal_reconcile_plan_boq(_boq_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'private'
AS $function$
DECLARE
  b public.portal_boqs;
  v_section uuid;
  v_sort integer;
  v_added integer := 0;
  v_updated integer := 0;
  v_removed integer := 0;
BEGIN
  IF _boq_id IS NULL THEN
    RETURN jsonb_build_object('reconciled', false, 'reason', 'no_design_boq');
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(_boq_id::text, 0));
  SELECT * INTO b FROM public.portal_boqs WHERE id = _boq_id FOR UPDATE;
  IF b.id IS NULL THEN
    RETURN jsonb_build_object('reconciled', false, 'reason', 'boq_missing');
  END IF;
  IF b.status <> 'draft' THEN
    RETURN jsonb_build_object('reconciled', false, 'reason', 'boq_not_draft', 'status', b.status);
  END IF;

  SELECT id INTO v_section FROM public.portal_boq_sections
   WHERE boq_id = _boq_id AND lower(title) = 'plan-derived equipment' LIMIT 1;
  IF v_section IS NULL THEN
    SELECT coalesce(max(sort_order), 0) + 1 INTO v_sort FROM public.portal_boq_sections WHERE boq_id = _boq_id;
    INSERT INTO public.portal_boq_sections (boq_id, title, description, sort_order)
    VALUES (_boq_id, 'Plan-derived equipment',
            'Quantities are controlled by the plan design and cannot be edited by hand.',
            coalesce(v_sort, 1))
    RETURNING id INTO v_section;
  END IF;

  SELECT coalesce(max(sort_order), 0) INTO v_sort FROM public.portal_boq_items WHERE section_id = v_section;

  WITH design AS (
    SELECT m.product_id, count(*)::numeric AS qty
      FROM public.portal_floor_markers m
     WHERE m.project_id = b.project_id
       AND m.product_id IS NOT NULL
       AND m.archived_at IS NULL
     GROUP BY m.product_id
  ),
  src AS (
    SELECT d.product_id, d.qty, p.name, p.manufacturer, p.model, p.sku, p.unit, p.specification,
           p.customer_unit_rate, p.vat_applicable, p.discipline, p.supplier_name,
           p.supplier_unit_cost, p.default_markup_pct,
           row_number() OVER (ORDER BY p.name) AS rn
      FROM design d
      JOIN public.portal_product_catalog p ON p.id = d.product_id
  ),
  up AS (
    INSERT INTO public.portal_boq_items (
      boq_id, section_id, item_code, description, specification, quantity, unit,
      customer_unit_rate, vat_applicable, is_included, discipline, line_kind, sort_order,
      product_id, quantity_source, reference
    )
    SELECT _boq_id, v_section, s.sku,
           trim(concat_ws(' ', s.manufacturer, s.model, '—', s.name)),
           s.specification, s.qty, coalesce(s.unit, 'each'),
           coalesce(s.customer_unit_rate, 0), coalesce(s.vat_applicable, true), true,
           s.discipline, 'base', v_sort + s.rn::integer, s.product_id, 'plan',
           'Quantity controlled by the plan design'
      FROM src s
    ON CONFLICT (boq_id, product_id) WHERE quantity_source = 'plan'
    DO UPDATE SET quantity = EXCLUDED.quantity,
                  is_included = true,
                  reference = 'Quantity controlled by the plan design'
      WHERE public.portal_boq_items.quantity IS DISTINCT FROM EXCLUDED.quantity
         OR public.portal_boq_items.is_included IS DISTINCT FROM true
    RETURNING id, product_id, (xmax = 0) AS was_insert
  ),
  seeded AS (
    INSERT INTO public.portal_boq_item_costs (item_id, supplier, supplier_unit_cost, markup_percent)
    SELECT up.id, s.supplier_name, coalesce(s.supplier_unit_cost, 0), coalesce(s.default_markup_pct, 0)
      FROM up JOIN src s ON s.product_id = up.product_id
     WHERE up.was_insert
       AND NOT EXISTS (SELECT 1 FROM public.portal_boq_item_costs c WHERE c.item_id = up.id)
    RETURNING 1
  )
  SELECT count(*) FILTER (WHERE was_insert), count(*) FILTER (WHERE NOT was_insert)
    INTO v_added, v_updated
    FROM up;

  -- A plan line whose devices are gone keeps its negotiated rate and private
  -- costing at quantity zero, so a later restore reuses the same record.
  WITH gone AS (
    UPDATE public.portal_boq_items i
       SET quantity = 0,
           is_included = false,
           reference = 'Removed from the plan design — rate and private costing retained'
     WHERE i.boq_id = _boq_id
       AND i.quantity_source = 'plan'
       AND (i.quantity <> 0 OR i.is_included)
       AND (
         i.product_id IS NULL
         OR NOT EXISTS (
           SELECT 1 FROM public.portal_floor_markers m
            WHERE m.project_id = b.project_id
              AND m.product_id = i.product_id
              AND m.archived_at IS NULL
         )
       )
    RETURNING 1
  )
  SELECT count(*) INTO v_removed FROM gone;

  INSERT INTO public.portal_boq_activity (boq_id, actor_user_id, actor_type, action, detail)
  VALUES (_boq_id, auth.uid(),
    CASE WHEN private.portal_is_admin() THEN 'admin' ELSE 'client' END,
    'plan_sync',
    format('Design reconciliation: %s line(s) added, %s updated, %s released to zero quantity. Manual lines, rates, specifications and private costs untouched.',
           v_added, v_updated, v_removed));

  RETURN jsonb_build_object('reconciled', true, 'boq_id', _boq_id,
                            'added', v_added, 'updated', v_updated, 'removed', v_removed);
END;
$function$;