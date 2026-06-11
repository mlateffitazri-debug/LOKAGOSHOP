import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

// Client compresses to WebP before upload; 500 KB is generous headroom
const MAX_IMAGE_BYTES = 500 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

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

  if (!ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase())) {
    return NextResponse.json(
      { error: 'Only JPG, PNG, WebP or HEIC images are allowed' },
      { status: 400 },
    )
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: `Image must be ${MAX_IMAGE_BYTES / 1024}KB or smaller after compression` },
      { status: 400 },
    )
  }

  // Output is always WebP (client compresses before sending)
  const ext = file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `sellers/${user.id}/${Date.now()}.${ext}`

  const { error: uploadError } = await adminClient.storage
    .from('profile-images')
    .upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = adminClient.storage.from('profile-images').getPublicUrl(path)

  return NextResponse.json({ url: data.publicUrl })
}
