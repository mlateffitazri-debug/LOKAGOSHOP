-- FIX: sellers.is_open NULL values cause buyers to see "kedai tutup"
-- NULL was treated as falsy by !seller.is_open in shop/page.tsx
-- Run in Supabase SQL Editor if not applied via migration runner

-- Set all active sellers with NULL is_open to TRUE (open by default)
UPDATE sellers
SET is_open = true
WHERE status = 'active'
  AND is_open IS NULL;

-- Ensure future rows default to false (seller must explicitly open)
ALTER TABLE sellers
  ALTER COLUMN is_open SET DEFAULT false;
