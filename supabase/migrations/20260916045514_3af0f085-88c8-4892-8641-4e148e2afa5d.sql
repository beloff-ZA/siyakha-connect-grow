-- Share link roles
ALTER TABLE public.portal_share_links
  ADD COLUMN IF NOT EXISTS link_role text NOT NULL DEFAULT 'client',
  ADD COLUMN IF NOT EXISTS assignee_label text;

-- ============================================================ site updates
CREATE TABLE public.portal_site_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  floor_id uuid REFERENCES public.portal_floors(id) ON DELETE SET NULL,
  area_label text,
  shift_date date NOT NULL DEFAULT current_date,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  submitted_by_name text NOT NULL,
  submitted_by_user uuid,
  field_access_id uuid,
  source text NOT NULL DEFAULT 'field',
  work_completed text,
  work_outstanding text,
  blockers text,
  materials_required text,
  team_onsite text,
  progress_pct integer NOT NULL DEFAULT 0,
  next_shift_plan text,
  notes text,
  internal_notes text,
  client_visible boolean NOT NULL DEFAULT false,
  approval_status text NOT NULL DEFAULT 'submitted',
  approved_by uuid,
  approved_at timestamptz,
  published_at timestamptz,
  locked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portal_site_update_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  update_id uuid REFERENCES public.portal_site_updates(id) ON DELETE CASCADE,
  issue_id uuid,
  floor_id uuid REFERENCES public.portal_floors(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'during',
  caption text,
  storage_path text NOT NULL,
  mime_type text,
  file_size bigint,
  taken_at timestamptz NOT NULL DEFAULT now(),
  client_visible boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portal_site_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  update_id uuid REFERENCES public.portal_site_updates(id) ON DELETE SET NULL,
  floor_id uuid REFERENCES public.portal_floors(id) ON DELETE SET NULL,
  location_note text,
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  reported_by_name text,
  field_access_id uuid,
  client_visible boolean NOT NULL DEFAULT false,
  internal_only boolean NOT NULL DEFAULT false,
  opened_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portal_site_update_photos
  ADD CONSTRAINT portal_site_update_photos_issue_fk
  FOREIGN KEY (issue_id) REFERENCES public.portal_site_issues(id) ON DELETE CASCADE;

CREATE TABLE public.portal_floor_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  floor_id uuid NOT NULL REFERENCES public.portal_floors(id) ON DELETE CASCADE,
  progress_pct integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'not_started',
  admin_override boolean NOT NULL DEFAULT false,
  note text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, floor_id)
);

CREATE TABLE public.portal_field_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  share_link_id uuid NOT NULL REFERENCES public.portal_share_links(id) ON DELETE CASCADE,
  technician_name text NOT NULL,
  technician_email text,
  role_label text NOT NULL DEFAULT 'Field technician',
  device_session_hash text,
  device_label text,
  device_expires_at timestamptz,
  last_seen_at timestamptz,
  submission_count integer NOT NULL DEFAULT 0,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portal_drawing_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  floor_id uuid REFERENCES public.portal_floors(id) ON DELETE SET NULL,
  plan_revision_id uuid REFERENCES public.portal_plan_revisions(id) ON DELETE SET NULL,
  update_id uuid REFERENCES public.portal_site_updates(id) ON DELETE SET NULL,
  issue_id uuid REFERENCES public.portal_site_issues(id) ON DELETE SET NULL,
  label text,
  x_norm numeric,
  y_norm numeric,
  client_visible boolean NOT NULL DEFAULT false,
  created_by_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portal_site_updates
  ADD CONSTRAINT portal_site_updates_access_fk
  FOREIGN KEY (field_access_id) REFERENCES public.portal_field_access(id) ON DELETE SET NULL;
ALTER TABLE public.portal_site_issues
  ADD CONSTRAINT portal_site_issues_access_fk
  FOREIGN KEY (field_access_id) REFERENCES public.portal_field_access(id) ON DELETE SET NULL;

CREATE INDEX idx_site_updates_project_date ON public.portal_site_updates(project_id, shift_date DESC);
CREATE INDEX idx_site_update_photos_update ON public.portal_site_update_photos(update_id);
CREATE INDEX idx_site_issues_project ON public.portal_site_issues(project_id, status);
CREATE INDEX idx_field_access_share ON public.portal_field_access(share_link_id);

-- grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_site_updates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_site_update_photos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_site_issues TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_floor_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_field_access TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_drawing_pins TO authenticated;
GRANT ALL ON public.portal_site_updates TO service_role;
GRANT ALL ON public.portal_site_update_photos TO service_role;
GRANT ALL ON public.portal_site_issues TO service_role;
GRANT ALL ON public.portal_floor_progress TO service_role;
GRANT ALL ON public.portal_field_access TO service_role;
GRANT ALL ON public.portal_drawing_pins TO service_role;

ALTER TABLE public.portal_site_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_site_update_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_site_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_floor_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_field_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_drawing_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage site updates" ON public.portal_site_updates FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "clients read approved site updates" ON public.portal_site_updates FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id) AND client_visible AND approval_status IN ('approved','locked'));

CREATE POLICY "admins manage site photos" ON public.portal_site_update_photos FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "clients read approved site photos" ON public.portal_site_update_photos FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id) AND client_visible);

CREATE POLICY "admins manage site issues" ON public.portal_site_issues FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "clients read visible site issues" ON public.portal_site_issues FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id) AND client_visible AND NOT internal_only);

CREATE POLICY "admins manage floor progress" ON public.portal_floor_progress FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "clients read floor progress" ON public.portal_floor_progress FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id));

CREATE POLICY "admins manage field access" ON public.portal_field_access FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());

CREATE POLICY "admins manage drawing pins" ON public.portal_drawing_pins FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "clients read visible drawing pins" ON public.portal_drawing_pins FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id) AND client_visible);

CREATE TRIGGER trg_site_updates_updated BEFORE UPDATE ON public.portal_site_updates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_site_issues_updated BEFORE UPDATE ON public.portal_site_issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_field_access_updated BEFORE UPDATE ON public.portal_field_access FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================ seed project
INSERT INTO public.portal_clients (id, display_name, contact_name, status, notes)
VALUES ('e1000000-0000-4000-8000-00000000d1c1', 'Digiconnect', NULL, 'active',
        'Digiconnect c/o Sun International — Siyakha delivers low-level layout installation works.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.portal_sites (id, client_id, name, venue_type, status, sort_order)
VALUES ('e1000000-0000-4000-8000-00000000d1c2', 'e1000000-0000-4000-8000-00000000d1c1',
        'Sun International site', 'Hospitality / gaming', 'active', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.portal_projects (id, client_id, site_id, title, reference, status, lifecycle_stage, description)
VALUES ('e1000000-0000-4000-8000-00000000d1c3', 'e1000000-0000-4000-8000-00000000d1c1',
        'e1000000-0000-4000-8000-00000000d1c2', 'DIGICONNECT C/O SUN INTERNATIONAL',
        '01_01_2026_33', 'In progress', 'implementation',
        'Low-level layout installation works across Ground to Fifth floors: data points, access-control power and network points, floor boxes, TV data and power, power skirting, core drilling and electrical reticulation. Construction pack: Low Level Layouts - All Floors (01_01_2026_33).')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.portal_floors (project_id, level_number, display_name, plan_type, sort_order, client_visible)
SELECT 'e1000000-0000-4000-8000-00000000d1c3', v.lvl, v.nm, 'low_level_layout', v.lvl, true
FROM (VALUES (0,'Ground Floor'),(1,'First Floor'),(2,'Second Floor'),(3,'Third Floor'),(4,'Fourth Floor'),(5,'Fifth Floor')) AS v(lvl,nm)
WHERE NOT EXISTS (
  SELECT 1 FROM public.portal_floors f
  WHERE f.project_id = 'e1000000-0000-4000-8000-00000000d1c3' AND f.level_number = v.lvl
);

INSERT INTO public.portal_floor_progress (project_id, floor_id)
SELECT f.project_id, f.id FROM public.portal_floors f
WHERE f.project_id = 'e1000000-0000-4000-8000-00000000d1c3'
ON CONFLICT (project_id, floor_id) DO NOTHING;