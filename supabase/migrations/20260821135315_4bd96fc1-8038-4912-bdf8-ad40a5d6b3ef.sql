update public.portal_floors
set notes = '11th storey rooftop / service level derived from the Council Submission dated 12 August 2026 (LTK 207_353, drawing LA-100). No communications rack allocated at this level — final riser and home-rack route for rooftop devices remains pending the site survey. Device allocation is shown live from the current design.',
    updated_at = now()
where project_id = 'c1a11e00-0000-4000-8000-0000000000a1' and level_number = 11;

update public.portal_floors
set notes = 'Ground storey / entry level derived from the Council Submission dated 12 August 2026 (LTK 207_353, drawing LA-100). Hosts the ground-floor communications rack and fibre aggregation. Device allocation is shown live from the current design.',
    updated_at = now()
where project_id = 'c1a11e00-0000-4000-8000-0000000000a1' and level_number = 0;