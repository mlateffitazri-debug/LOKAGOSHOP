import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/access'
import { createAdminClient } from '@/lib/supabase/admin'
import { safeError } from '@/lib/safe-error'
import {
  BUSINESS_TYPE_OPTIONS,
  isBusinessType,
  normalizeBusinessType,
  normalizePlanType,
} from '@/lib/business-types'

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const body = await request.json() as {
      id?: string
      shop_name?: string
      whatsapp_number?: string
      kawasan?: string
      postcode?: string
      is_open?: boolean
      business_type?: string
      plan_type?: string
      listing_limit?: number | string
      cascade?: 'none' | 'all_listings'
    }

    const { id, cascade, ...updates } = body
    if (!id) return NextResponse.json({ error: 'Missing seller id' }, { status: 400 })

    // Validate business_type explicitly so a typo doesn't silently fall back to FOOD
    if (updates.business_type !== undefined && !isBusinessType(String(updates.business_type).toUpperCase())) {
      return NextResponse.json(
        { error: `Invalid business_type. Must be one of: ${BUSINESS_TYPE_OPTIONS.join(', ')}` },
        { status: 400 },
      )
    }

    // Validate listing_limit explicitly so a negative value is rejected rather than floored
    if (updates.listing_limit !== undefined) {
      const limit = typeof updates.listing_limit === 'number' ? updates.listing_limit : Number(updates.listing_limit)
      if (!Number.isFinite(limit) || limit < 0) {
        return NextResponse.json({ error: 'listing_limit cannot be negative' }, { status: 400 })
      }
    }

    // Only columns that actually exist on the sellers table
    const allowed = ['shop_name', 'whatsapp_number', 'kawasan', 'postcode', 'is_open', 'business_type', 'plan_type', 'listing_limit']
    const patch: Record<string, unknown> = {}
    for (const k of allowed) {
      if (k in updates && updates[k as keyof typeof updates] !== undefined) {
        patch[k] = updates[k as keyof typeof updates]
      }
    }

    if (patch.business_type !== undefined) patch.business_type = normalizeBusinessType(patch.business_type)
    if (patch.plan_type !== undefined) patch.plan_type = normalizePlanType(patch.plan_type)
    if (patch.listing_limit !== undefined) patch.listing_limit = Math.trunc(Number(patch.listing_limit))

    if (!Object.keys(patch).length) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('sellers').update(patch).eq('id', id)
    if (error) return NextResponse.json({ error: safeError(error) }, { status: 500 })

    // Explicit opt-in cascade: update this seller's listings to match the new business_type.
    // Never automatic — admin must pass cascade: 'all_listings'.
    if (cascade === 'all_listings' && patch.business_type) {
      const { error: cascadeError } = await supabase
        .from('products')
        .update({ listing_type: patch.business_type })
        .eq('seller_id', id)
      if (cascadeError) {
        return NextResponse.json(
          { ok: true, cascadeError: safeError(cascadeError, 'Seller updated, but listing cascade failed') },
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: safeError(err, 'Failed to update seller') }, { status: 500 })
  }
}
