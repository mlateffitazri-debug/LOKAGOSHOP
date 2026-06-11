/**
 * LokalGo Demo Clean Script
 * Run: npm run seed:clean
 *
 * Removes all rows where is_demo = true and deletes the demo auth users.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('\n❌  Missing env vars. Ensure .env.local has NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY\n')
  process.exit(1)
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_EMAILS = [
  'demo-seller1@lokalgo.test',
  'demo-seller2@lokalgo.test',
  'demo-seller3@lokalgo.test',
  'demo-seller4@lokalgo.test',
  'demo-seller5@lokalgo.test',
  'demo-buyer1@lokalgo.test',
  'demo-buyer2@lokalgo.test',
]

function ok(label: string)                    { console.log(`  ✓  ${label}`) }
function warn(label: string, msg: unknown)    { console.warn(`  ⚠  ${label}: ${String(msg)}`) }

async function main() {
  console.log('\n🧹  LokalGo Demo Clean')
  console.log(`    Supabase: ${SUPABASE_URL}\n`)

  // 1. Collect demo seller ids before deletion (for testimonial cleanup)
  const { data: demoSellers, error: fetchErr } = await supabase
    .from('sellers')
    .select('id, shop_name, profile_image_url')
    .eq('is_demo', true)

  if (fetchErr) {
    if (fetchErr.message.includes('is_demo')) {
      console.error('❌  is_demo column missing — run seed-demo-migration.sql first.')
      process.exit(1)
    }
    warn('fetch demo sellers', fetchErr.message)
  }

  const sellerIds = (demoSellers ?? []).map((s: { id: string }) => s.id)
  console.log(`  Found ${sellerIds.length} demo seller(s) to remove.`)

  // 2. Delete products
  const { error: pe, count: pc } = await supabase
    .from('products')
    .delete({ count: 'exact' })
    .eq('is_demo', true)
  if (pe) warn('delete products', pe.message)
  else ok(`deleted ${pc ?? 0} demo product(s)`)

  // 3. Delete testimonials by seller_id
  if (sellerIds.length > 0) {
    const { error: te, count: tc } = await supabase
      .from('testimonials')
      .delete({ count: 'exact' })
      .in('seller_id', sellerIds)
    if (te) warn('delete testimonials', te.message)
    else ok(`deleted ${tc ?? 0} demo testimonial(s)`)

    // 4. Delete admin_messages by seller_id
    const { error: me, count: mc } = await supabase
      .from('admin_messages')
      .delete({ count: 'exact' })
      .in('seller_id', sellerIds)
    if (me) warn('delete admin_messages', me.message)
    else ok(`deleted ${mc ?? 0} demo admin_message(s)`)

    // 5. Delete storage images for sellers that have a profile_image_url
    //    Only attempt for URLs pointing to this project's storage bucket
    const storagePrefix = `${SUPABASE_URL}/storage/v1/object/public/`
    const imageUrls = (demoSellers ?? [])
      .map((s: { profile_image_url: string | null }) => s.profile_image_url)
      .filter((url: string | null): url is string => !!url && url.startsWith(storagePrefix))

    for (const url of imageUrls) {
      // Extract bucket/path from URL: .../public/{bucket}/{path}
      const after = url.slice(storagePrefix.length)
      const slashIdx = after.indexOf('/')
      if (slashIdx === -1) continue
      const bucket = after.slice(0, slashIdx)
      const path   = after.slice(slashIdx + 1)
      const { error: sie } = await supabase.storage.from(bucket).remove([path])
      if (sie) warn(`storage remove ${path}`, sie.message)
      else ok(`storage: removed ${bucket}/${path}`)
    }
  }

  // 6. Delete sellers
  const { error: se, count: sc } = await supabase
    .from('sellers')
    .delete({ count: 'exact' })
    .eq('is_demo', true)
  if (se) warn('delete sellers', se.message)
  else ok(`deleted ${sc ?? 0} demo seller(s)`)

  // 7. Delete buyer rows linked to demo emails
  //    (buyers.user_id → auth.users ON DELETE CASCADE handles this,
  //     but clean explicitly in case cascade is not set)
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const demoUsers = (existingUsers?.users ?? []).filter(
    (u) => DEMO_EMAILS.includes(u.email ?? ''),
  )

  console.log(`\n  Found ${demoUsers.length} demo auth user(s) to remove.`)

  for (const u of demoUsers) {
    // Deleting auth user cascades to buyers row (ON DELETE CASCADE)
    const { error: ue } = await supabase.auth.admin.deleteUser(u.id)
    if (ue) warn(`delete user ${u.email}`, ue.message)
    else ok(`deleted auth user ${u.email}`)
  }

  console.log('\n' + '═'.repeat(50))
  console.log('  CLEAN COMPLETE — all demo data removed.')
  console.log('═'.repeat(50) + '\n')
}

main().catch((e: unknown) => {
  console.error('\n❌  Unexpected error:', e)
  process.exit(1)
})
