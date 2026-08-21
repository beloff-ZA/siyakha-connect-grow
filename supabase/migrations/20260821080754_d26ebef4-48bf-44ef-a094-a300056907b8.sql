CREATE TABLE public.portal_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  contact_name text,
  contact_email text,
  phone text,
  notes text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portal_client_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.portal_clients(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  user_id uuid,
  portal_role text NOT NULL DEFAULT 'client_user',
  status text NOT NULL DEFAULT 'pending',
  invited_at timestamptz,
  activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, email)
);
CREATE INDEX portal_client_users_email_idx ON public.portal_client_users (lower(email));

CREATE TABLE public.portal_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES public.portal_clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'planning',
  address text,
  reference text,
  consultant text,
  description text,
  site_context text,
  objectives text,
  stakeholders text,
  risks_notes text,
  planning_narrative text,
  start_date date,
  target_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portal_project_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  client_user_id uuid NOT NULL REFERENCES public.portal_client_users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, client_user_id)
);

CREATE TABLE public.portal_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'not_started',
  start_date date,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portal_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  phase_id uuid REFERENCES public.portal_phases(id) ON DELETE SET NULL,
  title text NOT NULL,
  detail text,
  due_date date,
  status text NOT NULL DEFAULT 'not_started',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portal_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  phase_id uuid REFERENCES public.portal_phases(id) ON DELETE SET NULL,
  title text NOT NULL,
  owner text,
  priority text NOT NULL DEFAULT 'medium',
  due_date date,
  status text NOT NULL DEFAULT 'not_started',
  evidence_notes text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portal_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text,
  status text,
  author_name text,
  posted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portal_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'General',
  version text,
  document_date date,
  storage_path text,
  file_size bigint,
  mime_type text,
  notes text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portal_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  phase_id uuid REFERENCES public.portal_phases(id) ON DELETE SET NULL,
  caption text,
  taken_at date,
  storage_path text NOT NULL,
  mime_type text,
  file_size bigint,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.portal_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  client_user_id uuid REFERENCES public.portal_client_users(id) ON DELETE SET NULL,
  submitted_by uuid,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  admin_response text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION private.portal_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT private.has_role(auth.uid(), 'siyakha_admin'::app_role)
      OR private.has_role(auth.uid(), 'admin'::app_role)
$$;

CREATE OR REPLACE FUNCTION private.portal_my_client_user_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT cu.id FROM public.portal_client_users cu
  WHERE cu.status <> 'disabled'
    AND (cu.user_id = auth.uid()
         OR lower(cu.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
$$;

CREATE OR REPLACE FUNCTION private.portal_can_read_project(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, private AS $$
  SELECT private.portal_is_admin()
      OR EXISTS (
        SELECT 1 FROM public.portal_project_assignments a
        WHERE a.project_id = _project_id
          AND a.client_user_id IN (SELECT private.portal_my_client_user_ids())
      )
$$;

REVOKE ALL ON FUNCTION private.portal_is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.portal_my_client_user_ids() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.portal_can_read_project(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.portal_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION private.portal_my_client_user_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION private.portal_can_read_project(uuid) TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_client_users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_project_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_phases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_milestones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_updates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_photos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_queries TO authenticated;
GRANT ALL ON public.portal_clients, public.portal_client_users, public.portal_projects,
  public.portal_project_assignments, public.portal_phases, public.portal_milestones,
  public.portal_tasks, public.portal_updates, public.portal_documents,
  public.portal_photos, public.portal_queries TO service_role;

ALTER TABLE public.portal_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage clients" ON public.portal_clients FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage client users" ON public.portal_client_users FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage projects" ON public.portal_projects FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage assignments" ON public.portal_project_assignments FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage phases" ON public.portal_phases FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage milestones" ON public.portal_milestones FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage tasks" ON public.portal_tasks FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage updates" ON public.portal_updates FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage documents" ON public.portal_documents FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage photos" ON public.portal_photos FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());
CREATE POLICY "admins manage queries" ON public.portal_queries FOR ALL TO authenticated
  USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());

CREATE POLICY "clients read own client record" ON public.portal_clients FOR SELECT TO authenticated
  USING (id IN (SELECT cu.client_id FROM public.portal_client_users cu
                WHERE cu.id IN (SELECT private.portal_my_client_user_ids())));

CREATE POLICY "clients read own portal user record" ON public.portal_client_users FOR SELECT TO authenticated
  USING (id IN (SELECT private.portal_my_client_user_ids()));

CREATE POLICY "clients read assigned projects" ON public.portal_projects FOR SELECT TO authenticated
  USING (private.portal_can_read_project(id));

CREATE POLICY "clients read own assignments" ON public.portal_project_assignments FOR SELECT TO authenticated
  USING (client_user_id IN (SELECT private.portal_my_client_user_ids()));

CREATE POLICY "clients read project phases" ON public.portal_phases FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id));
CREATE POLICY "clients read project milestones" ON public.portal_milestones FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id));
CREATE POLICY "clients read project tasks" ON public.portal_tasks FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id));
CREATE POLICY "clients read project updates" ON public.portal_updates FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id));
CREATE POLICY "clients read project documents" ON public.portal_documents FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id));
CREATE POLICY "clients read project photos" ON public.portal_photos FOR SELECT TO authenticated
  USING (private.portal_can_read_project(project_id));

CREATE POLICY "clients read own queries" ON public.portal_queries FOR SELECT TO authenticated
  USING (submitted_by = auth.uid() OR client_user_id IN (SELECT private.portal_my_client_user_ids()));
CREATE POLICY "clients create queries on assigned projects" ON public.portal_queries FOR INSERT TO authenticated
  WITH CHECK (
    submitted_by = auth.uid()
    AND private.portal_can_read_project(project_id)
    AND client_user_id IN (SELECT private.portal_my_client_user_ids())
  );

CREATE TRIGGER trg_portal_clients_updated BEFORE UPDATE ON public.portal_clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_client_users_updated BEFORE UPDATE ON public.portal_client_users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_projects_updated BEFORE UPDATE ON public.portal_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_phases_updated BEFORE UPDATE ON public.portal_phases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_milestones_updated BEFORE UPDATE ON public.portal_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_tasks_updated BEFORE UPDATE ON public.portal_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_updates_updated BEFORE UPDATE ON public.portal_updates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_documents_updated BEFORE UPDATE ON public.portal_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_photos_updated BEFORE UPDATE ON public.portal_photos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_portal_queries_updated BEFORE UPDATE ON public.portal_queries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "portal storage admin all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id IN ('client-documents','client-photos') AND private.portal_is_admin())
  WITH CHECK (bucket_id IN ('client-documents','client-photos') AND private.portal_is_admin());

CREATE POLICY "portal storage client read" ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id IN ('client-documents','client-photos')
    AND (storage.foldername(name))[1] ~ '^[0-9a-fA-F-]{36}$'
    AND private.portal_can_read_project(((storage.foldername(name))[1])::uuid)
  );