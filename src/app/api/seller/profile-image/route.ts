import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function fileExtension(type: string) {
  if (type === 'image/png') return 'png'
  if (type === 'image/webp') return 'webp'
  return 'jpg'
}

export async function POST(request: Request) {
  const adminClient = createAdminClient()
  const authHeader = request.headers.get('Authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  const { data: { user }, error: authError } = bearerToken
    ? await adminClient.auth.getUser(bearerToken)
    : await createServerClient().auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Only JPG, PNG or WEBP images are allowed' }, { status: 400 })
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'Image must be 2MB or smaller' }, { status: 400 })
  }

  const path = `sellers/${user.id}/${Date.now()}.${fileExtension(file.type)}`
  const { error: uploadError } = await adminClient.storage
    .from('profile-images')
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = adminClient.storage.from('profile-images').getPublicUrl(path)

  return NextResponse.json({ url: data.publicUrl })
}
