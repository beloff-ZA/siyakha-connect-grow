CREATE TABLE public.portal_share_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  resource_type text NOT NULL CHECK (resource_type IN ('proposal','costing','boq','project_pack','report','floor_plan_view')),
  resource_id uuid,
  revision_label text,
  title text NOT NULL,
  project_id uuid NOT NULL REFERENCES public.portal_projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.portal_clients(id) ON DELETE SET NULL,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  permission_scope text NOT NULL DEFAULT 'view' CHECK (permission_scope IN ('view','view_download','view_comment','view_approve')),
  download_allowed boolean NOT NULL DEFAULT false,
  comments_allowed boolean NOT NULL DEFAULT false,
  approval_allowed boolean NOT NULL DEFAULT false,
  require_client_login boolean NOT NULL DEFAULT false,
  recipient_label text,
  recipient_email text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  revoked_at timestamptz,
  access_count integer NOT NULL DEFAULT 0,
  first_accessed_at timestamptz,
  last_accessed_at timestamptz
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_share_links TO authenticated;
GRANT ALL ON public.portal_share_links TO service_role;
ALTER TABLE public.portal_share_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal share links admin manage"
ON public.portal_share_links FOR ALL TO authenticated
USING (private.portal_is_admin())
WITH CHECK (private.portal_is_admin());

CREATE TRIGGER trg_portal_share_links_updated
BEFORE UPDATE ON public.portal_share_links
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_portal_share_links_token ON public.portal_share_links (token_hash);
CREATE INDEX idx_portal_share_links_project ON public.portal_share_links (project_id, created_at DESC);
CREATE INDEX idx_portal_share_links_resource ON public.portal_share_links (resource_type, resource_id);

CREATE TABLE public.portal_share_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id uuid REFERENCES public.portal_share_links(id) ON DELETE CASCADE,
  accessed_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  user_agent text,
  action text NOT NULL DEFAULT 'view',
  outcome text NOT NULL DEFAULT 'granted',
  detail text
);

GRANT SELECT ON public.portal_share_access_log TO authenticated;
GRANT ALL ON public.portal_share_access_log TO service_role;
ALTER TABLE public.portal_share_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal share access log admin read"
ON public.portal_share_access_log FOR SELECT TO authenticated
USING (private.portal_is_admin());

CREATE INDEX idx_portal_share_access_log_link ON public.portal_share_access_log (share_link_id, accessed_at DESC);
CREATE INDEX idx_portal_share_access_log_ip ON public.portal_share_access_log (ip_hash, accessed_at DESC);