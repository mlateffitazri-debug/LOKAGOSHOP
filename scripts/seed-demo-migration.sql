-- LokalGo Demo Seed Migration
-- Run ONCE in Supabase SQL Editor before running `npm run seed:demo`
-- https://app.supabase.com/project/kuepdjxaomcjyyhyanfk/editor

ALTER TABLE sellers  ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT false;

-- Verify
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('sellers','products') AND column_name = 'is_demo'
ORDER BY table_name;
