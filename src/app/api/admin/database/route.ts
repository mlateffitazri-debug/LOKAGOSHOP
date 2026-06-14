import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/access'
import { createAdminClient } from '@/lib/supabase/admin'
import { safeError } from '@/lib/safe-error'

const ALLOWED_TABLES = ['sellers', 'buyers', 'testimonials', 'saved_shops', 'products', 'suspended_sellers', 'admin_messages', 'platform_settings'] as const

type AllowedTable = (typeof ALLOWED_TABLES)[number]

const TABLE_META: Record<AllowedTable, { idColumn: string; orderColumn: string }> = {
  sellers:           { idColumn: 'id',  orderColumn: 'created_at' },
  buyers:            { idColumn: 'id',  orderColumn: 'created_at' },
  testimonials:      { idColumn: 'id',  orderColumn: 'created_at' },
  saved_shops:       { idColumn: 'id',  orderColumn: 'created_at' },
  products:          { idColumn: 'id',  orderColumn: 'created_at' },
  suspended_sellers: { idColumn: 'id',  orderColumn: 'suspend_date' },
  admin_messages:    { idColumn: 'id',  orderColumn: 'sent_at' },
  platform_settings: { idColumn: 'key', orderColumn: 'updated_at' },
}

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

    const meta = TABLE_META[table as AllowedTable]
    const supabase = createAdminClient()
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order(meta.orderColumn, { ascending: false })

    if (error) {
      return NextResponse.json({ error: safeError(error) }, { status: 500 })
    }

    return NextResponse.json({ rows: data ?? [], count: count ?? 0, table, limit, offset, idColumn: meta.idColumn })
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

    const meta = TABLE_META[table as AllowedTable]
    const supabase = createAdminClient()

    if (action === 'delete_row') {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
      const { error } = await supabase.from(table).delete().eq(meta.idColumn, id)
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
      const { error } = await supabase.from(table).delete().not(meta.idColumn, 'is', null)
      if (error) return NextResponse.json({ error: safeError(error) }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: safeError(err, 'Failed to execute action') }, { status: 500 })
  }
}
