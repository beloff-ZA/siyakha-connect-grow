ALTER TABLE public.portal_projects
  ADD COLUMN IF NOT EXISTS scope_of_work text,
  ADD COLUMN IF NOT EXISTS deliverables text;

ALTER TABLE public.portal_site_images
  ADD COLUMN IF NOT EXISTS uploaded_by_name text,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'admin';

CREATE TABLE IF NOT EXISTS public.portal_project_next_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  detail text,
  category text NOT NULL DEFAULT 'installation',
  status text NOT NULL DEFAULT 'pending',
  due_date date,
  sort_order integer NOT NULL DEFAULT 0,
  technician_visible boolean NOT NULL DEFAULT true,
  client_visible boolean NOT NULL DEFAULT true,
  completed_at timestamptz,
  updated_by_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_project_next_steps TO authenticated;
GRANT ALL ON public.portal_project_next_steps TO service_role;

ALTER TABLE public.portal_project_next_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage project next steps"
ON public.portal_project_next_steps FOR ALL TO authenticated
USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());

CREATE POLICY "clients read visible next steps"
ON public.portal_project_next_steps FOR SELECT TO authenticated
USING (client_visible AND private.portal_can_read_project(project_id));

CREATE INDEX IF NOT EXISTS portal_project_next_steps_project_idx
  ON public.portal_project_next_steps (project_id, sort_order);

CREATE TRIGGER portal_project_next_steps_updated_at
BEFORE UPDATE ON public.portal_project_next_steps
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();