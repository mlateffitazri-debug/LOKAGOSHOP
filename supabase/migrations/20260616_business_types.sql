-- LokalGo business types and free-plan listing limits.
-- Additive/backward-compatible: existing sellers and products remain FOOD.

ALTER TABLE sellers
  ADD COLUMN IF NOT EXISTS business_type text NOT NULL DEFAULT 'FOOD',
  ADD COLUMN IF NOT EXISTS plan_type text NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS listing_limit integer NOT NULL DEFAULT 5;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS listing_type text NOT NULL DEFAULT 'FOOD';

UPDATE sellers
SET business_type = 'FOOD'
WHERE business_type IS NULL
   OR business_type NOT IN ('FOOD', 'SERVICE', 'PRODUCT', 'HOMESTAY');

UPDATE sellers
SET plan_type = 'free'
WHERE plan_type IS NULL
   OR plan_type NOT IN ('free', 'pro');

UPDATE sellers
SET listing_limit = 5
WHERE listing_limit IS NULL
   OR listing_limit < 0;

UPDATE products
SET listing_type = 'FOOD'
WHERE listing_type IS NULL
   OR listing_type NOT IN ('FOOD', 'SERVICE', 'PRODUCT', 'HOMESTAY');

ALTER TABLE sellers
  DROP CONSTRAINT IF EXISTS sellers_business_type_check,
  DROP CONSTRAINT IF EXISTS sellers_plan_type_check,
  DROP CONSTRAINT IF EXISTS sellers_listing_limit_check;

ALTER TABLE sellers
  ADD CONSTRAINT sellers_business_type_check
    CHECK (business_type IN ('FOOD', 'SERVICE', 'PRODUCT', 'HOMESTAY')),
  ADD CONSTRAINT sellers_plan_type_check
    CHECK (plan_type IN ('free', 'pro')),
  ADD CONSTRAINT sellers_listing_limit_check
    CHECK (listing_limit >= 0);

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_listing_type_check;

ALTER TABLE products
  ADD CONSTRAINT products_listing_type_check
    CHECK (listing_type IN ('FOOD', 'SERVICE', 'PRODUCT', 'HOMESTAY'));

CREATE INDEX IF NOT EXISTS sellers_business_type_idx ON sellers(business_type);
CREATE INDEX IF NOT EXISTS products_listing_type_idx ON products(listing_type);

-- Keep seller-owned browser updates from changing plan/type controls.
-- Server routes using service_role can still set these values intentionally.
CREATE OR REPLACE FUNCTION protect_seller_plan_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    NEW.business_type := OLD.business_type;
    NEW.plan_type := OLD.plan_type;
    NEW.listing_limit := OLD.listing_limit;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_seller_plan_fields_before_update ON sellers;
CREATE TRIGGER protect_seller_plan_fields_before_update
  BEFORE UPDATE ON sellers
  FOR EACH ROW
  EXECUTE FUNCTION protect_seller_plan_fields();

REVOKE EXECUTE ON FUNCTION protect_seller_plan_fields() FROM anon, authenticated;

-- Enforce the free-plan listing limit for direct browser inserts.
-- The app's server route also enforces this, but this closes the direct Supabase insert path.
CREATE OR REPLACE FUNCTION enforce_product_listing_rules()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  seller_business_type text;
  seller_plan_type text;
  seller_listing_limit integer;
  current_listing_count integer;
BEGIN
  SELECT business_type, plan_type, listing_limit
    INTO seller_business_type, seller_plan_type, seller_listing_limit
  FROM sellers
  WHERE id = NEW.seller_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  IF auth.role() IS DISTINCT FROM 'service_role' THEN
    NEW.listing_type := COALESCE(seller_business_type, 'FOOD');

    IF COALESCE(seller_plan_type, 'free') = 'free'
       AND NEW.status IN ('pending', 'approved') THEN
      SELECT COUNT(*)
        INTO current_listing_count
      FROM products
      WHERE seller_id = NEW.seller_id
        AND status IN ('pending', 'approved');

      IF current_listing_count >= COALESCE(seller_listing_limit, 5) THEN
        RAISE EXCEPTION 'Free plan allows up to 5 listings only. Upgrade to LokalGo Pro to add more.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_product_listing_rules_before_insert ON products;
CREATE TRIGGER enforce_product_listing_rules_before_insert
  BEFORE INSERT ON products
  FOR EACH ROW
  EXECUTE FUNCTION enforce_product_listing_rules();

REVOKE EXECUTE ON FUNCTION enforce_product_listing_rules() FROM anon, authenticated;
