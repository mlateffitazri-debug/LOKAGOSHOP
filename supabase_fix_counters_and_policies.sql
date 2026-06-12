-- =============================================
-- LOKALGO — FIX: seller counters & buyer testimonial visibility
-- Run in Supabase SQL Editor:
-- https://app.supabase.com/project/kuepdjxaomcjyyhyanfk/editor
--
-- Why: view_count / wa_click_count were updated directly from the
-- visitor's browser session, but RLS (sellers_own_write) only allows
-- the shop owner to update their own row — so visitor counts were
-- silently never recorded. These SECURITY DEFINER functions bypass
-- RLS safely (increment only, no arbitrary writes).
-- =============================================

-- ─── 1. Shop profile view counter ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_seller_view_count(p_seller_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE sellers
  SET view_count = coalesce(view_count, 0) + 1
  WHERE id = p_seller_id;
$$;

-- ─── 2. WhatsApp click counter ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_seller_wa_click(p_seller_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE sellers
  SET wa_click_count = coalesce(wa_click_count, 0) + 1
  WHERE id = p_seller_id;
$$;

-- ─── 3. Buyers can read their OWN testimonials (incl. pending) ────────────────
-- Without this, /testimonials only shows approved reviews because the
-- public-read policy filters is_approved = true.
DROP POLICY IF EXISTS "testimonials_buyer_read" ON testimonials;
CREATE POLICY "testimonials_buyer_read" ON testimonials
  FOR SELECT USING (
    buyer_id IN (SELECT id FROM buyers WHERE user_id = auth.uid())
  );

-- ─── 4. VERIFY ────────────────────────────────────────────────────────────────
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('increment_seller_view_count', 'increment_seller_wa_click');
