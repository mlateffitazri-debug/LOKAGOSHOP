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
    broadcast?: boolean
  }

  if (!body.type || !body.title || !body.body) {
    return NextResponse.json({ error: 'Missing required fields: type, title, body' }, { status: 400 })
  }

  const validTypes = ['warning', 'info', 'flag', 'success']
  if (!validTypes.includes(body.type)) {
    return NextResponse.json({ error: 'Invalid type. Must be: warning, info, flag, success' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // ── Broadcast to all sellers ──────────────────────────────────────────────
  if (body.broadcast === true) {
    const { data: allSellers, error: sellersError } = await supabase
      .from('sellers')
      .select('id')

    if (sellersError) {
      return NextResponse.json({ error: sellersError.message }, { status: 500 })
    }

    const sellers = allSellers ?? []
    if (sellers.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, failed: 0, total: 0 })
    }

    const now = new Date().toISOString()
    const messages = sellers.map((s) => ({
      seller_id: s.id,
      type: body.type!,
      title: body.title!.trim(),
      body: body.body!.trim(),
      is_read: false,
      sent_at: now,
    }))

    const BATCH_SIZE = 50
    let sent = 0
    let failed = 0

    for (let i = 0; i < messages.length; i += BATCH_SIZE) {
      const batch = messages.slice(i, i + BATCH_SIZE)
      const { error } = await supabase.from('admin_messages').insert(batch)
      if (error) {
        failed += batch.length
      } else {
        sent += batch.length
      }
    }

    return NextResponse.json({ ok: true, sent, failed, total: sellers.length })
  }

  // ── Single seller message ────────────────────────────────────────────────
  if (!body.seller_id) {
    return NextResponse.json({ error: 'Missing required fields: seller_id, type, title, body' }, { status: 400 })
  }

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
