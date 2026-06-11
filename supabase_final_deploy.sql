-- =============================================
-- LOKALGO SHOP — FINAL DEPLOYMENT SQL
-- Run ONCE in Supabase SQL Editor:
-- https://app.supabase.com/project/kuepdjxaomcjyyhyanfk/editor
--
-- WARNING: This drops and recreates all app tables.
-- auth.users (Google sign-in accounts) are NOT affected.
-- =============================================

-- ─── 1. DROP EXISTING TABLES (reverse FK order) ───────────────────────────────
drop table if exists testimonials       cascade;
drop table if exists admin_messages     cascade;
drop table if exists suspended_sellers  cascade;
drop table if exists products           cascade;
drop table if exists tnc_acceptance_log cascade;
drop table if exists sellers            cascade;
drop table if exists buyers             cascade;
drop table if exists support_stats      cascade;

-- ─── 2. BUYERS ────────────────────────────────────────────────────────────────
create table buyers (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        references auth.users(id) on delete cascade unique,
  name             text        not null,
  email            text        not null unique,
  whatsapp_number  text,
  kawasan          text,
  address_rumah    text,
  address_pejabat  text,
  created_at       timestamptz default now()
);

-- ─── 3. SELLERS ───────────────────────────────────────────────────────────────
create table sellers (
  id                       uuid             primary key default gen_random_uuid(),
  user_id                  uuid             references auth.users(id) on delete set null,
  shop_name                text             not null,
  email                    text,
  whatsapp_number          text             not null unique,
  taman_name               text             not null,
  postcode                 text             not null default '00000',
  kawasan                  text,
  profile_image_url        text,
  pickup_instruction       text,
  custom_note              text             check (custom_note is null or char_length(custom_note) <= 120),
  custom_note_updated_at   timestamptz,
  latitude                 double precision,
  longitude                double precision,
  permanent_ban            boolean          not null default false,
  badge                    text             not null default 'seller_baharu'
                             check (badge in ('seller_baharu', 'seller_aktif', 'verified_seller')),
  status                   text             not null default 'pending'
                             check (status in ('pending', 'active', 'suspended', 'rejected')),
  is_open                  boolean          not null default false,
  is_demo                  boolean          not null default false,
  view_count               integer          not null default 0,
  wa_click_count           integer          not null default 0,
  testimonial_count        integer          not null default 0,
  months_active            integer          not null default 0,
  created_at               timestamptz      default now(),
  approved_at              timestamptz
);

-- ─── 4. PRODUCTS ──────────────────────────────────────────────────────────────
create table products (
  id               uuid         primary key default gen_random_uuid(),
  seller_id        uuid         references sellers(id) on delete cascade,
  name             text,
  category         text         not null,
  description      text,
  price_from       decimal(10,2),
  unit             text,
  images           text[]       default '{}',
  is_available     boolean      default true,
  is_preorder      boolean      default false,
  min_qty_preorder integer,
  is_demo          boolean      not null default false,
  status           text         default 'pending'
                     check (status in ('pending', 'approved', 'rejected')),
  created_at       timestamptz  default now()
);

-- ─── 5. TESTIMONIALS ──────────────────────────────────────────────────────────
create table testimonials (
  id            uuid        primary key default gen_random_uuid(),
  seller_id     uuid        references sellers(id) on delete cascade,
  buyer_id      uuid        references buyers(id) on delete set null,
  buyer_name    text        not null default 'Pembeli LokalGo',
  buyer_kawasan text,
  rating        integer     check (rating between 1 and 5),
  content       text        not null,
  is_approved   boolean     default false,
  created_at    timestamptz default now()
);

-- ─── 6. SUSPENDED SELLERS ─────────────────────────────────────────────────────
create table suspended_sellers (
  id               uuid        primary key default gen_random_uuid(),
  whatsapp_number  text        not null,
  seller_id        uuid        references sellers(id) on delete set null,
  suspend_date     timestamptz default now(),
  reason           text,
  appeal_status    text        check (appeal_status in ('pending', 'approved', 'rejected')),
  appeal_text      text,
  cooldown_until   timestamptz,
  permanent_ban    boolean     default false
);

-- ─── 7. ADMIN MESSAGES (seller inbox) ─────────────────────────────────────────
create table admin_messages (
  id         uuid        primary key default gen_random_uuid(),
  seller_id  uuid        references sellers(id) on delete cascade,
  type       text        not null check (type in ('warning', 'info', 'flag', 'success')),
  title      text        not null,
  body       text        not null,
  is_read    boolean     default false,
  sent_at    timestamptz default now()
);

