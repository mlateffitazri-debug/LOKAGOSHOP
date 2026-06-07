import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

async function getCurrentSellerId() {
  const authClient = createServerClient()
  const { data: authData, error: authError } = await authClient.auth.getUser()

  if (authError || !authData.user) {
    return { error: 'Not authenticated', status: 401 as const }
  }

  const adminClient = createAdminClient()
  const { data: seller, error: sellerError } = await adminClient
    .from('sellers')
    .select('id')
    .eq('user_id', authData.user.id)
    .maybeSingle()

  if (sellerError) {
    return { error: sellerError.message, status: 500 as const }
  }

  if (!seller) {
    return { error: 'Seller profile not found', status: 404 as const }
  }

  return { sellerId: seller.id, adminClient }
}

export async function GET() {
  const sellerContext = await getCurrentSellerId()

  if ('error' in sellerContext) {
    return NextResponse.json({ error: sellerContext.error }, { status: sellerContext.status })
  }

  const { data, error } = await sellerContext.adminClient
    .from('admin_messages')
    .select('*')
    .eq('seller_id', sellerContext.sellerId)
    .order('sent_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ messages: data ?? [] })
}

export async function PATCH(request: Request) {
  const sellerContext = await getCurrentSellerId()

  if ('error' in sellerContext) {
    return NextResponse.json({ error: sellerContext.error }, { status: sellerContext.status })
  }

  const body = (await request.json()) as { id?: string; all?: boolean }
  let query = sellerContext.adminClient
    .from('admin_messages')
    .update({ is_read: true })
    .eq('seller_id', sellerContext.sellerId)

  if (!body.all) {
    if (!body.id) {
      return NextResponse.json({ error: 'Missing message id' }, { status: 400 })
    }

    query = query.eq('id', body.id)
  }

  const { error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
