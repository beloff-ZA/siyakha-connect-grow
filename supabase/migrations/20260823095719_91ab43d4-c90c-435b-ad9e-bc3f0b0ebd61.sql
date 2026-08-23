CREATE TABLE IF NOT EXISTS public.portal_deck_view_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  share_link_id uuid,
  viewer_id uuid,
  idempotency_key text NOT NULL UNIQUE,
  recipient text NOT NULL,
  subject text,
  delivery_status text NOT NULL DEFAULT 'pending',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS portal_deck_view_notifications_project_idx
  ON public.portal_deck_view_notifications (project_id, created_at DESC);

GRANT SELECT ON public.portal_deck_view_notifications TO authenticated;
GRANT ALL ON public.portal_deck_view_notifications TO service_role;

ALTER TABLE public.portal_deck_view_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read deck view notifications" ON public.portal_deck_view_notifications;
CREATE POLICY "admins read deck view notifications"
  ON public.portal_deck_view_notifications
  FOR SELECT
  TO authenticated
  USING (private.portal_is_admin());