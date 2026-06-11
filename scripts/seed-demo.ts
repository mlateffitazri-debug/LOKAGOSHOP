/**
 * LokalGo Demo Seed Script
 * Run: npm run seed:demo
 *
 * Prerequisites:
 *   1. Run scripts/seed-demo-migration.sql in the Supabase SQL Editor once.
 *   2. SUPABASE_SERVICE_ROLE_KEY must be set in .env.local
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// ─── Config ────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('\n❌  Missing env vars. Ensure .env.local has:')
  console.error('    NEXT_PUBLIC_SUPABASE_URL')
  console.error('    SUPABASE_SERVICE_ROLE_KEY\n')
  process.exit(1)
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── Constants ─────────────────────────────────────────────────────────────

const SELLER_USERS = [
  { email: 'demo-seller1@lokalgo.test', password: 'DemoSeller123!', name: 'Kak Timah' },
  { email: 'demo-seller2@lokalgo.test', password: 'DemoSeller123!', name: 'Pak Samad' },
  { email: 'demo-seller3@lokalgo.test', password: 'DemoSeller123!', name: 'Mak Jah' },
  { email: 'demo-seller4@lokalgo.test', password: 'DemoSeller123!', name: 'Frozen Delights' },
  { email: 'demo-seller5@lokalgo.test', password: 'DemoSeller123!', name: 'Minuman Viral' },
]

const BUYER_USERS = [
  { email: 'demo-buyer1@lokalgo.test', password: 'DemoBuyer123!', name: 'Ali Demo' },
  { email: 'demo-buyer2@lokalgo.test', password: 'DemoBuyer123!', name: 'Siti Demo' },
]

// Stable placeholder food images (picsum is deterministic by seed word)
const IMG = {
  kak_timah:   'https://picsum.photos/seed/kaktimah/400/400',
  frozen:      'https://picsum.photos/seed/frozen/400/400',
  minuman:     'https://picsum.photos/seed/minuman/400/400',
  keklapis:    'https://picsum.photos/seed/keklapis/400/400',
  teh_tarik:   'https://picsum.photos/seed/tehtarik/400/400',
  rendang:     'https://picsum.photos/seed/rendang/400/400',
  nugget:      'https://picsum.photos/seed/nugget/400/400',
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function ok(label: string) { console.log(`  ✓  ${label}`) }
function warn(label: string, msg: unknown) { console.warn(`  ⚠  ${label}: ${String(msg)}`) }

function fatal(label: string, error: unknown): never {
  console.error(`\n❌  FAILED [${label}]: ${String(error)}\n`)
  process.exit(1)
}

// ─── Step 0: verify migration applied ──────────────────────────────────────

async function checkMigration() {
  console.log('\n── Step 0: Checking migration …')
  const { error } = await supabase
    .from('sellers')
    .select('is_demo')
    .limit(1)
  if (error?.message.includes('column') && error.message.includes('is_demo')) {
    console.error('\n❌  is_demo column missing on sellers.')
    console.error('    Run scripts/seed-demo-migration.sql in the Supabase SQL Editor first.\n')
    process.exit(1)
  }
  ok('is_demo columns present')
}

// ─── Step 1: clean existing demo data ──────────────────────────────────────

async function cleanExisting() {
  console.log('\n── Step 1: Cleaning existing demo rows …')

  // Products first (FK → sellers)
  const { error: pe } = await supabase.from('products').delete().eq('is_demo', true)
  if (pe) warn('products clean', pe.message)
  else ok('products cleaned')

  // Testimonials referencing demo sellers
  const { data: demoSellers } = await supabase
    .from('sellers').select('id').eq('is_demo', true)
  if (demoSellers?.length) {
    const ids = demoSellers.map((s: { id: string }) => s.id)
    const { error: te } = await supabase.from('testimonials').delete().in('seller_id', ids)
    if (te) warn('testimonials clean', te.message)
    else ok('testimonials cleaned')
  }

  // Sellers
  const { error: se } = await supabase.from('sellers').delete().eq('is_demo', true)
  if (se) warn('sellers clean', se.message)
  else ok('sellers cleaned')

  // Auth users by email suffix
  const allEmails = [...SELLER_USERS, ...BUYER_USERS].map((u) => u.email)
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const toDelete = (existingUsers?.users ?? []).filter((u) =>
    allEmails.includes(u.email ?? ''),
  )
  for (const u of toDelete) {
    const { error: ue } = await supabase.auth.admin.deleteUser(u.id)
    if (ue) warn(`delete user ${u.email}`, ue.message)
    else ok(`deleted auth user ${u.email}`)
  }
}

// ─── Step 2: create auth users ─────────────────────────────────────────────

type UserRecord = { id: string; email: string }

async function createUsers(): Promise<Map<string, string>> {
  console.log('\n── Step 2: Creating auth users …')
  const map = new Map<string, string>() // email → user_id

  for (const u of [...SELLER_USERS, ...BUYER_USERS]) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { full_name: u.name },
      })
      if (error) fatal(`createUser ${u.email}`, error.message)
      map.set(u.email, data.user.id)
      ok(`${u.email}`)
    } catch (e) {
      fatal(`createUser ${u.email}`, e)
    }
  }
  return map
}

// ─── Step 3: create sellers ────────────────────────────────────────────────

type ShopKey = 'timah' | 'samad' | 'jah' | 'frozen' | 'minuman'

async function createSellers(
  userMap: Map<string, string>,
): Promise<Map<ShopKey, string>> {
  console.log('\n── Step 3: Creating sellers …')
  const map = new Map<ShopKey, string>()

  const rows = [
    {
      key: 'timah' as ShopKey,
      email: 'demo-seller1@lokalgo.test',
      payload: {
        shop_name: '[DEMO] Resepi Kak Timah',
        whatsapp_number: '60111234501',
        taman_name: 'Taman Desa Baiduri',
        postcode: '41150',
        kawasan: 'Klang',
        badge: 'verified_seller',
        status: 'active',
        is_open: true,
        view_count: 145,
        wa_click_count: 32,
        testimonial_count: 3,
        months_active: 8,
        pickup_instruction: 'Hari ni cuaca hujan, sediakan payung',
        
        profile_image_url: IMG.kak_timah,
        approved_at: new Date(Date.now() - 8 * 30 * 24 * 3600 * 1000).toISOString(),
        is_demo: true,
      },
    },
    {
      key: 'samad' as ShopKey,
      email: 'demo-seller2@lokalgo.test',
      payload: {
        shop_name: '[DEMO] Dapur Pak Samad',
        whatsapp_number: '60111234502',
        taman_name: 'Taman Sri Muda',
        postcode: '40150',
        kawasan: 'Shah Alam',
        badge: 'seller_aktif',
        status: 'active',
        is_open: true,
        view_count: 67,
        wa_click_count: 14,
        testimonial_count: 0,
        months_active: 4,
        pickup_instruction: null,
        profile_image_url: null, // tests gradient+initial fallback
        approved_at: new Date(Date.now() - 4 * 30 * 24 * 3600 * 1000).toISOString(),
        is_demo: true,
      },
    },
    {
      key: 'jah' as ShopKey,
      email: 'demo-seller3@lokalgo.test',
      payload: {
        shop_name: '[DEMO] Kuih Mak Jah',
        whatsapp_number: '60111234503',
        taman_name: 'Taman Puteri',
        postcode: '68000',
        kawasan: 'Ampang',
        badge: 'seller_baharu',
        status: 'active',
        is_open: false, // CLOSED — must not appear on home
        view_count: 12,
        wa_click_count: 2,
        testimonial_count: 0,
        months_active: 1,
        pickup_instruction: null,
        profile_image_url: null,
        approved_at: new Date(Date.now() - 1 * 30 * 24 * 3600 * 1000).toISOString(),
        is_demo: true,
      },
    },
    {
      key: 'frozen' as ShopKey,
      email: 'demo-seller4@lokalgo.test',
      payload: {
        shop_name: '[DEMO] Frozen Delights',
        whatsapp_number: '60111234504',
        taman_name: 'Taman Melati',
        postcode: '53100',
        kawasan: 'Setapak',
        badge: 'seller_baharu',
        status: 'active',
        is_open: true,
        view_count: 34,
        wa_click_count: 8,
        testimonial_count: 0,
        months_active: 2,
        pickup_instruction: null,
        profile_image_url: IMG.frozen,
        approved_at: new Date(Date.now() - 2 * 30 * 24 * 3600 * 1000).toISOString(),
        is_demo: true,
      },
    },
    {
      key: 'minuman' as ShopKey,
      email: 'demo-seller5@lokalgo.test',
      payload: {
        shop_name: '[DEMO] Minuman Viral KL',
        whatsapp_number: '60111234505',
        taman_name: 'Bangsar South',
        postcode: '59200',
        kawasan: 'Kuala Lumpur',
        badge: 'verified_seller',
        status: 'active',
        is_open: true,
        view_count: 289,
        wa_click_count: 75,
        testimonial_count: 7,
        months_active: 14,
        pickup_instruction: null,
        profile_image_url: IMG.minuman,
        approved_at: new Date(Date.now() - 14 * 30 * 24 * 3600 * 1000).toISOString(),
        is_demo: true,
      },
    },
  ]

  for (const row of rows) {
    const userId = userMap.get(row.email)
    if (!userId) fatal(`seller user_id for ${row.email}`, 'user not found in map')

    const { data, error } = await supabase
      .from('sellers')
      .insert({ ...row.payload, user_id: userId })
      .select('id')
      .single()

    if (error) fatal(`seller ${row.payload.shop_name}`, error.message)
    map.set(row.key, data.id)
    ok(`${row.payload.shop_name} (${row.payload.is_open ? 'OPEN' : 'CLOSED'}, ${row.payload.badge})`)
  }

  return map
}

// ─── Step 4: create products ───────────────────────────────────────────────

type ProductMode = 'direct' | 'preorder' | 'both' | 'hidden'

interface ProductRow {
  name: string
  category: string
  description: string
  price_from: number
  unit: string
  mode: ProductMode
  images?: string[]
}

function modeFlags(mode: ProductMode) {
  return {
    direct:   { is_available: true,  is_preorder: false },
    preorder: { is_available: false, is_preorder: true  },
    both:     { is_available: true,  is_preorder: true  },
    hidden:   { is_available: false, is_preorder: false },
  }[mode]
}

async function createProducts(sellerMap: Map<ShopKey, string>) {
  console.log('\n── Step 4: Creating products …')

  const catalog: Record<ShopKey, ProductRow[]> = {
    timah: [
      { name: 'Kek Lapis Sarawak',       category: 'Pastri & Kek',      description: 'Kek lapis berlapis-lapis, manis dan lembut, saiz penuh.',    price_from: 18, unit: '/loaf',  mode: 'both',     images: [IMG.keklapis] },
      { name: 'Onde-onde Gula Melaka',   category: 'Pastri & Kek',      description: 'Bola pandan berisi gula melaka cair, salut kelapa parut.',   price_from: 2,  unit: '/biji',  mode: 'direct'   },
      { name: 'Rendang Daging Kampung',  category: 'Set Makanan & Lauk', description: 'Rendang daging lembu masak kering, pedas sederhana.',        price_from: 25, unit: '/bekas', mode: 'preorder', images: [IMG.rendang] },
      { name: 'Kuih Seri Muka',          category: 'Pastri & Kek',      description: 'Lapisan pulut bawah, lapisan pandan susu di atas.',           price_from: 3,  unit: '/biji',  mode: 'hidden'   },
      { name: 'Lemang Pulut',            category: 'Set Makanan & Lauk', description: 'Lemang pulut masak dalam buluh, sedap dengan rendang.',      price_from: 15, unit: '/batang',mode: 'direct'   },
    ],
    samad: [
      { name: 'Nasi Lemak Panas',         category: 'Set Makanan & Lauk', description: 'Nasi lemak dengan sambal tumis, ikan bilis, telur rebus.', price_from: 5,  unit: '/pack',  mode: 'direct'   },
      { name: 'Ayam Masak Merah',         category: 'Set Makanan & Lauk', description: 'Ayam masak dengan sos tomato pedas manis.',                price_from: 22, unit: '/bekas', mode: 'preorder' },
      { name: 'Sambal Tumis Ikan Bilis',  category: 'Frozen & Simpanan',  description: 'Sambal ikan bilis homemade, tahan 2 minggu dalam peti.',   price_from: 12, unit: '/botol', mode: 'direct'   },
      { name: 'Perut Ikan Masak Tempoyak',category: 'Set Makanan & Lauk', description: 'Gulai perut ikan dengan tempoyak durian, khas Pahang.',    price_from: 20, unit: '/bekas', mode: 'both'     },
    ],
    jah: [
      { name: 'Kuih Bahulu',  category: 'Pastri & Kek', description: 'Kuih bahulu sarang, rangup luar lembut dalam, rasa vanilla.', price_from: 8,  unit: '/pack', mode: 'direct' },
      { name: 'Donut Gula Icing', category: 'Pastri & Kek', description: 'Donat gebu salut gula icing pelbagai warna.',               price_from: 2,  unit: '/biji', mode: 'direct' },
      { name: 'Kek Batik',    category: 'Pastri & Kek', description: 'Kek batik coklat milo klasik, tidak perlu bakar.',             price_from: 20, unit: '/loaf', mode: 'direct' },
    ],
    frozen: [
      { name: 'Nugget Ayam Homemade',  category: 'Frozen & Simpanan', description: 'Nugget ayam tanpa pengawet, dibuat segar dan dibekukan.',  price_from: 15, unit: '/pack',  mode: 'direct',   images: [IMG.nugget] },
      { name: 'Karipap Kentang Beku',  category: 'Frozen & Simpanan', description: 'Karipap isi kentang masak lemak, beku siap goreng.',      price_from: 12, unit: '/pack',  mode: 'both'     },
      { name: 'Popiah Basah Beku',     category: 'Frozen & Simpanan', description: 'Popiah basah berisi sayur dan udang kering, beku fresh.', price_from: 10, unit: '/pack',  mode: 'preorder' },
      { name: 'Laksa Johor',           category: 'Set Makanan & Lauk', description: 'Laksa Johor berkuah ikan tenggiri dengan mee spaghetti.', price_from: 8,  unit: '/pack',  mode: 'direct'   },
    ],
    minuman: [
      { name: 'Teh Tarik Pekat',         category: 'Minuman',     description: 'Teh tarik pekat dalam botol, bancuh fresh setiap hari.',    price_from: 5, unit: '/botol', mode: 'direct',   images: [IMG.teh_tarik] },
      { name: 'Bandung Rose Homemade',   category: 'Minuman',     description: 'Minuman bandung susu mawar, manis segar, botol 500ml.',    price_from: 4, unit: '/botol', mode: 'direct'   },
      { name: 'Sirap Selasih',           category: 'Minuman',     description: 'Sirap biji selasih homemade, sejuk menyegarkan.',         price_from: 3, unit: '/botol', mode: 'both'     },
      { name: 'Kerepek Ubi Pedas',       category: 'Snek',        description: 'Kerepek ubi kayu pedas manis homemade, rangup tahan lama.', price_from: 8, unit: '/pack',  mode: 'direct'   },
      { name: 'Murukku Rangup',          category: 'Snek',        description: 'Murukku tepung beras rangup, resipi tradisional India.',    price_from: 6, unit: '/pack',  mode: 'direct'   },
      { name: 'Croissant Butter',        category: 'Pastri & Kek', description: 'Croissant mentega berlapis, bakar pagi hari sahaja.',     price_from: 8, unit: '/biji',  mode: 'preorder' },
    ],
  }

  const modeCount: Record<ProductMode, number> = { direct: 0, preorder: 0, both: 0, hidden: 0 }

  for (const [key, products] of Object.entries(catalog) as [ShopKey, ProductRow[]][]) {
    const sellerId = sellerMap.get(key)
    if (!sellerId) { warn(`products for ${key}`, 'seller id missing'); continue }

    for (const p of products) {
      const flags = modeFlags(p.mode)
      const { error } = await supabase.from('products').insert({
        seller_id: sellerId,
        name: p.name,
        category: p.category,
        description: p.description,
        price_from: p.price_from,
        unit: p.unit,
        images: p.images ?? [],
        is_available: flags.is_available,
        is_preorder: flags.is_preorder,
        status: 'approved',
        is_demo: true,
      })
      if (error) warn(`product "${p.name}"`, error.message)
      else {
        modeCount[p.mode]++
        ok(`${p.name} [${p.mode}]`)
      }
    }
  }

  console.log('\n  Product mode counts:')
  for (const [mode, count] of Object.entries(modeCount)) {
    console.log(`    ${mode.padEnd(8)} : ${count}`)
  }
}

// ─── Step 5: create testimonials ───────────────────────────────────────────

async function createTestimonials(sellerMap: Map<ShopKey, string>) {
  console.log('\n── Step 5: Creating testimonials …')

  const testimoniData: { key: ShopKey; reviews: { name: string; kawasan: string; rating: number; content: string }[] }[] = [
    {
      key: 'minuman',
      reviews: [
        { name: 'Pembeli LokalGo', kawasan: 'Bangsar',      rating: 5, content: 'Teh tarik paling sedap pernah cuba! Memang pekat.' },
        { name: 'Pembeli LokalGo', kawasan: 'Cheras',       rating: 5, content: 'Sirap selasih dia segar gila, anak-anak suka.' },
        { name: 'Pembeli LokalGo', kawasan: 'Petaling Jaya', rating: 4, content: 'Penghantaran cepat, packaging kemas. Akan order lagi.' },
        { name: 'Pembeli LokalGo', kawasan: 'KL Sentral',   rating: 5, content: 'Bandung rose dia lain dari yang lain, wangi sangat.' },
        { name: 'Pembeli LokalGo', kawasan: 'Damansara',    rating: 5, content: 'Kerepek ubi memang rangup, tak boleh berhenti makan 😂' },
        { name: 'Pembeli LokalGo', kawasan: 'Subang',       rating: 4, content: 'Croissant butter gebu dan sedap, akan pre-order lagi.' },
        { name: 'Pembeli LokalGo', kawasan: 'Mont Kiara',   rating: 5, content: 'Murukku dia betul-betul crispy. Terima kasih seller!' },
      ],
    },
    {
      key: 'timah',
      reviews: [
        { name: 'Pembeli LokalGo', kawasan: 'Klang',        rating: 4, content: 'Kek lapis Sarawak dia lembut dan tak terlalu manis.' },
        { name: 'Pembeli LokalGo', kawasan: 'Shah Alam',    rating: 4, content: 'Onde-onde masih suam sampai rumah. Sedap!' },
        { name: 'Pembeli LokalGo', kawasan: 'Subang Jaya',  rating: 4, content: 'Rendang daging dia wangi rempah, betul-betul masak kering.' },
      ],
    },
  ]

  for (const { key, reviews } of testimoniData) {
    const sellerId = sellerMap.get(key)
    if (!sellerId) { warn(`testimonials for ${key}`, 'seller id missing'); continue }

    for (const r of reviews) {
      const { error } = await supabase.from('testimonials').insert({
        seller_id: sellerId,
        buyer_id: null,
        buyer_name: r.name,
        buyer_kawasan: r.kawasan,
        rating: r.rating,
        content: r.content,
        is_approved: true,
      })
      if (error) warn(`testimonial for ${key}`, error.message)
      else ok(`[${key}] ★${r.rating} "${r.content.slice(0, 40)}…"`)
    }
  }
}

// ─── Step 6: support stats ─────────────────────────────────────────────────

async function upsertSupportStats() {
  console.log('\n── Step 6: Upserting support_stats …')
  const { error } = await supabase
    .from('support_stats')
    .upsert({ id: 1, qr_download_count: 7 }, { onConflict: 'id' })
  if (error) warn('support_stats', error.message)
  else ok('support_stats qr_download_count = 7')
}

// ─── Summary ───────────────────────────────────────────────────────────────

function printSummary(sellerMap: Map<ShopKey, string>) {
  console.log('\n' + '═'.repeat(62))
  console.log('  DEMO SEED COMPLETE')
  console.log('═'.repeat(62))

  console.log('\n  SELLER ACCOUNTS')
  console.log('  ┌─────────────────────────────────────┬──────────────────┐')
  console.log('  │ Email                               │ Password         │')
  console.log('  ├─────────────────────────────────────┼──────────────────┤')
  for (const u of SELLER_USERS) {
    console.log(`  │ ${u.email.padEnd(35)} │ ${u.password.padEnd(16)} │`)
  }
  console.log('  └─────────────────────────────────────┴──────────────────┘')

  console.log('\n  BUYER ACCOUNTS')
  console.log('  ┌─────────────────────────────────────┬──────────────────┐')
  console.log('  │ Email                               │ Password         │')
  console.log('  ├─────────────────────────────────────┼──────────────────┤')
  for (const u of BUYER_USERS) {
    console.log(`  │ ${u.email.padEnd(35)} │ ${u.password.padEnd(16)} │`)
  }
  console.log('  └─────────────────────────────────────┴──────────────────┘')

  console.log('\n  DEMO SHOPS')
  const shops: [ShopKey, string, string][] = [
    ['timah',   '[DEMO] Resepi Kak Timah',   'OPEN  | verified | custom_note | 5 products (both/direct/preorder/hidden)'],
    ['samad',   '[DEMO] Dapur Pak Samad',    'OPEN  | aktif    | no image   | 4 products (direct/preorder/both)'],
    ['jah',     '[DEMO] Kuih Mak Jah',       'CLOSED| baharu   |            | 3 products (all direct)'],
    ['frozen',  '[DEMO] Frozen Delights',    'OPEN  | baharu   | 0 reviews  | 4 products (direct/preorder/both)'],
    ['minuman', '[DEMO] Minuman Viral KL',   'OPEN  | verified | 7 reviews  | 6 products (direct/preorder/both)'],
  ]
  for (const [key, name, note] of shops) {
    const id = sellerMap.get(key) ?? '—'
    console.log(`\n  ${name}`)
    console.log(`    State  : ${note}`)
    console.log(`    DB id  : ${id}`)
  }

  console.log('\n  MANUAL VERIFY CHECKLIST')
  console.log('  □  Home shows 4 open [DEMO] shops; [DEMO] Kuih Mak Jah absent')
  console.log('  □  Search "teh tarik" returns [DEMO] Minuman Viral KL')
  console.log('  □  Minuman Viral KL shows "Terbaik" rating (4.7 avg)')
  console.log('  □  Resepi Kak Timah shows rating ~4.0 "Memuaskan"')
  console.log('  □  Frozen Delights shows "Belum ada ulasan"')
  console.log('  □  Shop page: Jual Terus / Pre-Order / both chips visible across shops')
  console.log('  □  "Kuih Seri Muka" hidden from buyer, visible in seller1 dashboard')
  console.log('  □  Login demo-seller1 → dashboard shows [DEMO] Resepi Kak Timah')
  console.log('  □  Login demo-buyer1 → tap Dashboard Penjual → invitation sheet')
  console.log('  □  npm run seed:clean → all [DEMO] data removed\n')
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱  LokalGo Demo Seed')
  console.log(`    Supabase: ${SUPABASE_URL}\n`)

  await checkMigration()
  await cleanExisting()
  const userMap  = await createUsers()
  const sellerMap = await createSellers(userMap)
  await createProducts(sellerMap)
  await createTestimonials(sellerMap)
  await upsertSupportStats()
  printSummary(sellerMap)
}

main().catch((e: unknown) => {
  console.error('\n❌  Unexpected error:', e)
  process.exit(1)
})
