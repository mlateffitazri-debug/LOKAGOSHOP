import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const adminClient = createAdminClient()

  // Primary: Bearer token in Authorization header — reliable in iOS PWA where
  // the WKWebView cookie store is separate from Safari and cookies aren't sent
  let userId: string | null = null
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (token) {
    const { data: { user: tokenUser } } = await adminClient.auth.getUser(token)
    userId = tokenUser?.id ?? null
  }

  // Fallback: cookie-based auth for desktop/web browsers
  if (!userId) {
    const cookieClient = createServerClient()
    const { data: { user: cookieUser } } = await cookieClient.auth.getUser()
    userId = cookieUser?.id ?? null
  }

  if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json() as { is_open?: boolean }
  if (typeof body.is_open !== 'boolean') {
    return NextResponse.json({ error: 'Missing is_open boolean' }, { status: 400 })
  }

  const { data: seller } = await adminClient
    .from('sellers')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 403 })

  const { error } = await adminClient
    .from('sellers')
    .update({ is_open: body.is_open })
    .eq('id', seller.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
