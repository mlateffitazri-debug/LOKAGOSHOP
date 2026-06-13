import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const authClient = createServerClient()
  const { data: { user }, error: authError } = await authClient.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json() as { is_open?: boolean }
  if (typeof body.is_open !== 'boolean') {
    return NextResponse.json({ error: 'Missing is_open boolean' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const { data: seller } = await adminClient
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 403 })

  const { error } = await adminClient
    .from('sellers')
    .update({ is_open: body.is_open })
    .eq('id', seller.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
