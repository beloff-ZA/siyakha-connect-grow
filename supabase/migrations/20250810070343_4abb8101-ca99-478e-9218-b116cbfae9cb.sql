
-- 1) Ensure updated_at is maintained on relevant tables
DROP TRIGGER IF EXISTS set_timestamp_companies ON public.companies;
CREATE TRIGGER set_timestamp_companies
BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_timestamp_support_calls ON public.support_calls;
CREATE TRIGGER set_timestamp_support_calls
BEFORE UPDATE ON public.support_calls
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_timestamp_quotes ON public.quotes;
CREATE TRIGGER set_timestamp_quotes
BEFORE UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS set_timestamp_profiles ON public.profiles;
CREATE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Auto-assign company_id on new support calls based on the user's earliest membership
DROP TRIGGER IF EXISTS set_company_on_support_call ON public.support_calls;
CREATE TRIGGER set_company_on_support_call
BEFORE INSERT ON public.support_calls
FOR EACH ROW EXECUTE FUNCTION public.set_support_call_company_id();

-- 3) Seed companies from existing profiles (company_name)
--    Only create companies for non-empty profile.company_name values that don't already exist by name
WITH to_create AS (
  SELECT DISTINCT TRIM(p.company_name) AS company_name
  FROM public.profiles p
  WHERE p.company_name IS NOT NULL AND TRIM(p.company_name) <> ''
),
dedup AS (
  SELECT t.company_name
  FROM to_create t
  LEFT JOIN public.companies c ON c.name = t.company_name
  WHERE c.id IS NULL
)
INSERT INTO public.companies (name)
SELECT d.company_name
FROM dedup d;

-- 4) Create company memberships for users based on their profile.company_name
--    (skip users already linked to that company)
INSERT INTO public.company_members (company_id, user_id, role)
SELECT c.id, p.id, 'member'::company_role
FROM public.profiles p
JOIN public.companies c ON c.name = p.company_name
LEFT JOIN public.company_members m
  ON m.company_id = c.id AND m.user_id = p.id
WHERE p.company_name IS NOT NULL
  AND TRIM(p.company_name) <> ''
  AND m.id IS NULL;

-- 5) Backfill existing support calls with a company_id based on the caller's membership
--    Use the earliest membership (aligns with set_support_call_company_id)
WITH first_membership AS (
  SELECT
    cm.user_id,
    cm.company_id,
    MIN(cm.created_at) AS first_at
  FROM public.company_members cm
  GROUP BY cm.user_id, cm.company_id
)
UPDATE public.support_calls sc
SET company_id = fm.company_id
FROM first_membership fm
WHERE sc.company_id IS NULL
  AND sc.user_id = fm.user_id;

