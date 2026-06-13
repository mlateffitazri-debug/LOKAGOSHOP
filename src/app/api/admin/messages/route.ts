import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/access'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  const supabase = createAdminClient()

  const [messagesResult, sellersResult] = await Promise.all([
    supabase
      .from('admin_messages')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(200),
    supabase.from('sellers').select('id, shop_name'),
  ])

  if (messagesResult.error) {
    return NextResponse.json({ error: messagesResult.error.message }, { status: 500 })
  }

  const sellerMap: Record<string, string> = {}
  for (const s of sellersResult.data ?? []) {
    sellerMap[s.id] = s.shop_name
  }

  const messages = (messagesResult.data ?? []).map((m) => ({
    ...m,
    shop_name: sellerMap[m.seller_id] ?? m.seller_id,
  }))

  return NextResponse.json({ messages })
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  const body = (await request.json()) as {
    seller_id?: string
    type?: string
    title?: string
    body?: string
  }

  if (!body.seller_id || !body.type || !body.title || !body.body) {
    return NextResponse.json({ error: 'Missing required fields: seller_id, type, title, body' }, { status: 400 })
  }

  const validTypes = ['warning', 'info', 'flag', 'success']
  if (!validTypes.includes(body.type)) {
    return NextResponse.json({ error: 'Invalid type. Must be: warning, info, flag, success' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase.from('admin_messages').insert({
    seller_id: body.seller_id,
    type: body.type,
    title: body.title.trim(),
    body: body.body.trim(),
    is_read: false,
    sent_at: new Date().toISOString(),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: Request) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  const { id } = (await request.json()) as { id?: string }
  if (!id) return NextResponse.json({ error: 'Missing message id' }, { status: 400 })

  const supabase = createAdminClient()
  const { error } = await supabase.from('admin_messages').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
