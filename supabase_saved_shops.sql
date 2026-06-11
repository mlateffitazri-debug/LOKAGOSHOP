-- =============================================
-- LOKALGO — saved_shops TABLE
-- Run in Supabase SQL Editor:
-- https://app.supabase.com/project/kuepdjxaomcjyyhyanfk/editor
-- =============================================

-- ─── 1. CREATE TABLE ──────────────────────────────────────────────────────────
create table if not exists saved_shops (
  id          uuid        primary key default gen_random_uuid(),
  buyer_id    uuid        references buyers(id) on delete cascade,
  shop_id     uuid        references sellers(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (buyer_id, shop_id)
);

-- ─── 2. ROW LEVEL SECURITY ────────────────────────────────────────────────────
alter table saved_shops enable row level security;

-- Buyers can read their own saved shops
create policy "saved_shops_buyer_read" on saved_shops
  for select using (
    buyer_id in (select id from buyers where user_id = auth.uid())
  );

-- Buyers can insert their own saves
create policy "saved_shops_buyer_insert" on saved_shops
  for insert with check (
    buyer_id in (select id from buyers where user_id = auth.uid())
  );

-- Buyers can delete their own saves
create policy "saved_shops_buyer_delete" on saved_shops
  for delete using (
    buyer_id in (select id from buyers where user_id = auth.uid())
  );

-- ─── 3. INDEX for fast lookup ─────────────────────────────────────────────────
create index if not exists idx_saved_shops_buyer on saved_shops (buyer_id);
create index if not exists idx_saved_shops_shop  on saved_shops (shop_id);

-- ─── 4. VERIFY ────────────────────────────────────────────────────────────────
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'saved_shops'
order by ordinal_position;
