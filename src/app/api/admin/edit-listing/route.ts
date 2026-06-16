import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/access'
import { createAdminClient } from '@/lib/supabase/admin'
import { safeError } from '@/lib/safe-error'
import { BUSINESS_TYPE_OPTIONS, isBusinessType } from '@/lib/business-types'

const STATUS_OPTIONS = ['pending', 'approved', 'rejected'] as const

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const body = await request.json() as {
      id?: string
      name?: string
      description?: string
      price_from?: number | string
      unit?: string
      listing_type?: string
      category?: string
      status?: string
      is_available?: boolean
      is_preorder?: boolean
    }

    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'Missing listing id' }, { status: 400 })

    if (updates.listing_type !== undefined && !isBusinessType(String(updates.listing_type).toUpperCase())) {
      return NextResponse.json(
        { error: `Invalid listing_type. Must be one of: ${BUSINESS_TYPE_OPTIONS.join(', ')}` },
        { status: 400 },
      )
    }

    if (updates.status !== undefined && !(STATUS_OPTIONS as readonly string[]).includes(updates.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${STATUS_OPTIONS.join(', ')}` },
        { status: 400 },
      )
    }

    if (updates.price_from !== undefined) {
      const price = typeof updates.price_from === 'number' ? updates.price_from : Number(updates.price_from)
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json({ error: 'price_from cannot be negative' }, { status: 400 })
      }
    }

    // Category is intentionally NOT validated against the fixed list — legacy values
    // (e.g. "Set Makanan & Lauk") must remain editable/storable so admin can correct
    // old data without the API rejecting the very value it's trying to fix.
    const allowed = ['name', 'description', 'price_from', 'unit', 'listing_type', 'category', 'status', 'is_available', 'is_preorder']
    const patch: Record<string, unknown> = {}
    for (const k of allowed) {
      if (k in updates && updates[k as keyof typeof updates] !== undefined) {
        patch[k] = updates[k as keyof typeof updates]
      }
    }

    if (patch.listing_type !== undefined) patch.listing_type = String(patch.listing_type).toUpperCase()
    if (patch.price_from !== undefined) patch.price_from = Number(patch.price_from)

    if (!Object.keys(patch).length) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('products').update(patch).eq('id', id)
    if (error) return NextResponse.json({ error: safeError(error) }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: safeError(err, 'Failed to update listing') }, { status: 500 })
  }
}
