-- Atomic, fail-closed view counter for guest share links.
CREATE OR REPLACE FUNCTION public.portal_share_register_view(_share_link_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.portal_share_links
     SET access_count = coalesce(access_count, 0) + 1,
         first_accessed_at = coalesce(first_accessed_at, now()),
         last_accessed_at = now()
   WHERE id = _share_link_id;
$$;

REVOKE ALL ON FUNCTION public.portal_share_register_view(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.portal_share_register_view(uuid) TO service_role;

-- Verifies a storage path really belongs to the shared project before signing.
CREATE OR REPLACE FUNCTION public.portal_share_path_allowed(_project_id uuid, _path text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT _path IS NOT NULL
     AND _path LIKE ('projects/' || _project_id::text || '/%')
     AND (
       EXISTS (
         SELECT 1 FROM public.portal_floors f
          WHERE f.project_id = _project_id AND f.plan_image_path = _path AND f.client_visible
       )
       OR EXISTS (
         SELECT 1 FROM public.portal_plan_revisions r
          WHERE r.project_id = _project_id AND r.image_path = _path
            AND r.client_visible AND r.archived_at IS NULL
       )
       OR EXISTS (
         SELECT 1 FROM public.portal_photos p
          WHERE p.project_id = _project_id AND p.storage_path = _path
       )
     );
$$;

REVOKE ALL ON FUNCTION public.portal_share_path_allowed(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.portal_share_path_allowed(uuid, text) TO service_role;