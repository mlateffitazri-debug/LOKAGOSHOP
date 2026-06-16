import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { normalizeBusinessType } from '@/lib/business-types'

type SellerOnboardingBody = {
  shop_name?: string
  whatsapp_number?: string
  taman_name?: string
  postcode?: string
  kawasan?: string
  email?: string
  business_type?: string | null
  profile_image_url?: string | null
  profile_image_position_x?: number | null
  profile_image_position_y?: number | null
  latitude?: number | null
  longitude?: number | null
}

function normalizeWhatsapp(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('60')) return digits
  if (digits.startsWith('0')) return `6${digits}`
  return digits
}

export async function POST(request: Request) {
  const body = (await request.json()) as SellerOnboardingBody

  if (process.env.LOKALGO_E2E_MOCK === '1' && process.env.NODE_ENV !== 'production') {
    if (!body.shop_name?.trim() || !body.whatsapp_number?.trim() || !body.taman_name?.trim()) {
      return NextResponse.json({ error: 'Missing seller onboarding fields' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, sellerId: 'mock-seller-id' }, { status: 201 })
  }

  // Prefer Bearer token from Authorization header (sent explicitly by the client
  // to bypass PKCE cookie-reading issues in Route Handlers). Fall back to SSR cookies.
  const adminClient = createAdminClient()
  const authHeader = request.headers.get('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  const { data: { user }, error: authError } = bearerToken
    ? await adminClient.auth.getUser(bearerToken)
    : await createServerClient().auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  if (!body.shop_name?.trim() || !body.whatsapp_number?.trim() || !body.taman_name?.trim()) {
    return NextResponse.json({ error: 'Missing seller onboarding fields' }, { status: 400 })
  }

  if (
    body.shop_name.trim().length > 100 ||
    body.taman_name.trim().length > 100 ||
    (body.kawasan && body.kawasan.trim().length > 100) ||
    (body.postcode && body.postcode.trim().length > 10)
  ) {
    return NextResponse.json({ error: 'Input melebihi had panjang yang dibenarkan' }, { status: 400 })
  }

  const basePayload = {
    user_id: user.id,
    shop_name: body.shop_name.trim(),
    email: body.email?.trim() || user.email || null,
    whatsapp_number: normalizeWhatsapp(body.whatsapp_number),
    taman_name: body.taman_name.trim(),
    postcode: body.postcode?.trim() || '00000',
    kawasan: body.kawasan?.trim() || body.taman_name.trim(),
    business_type: normalizeBusinessType(body.business_type),
    profile_image_url: body.profile_image_url || null,
    profile_image_position_x: typeof body.profile_image_position_x === 'number' ? body.profile_image_position_x : 50,
    profile_image_position_y: typeof body.profile_image_position_y === 'number' ? body.profile_image_position_y : 50,
    latitude: typeof body.latitude === 'number' && !Number.isNaN(body.latitude) ? body.latitude : null,
    longitude: typeof body.longitude === 'number' && !Number.isNaN(body.longitude) ? body.longitude : null,
    status: 'pending',
  }

  const { data: existingSeller, error: lookupError } = await adminClient
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (lookupError) {
    return NextResponse.json({ error: 'Failed to check existing seller' }, { status: 500 })
  }

  // Postcode is required only for brand-new sellers. Existing sellers (update path)
  // are never blocked here — old rows with '00000'/missing postcode are fixed
  // later via the admin panel, not by this endpoint.
  if (!existingSeller) {
    const postcode = body.postcode?.trim() ?? ''
    if (!/^\d{5}$/.test(postcode) || postcode === '00000') {
      return NextResponse.json({ error: 'Poskod anda membantu pembeli mengenalpasti kawasan jualan anda. Isikan dengan tepat.' }, { status: 400 })
    }
  }

  // INSERT new sellers with is_open: false (must explicitly open from dashboard).
  // UPDATE existing sellers WITHOUT touching is_open — seller controls that via toggle.
  const { data, error: saveError } = existingSeller
    ? await adminClient.from('sellers').update(basePayload).eq('id', existingSeller.id).select('id').single()
    : await adminClient.from('sellers').insert({ ...basePayload, is_open: false }).select('id').single()

  if (saveError) {
    return NextResponse.json({ error: saveError.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, sellerId: data.id }, { status: 201 })
}
