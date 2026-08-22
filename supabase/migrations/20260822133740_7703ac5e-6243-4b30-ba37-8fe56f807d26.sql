-- 1. Project lifecycle stage
ALTER TABLE public.portal_projects
  ADD COLUMN IF NOT EXISTS lifecycle_stage text,
  ADD COLUMN IF NOT EXISTS lifecycle_note text,
  ADD COLUMN IF NOT EXISTS design_concept text,
  ADD COLUMN IF NOT EXISTS project_approach text;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portal_projects_lifecycle_stage_chk') THEN
    ALTER TABLE public.portal_projects
      ADD CONSTRAINT portal_projects_lifecycle_stage_chk CHECK (
        lifecycle_stage IS NULL OR lifecycle_stage IN (
          'lead','quotation','client_review','approved','detailed_design','procurement',
          'implementation','testing_commissioning','handover','complete','on_hold'
        )
      );
  END IF;
END $$;

UPDATE public.portal_projects
SET lifecycle_stage = status
WHERE lifecycle_stage IS NULL
  AND status IN ('lead','quotation','client_review','approved','detailed_design','procurement',
    'implementation','testing_commissioning','handover','complete','on_hold');

-- 2. Stage / revision history
CREATE TABLE IF NOT EXISTS public.portal_project_stage_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  from_stage text,
  to_stage text NOT NULL,
  note text,
  changed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.portal_project_stage_history TO authenticated;
GRANT ALL ON public.portal_project_stage_history TO service_role;
ALTER TABLE public.portal_project_stage_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portal stage history admin all" ON public.portal_project_stage_history;
CREATE POLICY "portal stage history admin all" ON public.portal_project_stage_history
  FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
DROP POLICY IF EXISTS "portal stage history client read" ON public.portal_project_stage_history;
CREATE POLICY "portal stage history client read" ON public.portal_project_stage_history
  FOR SELECT TO authenticated USING (private.portal_can_read_project(project_id));

CREATE INDEX IF NOT EXISTS idx_portal_stage_hist_project
  ON public.portal_project_stage_history(project_id, created_at DESC);

-- 3. Planned device -> asset lifecycle
CREATE TABLE IF NOT EXISTS public.portal_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  marker_id uuid REFERENCES public.portal_floor_markers(id) ON DELETE CASCADE,
  floor_id uuid REFERENCES public.portal_floors(id) ON DELETE SET NULL,
  lifecycle_status text NOT NULL DEFAULT 'planned',
  asset_tag text,
  serial_number text,
  mac_address text,
  ip_address text,
  manufacturer text,
  model text,
  supplier text,
  purchase_date date,
  po_reference text,
  warranty_expiry date,
  area text,
  rack_label text,
  switch_label text,
  switch_port integer,
  patch_panel text,
  patch_panel_port integer,
  nvr_label text,
  nvr_channel integer,
  installer text,
  installed_on date,
  test_result text,
  tested_on date,
  commissioned_on date,
  evidence_path text,
  document_path text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portal_assets_status_chk CHECK (lifecycle_status IN (
    'planned','ordered','received','installed','tested','commissioned','replaced','removed')),
  CONSTRAINT portal_assets_marker_unique UNIQUE (marker_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_assets TO authenticated;
GRANT ALL ON public.portal_assets TO service_role;
ALTER TABLE public.portal_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portal assets admin all" ON public.portal_assets;
CREATE POLICY "portal assets admin all" ON public.portal_assets
  FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());

CREATE INDEX IF NOT EXISTS idx_portal_assets_project ON public.portal_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_assets_floor ON public.portal_assets(floor_id);
CREATE INDEX IF NOT EXISTS idx_portal_assets_status ON public.portal_assets(project_id, lifecycle_status);

