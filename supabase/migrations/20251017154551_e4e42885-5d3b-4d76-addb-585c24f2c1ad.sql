-- Create storage bucket for cached audio files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'audio-cache',
  'audio-cache',
  true,
  5242880, -- 5MB limit per file
  ARRAY['audio/mpeg', 'audio/mp3']
);

-- Allow public read access to audio files (they're not sensitive)
CREATE POLICY "Public can read cached audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio-cache');

-- Allow service role to insert audio (from edge functions)
CREATE POLICY "Service can upload audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'audio-cache');