-- Make the report-images bucket public so verified images can be displayed on the map
UPDATE storage.buckets SET public = true WHERE id = 'report-images';

-- Add UPDATE policy for reports table (needed when updating with verification results)
CREATE POLICY "Anyone can update reports"
ON public.reports
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Simplify storage SELECT policy - public bucket means anyone can view
DROP POLICY IF EXISTS "Only verified report images are accessible" ON storage.objects;