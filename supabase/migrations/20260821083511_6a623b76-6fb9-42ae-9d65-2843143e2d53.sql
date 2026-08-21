-- ============ TABLES ============
CREATE TABLE public.portal_boqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  revision_label text NOT NULL DEFAULT 'Draft v1',
  version_no integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','shared','approved','superseded')),
  currency text NOT NULL DEFAULT 'ZAR',
  vat_enabled boolean NOT NULL DEFAULT true,
  vat_rate numeric(6,4) NOT NULL DEFAULT 15.0000 CHECK (vat_rate >= 0 AND vat_rate <= 100),
  valid_until date,
  notes text,
  created_by uuid,
  published_at timestamptz,
  published_by uuid,
  approved_at timestamptz,
  approved_by uuid,
  superseded_by uuid REFERENCES public.portal_boqs(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX portal_boqs_project_idx ON public.portal_boqs (project_id, version_no DESC);

CREATE TABLE public.portal_boq_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boq_id uuid NOT NULL REFERENCES public.portal_boqs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX portal_boq_sections_boq_idx ON public.portal_boq_sections (boq_id, sort_order);

CREATE TABLE public.portal_boq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boq_id uuid NOT NULL REFERENCES public.portal_boqs(id) ON DELETE CASCADE,
  section_id uuid NOT NULL REFERENCES public.portal_boq_sections(id) ON DELETE CASCADE,
  item_code text,
  description text NOT NULL,
  specification text,
  quantity numeric(14,3) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit text NOT NULL DEFAULT 'each',
  customer_unit_rate numeric(14,2) NOT NULL DEFAULT 0 CHECK (customer_unit_rate >= 0),
  line_total numeric(16,2) GENERATED ALWAYS AS (round(quantity * customer_unit_rate, 2)) STORED,
  vat_applicable boolean NOT NULL DEFAULT true,
  is_included boolean NOT NULL DEFAULT true,
  notes text,
  reference text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX portal_boq_items_section_idx ON public.portal_boq_items (section_id, sort_order);
CREATE INDEX portal_boq_items_boq_idx ON public.portal_boq_items (boq_id);

-- ADMIN-ONLY internal costing
CREATE TABLE public.portal_boq_item_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL UNIQUE REFERENCES public.portal_boq_items(id) ON DELETE CASCADE,
  supplier text,
  supplier_unit_cost numeric(14,2) NOT NULL DEFAULT 0 CHECK (supplier_unit_cost >= 0),
  markup_percent numeric(8,4) NOT NULL DEFAULT 0 CHECK (markup_percent >= 0),
  internal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portal_boq_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boq_id uuid NOT NULL REFERENCES public.portal_boqs(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.portal_boq_items(id) ON DELETE CASCADE,
  author_user_id uuid,
  author_name text,
  author_type text NOT NULL DEFAULT 'client' CHECK (author_type IN ('client','admin')),
  body text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','answered','closed')),
  admin_response text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX portal_boq_comments_boq_idx ON public.portal_boq_comments (boq_id, created_at DESC);

CREATE TABLE public.portal_boq_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boq_id uuid NOT NULL REFERENCES public.portal_boqs(id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('accepted','changes_requested')),
  decided_by_user_id uuid,
  decided_by_name text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX portal_boq_decisions_boq_idx ON public.portal_boq_decisions (boq_id, created_at DESC);

CREATE TABLE public.portal_boq_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boq_id uuid NOT NULL REFERENCES public.portal_boqs(id) ON DELETE CASCADE,
  actor_user_id uuid,
  actor_type text NOT NULL DEFAULT 'admin',
  action text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX portal_boq_activity_boq_idx ON public.portal_boq_activity (boq_id, created_at DESC);

-- ============ TRIGGERS ============
CREATE TRIGGER trg_portal_boqs_updated BEFORE UPDATE ON public.portal_boqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_boq_sections_updated BEFORE UPDATE ON public.portal_boq_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_boq_items_updated BEFORE UPDATE ON public.portal_boq_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_boq_item_costs_updated BEFORE UPDATE ON public.portal_boq_item_costs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_boq_comments_updated BEFORE UPDATE ON public.portal_boq_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Lock approved BOQ content (revisions must be duplicated instead)
CREATE OR REPLACE FUNCTION private.portal_boq_guard_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _boq_id uuid;
  _status text;
BEGIN
  _boq_id := COALESCE(
    CASE WHEN TG_TABLE_NAME = 'portal_boq_items' THEN COALESCE(NEW.boq_id, OLD.boq_id) END,
    CASE WHEN TG_TABLE_NAME = 'portal_boq_sections' THEN COALESCE(NEW.boq_id, OLD.boq_id) END
  );
  SELECT status INTO _status FROM public.portal_boqs WHERE id = _boq_id;
  IF _status = 'approved' THEN
    RAISE EXCEPTION 'This BOQ is approved and immutable. Duplicate it as a new revision to make changes.';
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trg_boq_items_immutable
  BEFORE INSERT OR UPDATE OR DELETE ON public.portal_boq_items
  FOR EACH ROW EXECUTE FUNCTION private.portal_boq_guard_approved();
CREATE TRIGGER trg_boq_sections_immutable
  BEFORE INSERT OR UPDATE OR DELETE ON public.portal_boq_sections
  FOR EACH ROW EXECUTE FUNCTION private.portal_boq_guard_approved();

-- helper: can current session read this BOQ (client: shared/approved only)
CREATE OR REPLACE FUNCTION private.portal_can_read_boq(_boq_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.portal_boqs b
    WHERE b.id = _boq_id
      AND private.portal_can_read_project(b.project_id)
      AND (private.portal_is_admin() OR b.status IN ('shared','approved'))
  );
$$;

-- ============ GRANTS ============
GRANT EXECUTE ON FUNCTION private.portal_can_read_boq(uuid) TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_boqs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_boq_sections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_boq_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_boq_item_costs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_boq_comments TO authenticated;
GRANT SELECT, INSERT ON public.portal_boq_decisions TO authenticated;
GRANT SELECT, INSERT ON public.portal_boq_activity TO authenticated;
GRANT ALL ON public.portal_boqs, public.portal_boq_sections, public.portal_boq_items,
  public.portal_boq_item_costs, public.portal_boq_comments, public.portal_boq_decisions,
  public.portal_boq_activity TO service_role;

-- ============ RLS ============
ALTER TABLE public.portal_boqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_boq_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_boq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_boq_item_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_boq_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_boq_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_boq_activity ENABLE ROW LEVEL SECURITY;

-- admin full manage
CREATE POLICY "admins manage boqs" ON public.portal_boqs FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage boq sections" ON public.portal_boq_sections FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage boq items" ON public.portal_boq_items FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage boq costs" ON public.portal_boq_item_costs FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage boq comments" ON public.portal_boq_comments FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins read boq decisions" ON public.portal_boq_decisions FOR SELECT TO authenticated
  USING (private.portal_is_admin());
CREATE POLICY "admins insert boq decisions" ON public.portal_boq_decisions FOR INSERT TO authenticated
  WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins read boq activity" ON public.portal_boq_activity FOR SELECT TO authenticated
  USING (private.portal_is_admin());
CREATE POLICY "admins insert boq activity" ON public.portal_boq_activity FOR INSERT TO authenticated
  WITH CHECK (private.portal_is_admin());

-- client reads (shared/approved only)
CREATE POLICY "clients read shared boqs" ON public.portal_boqs FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id) AND status IN ('shared','approved'));
CREATE POLICY "clients read shared boq sections" ON public.portal_boq_sections FOR SELECT TO authenticated
  USING (private.portal_can_read_boq(boq_id));
