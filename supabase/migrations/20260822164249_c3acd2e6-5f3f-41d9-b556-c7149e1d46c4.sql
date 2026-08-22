ALTER TABLE public.portal_projects
  ADD COLUMN IF NOT EXISTS building_details jsonb;

ALTER TABLE public.portal_plan_revisions
  ADD COLUMN IF NOT EXISTS drawing_number text,
  ADD COLUMN IF NOT EXISTS drawing_title text,
  ADD COLUMN IF NOT EXISTS drawing_scale text,
  ADD COLUMN IF NOT EXISTS issue_date date,
  ADD COLUMN IF NOT EXISTS approval_status text;