-- Tighten companies INSERT policy to require authenticated users only
DO $$
BEGIN
  -- Drop and recreate the INSERT policy on companies
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'Users can create companies'
  ) THEN
    DROP POLICY "Users can create companies" ON public.companies;
  END IF;

  CREATE POLICY "Users can create companies"
  ON public.companies
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
END $$;

-- Create email_sends table for rate limiting and auditing of edge email usage
CREATE TABLE IF NOT EXISTS public.email_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text,
  to_emails text[] NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS and fully deny client access by default
ALTER TABLE public.email_sends ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_sends' AND policyname = 'email_sends_select_none'
  ) THEN
    CREATE POLICY "email_sends_select_none" ON public.email_sends FOR SELECT USING (false);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_sends' AND policyname = 'email_sends_modify_none'
  ) THEN
    CREATE POLICY "email_sends_modify_none" ON public.email_sends FOR ALL USING (false) WITH CHECK (false);
  END IF;
END $$;

-- Add trigger to automatically add company creator as admin (if missing)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'companies_add_creator_admin'
  ) THEN
    CREATE TRIGGER companies_add_creator_admin
    AFTER INSERT ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.add_creator_as_company_admin();
  END IF;
END $$;

-- Add trigger to set support_call company_id automatically from membership when not provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'support_calls_set_company_id'
  ) THEN
    CREATE TRIGGER support_calls_set_company_id
    BEFORE INSERT ON public.support_calls
    FOR EACH ROW
    EXECUTE FUNCTION public.set_support_call_company_id();
  END IF;
END $$;