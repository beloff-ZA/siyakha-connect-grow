-- 1. Commercial deal fields on the existing director_projects pipeline
ALTER TABLE public.director_projects
  ADD COLUMN IF NOT EXISTS contact_name text,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS contact_phone text,
  ADD COLUMN IF NOT EXISTS site_name text,
  ADD COLUMN IF NOT EXISTS deal_source text,
  ADD COLUMN IF NOT EXISTS probability_percent integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_action text,
  ADD COLUMN IF NOT EXISTS next_action_date date,
  ADD COLUMN IF NOT EXISTS assigned_to text,
  ADD COLUMN IF NOT EXISTS portal_client_id uuid,
  ADD COLUMN IF NOT EXISTS portal_project_id uuid,
  ADD COLUMN IF NOT EXISTS won_at timestamptz,
  ADD COLUMN IF NOT EXISTS lost_reason text;

CREATE INDEX IF NOT EXISTS idx_director_projects_status ON public.director_projects (status);
CREATE INDEX IF NOT EXISTS idx_director_projects_portal_project ON public.director_projects (portal_project_id);
CREATE INDEX IF NOT EXISTS idx_director_projects_next_action_date ON public.director_projects (next_action_date);

-- 2. Proposals / official costing documents
CREATE TABLE IF NOT EXISTS public.portal_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  boq_id uuid REFERENCES public.portal_boqs(id) ON DELETE SET NULL,
  proposal_number text NOT NULL UNIQUE,
  revision_label text NOT NULL DEFAULT 'Rev 1',
  title text NOT NULL DEFAULT 'Technology Infrastructure Proposal',
  status text NOT NULL DEFAULT 'draft',
  executive_summary text,
  project_understanding text,
  scope_of_work text,
  methodology text,
  deliverables text,
  assumptions text,
  exclusions text,
  warranty_terms text,
  payment_terms text,
  validity_days integer NOT NULL DEFAULT 30,
  planned_start_date date,
  planned_completion_date date,
  prepared_by_name text,
  prepared_by_email text,
  snapshot jsonb,
  issued_at timestamptz,
  accepted_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portal_proposals_status_chk CHECK (status IN ('draft','issued','accepted','superseded'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_proposals TO authenticated;
GRANT ALL ON public.portal_proposals TO service_role;

ALTER TABLE public.portal_proposals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins manage proposals" ON public.portal_proposals;
CREATE POLICY "admins manage proposals" ON public.portal_proposals
  FOR ALL TO authenticated
  USING (private.portal_is_admin())
  WITH CHECK (private.portal_is_admin());

CREATE INDEX IF NOT EXISTS idx_portal_proposals_project ON public.portal_proposals (project_id);
CREATE INDEX IF NOT EXISTS idx_portal_proposals_boq ON public.portal_proposals (boq_id);
CREATE INDEX IF NOT EXISTS idx_portal_proposals_status ON public.portal_proposals (status);

DROP TRIGGER IF EXISTS trg_portal_proposals_updated ON public.portal_proposals;
CREATE TRIGGER trg_portal_proposals_updated
  BEFORE UPDATE ON public.portal_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Collision-free proposal number generator
CREATE OR REPLACE FUNCTION public.portal_next_proposal_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, private
AS $$
DECLARE
  v_year text := to_char(now(), 'YYYY');
  v_next integer;
  v_num text;
BEGIN
  IF NOT private.portal_is_admin() THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  LOOP
    SELECT coalesce(max((regexp_replace(proposal_number, '^STS-' || v_year || '-', ''))::integer), 0) + 1
      INTO v_next
    FROM public.portal_proposals
    WHERE proposal_number ~ ('^STS-' || v_year || '-\d+$');

    v_num := 'STS-' || v_year || '-' || lpad(v_next::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.portal_proposals WHERE proposal_number = v_num);
  END LOOP;

  RETURN v_num;
END;
$$;