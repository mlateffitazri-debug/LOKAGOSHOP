-- Add soft-delete column to key tables (idempotent)
ALTER TABLE sellers      ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE buyers       ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Update RLS policies to exclude soft-deleted records (idempotent via DROP IF EXISTS)
DROP POLICY IF EXISTS "sellers_public_read" ON sellers;
CREATE POLICY "sellers_public_read" ON sellers
  FOR SELECT USING (status = 'active' AND deleted_at IS NULL);

DROP POLICY IF EXISTS "sellers_own_read" ON sellers;
CREATE POLICY "sellers_own_read" ON sellers
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "testimonials_public_read" ON testimonials;
CREATE POLICY "testimonials_public_read" ON testimonials
  FOR SELECT USING (is_approved = true AND deleted_at IS NULL);
