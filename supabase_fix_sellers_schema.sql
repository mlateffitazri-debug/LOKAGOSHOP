-- Migration: ensure sellers table has all required columns
-- Run this in Supabase SQL editor to fix schema mismatch

ALTER TABLE sellers
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS shop_name text,
  ADD COLUMN IF NOT EXISTS taman_name text,
  ADD COLUMN IF NOT EXISTS kawasan text,
  ADD COLUMN IF NOT EXISTS postcode text DEFAULT '00000',
  ADD COLUMN IF NOT EXISTS profile_image_url text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS badge text DEFAULT 'seller_baharu',
  ADD COLUMN IF NOT EXISTS is_open boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS testimonial_count integer NOT NULL DEFAULT 0;

-- Ensure status column has valid constraint
ALTER TABLE sellers
  DROP CONSTRAINT IF EXISTS sellers_status_check;

ALTER TABLE sellers
  ADD CONSTRAINT sellers_status_check
  CHECK (status IN ('pending', 'active', 'suspended', 'rejected'));

-- Index for common lookups
CREATE INDEX IF NOT EXISTS sellers_user_id_idx ON sellers(user_id);
CREATE INDEX IF NOT EXISTS sellers_status_idx ON sellers(status);
