ALTER TABLE public.portal_notification_settings
  ADD COLUMN IF NOT EXISTS client_emails_enabled boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.portal_admin_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_user_id uuid,
  target_client_user_id uuid,
  target_email text,
  action text NOT NULL,
  outcome text NOT NULL,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.portal_admin_audit TO authenticated;
GRANT ALL ON public.portal_admin_audit TO service_role;

ALTER TABLE public.portal_admin_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portal admin audit admin read"
  ON public.portal_admin_audit
  FOR SELECT
  TO authenticated
  USING (private.portal_is_admin());
