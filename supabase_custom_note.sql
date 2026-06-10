-- Custom note feature for sellers
-- Run in Supabase SQL Editor: https://app.supabase.com/project/kuepdjxaomcjyyhyanfk/editor

ALTER TABLE sellers ADD COLUMN IF NOT EXISTS custom_note TEXT DEFAULT NULL;
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS custom_note_updated_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE sellers
  ADD CONSTRAINT sellers_custom_note_length
  CHECK (custom_note IS NULL OR char_length(custom_note) <= 120);

-- RLS: seller can update their own custom_note (existing update policy may already cover this)
-- If you have row-level security enabled and need a specific policy:
-- CREATE POLICY "seller_update_custom_note" ON sellers
--   FOR UPDATE USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id);
