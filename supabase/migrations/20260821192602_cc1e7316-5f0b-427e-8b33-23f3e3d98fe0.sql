-- =========================================================================
-- Siyakha Connect — multi-client / multi-site tenancy (idempotent)
-- =========================================================================

-- 1. Client organisation becomes a tenant root ----------------------------
ALTER TABLE public.portal_clients
  ADD COLUMN IF NOT EXISTS parent_reference text,
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by uuid;

-- 2. Sites ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.portal_clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  city text,
  province text,
  postal_code text,
  venue_type text,
  contact_name text,
  contact_email text,
  contact_phone text,
  status text NOT NULL DEFAULT 'active',
  budget_reference numeric,
  budget_currency text NOT NULL DEFAULT 'ZAR',
  budget_includes_vat boolean NOT NULL DEFAULT true,
  budget_client_visible boolean NOT NULL DEFAULT false,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_sites TO authenticated;
GRANT ALL ON public.portal_sites TO service_role;
ALTER TABLE public.portal_sites ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.portal_projects
  ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES public.portal_sites(id) ON DELETE SET NULL;

DROP TRIGGER IF EXISTS trg_portal_sites_updated ON public.portal_sites;
CREATE TRIGGER trg_portal_sites_updated BEFORE UPDATE ON public.portal_sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Mapping objects: unplaced records + richer device attributes ---------
ALTER TABLE public.portal_floor_markers
  ALTER COLUMN x_norm DROP NOT NULL,
  ALTER COLUMN y_norm DROP NOT NULL;

ALTER TABLE public.portal_floor_markers
  ADD COLUMN IF NOT EXISTS is_placed boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS area text,
  ADD COLUMN IF NOT EXISTS capacity_u integer,
  ADD COLUMN IF NOT EXISTS nvr_id uuid,
  ADD COLUMN IF NOT EXISTS nvr_channel integer,
  ADD COLUMN IF NOT EXISTS mounting_height_m numeric,
  ADD COLUMN IF NOT EXISTS environment text,
  ADD COLUMN IF NOT EXISTS lens_model text,
  ADD COLUMN IF NOT EXISTS coverage_radius_m numeric,
  ADD COLUMN IF NOT EXISTS mount_type text,
  ADD COLUMN IF NOT EXISTS radio_band text,
  ADD COLUMN IF NOT EXISTS ssid text,
  ADD COLUMN IF NOT EXISTS vlan text,
  ADD COLUMN IF NOT EXISTS switch_marker_id uuid,
  ADD COLUMN IF NOT EXISTS switch_port integer,
  ADD COLUMN IF NOT EXISTS poe_class text,
  ADD COLUMN IF NOT EXISTS design_hold text;

-- keep unplaced records honest: no coordinates may be stored for them
CREATE OR REPLACE FUNCTION public.portal_marker_placement_guard()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.is_placed THEN
    IF NEW.x_norm IS NULL OR NEW.y_norm IS NULL THEN
      RAISE EXCEPTION 'A placed device must have plan coordinates';
    END IF;
  ELSE
    NEW.x_norm := NULL;
    NEW.y_norm := NULL;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_portal_marker_placement ON public.portal_floor_markers;
CREATE TRIGGER trg_portal_marker_placement BEFORE INSERT OR UPDATE ON public.portal_floor_markers
  FOR EACH ROW EXECUTE FUNCTION public.portal_marker_placement_guard();

-- 4. NVR / recorder register ---------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_nvrs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  rack_marker_id uuid REFERENCES public.portal_floor_markers(id) ON DELETE SET NULL,
  label text NOT NULL,
  manufacturer text NOT NULL DEFAULT 'Hikvision',
  model text,
  channel_count integer NOT NULL DEFAULT 16,
  channel_from integer,
  channel_to integer,
  status public.portal_marker_state NOT NULL DEFAULT 'planned',
  client_visible boolean NOT NULL DEFAULT true,
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, label)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_nvrs TO authenticated;
GRANT ALL ON public.portal_nvrs TO service_role;
ALTER TABLE public.portal_nvrs ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_portal_nvrs_updated ON public.portal_nvrs;
CREATE TRIGGER trg_portal_nvrs_updated BEFORE UPDATE ON public.portal_nvrs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Structured cabling / fibre schedule extensions ----------------------
ALTER TABLE public.portal_cable_routes
  ADD COLUMN IF NOT EXISTS route_kind text NOT NULL DEFAULT 'copper',
  ADD COLUMN IF NOT EXISTS source_label text,
  ADD COLUMN IF NOT EXISTS destination_label text,
  ADD COLUMN IF NOT EXISTS estimated_length_m numeric,
  ADD COLUMN IF NOT EXISTS measured_length_m numeric,
  ADD COLUMN IF NOT EXISTS test_result text,
  ADD COLUMN IF NOT EXISTS patch_panel text,
  ADD COLUMN IF NOT EXISTS patch_panel_port integer,
  ADD COLUMN IF NOT EXISTS switch_port integer,
  ADD COLUMN IF NOT EXISTS fibre_strands integer,
  ADD COLUMN IF NOT EXISTS sfp_detail text,
  ADD COLUMN IF NOT EXISTS max_length_m numeric NOT NULL DEFAULT 90;

