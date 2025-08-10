-- Ensure triggers exist to support company profiles and memberships
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_companies_add_creator_as_company_admin'
  ) THEN
    CREATE TRIGGER on_companies_add_creator_as_company_admin
    AFTER INSERT ON public.companies
    FOR EACH ROW
    EXECUTE FUNCTION public.add_creator_as_company_admin();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'before_insert_support_calls_set_company'
  ) THEN
    CREATE TRIGGER before_insert_support_calls_set_company
    BEFORE INSERT ON public.support_calls
    FOR EACH ROW
    EXECUTE FUNCTION public.set_support_call_company_id();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_handle_new_user'
  ) THEN
    CREATE TRIGGER on_auth_user_created_handle_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;