import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin/access'
import { createAdminClient } from '@/lib/supabase/admin'
import { safeError } from '@/lib/safe-error'

export async function PATCH(request: Request) {
  try {
    const admin = await requireAdmin()
    if (!admin.ok) return admin.response

    const body = await request.json() as {
      id?: string
      shop_name?: string
      description?: string
      logo_url?: string
      whatsapp_number?: string
      kawasan?: string
      postcode?: string
      is_open?: boolean
    }

    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'Missing seller id' }, { status: 400 })

    const allowed = ['shop_name', 'description', 'logo_url', 'whatsapp_number', 'kawasan', 'postcode', 'is_open']
    const patch: Record<string, unknown> = {}
    for (const k of allowed) {
      if (k in updates && updates[k as keyof typeof updates] !== undefined) {
        patch[k] = updates[k as keyof typeof updates]
      }
    }

    if (!Object.keys(patch).length) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('sellers').update(patch).eq('id', id)
    if (error) return NextResponse.json({ error: safeError(error) }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: safeError(err, 'Failed to update seller') }, { status: 500 })
  }
}
