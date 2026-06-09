-- =============================================
-- LOKALGO SHOP — SUPABASE SCHEMA
-- Run ini dalam Supabase SQL Editor
-- =============================================

-- BUYERS
create table buyers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  name text not null,
  email text not null unique,
  whatsapp_number text,
  kawasan text,
  address_rumah text,
  address_pejabat text,
  created_at timestamptz default now()
);

-- SELLERS
create table sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  shop_name text not null,
  email text,
  whatsapp_number text not null unique,
  taman_name text not null,
  postcode text not null,
  kawasan text,
  profile_image_url text,
  pickup_instruction text,
  badge text not null default 'seller_baharu' check (badge in ('seller_baharu','seller_aktif','verified_seller')),
  status text not null default 'pending' check (status in ('pending','active','suspended','rejected')),
  is_open boolean default true,
  view_count integer default 0,
  wa_click_count integer default 0,
  testimonial_count integer default 0,
  months_active integer default 0,
  created_at timestamptz default now(),
  approved_at timestamptz
);

-- PRODUCTS
create table products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers(id) on delete cascade,
  name text,
  category text not null,
  description text,
  price_from decimal(10,2),
  unit text,
  images text[] default '{}',
  is_available boolean default true,
  is_preorder boolean default false,
  min_qty_preorder integer,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now()
);

-- TESTIMONIALS
create table testimonials (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers(id) on delete cascade,
  buyer_id uuid references buyers(id) on delete set null,
  buyer_name text not null default 'Pembeli LokalGo',
  buyer_kawasan text,
  rating integer check (rating between 1 and 5),
  content text not null,
  is_approved boolean default false,
  created_at timestamptz default now()
);

-- SUSPENDED SELLERS
create table suspended_sellers (
  id uuid primary key default gen_random_uuid(),
  whatsapp_number text not null,
  seller_id uuid references sellers(id) on delete set null,
  suspend_date timestamptz default now(),
  reason text,
  appeal_status text check (appeal_status in ('pending','approved','rejected')),
  appeal_text text,
  cooldown_until timestamptz,
  permanent_ban boolean default false
);

-- ADMIN MESSAGES (inbox seller)
create table admin_messages (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid references sellers(id) on delete cascade,
  type text not null check (type in ('warning','info','flag','success')),
  title text not null,
  body text not null,
  is_read boolean default false,
  sent_at timestamptz default now()
);

-- T&C ACCEPTANCE LOG (PDPA compliance)
create table tnc_acceptance_log (
  id uuid primary key default gen_random_uuid(),
  whatsapp_number text not null,
  ip_address text,
  user_agent text,
  accepted_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table buyers enable row level security;
alter table sellers enable row level security;
alter table products enable row level security;
alter table testimonials enable row level security;
alter table suspended_sellers enable row level security;
alter table admin_messages enable row level security;

-- Buyers: boleh baca data sendiri sahaja
create policy "buyers_own" on buyers
  for all using (auth.uid() = user_id);

-- Sellers: public boleh baca active sellers
create policy "sellers_public_read" on sellers
  for select using (status = 'active');

create policy "sellers_own_write" on sellers
  for all using (auth.uid() = user_id);

-- Products: public boleh baca approved products
create policy "products_public_read" on products
  for select using (status = 'approved');

-- Testimonials: public boleh baca approved
create policy "testimonials_public_read" on testimonials
  for select using (is_approved = true);

-- Admin messages: seller boleh baca inbox sendiri
create policy "admin_messages_seller_read" on admin_messages
  for select using (
    seller_id in (
      select id from sellers where user_id = auth.uid()
    )
  );

-- =============================================
-- NIGHTLY BADGE CHECK FUNCTION
-- Run via Supabase cron (pg_cron)
-- =============================================

create or replace function check_badge_upgrade()
returns void as $$
begin
  -- Upgrade ke seller_aktif
  update sellers set badge = 'seller_aktif'
  where status = 'active'
    and badge = 'seller_baharu'
    and testimonial_count >= 5
    and months_active >= 3
    and id not in (select seller_id from suspended_sellers where suspend_date > now() - interval '6 months');

  -- Upgrade ke verified_seller
  update sellers set badge = 'verified_seller'
  where status = 'active'
    and badge = 'seller_aktif'
    and testimonial_count >= 10
    and months_active >= 6
    and id not in (select seller_id from suspended_sellers where suspend_date > now() - interval '12 months');
end;
$$ language plpgsql security definer;
