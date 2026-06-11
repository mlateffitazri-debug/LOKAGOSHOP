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

// Verify actual file content via magic bytes — client-supplied MIME type is untrusted
async function detectImageType(file: File): Promise<string | null> {
  const buf = await file.slice(0, 12).arrayBuffer()
  const bytes = new Uint8Array(buf)
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return 'image/jpeg'
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'image/png'
  // WebP: RIFF....WEBP
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp'
  // HEIC/HEIF — no reliable magic bytes at offset 0, allow if declared and size is ok
  if (file.type === 'image/heic' || file.type === 'image/heif') return file.type
  return null
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

  const detectedType = await detectImageType(file)
  if (!detectedType) {
    return NextResponse.json(
      { error: 'File content does not match a supported image format' },
      { status: 400 },
    )
  }

  const extMap: Record<string, string> = { 'image/webp': 'webp', 'image/png': 'png', 'image/heic': 'heic', 'image/heif': 'heif' }
  const ext = extMap[detectedType] ?? 'jpg'
  const path = `sellers/${user.id}/${Date.now()}.${ext}`

  const { error: uploadError } = await adminClient.storage
    .from('profile-images')
    .upload(path, file, {
      contentType: detectedType,
      cacheControl: '31536000',
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = adminClient.storage.from('profile-images').getPublicUrl(path)

  return NextResponse.json({ url: data.publicUrl })
}
