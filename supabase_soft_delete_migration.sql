-- =============================================
-- LOKALGO — SOFT DELETE + MANUAL ONBOARD MIGRATION
-- Run in Supabase SQL Editor:
-- https://app.supabase.com/project/kuepdjxaomcjyyhyanfk/editor
-- =============================================

-- ─── 1. ADD deleted_at TO KEY TABLES ──────────────────────────────────────────
ALTER TABLE sellers      ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE buyers       ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- ─── 2. UPDATE RLS — EXCLUDE DELETED RECORDS FROM PUBLIC VIEWS ────────────────

-- Sellers: public browse only sees active + not deleted
DROP POLICY IF EXISTS "sellers_public_read" ON sellers;
CREATE POLICY "sellers_public_read" ON sellers
  FOR SELECT USING (status = 'active' AND deleted_at IS NULL);

-- Sellers: own seller can still see their own record
DROP POLICY IF EXISTS "sellers_own_read" ON sellers;
CREATE POLICY "sellers_own_read" ON sellers
  FOR SELECT USING (auth.uid() = user_id);

-- Testimonials: exclude deleted from public
DROP POLICY IF EXISTS "testimonials_public_read" ON testimonials;
CREATE POLICY "testimonials_public_read" ON testimonials
  FOR SELECT USING (is_approved = true AND deleted_at IS NULL);

-- ─── 3. VERIFY ────────────────────────────────────────────────────────────────
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'deleted_at'
ORDER BY table_name;
