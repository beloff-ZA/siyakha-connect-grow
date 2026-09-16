ALTER TABLE public.portal_share_links DROP CONSTRAINT IF EXISTS portal_share_links_resource_type_check;
ALTER TABLE public.portal_share_links
  ADD CONSTRAINT portal_share_links_resource_type_check
  CHECK (resource_type IN ('proposal','costing','boq','project_pack','report','floor_plan_view','site_delivery'));