-- ─── 8. T&C ACCEPTANCE LOG (PDPA) ─────────────────────────────────────────────
create table tnc_acceptance_log (
  id               uuid        primary key default gen_random_uuid(),
  whatsapp_number  text        not null,
  ip_address       text,
  user_agent       text,
  accepted_at      timestamptz default now()
);

-- ─── 9. SUPPORT STATS (sokong page / QR download counter) ─────────────────────
create table support_stats (
  id                 integer     primary key,
  qr_download_count  integer     not null default 0,
  updated_at         timestamptz default now()
);
-- Singleton row
insert into support_stats (id, qr_download_count) values (1, 0);

-- ─── 10. ROW LEVEL SECURITY ───────────────────────────────────────────────────
alter table buyers             enable row level security;
alter table sellers            enable row level security;
alter table products           enable row level security;
alter table testimonials       enable row level security;
alter table suspended_sellers  enable row level security;
alter table admin_messages     enable row level security;
alter table tnc_acceptance_log enable row level security;
alter table support_stats      enable row level security;

-- Buyers: own data only
create policy "buyers_own" on buyers
  for all using (auth.uid() = user_id);

-- Sellers: anyone can read active sellers (public browse)
create policy "sellers_public_read" on sellers
  for select using (status = 'active');

-- Sellers: own seller can read their record at any status (dashboard / onboarding redirect)
create policy "sellers_own_read" on sellers
  for select using (auth.uid() = user_id);

-- Sellers: own seller can insert/update their record
create policy "sellers_own_write" on sellers
  for all using (auth.uid() = user_id);

-- Products: anyone can read approved products
create policy "products_public_read" on products
  for select using (status = 'approved');

-- Products: seller can manage their own products
create policy "products_seller_own" on products
  for all using (
    seller_id in (select id from sellers where user_id = auth.uid())
  );

-- Testimonials: anyone can read approved testimonials
create policy "testimonials_public_read" on testimonials
  for select using (is_approved = true);

-- Testimonials: seller can read all testimonials for their shop
create policy "testimonials_seller_read" on testimonials
  for select using (
    seller_id in (select id from sellers where user_id = auth.uid())
  );

-- Admin messages: seller can read their own inbox
create policy "admin_messages_seller_read" on admin_messages
  for select using (
    seller_id in (select id from sellers where user_id = auth.uid())
  );

-- Admin messages: seller can mark as read
create policy "admin_messages_seller_update" on admin_messages
  for update using (
    seller_id in (select id from sellers where user_id = auth.uid())
  );

-- Support stats: public read (displays QR download count)
create policy "support_stats_public_read" on support_stats
  for select using (true);

-- ─── 11. FUNCTIONS ────────────────────────────────────────────────────────────

-- Nightly badge upgrade (schedule via pg_cron or Supabase Edge Function cron)
create or replace function check_badge_upgrade()
returns void as $$
begin
  -- Upgrade to seller_aktif
  update sellers set badge = 'seller_aktif'
  where status = 'active'
    and badge = 'seller_baharu'
    and testimonial_count >= 5
    and months_active >= 3
    and id not in (
      select seller_id from suspended_sellers
      where seller_id is not null
        and suspend_date > now() - interval '6 months'
    );

  -- Upgrade to verified_seller
  update sellers set badge = 'verified_seller'
  where status = 'active'
    and badge = 'seller_aktif'
    and testimonial_count >= 10
    and months_active >= 6
    and id not in (
      select seller_id from suspended_sellers
      where seller_id is not null
        and suspend_date > now() - interval '12 months'
    );
end;
$$ language plpgsql security definer;

-- QR download counter (called from Edge Function or RPC)
create or replace function increment_qr_download_count()
returns void
language sql
security definer
as $$
  update support_stats
  set qr_download_count = qr_download_count + 1,
      updated_at = now()
  where id = 1;
$$;

-- ─── 12. VERIFY ───────────────────────────────────────────────────────────────
select
  table_name,
  count(*) as column_count
from information_schema.columns
where table_schema = 'public'
  and table_name in ('sellers','buyers','products','testimonials',
                     'suspended_sellers','admin_messages','tnc_acceptance_log','support_stats')
group by table_name
order by table_name;
