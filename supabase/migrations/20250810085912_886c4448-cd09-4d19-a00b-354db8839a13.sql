-- M1 Migration: roles, companies extensions, sites table, storage bucket and policies

-- 1) Create global app roles and user_roles table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM (
    'siyakha_admin',
    'dispatcher',
    'technician',
    'client_msp',
    'client_non_msp',
    'team_member'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Function to check if a user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = _user_id AND ur.role = _role
  );
$$;

-- Policies for user_roles
DO $$ BEGIN
  CREATE POLICY user_roles_select_self ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY user_roles_manage_by_admin ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'siyakha_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'siyakha_admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Extend companies with logo and preferences
DO $$ BEGIN
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS logo_url text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS arrival_notification_recipients text[] NOT NULL DEFAULT '{}';
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS sla_tier text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS preferred_comms text;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS working_hours jsonb NOT NULL DEFAULT '{}'::jsonb;
  ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS access_instructions text;
END $$;

-- 3) Sites table
CREATE TABLE IF NOT EXISTS public.sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  site_ref text,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  latitude double precision,
  longitude double precision,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;

-- RLS policies for sites (members of company can CRUD)
DO $$ BEGIN
  CREATE POLICY sites_select_members ON public.sites
  FOR SELECT TO authenticated
  USING (public.is_company_member(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY sites_insert_members ON public.sites
  FOR INSERT TO authenticated
  WITH CHECK (public.is_company_member(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY sites_update_members ON public.sites
  FOR UPDATE TO authenticated
  USING (public.is_company_member(company_id))
  WITH CHECK (public.is_company_member(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY sites_delete_members ON public.sites
  FOR DELETE TO authenticated
  USING (public.is_company_member(company_id));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER set_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) Storage bucket for company logos and policies
-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for company logos
DO $$ BEGIN
  CREATE POLICY "Public read for company logos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'company-logos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Members can upload/update/delete logos within their company folder
-- Expect object path like `${company_id}/filename.ext`
DO $$ BEGIN
  CREATE POLICY "Company members can upload logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'company-logos'
    AND public.is_company_member((storage.foldername(name))[1]::uuid)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Company members can update logos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND public.is_company_member((storage.foldername(name))[1]::uuid)
  )
  WITH CHECK (
    bucket_id = 'company-logos'
    AND public.is_company_member((storage.foldername(name))[1]::uuid)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Company members can delete logos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND public.is_company_member((storage.foldername(name))[1]::uuid)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;