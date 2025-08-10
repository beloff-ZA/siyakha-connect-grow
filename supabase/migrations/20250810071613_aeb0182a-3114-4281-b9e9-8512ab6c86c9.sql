-- Enable triggers, backfill data, add indexes, and enable realtime for dashboard features

-- 1) Ensure updated_at triggers and company_id auto-assignment on support_calls
-- Drop and recreate to avoid duplicates
DROP TRIGGER IF EXISTS set_support_call_company_id_before_insert ON public.support_calls;
CREATE TRIGGER set_support_call_company_id_before_insert
BEFORE INSERT ON public.support_calls
FOR EACH ROW
EXECUTE FUNCTION public.set_support_call_company_id();

DROP TRIGGER IF EXISTS update_support_calls_updated_at ON public.support_calls;
CREATE TRIGGER update_support_calls_updated_at
BEFORE UPDATE ON public.support_calls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON public.quotes;
CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Backfill company_id on existing support_calls from earliest membership per user
WITH first_membership AS (
  SELECT DISTINCT ON (user_id) user_id, company_id
  FROM public.company_members
  ORDER BY user_id, created_at ASC, id ASC
)
UPDATE public.support_calls sc
SET company_id = fm.company_id
FROM first_membership fm
WHERE sc.company_id IS NULL
  AND sc.user_id = fm.user_id;

-- 3) Performance indexes for common dashboard queries
CREATE INDEX IF NOT EXISTS idx_support_calls_company_status_created_at
  ON public.support_calls (company_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_calls_user_created_at
  ON public.support_calls (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_company_status_created_at
  ON public.quotes (company_id, status, created_at DESC);

-- 4) Ensure realtime sends full rows and publication includes tables
ALTER TABLE public.support_calls REPLICA IDENTITY FULL;
ALTER TABLE public.quotes REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.support_calls';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.quotes';
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;