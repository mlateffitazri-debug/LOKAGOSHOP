-- Fix product names: populate name column from description where name is null or equals category
-- Run in Supabase SQL Editor: https://app.supabase.com/project/kuepdjxaomcjyyhyanfk/editor

-- Step 1: Inspect current state
SELECT id, name, category, LEFT(description, 60) AS desc_preview
FROM products
WHERE name IS NULL OR name = category
LIMIT 20;

-- Step 2: Set name from first segment of description (before " - " separator)
-- Only update rows where name is null or matches the category (i.e., was never set)
UPDATE products
SET name = TRIM(SPLIT_PART(description, ' - ', 1))
WHERE (name IS NULL OR name = category)
  AND description IS NOT NULL
  AND TRIM(SPLIT_PART(description, ' - ', 1)) != ''
  AND TRIM(SPLIT_PART(description, ' - ', 1)) != category;

-- Step 3: Verify the fix
SELECT id, name, category, LEFT(description, 60) AS desc_preview
FROM products
ORDER BY created_at DESC
LIMIT 20;
