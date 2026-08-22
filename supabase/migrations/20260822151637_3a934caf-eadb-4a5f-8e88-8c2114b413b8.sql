-- Legacy marker mutators are now unreachable from browsers: every plan change
-- goes through portal_marker_transaction / portal_place_cameras.
REVOKE EXECUTE ON FUNCTION public.portal_move_floor_markers(jsonb) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.portal_update_camera_optics(jsonb) FROM authenticated, anon;

-- Archived devices must never appear in a client's plan.
DROP POLICY IF EXISTS "clients read visible floor markers" ON public.portal_floor_markers;
CREATE POLICY "clients read visible floor markers"
  ON public.portal_floor_markers
  FOR SELECT
  TO authenticated
  USING (client_visible AND archived_at IS NULL AND private.portal_can_read_floor(floor_id));