import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

const ALLOWED_FIELDS = new Set(['is_available', 'is_preorder'])

export async function POST(request: Request) {
  const authClient = createServerClient()
  const { data: { user }, error: authError } = await authClient.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const body = await request.json() as { productId?: string; field?: string; value?: boolean }
  const { productId, field, value } = body

  if (!productId || !field || typeof value !== 'boolean') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!ALLOWED_FIELDS.has(field)) {
    return NextResponse.json({ error: 'Invalid field' }, { status: 400 })
  }

  const adminClient = createAdminClient()

  const { data: seller } = await adminClient
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 403 })

  const { data: product } = await adminClient
    .from('products')
    .select('id, seller_id, status')
    .eq('id', productId)
    .maybeSingle()
  if (!product || product.seller_id !== seller.id) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }
  if (product.status !== 'approved') {
    return NextResponse.json({ error: 'Product not yet approved' }, { status: 403 })
  }

  const { error } = await adminClient
    .from('products')
    .update({ [field]: value })
    .eq('id', productId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
