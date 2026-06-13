import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/access'
import { createAdminClient } from '@/lib/supabase/admin'
import { safeError } from '@/lib/safe-error'

const ALLOWED_TABLES = ['sellers', 'buyers', 'testimonials', 'saved_shops', 'products', 'suspended_sellers', 'admin_messages', 'platform_settings'] as const

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const url = new URL(request.url)
    const table = url.searchParams.get('table')
    const rawLimit = parseInt(url.searchParams.get('limit') ?? '50', 10)
    const limit = Number.isNaN(rawLimit) ? 50 : Math.min(Math.max(rawLimit, 1), 200)
    const rawOffset = parseInt(url.searchParams.get('offset') ?? '0', 10)
    const offset = Number.isNaN(rawOffset) ? 0 : Math.max(rawOffset, 0)

    if (!table || !(ALLOWED_TABLES as readonly string[]).includes(table)) {
      return NextResponse.json({ error: 'Invalid or missing table name', allowed: ALLOWED_TABLES }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: safeError(error) }, { status: 500 })
    }

    return NextResponse.json({ rows: data ?? [], count: count ?? 0, table, limit, offset })
  } catch (err) {
    return NextResponse.json({ error: safeError(err, 'Failed to query table') }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const body = await request.json() as { action?: string; table?: string; id?: string; confirm?: string }
    const { action, table, id, confirm } = body

    if (!table || !(ALLOWED_TABLES as readonly string[]).includes(table)) {
      return NextResponse.json({ error: 'Invalid or missing table name' }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (action === 'delete_row') {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) return NextResponse.json({ error: safeError(error) }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if (action === 'clear_table') {
      if (confirm !== `CLEAR_${table.toUpperCase()}`) {
        return NextResponse.json(
          { error: `Confirmation token required. Pass confirm: "CLEAR_${table.toUpperCase()}"` },
          { status: 400 },
        )
      }
      const { error } = await supabase.from(table).delete().not('id', 'is', null)
      if (error) return NextResponse.json({ error: safeError(error) }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: safeError(err, 'Failed to execute action') }, { status: 500 })
  }
}