DROP TRIGGER IF EXISTS trg_portal_assets_updated ON public.portal_assets;
CREATE TRIGGER trg_portal_assets_updated BEFORE UPDATE ON public.portal_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. QS structure + quantity tracking on BOQ lines
ALTER TABLE public.portal_boq_items
  ADD COLUMN IF NOT EXISTS discipline text,
  ADD COLUMN IF NOT EXISTS work_package text,
  ADD COLUMN IF NOT EXISTS floor_id uuid REFERENCES public.portal_floors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS line_kind text NOT NULL DEFAULT 'base',
  ADD COLUMN IF NOT EXISTS qty_procured numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qty_received numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qty_installed numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qty_tested numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qty_commissioned numeric NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'portal_boq_items_line_kind_chk') THEN
    ALTER TABLE public.portal_boq_items
      ADD CONSTRAINT portal_boq_items_line_kind_chk CHECK (line_kind IN (
        'base','alternative','provisional','contingency','exclusion','variation'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_portal_boq_items_kind ON public.portal_boq_items(boq_id, line_kind);

-- 5. Variation / change register
CREATE TABLE IF NOT EXISTS public.portal_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  boq_id uuid REFERENCES public.portal_boqs(id) ON DELETE SET NULL,
  reference text NOT NULL,
  title text NOT NULL,
  description text,
  discipline text,
  status text NOT NULL DEFAULT 'proposed',
  customer_amount numeric NOT NULL DEFAULT 0,
  raised_on date NOT NULL DEFAULT current_date,
  decided_on date,
  client_visible boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portal_variations_status_chk CHECK (status IN ('proposed','approved','rejected','withdrawn','instructed'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_variations TO authenticated;
GRANT ALL ON public.portal_variations TO service_role;
ALTER TABLE public.portal_variations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portal variations admin all" ON public.portal_variations;
CREATE POLICY "portal variations admin all" ON public.portal_variations
  FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
DROP POLICY IF EXISTS "portal variations client read" ON public.portal_variations;
CREATE POLICY "portal variations client read" ON public.portal_variations
  FOR SELECT TO authenticated USING (client_visible AND private.portal_can_read_project(project_id));

CREATE INDEX IF NOT EXISTS idx_portal_variations_project ON public.portal_variations(project_id, raised_on DESC);

DROP TRIGGER IF EXISTS trg_portal_variations_updated ON public.portal_variations;
CREATE TRIGGER trg_portal_variations_updated BEFORE UPDATE ON public.portal_variations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Immutable issued project packs
CREATE TABLE IF NOT EXISTS public.portal_project_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  pack_number text NOT NULL,
  revision_no integer NOT NULL DEFAULT 1,
  pack_kind text NOT NULL DEFAULT 'client',
  lifecycle_stage text,
  title text NOT NULL,
  snapshot jsonb NOT NULL,
  client_visible boolean NOT NULL DEFAULT false,
  issued_by uuid,
  issued_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portal_project_packs_kind_chk CHECK (pack_kind IN ('client','internal')),
  CONSTRAINT portal_project_packs_unique UNIQUE (project_id, pack_kind, revision_no)
);
GRANT SELECT, INSERT ON public.portal_project_packs TO authenticated;
GRANT ALL ON public.portal_project_packs TO service_role;
ALTER TABLE public.portal_project_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "portal packs admin read" ON public.portal_project_packs;
CREATE POLICY "portal packs admin read" ON public.portal_project_packs
  FOR SELECT TO authenticated USING (private.portal_is_admin());
DROP POLICY IF EXISTS "portal packs admin insert" ON public.portal_project_packs;
CREATE POLICY "portal packs admin insert" ON public.portal_project_packs
  FOR INSERT TO authenticated WITH CHECK (private.portal_is_admin());
DROP POLICY IF EXISTS "portal packs client read" ON public.portal_project_packs;
CREATE POLICY "portal packs client read" ON public.portal_project_packs
  FOR SELECT TO authenticated
  USING (pack_kind = 'client' AND client_visible AND private.portal_can_read_project(project_id));

CREATE INDEX IF NOT EXISTS idx_portal_packs_project ON public.portal_project_packs(project_id, issued_at DESC);

-- 7. Next pack revision helper
CREATE OR REPLACE FUNCTION public.portal_next_pack_revision(_project_id uuid, _pack_kind text)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(MAX(revision_no), 0) + 1
  FROM public.portal_project_packs
  WHERE project_id = _project_id AND pack_kind = _pack_kind
$$;