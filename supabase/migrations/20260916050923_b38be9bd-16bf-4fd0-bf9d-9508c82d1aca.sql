ALTER TABLE public.portal_site_updates
  ADD COLUMN IF NOT EXISTS photo_evidence_required boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS photo_evidence_override_reason text,
  ADD COLUMN IF NOT EXISTS photo_evidence_override_by uuid,
  ADD COLUMN IF NOT EXISTS photo_evidence_override_at timestamptz;

ALTER TABLE public.portal_site_update_photos
  ADD COLUMN IF NOT EXISTS timestamp_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS original_filename text,
  ADD COLUMN IF NOT EXISTS original_storage_path text,
  ADD COLUMN IF NOT EXISTS original_file_size bigint,
  ADD COLUMN IF NOT EXISTS exif_captured_at timestamptz,
  ADD COLUMN IF NOT EXISTS uploaded_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS portal_site_update_photos_update_idx
  ON public.portal_site_update_photos (update_id);