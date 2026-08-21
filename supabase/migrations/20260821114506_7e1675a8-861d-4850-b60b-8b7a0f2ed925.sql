DO $$
DECLARE
  v_project uuid := 'c1a11e00-0000-4000-8000-0000000000a1';
  f record;
  v_label text;
  v_id uuid;
  v_sort integer;
BEGIN
  FOR f IN
    SELECT id, level_number, display_name
    FROM public.portal_floors
    WHERE project_id = v_project
    ORDER BY level_number
  LOOP
    v_label := 'RACK-L' || lpad(f.level_number::text, 2, '0') || '-01';

    CONTINUE WHEN EXISTS (
      SELECT 1 FROM public.portal_floor_markers
      WHERE floor_id = f.id
        AND (marker_type = 'rack'::public.portal_marker_kind OR label = v_label)
    );

    SELECT coalesce(max(sort_order), 0) + 1 INTO v_sort
    FROM public.portal_floor_markers WHERE floor_id = f.id;

    INSERT INTO public.portal_floor_markers (
      floor_id, project_id, marker_type, x_norm, y_norm, label,
      equipment, model, status, client_visible, description, notes,
      sort_order, direction_deg, fov_deg, coverage_range
    ) VALUES (
      f.id, v_project, 'rack'::public.portal_marker_kind, 0.5000, 0.5000, v_label,
      '6U Wall-Mount Network Rack', '6U', 'planned'::public.portal_marker_state, true,
      'Floor telecommunications rack serving local Wi-Fi, CCTV and structured cabling.',
      'Provisional placement — move to the approved rack location before final sign-off.',
      v_sort, 0, 90, 'medium'
    ) RETURNING id INTO v_id;

    INSERT INTO public.portal_floor_marker_history (
      marker_id, floor_id, actor_user_id, actor_type, actor_role, action, detail,
      new_x_norm, new_y_norm
    ) VALUES (
      v_id, f.id, NULL, 'admin', 'siyakha_admin', 'rack_created',
      format('%s (6U Wall-Mount Network Rack) added to %s as provisional project setup at (0.5000, 0.5000) - pending approved rack position.',
             v_label, f.display_name),
      0.5000, 0.5000
    );
  END LOOP;
END $$;