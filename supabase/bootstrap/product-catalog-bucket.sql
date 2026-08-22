-- Product-catalogue storage bucket bootstrap (idempotent).
--
-- Storage bucket rows cannot be created from the managed migration pipeline, so
-- this script is kept in the repo and must be run once against a fresh
-- environment (it is already applied on the live environment). Re-running it is
-- safe: it only ever converges the bucket to private, 15 MB, image/PDF.
--
--   psql "$SUPABASE_DB_URL" -f supabase/bootstrap/product-catalog-bucket.sql
--
-- The matching storage.objects access rule ("product catalog admin manage",
-- Siyakha administrators only) is created by the normal migration pipeline.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-catalog',
  'product-catalog',
  false,
  15728640, -- 15 MB
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
  SET public = false,
      file_size_limit = 15728640,
      allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf'];
