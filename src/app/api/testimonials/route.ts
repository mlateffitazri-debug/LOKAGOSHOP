import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type TestimonialBody = {
  seller_id?: string
  buyer_name?: string
  buyer_kawasan?: string
  rating?: number
  content?: string
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TestimonialBody
    const rating = Number(body.rating)

    if (!body.seller_id || !body.content?.trim() || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid testimonial submission' }, { status: 400 })
    }

    if (process.env.LOKALGO_E2E_MOCK === '1') {
      return NextResponse.json({ ok: true, testimonialId: 'mock-testimonial-id' }, { status: 201 })
    }

    const supabase = createAdminClient()

    const { data: seller, error: sellerError } = await supabase
      .from('sellers')
      .select('id')
      .eq('id', body.seller_id)
      .maybeSingle()

    if (sellerError) {
      return NextResponse.json({ error: 'Unable to verify seller' }, { status: 500 })
    }

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 })
    }

    const { error } = await supabase.from('testimonials').insert({
      seller_id: body.seller_id,
      buyer_name: body.buyer_name?.trim() || 'Pembeli LokalGo',
      buyer_kawasan: body.buyer_kawasan?.trim() || null,
      rating,
      content: body.content.trim(),
      is_approved: false,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to submit testimonial' },
      { status: 500 },
    )
  }
}
