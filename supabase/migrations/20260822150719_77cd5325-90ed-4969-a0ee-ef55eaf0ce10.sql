-- 1. Share-link immutability ----------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_share_link_guard()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.portal_projects p
       WHERE p.id = NEW.project_id
         AND (NEW.client_id IS NULL OR p.client_id = NEW.client_id)
    ) THEN
      RAISE EXCEPTION 'A share link must belong to the project''s own client';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.token_hash IS DISTINCT FROM OLD.token_hash
     OR NEW.snapshot IS DISTINCT FROM OLD.snapshot
     OR NEW.resource_type IS DISTINCT FROM OLD.resource_type
     OR NEW.resource_id IS DISTINCT FROM OLD.resource_id
     OR NEW.revision_label IS DISTINCT FROM OLD.revision_label
     OR NEW.project_id IS DISTINCT FROM OLD.project_id
     OR NEW.client_id IS DISTINCT FROM OLD.client_id
     OR NEW.created_by IS DISTINCT FROM OLD.created_by
     OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'A share link''s token, snapshot and resource identity are immutable. Revoke it and issue a new link.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS portal_share_link_guard ON public.portal_share_links;
CREATE TRIGGER portal_share_link_guard
  BEFORE INSERT OR UPDATE ON public.portal_share_links
  FOR EACH ROW EXECUTE FUNCTION public.portal_share_link_guard();

-- 2. Immutable acceptances -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_share_acceptances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id uuid NOT NULL REFERENCES public.portal_share_links(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  client_id uuid,
  resource_type text NOT NULL,
  resource_id uuid,
  revision_label text,
  snapshot_hash text NOT NULL,
  accepted_by_user_id uuid,
  note text,
  accepted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (share_link_id)
);

GRANT SELECT ON public.portal_share_acceptances TO authenticated;
GRANT ALL ON public.portal_share_acceptances TO service_role;
ALTER TABLE public.portal_share_acceptances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "share acceptances admin read" ON public.portal_share_acceptances;
CREATE POLICY "share acceptances admin read" ON public.portal_share_acceptances
  FOR SELECT TO authenticated USING (private.portal_is_admin());

CREATE OR REPLACE FUNCTION public.portal_share_acceptance_guard()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  RAISE EXCEPTION 'An acceptance record is immutable';
END;
$$;

DROP TRIGGER IF EXISTS portal_share_acceptance_guard ON public.portal_share_acceptances;
CREATE TRIGGER portal_share_acceptance_guard
  BEFORE UPDATE OR DELETE ON public.portal_share_acceptances
  FOR EACH ROW EXECUTE FUNCTION public.portal_share_acceptance_guard();

-- 3. Issued documents are append-only -------------------------------------
CREATE OR REPLACE FUNCTION public.portal_proposal_guard()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.boq_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.portal_boqs b WHERE b.id = NEW.boq_id AND b.project_id = NEW.project_id
  ) THEN
    RAISE EXCEPTION 'The linked bill of quantities belongs to another project';
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status IN ('issued', 'accepted') THEN
    IF NEW.snapshot IS DISTINCT FROM OLD.snapshot
       OR NEW.boq_id IS DISTINCT FROM OLD.boq_id
       OR NEW.project_id IS DISTINCT FROM OLD.project_id
       OR NEW.proposal_number IS DISTINCT FROM OLD.proposal_number
       OR NEW.revision_label IS DISTINCT FROM OLD.revision_label
       OR NEW.scope_of_work IS DISTINCT FROM OLD.scope_of_work
       OR NEW.deliverables IS DISTINCT FROM OLD.deliverables
       OR NEW.executive_summary IS DISTINCT FROM OLD.executive_summary
       OR NEW.issued_at IS DISTINCT FROM OLD.issued_at THEN
      RAISE EXCEPTION 'An issued proposal is immutable. Create a new revision instead.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS portal_proposal_guard ON public.portal_proposals;
CREATE TRIGGER portal_proposal_guard
  BEFORE INSERT OR UPDATE ON public.portal_proposals
  FOR EACH ROW EXECUTE FUNCTION public.portal_proposal_guard();

CREATE OR REPLACE FUNCTION public.portal_project_pack_guard()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.snapshot IS DISTINCT FROM OLD.snapshot
       OR NEW.project_id IS DISTINCT FROM OLD.project_id
       OR NEW.pack_number IS DISTINCT FROM OLD.pack_number
       OR NEW.revision_no IS DISTINCT FROM OLD.revision_no
       OR NEW.pack_kind IS DISTINCT FROM OLD.pack_kind
       OR NEW.issued_at IS DISTINCT FROM OLD.issued_at THEN
      RAISE EXCEPTION 'An issued project pack is immutable. Issue a new revision instead.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS portal_project_pack_guard ON public.portal_project_packs;
CREATE TRIGGER portal_project_pack_guard
  BEFORE UPDATE ON public.portal_project_packs
  FOR EACH ROW EXECUTE FUNCTION public.portal_project_pack_guard();

-- 4. Relationship validation ----------------------------------------------
CREATE OR REPLACE FUNCTION public.portal_variation_guard()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.boq_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.portal_boqs b WHERE b.id = NEW.boq_id AND b.project_id = NEW.project_id
  ) THEN
    RAISE EXCEPTION 'The linked bill of quantities belongs to another project';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS portal_variation_guard ON public.portal_variations;
CREATE TRIGGER portal_variation_guard
  BEFORE INSERT OR UPDATE ON public.portal_variations
  FOR EACH ROW EXECUTE FUNCTION public.portal_variation_guard();

CREATE OR REPLACE FUNCTION public.portal_project_guard()
 RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN
  IF NEW.site_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.portal_sites s WHERE s.id = NEW.site_id AND s.client_id = NEW.client_id
  ) THEN
    RAISE EXCEPTION 'The selected site belongs to another client';
  END IF;
  IF NEW.design_boq_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM public.portal_boqs b WHERE b.id = NEW.design_boq_id AND b.project_id = NEW.id
  ) THEN
    RAISE EXCEPTION 'The nominated design bill of quantities belongs to another project';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS portal_project_guard ON public.portal_projects;
CREATE TRIGGER portal_project_guard
  BEFORE INSERT OR UPDATE ON public.portal_projects
  FOR EACH ROW EXECUTE FUNCTION public.portal_project_guard();