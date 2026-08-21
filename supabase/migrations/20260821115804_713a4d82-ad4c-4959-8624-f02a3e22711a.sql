-- Final rack allocation correction: Level 0-10 only, no rack on Level 11 (rooftop/service).
-- Supersedes the original 12-rack seed. Idempotent.
DO $$
DECLARE
  v_project uuid := 'c1a11e00-0000-4000-8000-0000000000a1';
  r record;
BEGIN
  FOR r IN
    SELECT m.id, m.label, m.floor_id, f.display_name
    FROM public.portal_floor_markers m
    JOIN public.portal_floors f ON f.id = m.floor_id
    WHERE m.project_id = v_project
      AND m.marker_type = 'rack'::public.portal_marker_kind
      AND f.level_number > 10
  LOOP
    INSERT INTO public.portal_floor_marker_history (
      marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail
    ) VALUES (
      NULL, r.floor_id, NULL, 'admin', 'siyakha_admin', 'rack_removed',
      format('%s removed from %s - final rack allocation is one 6U rack on Level 0 through Level 10 only; the rooftop/service level carries no floor rack.',
             r.label, r.display_name)
    );

    DELETE FROM public.portal_floor_marker_history WHERE marker_id = r.id;
    DELETE FROM public.portal_floor_markers WHERE id = r.id;
  END LOOP;
END $$;