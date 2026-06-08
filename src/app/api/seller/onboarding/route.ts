import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

type SellerOnboardingBody = {
  shop_name?: string
  whatsapp_number?: string
  taman_name?: string
  postcode?: string
  kawasan?: string
  email?: string
  profile_image_url?: string | null
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

  if (process.env.LOKALGO_E2E_MOCK === '1') {
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

  const sellerPayload = {
    user_id: user.id,
    shop_name: body.shop_name.trim(),
    email: body.email?.trim() || user.email || null,
    whatsapp_number: normalizeWhatsapp(body.whatsapp_number),
    taman_name: body.taman_name.trim(),
    postcode: body.postcode?.trim() || '00000',
    kawasan: body.kawasan?.trim() || body.taman_name.trim(),
    profile_image_url: body.profile_image_url || null,
    latitude: typeof body.latitude === 'number' && !Number.isNaN(body.latitude) ? body.latitude : null,
    longitude: typeof body.longitude === 'number' && !Number.isNaN(body.longitude) ? body.longitude : null,
    status: 'pending',
    is_open: false,
  }
  const legacySellerPayload = {
    name: body.shop_name.trim(),
    email: user.email || '',
    whatsapp_number: normalizeWhatsapp(body.whatsapp_number),
    permanent_ban: false,
  }

  let existingSellerResult = await adminClient
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingSellerResult.error?.message.includes('user_id')) {
    existingSellerResult = await adminClient
      .from('sellers')
      .select('id')
      .eq('whatsapp_number', legacySellerPayload.whatsapp_number)
      .maybeSingle()
  }

  if (existingSellerResult.error) {
    return NextResponse.json({ error: existingSellerResult.error.message }, { status: 500 })
  }

  let result = existingSellerResult.data
    ? await adminClient.from('sellers').update(sellerPayload).eq('id', existingSellerResult.data.id).select('id').single()
    : await adminClient.from('sellers').insert(sellerPayload).select('id').single()

  if (result.error?.message.includes('shop_name')
    || result.error?.message.includes('status')
    || result.error?.message.includes('user_id')
    || result.error?.message.includes('taman_name')) {
    result = existingSellerResult.data
      ? await adminClient.from('sellers').update(legacySellerPayload).eq('id', existingSellerResult.data.id).select('id').single()
      : await adminClient.from('sellers').insert(legacySellerPayload).select('id').single()
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, sellerId: result.data.id }, { status: 201 })
}
