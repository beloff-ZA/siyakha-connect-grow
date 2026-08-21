CREATE TABLE public.portal_site_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  original_filename text NOT NULL,
  title text NOT NULL,
  caption text,
  area text,
  category text NOT NULL DEFAULT 'Existing Conditions',
  captured_on date,
  sort_order integer NOT NULL DEFAULT 0,
  client_visible boolean NOT NULL DEFAULT true,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX portal_site_images_project_filename_key ON public.portal_site_images (project_id, original_filename);
CREATE UNIQUE INDEX portal_site_images_storage_path_key ON public.portal_site_images (storage_path);
CREATE INDEX portal_site_images_project_idx ON public.portal_site_images (project_id, sort_order);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_site_images TO authenticated;
GRANT ALL ON public.portal_site_images TO service_role;

ALTER TABLE public.portal_site_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage site images" ON public.portal_site_images
  FOR ALL TO authenticated
  USING (private.portal_is_admin())
  WITH CHECK (private.portal_is_admin());

CREATE POLICY "clients read project site images" ON public.portal_site_images
  FOR SELECT TO authenticated
  USING (client_visible AND private.portal_can_read_project(project_id));

CREATE TRIGGER trg_portal_site_images_updated
  BEFORE UPDATE ON public.portal_site_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();