import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/access'
import { createAdminClient } from '@/lib/supabase/admin'

type ModerationType = 'seller' | 'testimonial' | 'product' | 'complaint' | 'buyer'
type ModerationAction =
  | 'approve'
  | 'reject'
  | 'dismiss'
  | 'suspend'
  | 'unsuspend'
  | 'delete'
  | 'restore'
  | 'badge_baharu'
  | 'badge_aktif'
  | 'badge_verified'

type ModerationBody = {
  type?: ModerationType
  id?: string
  action?: ModerationAction
}

function getSellerStatus(seller: Record<string, unknown>) {
  if (seller.status) return seller.status as string
  if (seller.permanent_ban) return 'suspended'
  return 'pending'
}

async function softDelete(
  supabase: ReturnType<typeof createAdminClient>,
  table: 'sellers' | 'buyers' | 'testimonials',
  id: string,
) {
  const r = await supabase.from(table).update({ deleted_at: new Date().toISOString() }).eq('id', id)
  if (r.error?.message?.includes('deleted_at')) {
    // Migration not yet applied — fall back to hard delete
    return supabase.from(table).delete().eq('id', id)
  }
  return r
}

export async function GET() {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const supabase = createAdminClient()

    const [
      sellersResult,
      buyersResult,
      testimonialsResult,
      savedShopsResult,
      pendingProductsResult,
      complaintsResult,
    ] = await Promise.all([
      supabase.from('sellers').select('*').order('created_at', { ascending: false }),
      supabase.from('buyers').select('*').order('created_at', { ascending: false }),
      supabase.from('testimonials').select('*').order('created_at', { ascending: false }),
      supabase.from('saved_shops').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('suspended_sellers').select('*').order('suspend_date', { ascending: false }),
    ])

    const allSellers = sellersResult.data ?? []
    const sellers = allSellers.filter((s) => !s.deleted_at)
    const deletedSellers = allSellers.filter((s) => s.deleted_at)

    const allBuyers = buyersResult.data ?? []
    const buyers = allBuyers.filter((b) => !b.deleted_at)
    const deletedBuyers = allBuyers.filter((b) => b.deleted_at)

    const allTestimonials = testimonialsResult.data ?? []
    const testimonials = allTestimonials.filter((t) => !t.deleted_at)
    const deletedTestimonials = allTestimonials.filter((t) => t.deleted_at)

    const savedShopsRaw = savedShopsResult.data ?? []

    const buyerMap: Record<string, string> = {}
    buyers.forEach((b) => { buyerMap[b.id] = (b.name as string) || (b.email as string) || b.id })
    const sellerMap: Record<string, string> = {}
    sellers.forEach((s) => { sellerMap[s.id] = (s.shop_name as string) || (s.name as string) || s.id })

    const savedShops = savedShopsRaw.map((row) => ({
      ...row,
      buyer_display: buyerMap[row.buyer_id as string] ?? row.buyer_id,
      shop_display: sellerMap[row.shop_id as string] ?? row.shop_id,
    }))

    const pending = sellers.filter((s) => getSellerStatus(s) === 'pending')
    const active = sellers.filter((s) => getSellerStatus(s) === 'active')
    const suspended = sellers.filter((s) => getSellerStatus(s) === 'suspended')
    const rejected = sellers.filter((s) => getSellerStatus(s) === 'rejected')

    const badgeCount = { seller_baharu: 0, seller_aktif: 0, verified: 0 }
    sellers.forEach((s) => {
      const b = (s.badge as string) || 'seller_baharu'
      if (b in badgeCount) badgeCount[b as keyof typeof badgeCount]++
    })

    const areaCount: Record<string, number> = {}
    sellers.forEach((s) => {
      const area = (s.kawasan as string) || 'Lain-lain'
      areaCount[area] = (areaCount[area] || 0) + 1
    })
    const sellersByArea = Object.entries(areaCount)
      .sort((a, b) => b[1] - a[1])
      .map(([area, count]) => ({ area, count }))

    const registeredUserIds = new Set<string>()
    allBuyers.forEach((b) => { if (b.user_id) registeredUserIds.add(b.user_id as string) })
    allSellers.forEach((s) => { if (s.user_id) registeredUserIds.add(s.user_id as string) })

    const warnings: string[] = [
      sellersResult.error?.message,
      buyersResult.error?.message,
      testimonialsResult.error?.message,
      savedShopsResult.error?.message,
      pendingProductsResult.error?.message,
      complaintsResult.error?.message,
    ].filter(Boolean) as string[]

    return NextResponse.json({
      sellers,
      deletedSellers,
      pendingSellers: pending,
      activeSellers: active,
      suspendedSellers: suspended,
      rejectedSellers: rejected,
      buyers,
      deletedBuyers,
      testimonials,
      deletedTestimonials,
      pendingTestimonials: testimonials.filter((t) => !(t.is_approved as boolean)),
      savedShops,
      pendingProducts: pendingProductsResult.data ?? [],
      complaints: complaintsResult.data ?? [],
      buyerCount: buyers.length,
      stats: {
        totalSellers: sellers.length,
        totalBuyers: buyers.length,
        totalTestimonials: testimonials.length,
        totalSavedShops: savedShopsRaw.length,
        sellersByStatus: {
          pending: pending.length,
          active: active.length,
          suspended: suspended.length,
          rejected: rejected.length,
        },
        sellersByBadge: badgeCount,
        sellersByArea,
        totalRegisteredUsers: registeredUserIds.size,
      },
      warnings,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load admin data' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const body = (await request.json()) as ModerationBody

    if (!body.type || !body.id || !body.action) {
      return NextResponse.json({ error: 'Missing moderation request fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // ── SELLER ──────────────────────────────────────────────────────────────
    if (body.type === 'seller') {
      if (body.action === 'delete') {
        const r = await softDelete(supabase, 'sellers', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'restore') {
        const r = await supabase.from('sellers').update({ deleted_at: null }).eq('id', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'suspend') {
        let r = await supabase.from('sellers').update({ status: 'suspended' }).eq('id', body.id)
        if (r.error?.message.includes('status')) {
          r = await supabase.from('sellers').update({ permanent_ban: true }).eq('id', body.id)
        }
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'unsuspend') {
        let r = await supabase.from('sellers').update({ status: 'active' }).eq('id', body.id)
        if (r.error?.message.includes('status')) {
          r = await supabase.from('sellers').update({ permanent_ban: false }).eq('id', body.id)
        }
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'badge_baharu' || body.action === 'badge_aktif' || body.action === 'badge_verified') {
        const badge = body.action === 'badge_baharu' ? 'seller_baharu'
          : body.action === 'badge_aktif' ? 'seller_aktif'
          : 'verified'
        const r = await supabase.from('sellers').update({ badge }).eq('id', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'approve') {
        let r = await supabase.from('sellers').update({ status: 'active', approved_at: new Date().toISOString() }).eq('id', body.id)
        if (r.error?.message.includes('approved_at')) {
          r = await supabase.from('sellers').update({ status: 'active' }).eq('id', body.id)
        }
        if (r.error?.message.includes('status')) {
          r = await supabase.from('sellers').update({ permanent_ban: false }).eq('id', body.id)
        }
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'reject') {
        let r = await supabase.from('sellers').update({ status: 'rejected' }).eq('id', body.id)
        if (r.error?.message.includes('status')) {
          r = await supabase.from('sellers').update({ permanent_ban: true }).eq('id', body.id)
        }
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }
    }

    // ── BUYER ────────────────────────────────────────────────────────────────
    if (body.type === 'buyer') {
      if (body.action === 'delete') {
        const r = await softDelete(supabase, 'buyers', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'restore') {
        const r = await supabase.from('buyers').update({ deleted_at: null }).eq('id', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }
    }

    // ── TESTIMONIAL ──────────────────────────────────────────────────────────
    if (body.type === 'testimonial') {
      if (body.action === 'delete' || body.action === 'reject') {
        const r = await softDelete(supabase, 'testimonials', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'restore') {
        const r = await supabase.from('testimonials').update({ deleted_at: null }).eq('id', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'approve') {
        const testimonial = await supabase.from('testimonials').select('seller_id').eq('id', body.id).single()
        if (testimonial.error) return NextResponse.json({ error: testimonial.error.message }, { status: 500 })

        const r = await supabase.from('testimonials').update({ is_approved: true }).eq('id', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })

        if (testimonial.data?.seller_id) {
          const approved = await supabase
            .from('testimonials')
            .select('id', { count: 'exact', head: true })
            .eq('seller_id', testimonial.data.seller_id)
            .eq('is_approved', true)
          if (!approved.error) {
            await supabase.from('sellers').update({ testimonial_count: approved.count ?? 0 }).eq('id', testimonial.data.seller_id)
          }
        }
        return NextResponse.json({ ok: true })
      }
    }

    // ── PRODUCT ──────────────────────────────────────────────────────────────
    if (body.type === 'product') {
      const r = await supabase.from('products').update({ status: body.action === 'approve' ? 'approved' : 'rejected' }).eq('id', body.id)
      if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    // ── COMPLAINT ─────────────────────────────────────────────────────────────
    if (body.type === 'complaint') {
      const r = await supabase.from('suspended_sellers').update({
        appeal_status: body.action === 'approve' || body.action === 'dismiss' ? 'approved' : 'rejected',
      }).eq('id', body.id)
      if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action type' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update record' },
      { status: 500 },
    )
  }
}
