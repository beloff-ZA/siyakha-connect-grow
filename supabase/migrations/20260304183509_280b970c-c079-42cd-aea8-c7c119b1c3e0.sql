
CREATE TABLE public.director_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  source text,
  source_id text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.director_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access notifications" ON public.director_notifications
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));

CREATE TABLE public.director_sent_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  to_email text NOT NULL,
  to_name text,
  subject text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.director_sent_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access sent_emails" ON public.director_sent_emails
  AS RESTRICTIVE FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));
