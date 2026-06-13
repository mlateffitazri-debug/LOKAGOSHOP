-- RPC: increment seller view count (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION increment_seller_view_count(p_seller_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE sellers
  SET view_count = coalesce(view_count, 0) + 1
  WHERE id = p_seller_id;
$$;

-- RPC: increment seller WA click count (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION increment_seller_wa_click(p_seller_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE sellers
  SET wa_click_count = coalesce(wa_click_count, 0) + 1
  WHERE id = p_seller_id;
$$;
