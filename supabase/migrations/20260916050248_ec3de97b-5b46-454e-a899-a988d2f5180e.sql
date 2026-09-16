ALTER TABLE public.portal_site_updates
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS photos_outstanding boolean NOT NULL DEFAULT false;

INSERT INTO public.portal_site_updates (
  id, project_id, floor_id, area_label, shift_date, submitted_by_name, source, category,
  work_completed, work_outstanding, notes, progress_pct, next_shift_plan,
  photos_outstanding, client_visible, approval_status, approved_at, published_at
) VALUES (
  'e1000000-0000-4000-8000-00000000d201',
  'e1000000-0000-4000-8000-00000000d1c3',
  NULL,
  NULL,
  '2026-09-14',
  'Siyakha Technology Solutions',
  'admin',
  'Procurement',
  'Siyakha purchased 15 x 30 mm PVC pipes, 100 x 5 mm cable ties and 15 x elbow joints for 30 mm PVC pipe.',
  NULL,
  'Materials procured for the containment and cable routing installation.',
  0,
  NULL,
  false,
  true,
  'approved',
  now(),
  now()
), (
  'e1000000-0000-4000-8000-00000000d202',
  'e1000000-0000-4000-8000-00000000d1c3',
  (SELECT id FROM public.portal_floors
    WHERE project_id = 'e1000000-0000-4000-8000-00000000d1c3' AND display_name = 'Fifth Floor' LIMIT 1),
  NULL,
  '2026-09-15',
  'Siyakha Technology Solutions',
  'admin',
  'Site Work',
  'The team installed the 9 PVC pipes allocated to the Fifth Floor. Routing was extremely challenging, and most of the routing challenges were resolved and finalised.',
  'Fifth Floor completion expected 16 September 2026.',
  'Progress images were outstanding at the time of this entry and were to be added the following morning.',
  0,
  'Complete the Fifth Floor on 16 September 2026.',
  true,
  true,
  'approved',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;