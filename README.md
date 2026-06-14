# LokalGo Shop — Setup Guide

## 1. Install dependencies

```bash
npm install
```

## 2. Setup environment variables

```bash
cp .env.local.example .env.local
```

Isi nilai dalam `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` — dari Supabase Dashboard > Settings > API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — dari Supabase Dashboard > Settings > API
- `SUPABASE_SERVICE_ROLE_KEY` — dari Supabase Dashboard > Settings > API (jangan expose ke client!)
- `RESEND_API_KEY` — dari resend.com (untuk admin broadcast email)

## 3. Setup Supabase

1. Pergi Supabase Dashboard > SQL Editor
2. Copy paste kandungan `supabase_final_deploy.sql` (atau `supabase_schema.sql` untuk schema asas sahaja)
3. Run semua
4. Kemudian jalankan semua fail dalam folder `supabase/migrations/` mengikut tertib nama fail (tarikh ascending):
   - `20260613_platform_settings.sql`
   - `20260613_rpc_counters.sql`
   - `20260613_fix_is_open_null.sql`
   - `20260614_seller_image_position.sql`
   - `20260614_soft_delete.sql`

### Storage Buckets

Buat bucket berikut dalam Supabase Dashboard > Storage:

| Bucket | Public | Kegunaan |
|--------|--------|----------|
| `product-images` | Ya | Gambar produk seller |
| `profile-images` | Ya | Gambar profil seller |

## 4. Setup Google OAuth dalam Supabase

1. Supabase Dashboard > Authentication > Providers > Google
2. Enable Google
3. Masukkan Client ID dan Secret dari Google Cloud Console
4. Redirect URL: `https://your-project.supabase.co/auth/v1/callback`

## 5. Run development server

```bash
npm run dev
```

Buka http://localhost:3000

## 6. Deploy ke Vercel

```bash
npx vercel
```

Tambah semua environment variables dalam Vercel Dashboard.

---

## Folder Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Splash / redirect
│   ├── auth/               # Login page
│   ├── home/               # Home page
│   ├── shop/               # Shop detail page
│   ├── produk/             # Product detail page
│   ├── search/             # Search results
│   ├── saved/              # Saved shops
│   ├── profile/            # Buyer profile
│   ├── alamat/             # Delivery address settings
│   ├── sokong/             # Support developer page
│   ├── notifikasi/         # Notifications
│   ├── inbox/              # Seller inbox
│   ├── onboarding/         # Seller onboarding (4 steps)
│   ├── seller/             # Seller dashboard + edit
│   ├── admin/              # Admin panel
│   └── testimoni/          # Testimonial submit
├── components/
│   ├── ui/                 # Base UI components
│   ├── layout/             # Header, navigation
│   ├── seller/             # Seller-specific components
│   ├── buyer/              # Buyer-specific components
│   ├── admin/              # Admin components
│   └── shared/             # Shared across roles
├── lib/
│   ├── supabase/           # Supabase clients (browser + server)
│   ├── utils/              # Helper functions
│   └── i18n/              # BM/English translations
├── hooks/                  # Custom React hooks
├── types/                  # TypeScript types
└── styles/                 # Global CSS
```
