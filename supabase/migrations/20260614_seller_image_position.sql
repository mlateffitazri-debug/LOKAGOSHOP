ALTER TABLE sellers
  ADD COLUMN IF NOT EXISTS profile_image_position_x NUMERIC DEFAULT 50,
  ADD COLUMN IF NOT EXISTS profile_image_position_y NUMERIC DEFAULT 50;
