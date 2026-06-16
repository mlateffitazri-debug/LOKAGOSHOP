import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/access'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'
import { normalizeBusinessType } from '@/lib/business-types'

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('60')) return digits
  if (digits.startsWith('0')) return `6${digits}`
  return digits
}

async function findSellerByField(
  supabase: SupabaseClient,
  field: string,
  value: string,
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('sellers')
    .select('id')
    .eq(field, value)
    .is('deleted_at', null)
    .maybeSingle()

  if (!error) return data as { id: string } | null

  // Column deleted_at doesn't exist yet — retry without it
  const missingCol =
    error.message.includes('deleted_at') ||
    (error as { code?: string }).code === '42703'
  if (missingCol) {
    const { data: data2, error: error2 } = await supabase
      .from('sellers')
      .select('id')
      .eq(field, value)
      .maybeSingle()
    if (error2) throw new Error(error2.message)
    return data2 as { id: string } | null
  }

  throw new Error(error.message)
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const body = await request.json() as {
      email?: string
      shop_name?: string
      taman_name?: string
      whatsapp_number?: string
      kawasan?: string
      postcode?: string
      business_type?: string
    }

    const { email, shop_name, taman_name, whatsapp_number, kawasan, postcode, business_type } = body

    if (!email?.trim() || !shop_name?.trim() || !taman_name?.trim() || !whatsapp_number?.trim()) {
      return NextResponse.json({ error: 'Sila isi email, nama kedai, taman dan nombor WhatsApp' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const phone = normalizePhone(whatsapp_number)

    // Reject duplicate phone number
    const existingByPhone = await findSellerByField(supabase, 'whatsapp_number', phone)
    if (existingByPhone) {
      return NextResponse.json(
        { error: 'Penjual dengan nombor WhatsApp ini sudah wujud', sellerId: existingByPhone.id },
        { status: 409 },
      )
    }

    // Try to find the Google auth account by email
    let userId: string | null = null
    try {
      const { data: { users } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
      const match = users?.find((u) => u.email?.toLowerCase() === email.toLowerCase().trim())
      if (match) userId = match.id
    } catch {
      // Auth admin API unavailable — continue without linking
    }

    // Ensure no seller is already linked to this user (outside auth try-catch so DB errors surface)
    if (userId) {
      const existingByUser = await findSellerByField(supabase, 'user_id', userId)
      if (existingByUser) {
        return NextResponse.json(
          { error: 'Pengguna ini sudah mempunyai akaun penjual', sellerId: existingByUser.id },
          { status: 409 },
        )
      }
    }

    const payload: Record<string, unknown> = {
      shop_name: shop_name.trim(),
      taman_name: taman_name.trim(),
      whatsapp_number: phone,
      kawasan: (kawasan?.trim() || taman_name.trim()),
      postcode: (postcode?.trim() || '00000'),
      email: email.trim(),
      business_type: normalizeBusinessType(business_type),
      status: 'pending',
      is_open: false,
      badge: 'seller_baharu',
    }
    if (userId) payload.user_id = userId

    let result = await supabase.from('sellers').insert(payload).select('id').single()

    // Retry without optional columns if schema is outdated
    if (result.error?.message.includes('email') || result.error?.message.includes('kawasan') || result.error?.message.includes('business_type')) {
      const minimal: Record<string, unknown> = {
        shop_name: payload.shop_name,
        taman_name: payload.taman_name,
        whatsapp_number: payload.whatsapp_number,
        postcode: payload.postcode,
        status: 'pending',
        is_open: false,
      }
      if (userId) minimal.user_id = userId
      result = await supabase.from('sellers').insert(minimal).select('id').single()
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true, sellerId: result.data.id, linked: !!userId }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Gagal mendaftar penjual' },
      { status: 500 },
    )
  }
}
