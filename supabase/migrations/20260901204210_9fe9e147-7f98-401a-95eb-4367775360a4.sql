CREATE TABLE public.website_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','qualified','won','lost')),
  source text NOT NULL DEFAULT 'website',
  landing_page text,
  referrer text,
  service text NOT NULL,
  location text NOT NULL,
  full_name text NOT NULL,
  company text,
  work_email text NOT NULL,
  phone text,
  whatsapp text,
  project_description text NOT NULL,
  budget_range text,
  timeline text,
  consent boolean NOT NULL DEFAULT false,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  gclid text,
  follow_up_notes text,
  contacted_at timestamptz,
  notification_status text NOT NULL DEFAULT 'pending' CHECK (notification_status IN ('pending','sent','failed','skipped')),
  notification_error text,
  ip_hash text,
  user_agent text,
  dedupe_key text
);

GRANT SELECT, UPDATE ON public.website_leads TO authenticated;
GRANT ALL ON public.website_leads TO service_role;

ALTER TABLE public.website_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read website leads"
  ON public.website_leads FOR SELECT TO authenticated
  USING (private.portal_is_admin());

CREATE POLICY "Admins can update website leads"
  ON public.website_leads FOR UPDATE TO authenticated
  USING (private.portal_is_admin())
  WITH CHECK (private.portal_is_admin());

CREATE UNIQUE INDEX website_leads_dedupe_key_idx ON public.website_leads (dedupe_key) WHERE dedupe_key IS NOT NULL;
CREATE INDEX website_leads_created_at_idx ON public.website_leads (created_at DESC);
CREATE INDEX website_leads_status_idx ON public.website_leads (status);
CREATE INDEX website_leads_ip_hash_idx ON public.website_leads (ip_hash, created_at DESC);

CREATE TRIGGER website_leads_set_updated_at
  BEFORE UPDATE ON public.website_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();