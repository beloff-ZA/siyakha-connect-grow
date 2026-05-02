-- 1. Add partner_engineer to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'partner_engineer';

-- 2. partner_engineers table
CREATE TABLE public.partner_engineers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  company_registration TEXT,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'South Africa',
  skills TEXT[] NOT NULL DEFAULT '{}',
  service_regions TEXT[] NOT NULL DEFAULT '{}',
  bio TEXT,
  years_experience INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.partner_engineers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engineers view own profile"
  ON public.partner_engineers FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Engineers insert own profile"
  ON public.partner_engineers FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Engineers update own profile"
  ON public.partner_engineers FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins full access partner_engineers"
  ON public.partner_engineers FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));

CREATE TRIGGER update_partner_engineers_updated_at
  BEFORE UPDATE ON public.partner_engineers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. engineer_certificates table
CREATE TABLE public.engineer_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  engineer_id UUID NOT NULL REFERENCES public.partner_engineers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  issuer TEXT,
  issue_date DATE,
  expiry_date DATE,
  file_path TEXT,
  file_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.engineer_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engineers view own certificates"
  ON public.engineer_certificates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Engineers insert own certificates"
  ON public.engineer_certificates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Engineers delete own certificates"
  ON public.engineer_certificates FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins full access engineer_certificates"
  ON public.engineer_certificates FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'siyakha_admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'siyakha_admin'::app_role));

CREATE INDEX idx_engineer_certificates_engineer ON public.engineer_certificates(engineer_id);

-- 4. Storage bucket for certificates (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('engineer-certificates', 'engineer-certificates', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Engineers upload own certificates"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'engineer-certificates'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Engineers view own certificate files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'engineer-certificates'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR has_role(auth.uid(), 'siyakha_admin'::app_role)
    )
  );

CREATE POLICY "Engineers delete own certificate files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'engineer-certificates'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );