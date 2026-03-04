
-- Drop RLS policies first
DROP POLICY IF EXISTS "Anyone can submit job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Only admins can view job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;

-- Drop tables (job_applications references jobs, so drop it first)
DROP TABLE IF EXISTS public.job_applications;
DROP TABLE IF EXISTS public.jobs;
