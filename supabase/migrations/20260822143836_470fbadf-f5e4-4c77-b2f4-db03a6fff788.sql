-- A. Client portal access requires exactly 'active'
CREATE OR REPLACE FUNCTION private.portal_my_client_user_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $function$
  SELECT cu.id FROM public.portal_client_users cu
  WHERE cu.status = 'active'
    AND (cu.user_id = auth.uid()
         OR lower(cu.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
$function$;

-- B. Extensible generic device kinds
ALTER TYPE public.portal_marker_kind ADD VALUE IF NOT EXISTS 'fire_device';
ALTER TYPE public.portal_marker_kind ADD VALUE IF NOT EXISTS 'power_saving_device';
ALTER TYPE public.portal_marker_kind ADD VALUE IF NOT EXISTS 'automation_device';

-- C. Marker lifecycle: archive instead of destroy
ALTER TABLE public.portal_floor_markers
  ADD COLUMN IF NOT EXISTS archived_at timestamptz,
  ADD COLUMN IF NOT EXISTS archived_by uuid;

CREATE INDEX IF NOT EXISTS portal_floor_markers_active_product_idx
  ON public.portal_floor_markers (project_id, product_id)
  WHERE archived_at IS NULL AND product_id IS NOT NULL;

-- D. One nominated draft design BOQ per project
ALTER TABLE public.portal_projects
  ADD COLUMN IF NOT EXISTS design_boq_id uuid REFERENCES public.portal_boqs(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION private.portal_validate_design_boq()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public','private' AS $function$
BEGIN
  IF NEW.design_boq_id IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.design_boq_id IS DISTINCT FROM OLD.design_boq_id) THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.portal_boqs b
      WHERE b.id = NEW.design_boq_id AND b.project_id = NEW.id AND b.status = 'draft'
    ) THEN
      RAISE EXCEPTION 'The design bill must be a draft revision belonging to this project';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_portal_projects_design_boq ON public.portal_projects;
CREATE TRIGGER trg_portal_projects_design_boq
  BEFORE INSERT OR UPDATE OF design_boq_id ON public.portal_projects
  FOR EACH ROW EXECUTE FUNCTION private.portal_validate_design_boq();

-- E. One plan line per product per BOQ (enables set-based UPSERT)
CREATE UNIQUE INDEX IF NOT EXISTS portal_boq_items_plan_product_uniq
  ON public.portal_boq_items (boq_id, product_id)
  WHERE quantity_source = 'plan';

-- F. The single reconciliation core
CREATE OR REPLACE FUNCTION private.portal_reconcile_plan_boq(_boq_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','private' AS $function$
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

  -- Serialise concurrent reconciliations of the same bill.
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
    DO UPDATE SET quantity = EXCLUDED.quantity
      WHERE public.portal_boq_items.quantity IS DISTINCT FROM EXCLUDED.quantity
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

  WITH gone AS (
    DELETE FROM public.portal_boq_items i
     WHERE i.boq_id = _boq_id
       AND i.quantity_source = 'plan'
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
    format('Design reconciliation: %s line(s) added, %s updated, %s removed. Manual lines, rates, specifications and private costs untouched.',
           v_added, v_updated, v_removed));

  RETURN jsonb_build_object('reconciled', true, 'boq_id', _boq_id,
                            'added', v_added, 'updated', v_updated, 'removed', v_removed);
END;
$function$;

-- G. Public admin/repair entry point delegates to the same core
CREATE OR REPLACE FUNCTION public.portal_sync_boq_from_plan(_boq_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','private' AS $function$
DECLARE v_project uuid; v_res jsonb;
BEGIN
  SELECT project_id INTO v_project FROM public.portal_boqs WHERE id = _boq_id;
  IF v_project IS NULL THEN RAISE EXCEPTION 'BOQ not found'; END IF;
  IF NOT private.portal_is_admin() THEN
    RAISE EXCEPTION 'Only Siyakha administrators may reconcile a bill from the design';
  END IF;

  v_res := private.portal_reconcile_plan_boq(_boq_id);
  IF (v_res ->> 'reconciled') = 'false' AND (v_res ->> 'reason') = 'boq_not_draft' THEN
    RAISE EXCEPTION 'This bill is % — create a new draft revision before reconciling the design into it', v_res ->> 'status';
  END IF;
  RETURN v_res;
END;
$function$;

-- H. The transactional marker API: mutate + reconcile in one transaction
CREATE OR REPLACE FUNCTION public.portal_marker_transaction(_action text, _payload jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','private' AS $function$
DECLARE
  v_action text := lower(coalesce(_action, 'save'));
  v_payload jsonb := coalesce(_payload, '{}'::jsonb);
  v_marker_id uuid := nullif(v_payload ->> 'id', '')::uuid;
  m public.portal_floor_markers;
  v_project uuid;
  v_boq uuid;
  v_product uuid;
  prod public.portal_product_catalog;
  v_is_admin boolean;
  v_res jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  v_is_admin := private.portal_is_admin();

  IF v_action NOT IN ('save', 'archive', 'restore', 'delete') THEN
    RAISE EXCEPTION 'Unsupported action %', v_action;
  END IF;

  -- Resolve the project and lock the marker row when one is supplied.
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

  SELECT design_boq_id INTO v_boq FROM public.portal_projects WHERE id = v_project;

  IF v_action = 'save' THEN
    -- Catalogue linkage drives device type and discipline.
    IF v_payload ? 'product_id' THEN
      v_product := nullif(v_payload ->> 'product_id', '')::uuid;
    ELSE
      v_product := m.product_id;
    END IF;

    IF v_product IS NOT NULL THEN
      SELECT * INTO prod FROM public.portal_product_catalog
       WHERE id = v_product AND is_active AND archived_at IS NULL;
      IF prod.id IS NULL THEN
        RAISE EXCEPTION 'That catalogue product is archived or inactive and may not be linked to a device';
      END IF;
      v_payload := v_payload
        || jsonb_build_object('product_id', v_product, 'discipline', prod.discipline);
      IF prod.default_marker_type IS NOT NULL AND NOT (v_payload ? 'marker_type') THEN
        v_payload := v_payload || jsonb_build_object('marker_type', prod.default_marker_type::text);
      END IF;
      IF prod.default_fov_deg IS NOT NULL AND NOT (v_payload ? 'fov_deg') AND m.id IS NULL THEN
        v_payload := v_payload
          || jsonb_build_object('fov_deg', least(360, greatest(10, prod.default_fov_deg)));
      END IF;
    END IF;

    v_marker_id := public.portal_save_floor_marker(v_payload);
  ELSIF v_action = 'archive' THEN
    IF m.archived_at IS NULL THEN
      UPDATE public.portal_floor_markers
         SET archived_at = now(), archived_by = auth.uid()
       WHERE id = v_marker_id;
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
      UPDATE public.portal_floor_markers
         SET archived_at = NULL, archived_by = NULL
       WHERE id = v_marker_id;
      INSERT INTO public.portal_floor_marker_history (
        marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail
      ) VALUES (
        v_marker_id, m.floor_id, auth.uid(),
        CASE WHEN v_is_admin THEN 'admin' ELSE 'client' END,
        CASE WHEN v_is_admin THEN 'siyakha_admin' ELSE 'client_user' END,
        'device_restored',
        format('%s restored to the active design', m.label)
      );
    END IF;
  ELSE
    -- Hard delete stays available only for unreferenced planned devices.
    IF m.status <> 'planned'::public.portal_marker_state THEN
      RAISE EXCEPTION 'Device % is % — archive it instead of deleting it', m.label, m.status;
    END IF;
    IF EXISTS (SELECT 1 FROM public.portal_assets a WHERE a.marker_id = m.id) THEN
      RAISE EXCEPTION 'Device % has asset records — archive it instead of deleting it', m.label;
    END IF;
    PERFORM public.portal_delete_floor_marker(v_marker_id);
    v_marker_id := NULL;
  END IF;

  v_res := private.portal_reconcile_plan_boq(v_boq);

  RETURN jsonb_build_object('action', v_action, 'marker_id', v_marker_id,
                            'project_id', v_project, 'reconciliation', v_res);
END;
$function$;

REVOKE ALL ON FUNCTION public.portal_marker_transaction(text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.portal_marker_transaction(text, jsonb) TO authenticated;
REVOKE ALL ON FUNCTION private.portal_reconcile_plan_boq(uuid) FROM PUBLIC, anon, authenticated;

-- I. Only active products may be linked; camera FOV accepts a safe 10-360 range
DO $$
DECLARE d text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO d
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'portal_save_floor_marker';
  d := replace(d, 'IF nfov NOT IN (60, 90, 110) THEN', 'IF nfov NOT BETWEEN 10 AND 360 THEN');
  d := replace(d, 'Field of view must be 60, 90 or 110 degrees', 'Field of view must be between 10 and 360 degrees');
  d := replace(d,
    'NOT EXISTS (SELECT 1 FROM public.portal_product_catalog WHERE id = v_product)',
    'NOT EXISTS (SELECT 1 FROM public.portal_product_catalog WHERE id = v_product AND is_active AND archived_at IS NULL)');
  d := replace(d, 'RAISE EXCEPTION ''Catalogue product not found'';',
    'RAISE EXCEPTION ''That catalogue product is archived or inactive and may not be linked to a device'';');
  EXECUTE d;
END $$;