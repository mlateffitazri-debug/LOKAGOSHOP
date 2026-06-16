import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/access'
import { createAdminClient } from '@/lib/supabase/admin'
import { safeError } from '@/lib/safe-error'

// Admin-only shop preview — loads a seller + their listings directly by seller_id.
// No GPS / distance / 50km discovery logic at all (this route never sees buyer
// coordinates), and this is NOT reachable from any public route — requireAdmin()
// gates every request, mirroring the rest of /api/admin/*.
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
    const [sellerResult, productsResult, testimonialsResult] = await Promise.all([
      supabase.from('sellers').select('*').eq('id', sellerId).maybeSingle(),
      supabase.from('products').select('*').eq('seller_id', sellerId).order('created_at', { ascending: false }),
      supabase.from('testimonials').select('*').eq('seller_id', sellerId).order('created_at', { ascending: false }).limit(10),
    ])

    if (sellerResult.error) return NextResponse.json({ error: safeError(sellerResult.error) }, { status: 500 })
    if (!sellerResult.data) return NextResponse.json({ error: 'Seller not found' }, { status: 404 })

    return NextResponse.json({
      seller: sellerResult.data,
      products: productsResult.data ?? [],
      testimonials: testimonialsResult.data ?? [],
      warnings: [productsResult.error?.message, testimonialsResult.error?.message].filter(Boolean),
    })
  } catch (err) {
    return NextResponse.json({ error: safeError(err, 'Failed to load shop preview') }, { status: 500 })
  }
}
