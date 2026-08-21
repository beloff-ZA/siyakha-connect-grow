UPDATE public.portal_building_levels
SET plan_image_path = replace(plan_image_path, 'plans/353-anton-lembede/', 'c1a11e00-0000-4000-8000-0000000000a1/plans/')
WHERE plan_image_path LIKE 'plans/353-anton-lembede/%';