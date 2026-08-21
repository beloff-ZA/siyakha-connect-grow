CREATE TABLE public.portal_notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true,
  login_notify_enabled boolean NOT NULL DEFAULT true,
  recipient_email text NOT NULL DEFAULT 'nikita@siyakhatechnology.co.za',
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT portal_notification_settings_one_row UNIQUE (singleton),
  CONSTRAINT portal_notification_settings_singleton_true CHECK (singleton),
  CONSTRAINT portal_notification_settings_email_valid CHECK (recipient_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

GRANT SELECT, INSERT, UPDATE ON public.portal_notification_settings TO authenticated;
GRANT ALL ON public.portal_notification_settings TO service_role;
ALTER TABLE public.portal_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification settings admin read" ON public.portal_notification_settings
  FOR SELECT TO authenticated USING (private.portal_is_admin());
CREATE POLICY "notification settings admin write" ON public.portal_notification_settings
  FOR ALL TO authenticated USING (private.portal_is_admin()) WITH CHECK (private.portal_is_admin());

CREATE TRIGGER trg_portal_notification_settings_updated
  BEFORE UPDATE ON public.portal_notification_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.portal_notification_settings (login_notify_enabled, recipient_email)
VALUES (true, 'nikita@siyakhatechnology.co.za');

CREATE TABLE public.portal_login_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  client_user_id uuid REFERENCES public.portal_client_users(id) ON DELETE SET NULL,
  client_id uuid REFERENCES public.portal_clients(id) ON DELETE SET NULL,
  user_email text,
  full_name text,
  client_name text,
  site_summary text,
  project_summary text,
  recipient_email text,
  user_agent text,
  event_kind text NOT NULL DEFAULT 'client_login',
  delivery_status text NOT NULL DEFAULT 'sent',
  error_message text,
  signed_in_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.portal_login_notifications TO authenticated;
GRANT ALL ON public.portal_login_notifications TO service_role;
ALTER TABLE public.portal_login_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "login notifications admin read" ON public.portal_login_notifications
  FOR SELECT TO authenticated USING (private.portal_is_admin());

CREATE INDEX portal_login_notifications_user_time_idx
  ON public.portal_login_notifications (user_id, created_at DESC);