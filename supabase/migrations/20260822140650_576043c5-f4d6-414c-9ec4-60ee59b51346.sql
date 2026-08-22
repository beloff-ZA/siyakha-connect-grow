-- 1. Admin-managed product catalogue (supplier costs are admin-only by RLS).
CREATE TABLE IF NOT EXISTS public.portal_product_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  manufacturer text,
  model text,
  sku text,
  discipline text NOT NULL,
  category text,
  description text,
  specification text,
  unit text NOT NULL DEFAULT 'each',
  customer_unit_rate numeric(14,2) NOT NULL DEFAULT 0 CHECK (customer_unit_rate >= 0),
  vat_applicable boolean NOT NULL DEFAULT true,
  supplier_name text,
  supplier_unit_cost numeric(14,2) CHECK (supplier_unit_cost IS NULL OR supplier_unit_cost >= 0),
  default_markup_pct numeric(6,2) CHECK (default_markup_pct IS NULL OR default_markup_pct >= 0),
  image_path text,
  datasheet_path text,
  default_marker_type public.portal_marker_kind,
  default_fov_deg integer,
  default_coverage_range text,
  default_coverage_radius_m numeric(8,2),
  is_active boolean NOT NULL DEFAULT true,
  archived_at timestamptz,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portal_product_catalog_discipline_chk CHECK (discipline IN
    ('connectivity_wifi','cctv_security','fibre_cabling','fire_detection','power_energy','automation_iot','general'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_product_catalog TO authenticated;
GRANT ALL ON public.portal_product_catalog TO service_role;

ALTER TABLE public.portal_product_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portal product catalog admin manage" ON public.portal_product_catalog;
CREATE POLICY "portal product catalog admin manage"
  ON public.portal_product_catalog FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());

CREATE UNIQUE INDEX IF NOT EXISTS portal_product_catalog_sku_key
  ON public.portal_product_catalog (lower(sku)) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS portal_product_catalog_discipline_idx
  ON public.portal_product_catalog (discipline, is_active);

DROP TRIGGER IF EXISTS trg_portal_product_catalog_updated ON public.portal_product_catalog;
CREATE TRIGGER trg_portal_product_catalog_updated
  BEFORE UPDATE ON public.portal_product_catalog
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Link plan device instances to catalogue products (existing markers untouched).
ALTER TABLE public.portal_floor_markers
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.portal_product_catalog(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS discipline text;

CREATE INDEX IF NOT EXISTS portal_floor_markers_product_idx
  ON public.portal_floor_markers (project_id, product_id);

-- 3. BOQ lines can be plan-derived or manual.
ALTER TABLE public.portal_boq_items
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.portal_product_catalog(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS quantity_source text NOT NULL DEFAULT 'manual';

ALTER TABLE public.portal_boq_items
  DROP CONSTRAINT IF EXISTS portal_boq_items_quantity_source_chk;
ALTER TABLE public.portal_boq_items
  ADD CONSTRAINT portal_boq_items_quantity_source_chk CHECK (quantity_source IN ('manual','plan'));

CREATE UNIQUE INDEX IF NOT EXISTS portal_boq_items_plan_product_key
  ON public.portal_boq_items (boq_id, product_id) WHERE quantity_source = 'plan';

-- 4. Idempotent plan → BOQ quantity sync. Never touches rates, costs, markup,
--    specifications, inclusion flags or manual lines.
CREATE OR REPLACE FUNCTION public.portal_sync_boq_from_plan(_boq_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private'
AS $$
DECLARE
  b public.portal_boqs;
  v_section uuid;
  v_sort integer;
  v_added integer := 0;
  v_updated integer := 0;
  v_removed integer := 0;
  r record;
BEGIN
  IF NOT private.portal_is_admin() THEN
    RAISE EXCEPTION 'Only Siyakha administrators may sync a BOQ from the design';
  END IF;

  SELECT * INTO b FROM public.portal_boqs WHERE id = _boq_id;
  IF b.id IS NULL THEN
    RAISE EXCEPTION 'BOQ not found';
  END IF;
  IF b.status <> 'draft' THEN
    RAISE EXCEPTION 'BOQ % is % — create a new draft revision before syncing the design', b.revision_label, b.status;
  END IF;

  SELECT id INTO v_section FROM public.portal_boq_sections
   WHERE boq_id = _boq_id AND lower(title) = 'plan-derived equipment' LIMIT 1;

  IF v_section IS NULL THEN
    SELECT coalesce(max(sort_order), 0) + 1 INTO v_sort FROM public.portal_boq_sections WHERE boq_id = _boq_id;
    INSERT INTO public.portal_boq_sections (boq_id, title, sort_order)
    VALUES (_boq_id, 'Plan-derived equipment', coalesce(v_sort, 1))
    RETURNING id INTO v_section;
  END IF;

  FOR r IN
    SELECT m.product_id,
           count(*)::numeric AS qty,
           p.name, p.manufacturer, p.model, p.sku, p.unit, p.specification,
           p.customer_unit_rate, p.vat_applicable, p.discipline
      FROM public.portal_floor_markers m
      JOIN public.portal_product_catalog p ON p.id = m.product_id
     WHERE m.project_id = b.project_id
       AND m.product_id IS NOT NULL
     GROUP BY m.product_id, p.name, p.manufacturer, p.model, p.sku, p.unit,
              p.specification, p.customer_unit_rate, p.vat_applicable, p.discipline
  LOOP
    UPDATE public.portal_boq_items
       SET quantity = r.qty
     WHERE boq_id = _boq_id AND product_id = r.product_id AND quantity_source = 'plan';

    IF FOUND THEN
      v_updated := v_updated + 1;
    ELSE
      SELECT coalesce(max(sort_order), 0) + 1 INTO v_sort
        FROM public.portal_boq_items WHERE section_id = v_section;

      INSERT INTO public.portal_boq_items (
        boq_id, section_id, item_code, description, specification, quantity, unit,
        customer_unit_rate, vat_applicable, is_included, discipline, sort_order,
        product_id, quantity_source, reference
      ) VALUES (
        _boq_id, v_section, r.sku,
        trim(concat_ws(' ', r.manufacturer, r.model, '—', r.name)),
        r.specification, r.qty, coalesce(r.unit, 'each'),
        coalesce(r.customer_unit_rate, 0), coalesce(r.vat_applicable, true), true,
        r.discipline, coalesce(v_sort, 1), r.product_id, 'plan',
        'Quantity controlled by the plan design'
      );
      v_added := v_added + 1;
    END IF;
  END LOOP;

  DELETE FROM public.portal_boq_items i
   WHERE i.boq_id = _boq_id
     AND i.quantity_source = 'plan'
     AND NOT EXISTS (
       SELECT 1 FROM public.portal_floor_markers m
        WHERE m.project_id = b.project_id AND m.product_id = i.product_id
     );
  v_removed := coalesce((SELECT count(*) FROM (SELECT 1) t WHERE false), 0);
  GET DIAGNOSTICS v_removed = ROW_COUNT;

  INSERT INTO public.portal_boq_activity (boq_id, actor_user_id, actor_type, action, detail)
  VALUES (_boq_id, auth.uid(), 'admin', 'plan_sync',
    format('Design sync: %s line(s) added, %s updated, %s removed. Rates, costs, markup and manual lines untouched.',
           v_added, v_updated, v_removed));

  RETURN jsonb_build_object('added', v_added, 'updated', v_updated, 'removed', v_removed);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.portal_sync_boq_from_plan(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.portal_sync_boq_from_plan(uuid) TO authenticated;