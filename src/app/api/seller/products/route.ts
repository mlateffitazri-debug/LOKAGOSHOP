import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import {
  isListingLimitReached,
  normalizeBusinessType,
} from '@/lib/business-types'

const LIMIT_MESSAGE = 'Free plan allows up to 5 listings only. Upgrade to LokalGo Pro to add more.'

type ProductCreateBody = {
  name?: string
  category?: string
  description?: string | null
  price_from?: number | string | null
  unit?: string | null
  images?: string[]
}

function normalizeImageUrls(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= 2000)
    .slice(0, 4)
}

export async function POST(request: Request) {
  const adminClient = createAdminClient()
  const authHeader = request.headers.get('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  const { data: { user }, error: authError } = bearerToken
    ? await adminClient.auth.getUser(bearerToken)
    : await createServerClient().auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = (await request.json()) as ProductCreateBody
  const name = body.name?.trim()
  const category = body.category?.trim()
  const priceFrom = Number(body.price_from)
  const description = body.description?.trim() || null
  const unit = body.unit?.trim() || null
  const images = normalizeImageUrls(body.images)

  if (!name || !category || !Number.isFinite(priceFrom) || priceFrom <= 0) {
    return NextResponse.json({ error: 'Missing or invalid product fields' }, { status: 400 })
  }

  if (
    name.length > 80 ||
    category.length > 100 ||
    (description && description.length > 300) ||
    (unit && unit.length > 30)
  ) {
    return NextResponse.json({ error: 'Input melebihi had panjang yang dibenarkan' }, { status: 400 })
  }

  const { data: seller, error: sellerError } = await adminClient
    .from('sellers')
    .select('id, status, business_type, plan_type, listing_limit')
    .eq('user_id', user.id)
    .maybeSingle()

  if (sellerError) {
    return NextResponse.json({ error: sellerError.message }, { status: 500 })
  }

  if (!seller) {
    return NextResponse.json({ error: 'Seller profile not found' }, { status: 403 })
  }

  if (seller.status !== 'active') {
    return NextResponse.json({ error: 'Seller shop is not active yet' }, { status: 403 })
  }

  const { count, error: countError } = await adminClient
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('seller_id', seller.id)
    .in('status', ['pending', 'approved'])

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  if (isListingLimitReached({
    planType: seller.plan_type,
    listingLimit: seller.listing_limit,
    listingCount: count ?? 0,
  })) {
    return NextResponse.json({ error: LIMIT_MESSAGE }, { status: 403 })
  }

  const listingType = normalizeBusinessType(seller.business_type)

  const { data, error: insertError } = await adminClient
    .from('products')
    .insert({
      seller_id: seller.id,
      name,
      category,
      listing_type: listingType,
      description,
      price_from: priceFrom,
      unit,
      images,
      is_available: false,
      is_preorder: false,
      status: 'pending',
    })
    .select('id, listing_type')
    .single()

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, productId: data.id, listingType: data.listing_type }, { status: 201 })
}
