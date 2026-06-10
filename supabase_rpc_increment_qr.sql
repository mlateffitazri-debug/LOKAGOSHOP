-- Run this in Supabase SQL Editor
CREATE OR REPLACE FUNCTION increment_qr_download_count()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE support_stats SET qr_download_count = qr_download_count + 1 WHERE id = 1;
$$;
