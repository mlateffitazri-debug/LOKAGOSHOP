import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/access'
import { createAdminClient } from '@/lib/supabase/admin'
import { BUSINESS_TYPE_OPTIONS, CATEGORIES_BY_BUSINESS_TYPE, PLAN_TYPE_OPTIONS, isBusinessType } from '@/lib/business-types'

function isInvalidPostcode(postcode: unknown) {
  const value = typeof postcode === 'string' ? postcode.trim() : ''
  return !value || value === '00000' || !/^\d{5}$/.test(value)
}

type ModerationType = 'seller' | 'testimonial' | 'product' | 'complaint' | 'buyer'
type ModerationAction =
  | 'approve'
  | 'reject'
  | 'dismiss'
  | 'suspend'
  | 'unsuspend'
  | 'delete'
  | 'badge_baharu'
  | 'badge_aktif'
  | 'badge_verified'
  | 'open_shop'
  | 'close_shop'
  | 'verify'
  | 'set_available'
  | 'set_preorder'
  | 'hide_product'

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

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const url = new URL(request.url)
    const page = Math.max(0, parseInt(url.searchParams.get('page') ?? '0', 10) || 0)
    const PAGE_SIZE = 100

    const supabase = createAdminClient()

    const [
      sellersResult,
      buyersResult,
      testimonialsResult,
      savedShopsResult,
      pendingProductsResult,
      allProductsResult,
      complaintsResult,
      supportStatsResult,
    ] = await Promise.all([
      supabase.from('sellers').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),
      supabase.from('buyers').select('id, name, email, created_at', { count: 'exact' }).order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),
      supabase.from('testimonials').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),
      supabase.from('saved_shops').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),
      supabase.from('products').select('*', { count: 'exact' }).eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),
      supabase.from('suspended_sellers').select('*', { count: 'exact' }).order('suspend_date', { ascending: false }).range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1),
      supabase.from('support_stats').select('qr_download_count').eq('id', 1).maybeSingle(),
    ])

    const sellers = sellersResult.data ?? []
    const buyers = buyersResult.data ?? []
    const testimonials = testimonialsResult.data ?? []
    const savedShopsRaw = savedShopsResult.data ?? []
    const allProducts = allProductsResult.data ?? []

    // Enrich saved_shops with buyer name and seller name
    const buyerMap: Record<string, string> = {}
    buyers.forEach((b) => { buyerMap[b.id] = (b.name as string) || (b.email as string) || b.id })
    const sellerMap: Record<string, string> = {}
    sellers.forEach((s) => { sellerMap[s.id] = (s.shop_name as string) || (s.name as string) || s.id })

    const savedShops = savedShopsRaw.map((row) => ({
      ...row,
      buyer_display: buyerMap[row.buyer_id as string] ?? row.buyer_id,
      shop_display: sellerMap[row.shop_id as string] ?? row.shop_id,
    }))

    // Stats
    const pending = sellers.filter((s) => getSellerStatus(s) === 'pending')
    const active = sellers.filter((s) => getSellerStatus(s) === 'active')
    const suspended = sellers.filter((s) => getSellerStatus(s) === 'suspended')
    const rejected = sellers.filter((s) => getSellerStatus(s) === 'rejected')

    const badgeCount = { seller_baharu: 0, seller_aktif: 0, verified: 0 }
    sellers.forEach((s) => {
      const b = (s.badge as string) || 'seller_baharu'
      // DB stores 'verified_seller'; admin panel reads the 'verified' key
      const key = b === 'verified_seller' ? 'verified' : b
      if (key in badgeCount) badgeCount[key as keyof typeof badgeCount]++
    })

    const areaCount: Record<string, number> = {}
    sellers.forEach((s) => {
      const area = (s.kawasan as string) || 'Lain-lain'
      areaCount[area] = (areaCount[area] || 0) + 1
    })
    const sellersByArea = Object.entries(areaCount)
      .sort((a, b) => b[1] - a[1])
      .map(([area, count]) => ({ area, count }))

    // ── Business type / plan type / postcode quality (Part 4 & 8) ───────────
    const sellersByBusinessType: Record<string, number> = { FOOD: 0, SERVICE: 0, PRODUCT: 0, HOMESTAY: 0, UNKNOWN: 0 }
    const sellersByPlanType: Record<string, number> = { free: 0, pro: 0 }
    let postcodeWarningCount = 0
    sellers.forEach((s) => {
      const bt = s.business_type as string | null
      sellersByBusinessType[isBusinessType(bt) ? bt : 'UNKNOWN']++
      sellersByPlanType[s.plan_type === 'pro' ? 'pro' : 'free']++
      if (isInvalidPostcode(s.postcode)) postcodeWarningCount++
    })

    const productsByListingType: Record<string, number> = { FOOD: 0, SERVICE: 0, PRODUCT: 0, HOMESTAY: 0, UNKNOWN: 0 }
    const productsByCategory: Record<string, number> = {}
    const productsByStatus: Record<string, number> = { pending: 0, approved: 0, rejected: 0 }
    allProducts.forEach((p) => {
      const lt = p.listing_type as string | null
      productsByListingType[isBusinessType(lt) ? lt : 'UNKNOWN']++
      const cat = (p.category as string) || 'Tiada Kategori'
      productsByCategory[cat] = (productsByCategory[cat] || 0) + 1
      const status = (p.status as string) || 'pending'
      if (status in productsByStatus) productsByStatus[status]++
    })

    // Seller listing counts (for zero-listing warning) — derived from the products page already fetched
    const listingCountBySeller: Record<string, number> = {}
    allProducts.forEach((p) => {
      const sid = p.seller_id as string
      listingCountBySeller[sid] = (listingCountBySeller[sid] || 0) + 1
    })

    type DataQualityWarning = {
      type: 'seller_postcode' | 'seller_business_type' | 'seller_zero_listings' | 'listing_type_mismatch' | 'listing_category_mismatch' | 'listing_missing_type'
      sellerId?: string
      sellerName?: string
      productId?: string
      productName?: string
      message: string
    }
    const dataQualityWarnings: DataQualityWarning[] = []

    sellers.forEach((s) => {
      const name = (s.shop_name as string) || s.id
      if (isInvalidPostcode(s.postcode)) {
        dataQualityWarnings.push({ type: 'seller_postcode', sellerId: s.id, sellerName: name, message: `${name}: postcode tidak sah atau 00000` })
      }
      if (!isBusinessType(s.business_type as string | null)) {
        dataQualityWarnings.push({ type: 'seller_business_type', sellerId: s.id, sellerName: name, message: `${name}: business_type tiada/tidak sah` })
      }
      if ((listingCountBySeller[s.id as string] || 0) === 0 && getSellerStatus(s) === 'active') {
        dataQualityWarnings.push({ type: 'seller_zero_listings', sellerId: s.id, sellerName: name, message: `${name}: seller aktif tanpa sebarang produk/listing` })
      }
    })

    const sellerBusinessTypeMap: Record<string, string | null> = {}
    sellers.forEach((s) => { sellerBusinessTypeMap[s.id as string] = (s.business_type as string) || null })

    allProducts.forEach((p) => {
      const pname = (p.name as string) || (p.category as string) || p.id
      const sellerName = sellerMap[p.seller_id as string] ?? p.seller_id

      if (!isBusinessType(p.listing_type as string | null)) {
        dataQualityWarnings.push({ type: 'listing_missing_type', sellerId: p.seller_id as string, sellerName, productId: p.id, productName: pname, message: `${pname} (${sellerName}): listing_type tiada/tidak sah` })
        return
      }

      const sellerBt = sellerBusinessTypeMap[p.seller_id as string]
      if (sellerBt && isBusinessType(sellerBt) && sellerBt !== p.listing_type) {
        dataQualityWarnings.push({ type: 'listing_type_mismatch', sellerId: p.seller_id as string, sellerName, productId: p.id, productName: pname, message: `${pname} (${sellerName}): listing_type (${p.listing_type}) tidak sepadan dengan business_type seller (${sellerBt})` })
      }

      const validCategories = CATEGORIES_BY_BUSINESS_TYPE[p.listing_type as keyof typeof CATEGORIES_BY_BUSINESS_TYPE]
      if (p.category && !validCategories.includes(p.category as string)) {
        dataQualityWarnings.push({ type: 'listing_category_mismatch', sellerId: p.seller_id as string, sellerName, productId: p.id, productName: pname, message: `${pname} (${sellerName}): kategori "${p.category}" adalah legacy/tidak sepadan dengan listing_type ${p.listing_type}` })
      }
    })

    const warnings: string[] = [
      sellersResult.error?.message,
      buyersResult.error?.message,
      testimonialsResult.error?.message,
      savedShopsResult.error?.message,
      pendingProductsResult.error?.message,
      allProductsResult.error?.message,
      complaintsResult.error?.message,
    ].filter(Boolean) as string[]

    return NextResponse.json({
      sellers,
      pendingSellers: pending,
      activeSellers: active,
      suspendedSellers: suspended,
      rejectedSellers: rejected,
      buyers,
      testimonials,
      pendingTestimonials: testimonials.filter((t) => !(t.is_approved as boolean)),
      savedShops,
      pendingProducts: pendingProductsResult.data ?? [],
      products: allProducts,
      complaints: complaintsResult.data ?? [],
      buyerCount: buyersResult.count ?? buyers.length,
      qrDownloadCount: supportStatsResult.data?.qr_download_count ?? 0,
      pagination: {
        page,
        pageSize: PAGE_SIZE,
        totalSellers: sellersResult.count ?? 0,
        totalBuyers: buyersResult.count ?? 0,
        totalTestimonials: testimonialsResult.count ?? 0,
        totalProducts: allProductsResult.count ?? 0,
      },
      stats: {
        totalSellers: sellersResult.count ?? sellers.length,
        totalBuyers: buyersResult.count ?? buyers.length,
        totalTestimonials: testimonialsResult.count ?? testimonials.length,
        totalSavedShops: savedShopsResult.count ?? savedShopsRaw.length,
        totalProducts: allProductsResult.count ?? allProducts.length,
        sellersByStatus: {
          pending: pending.length,
          active: active.length,
          suspended: suspended.length,
          rejected: rejected.length,
        },
        sellersByBadge: badgeCount,
        sellersByArea,
        sellersByBusinessType,
        sellersByPlanType,
        postcodeWarningCount,
        productsByListingType,
        productsByCategory,
        productsByStatus,
      },
      businessTypeOptions: BUSINESS_TYPE_OPTIONS,
      planTypeOptions: PLAN_TYPE_OPTIONS,
      categoriesByBusinessType: CATEGORIES_BY_BUSINESS_TYPE,
      dataQualityWarnings,
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

    // ── SELLER actions ──────────────────────────────────────────────────────
    if (body.type === 'seller') {
      if (body.action === 'delete') {
        const { error } = await supabase.from('sellers').delete().eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'suspend') {
        const r = await supabase.from('sellers').update({ status: 'suspended' }).eq('id', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'unsuspend') {
        const r = await supabase.from('sellers').update({ status: 'active' }).eq('id', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'badge_baharu' || body.action === 'badge_aktif' || body.action === 'badge_verified') {
        const badge = body.action === 'badge_baharu' ? 'seller_baharu'
          : body.action === 'badge_aktif' ? 'seller_aktif'
          : 'verified_seller'
        const r = await supabase.from('sellers').update({ badge }).eq('id', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'approve') {
        const r = await supabase.from('sellers').update({ status: 'active', approved_at: new Date().toISOString() }).eq('id', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'reject') {
        const r = await supabase.from('sellers').update({ status: 'rejected' }).eq('id', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'open_shop') {
        const r = await supabase.from('sellers').update({ is_open: true }).eq('id', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'close_shop') {
        const r = await supabase.from('sellers').update({ is_open: false }).eq('id', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }

      if (body.action === 'verify') {
        const r = await supabase.from('sellers').update({ badge: 'verified_seller' }).eq('id', body.id)
        if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }
    }

    // ── BUYER actions ───────────────────────────────────────────────────────
    if (body.type === 'buyer') {
      if (body.action === 'delete') {
        const { error } = await supabase.from('buyers').delete().eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ ok: true })
      }
    }

    // ── TESTIMONIAL actions ─────────────────────────────────────────────────
    if (body.type === 'testimonial') {
      if (body.action === 'delete' || body.action === 'reject') {
        const { error } = await supabase.from('testimonials').delete().eq('id', body.id)
        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
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

    // ── PRODUCT actions ─────────────────────────────────────────────────────
    if (body.type === 'product') {
      let update: Record<string, unknown> = {}

      if (body.action === 'approve') {
        update = { status: 'approved' }
      } else if (body.action === 'reject') {
        update = { status: 'rejected' }
      } else if (body.action === 'set_available') {
        update = { status: 'approved', is_available: true, is_preorder: false }
      } else if (body.action === 'set_preorder') {
        update = { status: 'approved', is_available: false, is_preorder: true }
      } else if (body.action === 'hide_product') {
        update = { is_available: false, is_preorder: false }
      } else {
        return NextResponse.json({ error: 'Unknown product action' }, { status: 400 })
      }

      const r = await supabase.from('products').update(update).eq('id', body.id)
      if (r.error) return NextResponse.json({ error: r.error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    // ── COMPLAINT actions ───────────────────────────────────────────────────
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
