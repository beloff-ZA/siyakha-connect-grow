-- Types
DO $$ BEGIN
  CREATE TYPE public.portal_marker_kind AS ENUM ('wifi_ap','camera','rack','cable_route','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.portal_marker_state AS ENUM ('planned','installed','tested','active');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Floors
CREATE TABLE public.portal_floors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  level_number integer NOT NULL,
  display_name text NOT NULL,
  floor_use text NOT NULL DEFAULT 'accommodation',
  plan_image_path text,
  plan_type text NOT NULL DEFAULT 'architectural',
  notes text,
  sort_order integer NOT NULL DEFAULT 0,
  client_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, level_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_floors TO authenticated;
GRANT ALL ON public.portal_floors TO service_role;
ALTER TABLE public.portal_floors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage floors" ON public.portal_floors FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "clients read visible floors" ON public.portal_floors FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id) AND client_visible);

CREATE TRIGGER trg_portal_floors_updated BEFORE UPDATE ON public.portal_floors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: can the current user read a floor
CREATE OR REPLACE FUNCTION private.portal_can_read_floor(_floor_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.portal_floors f
    WHERE f.id = _floor_id
      AND f.client_visible
      AND private.portal_can_read_project(f.project_id)
  );
$$;
REVOKE ALL ON FUNCTION private.portal_can_read_floor(uuid) FROM PUBLIC;

-- Markers
CREATE TABLE public.portal_floor_markers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  floor_id uuid NOT NULL REFERENCES public.portal_floors(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  marker_type public.portal_marker_kind NOT NULL DEFAULT 'wifi_ap',
  x_norm numeric NOT NULL DEFAULT 0.5,
  y_norm numeric NOT NULL DEFAULT 0.5,
  label text NOT NULL,
  equipment text,
  model text,
  status public.portal_marker_state NOT NULL DEFAULT 'planned',
  client_visible boolean NOT NULL DEFAULT true,
  description text,
  notes text,
  installed_on date,
  tested_on date,
  serial_number text,
  mac_address text,
  evidence_path text,
  evidence_note text,
  sort_order integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (floor_id, label)
);

CREATE INDEX idx_portal_floor_markers_floor ON public.portal_floor_markers(floor_id);
CREATE INDEX idx_portal_floor_markers_project ON public.portal_floor_markers(project_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_floor_markers TO authenticated;
GRANT ALL ON public.portal_floor_markers TO service_role;
ALTER TABLE public.portal_floor_markers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage floor markers" ON public.portal_floor_markers FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "clients read visible floor markers" ON public.portal_floor_markers FOR SELECT TO authenticated
  USING (client_visible AND private.portal_can_read_floor(floor_id));

CREATE TRIGGER trg_portal_floor_markers_updated BEFORE UPDATE ON public.portal_floor_markers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Marker comments / queries
CREATE TABLE public.portal_floor_marker_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id uuid REFERENCES public.portal_floor_markers(id) ON DELETE CASCADE,
  floor_id uuid NOT NULL REFERENCES public.portal_floors(id) ON DELETE CASCADE,
  author_user_id uuid,
  author_name text,
  author_type text NOT NULL DEFAULT 'client',
  body text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  admin_response text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_floor_marker_comments TO authenticated;
GRANT ALL ON public.portal_floor_marker_comments TO service_role;
ALTER TABLE public.portal_floor_marker_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage floor marker comments" ON public.portal_floor_marker_comments FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "clients read own floor marker comments" ON public.portal_floor_marker_comments FOR SELECT TO authenticated
  USING (author_user_id = auth.uid() AND private.portal_can_read_floor(floor_id));
CREATE POLICY "clients add floor marker comments" ON public.portal_floor_marker_comments FOR INSERT TO authenticated
  WITH CHECK (author_user_id = auth.uid() AND author_type = 'client' AND private.portal_can_read_floor(floor_id));

CREATE TRIGGER trg_portal_floor_marker_comments_updated BEFORE UPDATE ON public.portal_floor_marker_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Marker history (append-only audit)
CREATE TABLE public.portal_floor_marker_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  marker_id uuid REFERENCES public.portal_floor_markers(id) ON DELETE CASCADE,
  floor_id uuid REFERENCES public.portal_floors(id) ON DELETE CASCADE,
  actor_user_id uuid,
  actor_type text NOT NULL DEFAULT 'admin',
  action text NOT NULL,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.portal_floor_marker_history TO authenticated;
GRANT ALL ON public.portal_floor_marker_history TO service_role;
ALTER TABLE public.portal_floor_marker_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read floor marker history" ON public.portal_floor_marker_history FOR SELECT TO authenticated
  USING (private.portal_is_admin());
CREATE POLICY "admins write floor marker history" ON public.portal_floor_marker_history FOR INSERT TO authenticated
  WITH CHECK (private.portal_is_admin());