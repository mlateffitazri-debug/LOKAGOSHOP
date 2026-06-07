import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type ModerationType = 'seller' | 'testimonial' | 'product' | 'complaint'
type ModerationAction = 'approve' | 'reject' | 'dismiss' | 'suspend'

type ModerationBody = {
  type?: ModerationType
  id?: string
  action?: ModerationAction
}

function getSellerStatus(seller: { status?: string; permanent_ban?: boolean }) {
  if (seller.status) return seller.status
  if (seller.permanent_ban) return 'suspended'
  return 'pending'
}

export async function GET() {
  try {
    const supabase = createAdminClient()

    const sellersResult = await supabase.from('sellers').select('*').order('created_at', { ascending: false })

    if (sellersResult.error) {
      return NextResponse.json({ error: sellersResult.error.message }, { status: 500 })
    }

    const [pendingTestimonialsResult, pendingProductsResult, complaintsResult, buyersResult] = await Promise.all([
      supabase.from('testimonials').select('*').eq('is_approved', false).order('created_at', { ascending: false }),
      supabase.from('products').select('*').eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('suspended_sellers').select('*').order('suspend_date', { ascending: false }),
      supabase.from('buyers').select('id', { count: 'exact', head: true }),
    ])

    const sellers = sellersResult.data ?? []

    return NextResponse.json({
      sellers,
      pendingSellers: sellers.filter((seller) => getSellerStatus(seller) === 'pending'),
      activeSellers: sellers.filter((seller) => getSellerStatus(seller) === 'active'),
      pendingTestimonials: pendingTestimonialsResult.error ? [] : pendingTestimonialsResult.data ?? [],
      pendingProducts: pendingProductsResult.error ? [] : pendingProductsResult.data ?? [],
      complaints: complaintsResult.error ? [] : complaintsResult.data ?? [],
      buyerCount: buyersResult.count ?? 0,
      warnings: [
        pendingTestimonialsResult.error?.message,
        pendingProductsResult.error?.message,
        complaintsResult.error?.message,
        buyersResult.error?.message,
      ].filter(Boolean),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to load moderation data' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as ModerationBody

    if (!body.type || !body.id || !body.action) {
      return NextResponse.json({ error: 'Missing moderation request fields' }, { status: 400 })
    }

    const supabase = createAdminClient()
    let result

    if (body.type === 'seller') {
      result = await supabase
        .from('sellers')
        .update(body.action === 'approve' ? { status: 'active', approved_at: new Date().toISOString() } : { status: 'rejected' })
        .eq('id', body.id)

      if (result.error?.message.includes('approved_at')) {
        result = await supabase
          .from('sellers')
          .update({ status: body.action === 'approve' ? 'active' : 'rejected' })
          .eq('id', body.id)
      }

      if (result.error?.message.includes('status')) {
        result = await supabase
          .from('sellers')
          .update({ permanent_ban: body.action === 'reject' })
          .eq('id', body.id)
      }
    } else if (body.type === 'testimonial') {
      if (body.action === 'approve') {
        const testimonial = await supabase
          .from('testimonials')
          .select('seller_id')
          .eq('id', body.id)
          .single()

        if (testimonial.error) {
          return NextResponse.json({ error: testimonial.error.message }, { status: 500 })
        }

        result = await supabase
          .from('testimonials')
          .update({ is_approved: true })
          .eq('id', body.id)

        if (!result.error && testimonial.data?.seller_id) {
          const approved = await supabase
            .from('testimonials')
            .select('id', { count: 'exact', head: true })
            .eq('seller_id', testimonial.data.seller_id)
            .eq('is_approved', true)

          if (!approved.error) {
            await supabase
              .from('sellers')
              .update({ testimonial_count: approved.count ?? 0 })
              .eq('id', testimonial.data.seller_id)
          }
        }
      } else {
        result = await supabase.from('testimonials').delete().eq('id', body.id)
      }
    } else if (body.type === 'product') {
      result = await supabase
        .from('products')
        .update({ status: body.action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', body.id)
    } else {
      result = await supabase
        .from('suspended_sellers')
        .update({ appeal_status: body.action === 'approve' || body.action === 'dismiss' ? 'approved' : 'rejected' })
        .eq('id', body.id)
    }

    if (result?.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to update moderation item' },
      { status: 500 },
    )
  }
}