CREATE POLICY "clients read shared boq items" ON public.portal_boq_items FOR SELECT TO authenticated
  USING (private.portal_can_read_boq(boq_id));
CREATE POLICY "clients read boq comments" ON public.portal_boq_comments FOR SELECT TO authenticated
  USING (private.portal_can_read_boq(boq_id));
CREATE POLICY "clients add boq comments" ON public.portal_boq_comments FOR INSERT TO authenticated
  WITH CHECK (
    private.portal_can_read_boq(boq_id)
    AND author_user_id = auth.uid()
    AND author_type = 'client'
  );
CREATE POLICY "clients read boq decisions" ON public.portal_boq_decisions FOR SELECT TO authenticated
  USING (private.portal_can_read_boq(boq_id));
CREATE POLICY "clients record boq decisions" ON public.portal_boq_decisions FOR INSERT TO authenticated
  WITH CHECK (private.portal_can_read_boq(boq_id) AND decided_by_user_id = auth.uid());
CREATE POLICY "clients read boq activity" ON public.portal_boq_activity FOR SELECT TO authenticated
  USING (private.portal_can_read_boq(boq_id));

-- ============ SEED (empty Draft v1) ============
INSERT INTO public.portal_boqs (id, project_id, title, revision_label, version_no, status, currency, vat_enabled, vat_rate, notes)
VALUES (
  'd1a11e00-0000-4000-8000-0000000000b1',
  'c1a11e00-0000-4000-8000-0000000000a1',
  '353 Anton Lembede Street – Project BOQ',
  'Draft v1', 1, 'draft', 'ZAR', true, 15.0000,
  'Structure prepared. Quantities and rates to be populated by Siyakha before sharing.'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.portal_boq_sections (boq_id, title, description, sort_order)
SELECT 'd1a11e00-0000-4000-8000-0000000000b1', t.title, NULL, t.ord
FROM (VALUES
  ('Preliminaries & General', 1),
  ('Containment & Cable Infrastructure', 2),
  ('Network Equipment', 3),
  ('Wireless Coverage', 4),
  ('Surveillance & Access Control', 5),
  ('Testing, Certification & Handover', 6)
) AS t(title, ord)
WHERE NOT EXISTS (
  SELECT 1 FROM public.portal_boq_sections WHERE boq_id = 'd1a11e00-0000-4000-8000-0000000000b1'
);