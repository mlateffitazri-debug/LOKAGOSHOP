import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

export async function DELETE() {
  try {
    const authClient = createServerClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    // Delete buyer record
    await adminClient.from('buyers').delete().eq('user_id', user.id)

    // For sellers: mark as deleted, anonymise PII — keep record for audit (PDPA retention)
    const { data: seller } = await adminClient
      .from('sellers')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (seller) {
      await adminClient.from('sellers').update({
        shop_name: '[Akaun Dipadam]',
        email: null,
        whatsapp_number: '000000000000',
        profile_image_url: null,
        latitude: null,
        longitude: null,
        status: 'rejected',
        user_id: null,
      }).eq('id', seller.id)

      // Delete seller's products and testimonials
      await adminClient.from('products').delete().eq('seller_id', seller.id)
      await adminClient.from('testimonials').delete().eq('seller_id', seller.id)
      await adminClient.from('saved_shops').delete().eq('shop_id', seller.id)
    }

    // Delete saved shops by this buyer
    await adminClient.from('saved_shops').delete().eq('buyer_id', user.id)

    // Delete the auth user (this cascades to all auth-linked data)
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id)
    if (deleteError) {
      console.error('account/delete: failed to delete auth user', deleteError.message)
      return NextResponse.json({ error: 'Gagal memadam akaun. Sila hubungi support.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Akaun berjaya dipadam.' })
  } catch (err) {
    console.error('account/delete error:', err)
    return NextResponse.json({ error: 'Ralat dalaman berlaku' }, { status: 500 })
  }
}
