-- Create storage bucket for report images
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true);

-- Allow anyone to view images (public bucket)
CREATE POLICY "Report images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'report-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload report images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'report-images' AND auth.role() = 'authenticated');

-- Allow users to delete their own images
CREATE POLICY "Users can delete their own report images"
ON storage.objects FOR DELETE
USING (bucket_id = 'report-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  image_url TEXT NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('pothole', 'waste', 'water', 'other', 'spam', 'pending')),
  title TEXT NOT NULL,
  confidence INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  is_spam BOOLEAN DEFAULT false,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'resolved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Anyone can view verified, non-spam reports
CREATE POLICY "Anyone can view verified reports"
ON public.reports FOR SELECT
USING (verified = true AND is_spam = false);

-- Authenticated users can create reports
CREATE POLICY "Authenticated users can create reports"
ON public.reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports
CREATE POLICY "Users can update their own reports"
ON public.reports FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for reports
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;