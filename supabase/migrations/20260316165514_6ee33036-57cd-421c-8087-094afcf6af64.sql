
-- Create storage bucket for website order uploads (logos, mockups)
INSERT INTO storage.buckets (id, name, public)
VALUES ('website-orders', 'website-orders', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to upload to website-orders bucket (public form)
CREATE POLICY "Anyone can upload website order files"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'website-orders');

-- Allow anyone to read website order files
CREATE POLICY "Anyone can read website order files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'website-orders');
