-- 1) Enum for contact types
DO $$ BEGIN
  CREATE TYPE public.contact_type AS ENUM ('primary','billing','technical','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Company contacts table
CREATE TABLE IF NOT EXISTS public.company_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  position text,
  type contact_type NOT NULL DEFAULT 'primary',
  is_primary boolean NOT NULL DEFAULT false,
  preferred_comms text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.company_contacts ENABLE ROW LEVEL SECURITY;

-- RLS: company members full CRUD
CREATE POLICY IF NOT EXISTS company_contacts_select_members
ON public.company_contacts FOR SELECT
USING (public.is_company_member(company_id));

CREATE POLICY IF NOT EXISTS company_contacts_insert_members
ON public.company_contacts FOR INSERT
WITH CHECK (public.is_company_member(company_id));

CREATE POLICY IF NOT EXISTS company_contacts_update_members
ON public.company_contacts FOR UPDATE
USING (public.is_company_member(company_id))
WITH CHECK (public.is_company_member(company_id));

CREATE POLICY IF NOT EXISTS company_contacts_delete_members
ON public.company_contacts FOR DELETE
USING (public.is_company_member(company_id));

-- 3) Company invites table
CREATE TABLE IF NOT EXISTS public.company_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  email text NOT NULL,
  role company_role NOT NULL DEFAULT 'member',
  token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.company_invites ENABLE ROW LEVEL SECURITY;

-- Members can view their company invites
CREATE POLICY IF NOT EXISTS company_invites_select_members
ON public.company_invites FOR SELECT
USING (public.is_company_member(company_id));

-- Only company admins can create/delete invites
CREATE POLICY IF NOT EXISTS company_invites_insert_admins
ON public.company_invites FOR INSERT
WITH CHECK (public.is_company_admin(company_id));

CREATE POLICY IF NOT EXISTS company_invites_delete_admins
ON public.company_invites FOR DELETE
USING (public.is_company_admin(company_id));

-- Disallow direct updates via RLS (handled by function)
DROP POLICY IF EXISTS company_invites_update_any ON public.company_invites;

-- 4) Functions for invites
CREATE OR REPLACE FUNCTION public.create_company_invite(_company_id uuid, _email text, _role company_role DEFAULT 'member')
RETURNS TABLE (id uuid, token uuid) AS $$
BEGIN
  IF NOT public.is_company_admin(_company_id) THEN
    RAISE EXCEPTION 'Only company admins can invite' USING errcode = '42501';
  END IF;
  INSERT INTO public.company_invites (company_id, email, role)
  VALUES (_company_id, _email, _role)
  RETURNING company_invites.id, company_invites.token INTO id, token;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.accept_company_invite(_token uuid)
RETURNS uuid AS $$
DECLARE
  _invite RECORD;
  _authed_email text;
  _company_id uuid;
BEGIN
  SELECT lower(raw_user_meta_data->>'email') FROM auth.users WHERE id = auth.uid() INTO _authed_email;
  IF _authed_email IS NULL THEN
    -- Fallback: auth.email() helper for service contexts
    SELECT lower(auth.email()) INTO _authed_email;
  END IF;

  SELECT * FROM public.company_invites WHERE token = _token AND accepted_at IS NULL LIMIT 1 INTO _invite;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found or already accepted' USING errcode = '22023';
  END IF;

  IF lower(_invite.email) <> lower(_authed_email) THEN
    RAISE EXCEPTION 'This invite is for a different email address' USING errcode = '42501';
  END IF;

  _company_id := _invite.company_id;

  -- Add membership if missing
  INSERT INTO public.company_members (company_id, user_id, role)
  VALUES (_invite.company_id, auth.uid(), _invite.role)
  ON CONFLICT (company_id, user_id) DO NOTHING;

  UPDATE public.company_invites SET accepted_at = now() WHERE id = _invite.id;

  RETURN _company_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 5) Update profiles with position & role title
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN position text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE public.profiles ADD COLUMN role_title text;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 6) Add triggers for updated_at where applicable
DO $$ BEGIN
  CREATE TRIGGER trg_company_contacts_updated
  BEFORE UPDATE ON public.company_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_companies_updated
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 7) Storage policies for company logos
-- Public read (bucket already public, but ensure explicit policy)
DO $$ BEGIN
  CREATE POLICY company_logos_public_read ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'company-logos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Authenticated members can manage files in their company folder: company-logos/{company_id}/...
DO $$ BEGIN
  CREATE POLICY company_logos_insert_members ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'company-logos'
    AND public.is_company_member(((storage.foldername(name))[1])::uuid)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY company_logos_update_members ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND public.is_company_member(((storage.foldername(name))[1])::uuid)
  )
  WITH CHECK (
    bucket_id = 'company-logos'
    AND public.is_company_member(((storage.foldername(name))[1])::uuid)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY company_logos_delete_members ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'company-logos'
    AND public.is_company_member(((storage.foldername(name))[1])::uuid)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;