import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_TABLES = ['sellers', 'buyers', 'testimonials', 'saved_shops', 'products', 'suspended_sellers'] as const

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const table = url.searchParams.get('table')
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '50', 10), 200)
    const offset = parseInt(url.searchParams.get('offset') ?? '0', 10)

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
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ rows: data ?? [], count: count ?? 0, table, limit, offset })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to query table' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { action?: string; table?: string; id?: string }
    const { action, table, id } = body

    if (!table || !(ALLOWED_TABLES as readonly string[]).includes(table)) {
      return NextResponse.json({ error: 'Invalid or missing table name' }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (action === 'delete_row') {
      if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    if (action === 'clear_table') {
      // Delete all rows by filtering on created_at >= epoch (matches everything)
      const { error } = await supabase.from(table).delete().not('id', 'is', null)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to execute action' }, { status: 500 })
  }
}
