-- Add slug column for human-readable shop URLs
ALTER TABLE sellers ADD COLUMN IF NOT EXISTS slug VARCHAR(100);

-- Trigger function: auto-generate slug before INSERT
CREATE OR REPLACE FUNCTION auto_set_seller_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  new_slug  TEXT;
  counter   INT := 2;
BEGIN
  IF NEW.slug IS NOT NULL AND NEW.slug != '' THEN
    RETURN NEW;
  END IF;

  base_slug := lower(NEW.shop_name);
  base_slug := regexp_replace(base_slug, '[^a-z0-9\s\-]', '', 'g');
  base_slug := regexp_replace(base_slug, '\s+',            '-', 'g');
  base_slug := regexp_replace(base_slug, '-{2,}',          '-', 'g');
  base_slug := trim(both '-' from base_slug);
  IF base_slug = '' THEN base_slug := 'kedai'; END IF;

  new_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM sellers WHERE slug = new_slug) LOOP
    new_slug := base_slug || '-' || counter;
    counter  := counter + 1;
  END LOOP;

  NEW.slug := new_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_seller_slug ON sellers;
CREATE TRIGGER set_seller_slug
  BEFORE INSERT ON sellers
  FOR EACH ROW EXECUTE FUNCTION auto_set_seller_slug();

-- Backfill slugs for existing sellers (ordered by created_at for determinism)
DO $$
DECLARE
  rec       RECORD;
  base_slug TEXT;
  new_slug  TEXT;
  counter   INT;
BEGIN
  FOR rec IN SELECT id, shop_name FROM sellers WHERE slug IS NULL ORDER BY created_at LOOP
    base_slug := lower(rec.shop_name);
    base_slug := regexp_replace(base_slug, '[^a-z0-9\s\-]', '', 'g');
    base_slug := regexp_replace(base_slug, '\s+',            '-', 'g');
    base_slug := regexp_replace(base_slug, '-{2,}',          '-', 'g');
    base_slug := trim(both '-' from base_slug);
    IF base_slug = '' THEN base_slug := 'kedai'; END IF;

    new_slug := base_slug;
    counter  := 2;
    WHILE EXISTS (SELECT 1 FROM sellers WHERE slug = new_slug) LOOP
      new_slug := base_slug || '-' || counter;
      counter  := counter + 1;
    END LOOP;

    UPDATE sellers SET slug = new_slug WHERE id = rec.id;
  END LOOP;
END $$;

-- Unique index (after backfill so no conflicts during ALTER)
CREATE UNIQUE INDEX IF NOT EXISTS sellers_slug_unique ON sellers(slug);