-- 6. Plan revisions -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_plan_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  floor_id uuid REFERENCES public.portal_floors(id) ON DELETE CASCADE,
  revision_label text NOT NULL,
  page_number integer NOT NULL DEFAULT 1,
  page_count integer NOT NULL DEFAULT 1,
  rotation_deg integer NOT NULL DEFAULT 0,
  source_path text,
  image_path text,
  original_filename text,
  mime_type text,
  file_size bigint,
  checksum text,
  review_status text NOT NULL DEFAULT 'pending_review',
  client_visible boolean NOT NULL DEFAULT false,
  is_current boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  notes text,
  uploaded_by uuid,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_plan_revisions TO authenticated;
GRANT ALL ON public.portal_plan_revisions TO service_role;
ALTER TABLE public.portal_plan_revisions ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_portal_plan_revisions_updated ON public.portal_plan_revisions;
CREATE TRIGGER trg_portal_plan_revisions_updated BEFORE UPDATE ON public.portal_plan_revisions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Onboarding registrations --------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by uuid,
  organisation_name text NOT NULL,
  parent_reference text,
  contact_name text,
  contact_email text NOT NULL,
  contact_phone text,
  site_name text,
  site_address text,
  site_city text,
  site_province text,
  site_postal_code text,
  venue_type text,
  services text[] NOT NULL DEFAULT '{}',
  page_labels text[] NOT NULL DEFAULT '{}',
  collaborators text[] NOT NULL DEFAULT '{}',
  plan_paths text[] NOT NULL DEFAULT '{}',
  notes text,
  status text NOT NULL DEFAULT 'pending_review',
  reviewed_by uuid,
  reviewed_at timestamptz,
  client_id uuid REFERENCES public.portal_clients(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.portal_registrations TO authenticated;
GRANT ALL ON public.portal_registrations TO service_role;
ALTER TABLE public.portal_registrations ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS trg_portal_registrations_updated ON public.portal_registrations;
CREATE TRIGGER trg_portal_registrations_updated BEFORE UPDATE ON public.portal_registrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Generic activity log -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portal_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid,
  site_id uuid,
  project_id uuid,
  entity_type text NOT NULL,
  entity_id uuid,
  action text NOT NULL,
  detail text,
  actor_user_id uuid,
  actor_type text NOT NULL DEFAULT 'client',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.portal_activity TO authenticated;
GRANT ALL ON public.portal_activity TO service_role;
ALTER TABLE public.portal_activity ENABLE ROW LEVEL SECURITY;

-- 9. Security helpers ----------------------------------------------------
CREATE OR REPLACE FUNCTION private.portal_is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT private.has_role(auth.uid(), 'super_admin'::public.app_role)
$$;
REVOKE ALL ON FUNCTION private.portal_is_super_admin() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.portal_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT private.has_role(auth.uid(), 'super_admin'::public.app_role)
      OR private.has_role(auth.uid(), 'siyakha_admin'::public.app_role)
      OR private.has_role(auth.uid(), 'admin'::public.app_role)
      OR private.has_role(auth.uid(), 'project_manager'::public.app_role)
$$;

CREATE OR REPLACE FUNCTION private.portal_my_client_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT DISTINCT cu.client_id FROM public.portal_client_users cu
  WHERE cu.id IN (SELECT private.portal_my_client_user_ids())
$$;
REVOKE ALL ON FUNCTION private.portal_my_client_ids() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.portal_can_read_site(_site_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT private.portal_is_admin()
      OR EXISTS (
        SELECT 1 FROM public.portal_projects p
        WHERE p.site_id = _site_id
          AND private.portal_can_read_project(p.id)
      )
$$;
REVOKE ALL ON FUNCTION private.portal_can_read_site(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION private.portal_can_edit_project(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT private.portal_is_admin()
      OR EXISTS (
        SELECT 1
        FROM public.portal_project_assignments a
        JOIN public.portal_client_users cu ON cu.id = a.client_user_id
        WHERE a.project_id = _project_id
          AND a.client_user_id IN (SELECT private.portal_my_client_user_ids())
          AND cu.portal_role IN ('client_admin', 'client_editor', 'admin', 'editor')
      )
$$;
REVOKE ALL ON FUNCTION private.portal_can_edit_project(uuid) FROM PUBLIC, anon, authenticated;

-- 10. RLS policies for the new tenant tables -----------------------------
DROP POLICY IF EXISTS "portal sites admin manage" ON public.portal_sites;
CREATE POLICY "portal sites admin manage" ON public.portal_sites FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
DROP POLICY IF EXISTS "portal sites client read" ON public.portal_sites;
CREATE POLICY "portal sites client read" ON public.portal_sites FOR SELECT TO authenticated
  USING (archived_at IS NULL AND private.portal_can_read_site(id));

DROP POLICY IF EXISTS "portal nvrs admin manage" ON public.portal_nvrs;
CREATE POLICY "portal nvrs admin manage" ON public.portal_nvrs FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
DROP POLICY IF EXISTS "portal nvrs client read" ON public.portal_nvrs;
CREATE POLICY "portal nvrs client read" ON public.portal_nvrs FOR SELECT TO authenticated
  USING (client_visible AND private.portal_can_read_project(project_id));

DROP POLICY IF EXISTS "portal plan revisions admin manage" ON public.portal_plan_revisions;
CREATE POLICY "portal plan revisions admin manage" ON public.portal_plan_revisions FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
DROP POLICY IF EXISTS "portal plan revisions client read" ON public.portal_plan_revisions;
CREATE POLICY "portal plan revisions client read" ON public.portal_plan_revisions FOR SELECT TO authenticated
  USING (client_visible AND archived_at IS NULL AND private.portal_can_read_project(project_id));
DROP POLICY IF EXISTS "portal plan revisions client upload" ON public.portal_plan_revisions;
CREATE POLICY "portal plan revisions client upload" ON public.portal_plan_revisions FOR INSERT TO authenticated
  WITH CHECK (
    private.portal_can_edit_project(project_id)
    AND uploaded_by = auth.uid()
    AND review_status = 'pending_review'
  );

DROP POLICY IF EXISTS "portal registrations admin manage" ON public.portal_registrations;
CREATE POLICY "portal registrations admin manage" ON public.portal_registrations FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
DROP POLICY IF EXISTS "portal registrations own read" ON public.portal_registrations;
CREATE POLICY "portal registrations own read" ON public.portal_registrations FOR SELECT TO authenticated
  USING (submitted_by = auth.uid());
DROP POLICY IF EXISTS "portal registrations own insert" ON public.portal_registrations;
CREATE POLICY "portal registrations own insert" ON public.portal_registrations FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid() AND status = 'pending_review');

DROP POLICY IF EXISTS "portal activity admin read" ON public.portal_activity;
CREATE POLICY "portal activity admin read" ON public.portal_activity FOR SELECT TO authenticated
  USING (private.portal_is_admin());
DROP POLICY IF EXISTS "portal activity client read" ON public.portal_activity;
CREATE POLICY "portal activity client read" ON public.portal_activity FOR SELECT TO authenticated
  USING (project_id IS NOT NULL AND private.portal_can_read_project(project_id));
DROP POLICY IF EXISTS "portal activity insert" ON public.portal_activity;
CREATE POLICY "portal activity insert" ON public.portal_activity FOR INSERT TO authenticated
  WITH CHECK (
    actor_user_id = auth.uid()
    AND (private.portal_is_admin() OR (project_id IS NOT NULL AND private.portal_can_read_project(project_id)))
  );

CREATE INDEX IF NOT EXISTS idx_portal_sites_client ON public.portal_sites(client_id);
CREATE INDEX IF NOT EXISTS idx_portal_projects_site ON public.portal_projects(site_id);
CREATE INDEX IF NOT EXISTS idx_portal_nvrs_project ON public.portal_nvrs(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_plan_rev_project ON public.portal_plan_revisions(project_id);
CREATE INDEX IF NOT EXISTS idx_portal_activity_project ON public.portal_activity(project_id, created_at DESC);