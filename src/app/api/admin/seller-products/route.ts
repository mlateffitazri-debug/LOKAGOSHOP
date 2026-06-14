import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/access'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const url = new URL(request.url)
    const sellerId = url.searchParams.get('seller_id')

    if (!sellerId) {
      return NextResponse.json({ error: 'Missing seller_id' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ products: data ?? [] })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load products' },
      { status: 500 },
    )
  }
}
