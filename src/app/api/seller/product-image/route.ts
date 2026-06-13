import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'

const MAX_IMAGE_BYTES = 1024 * 1024 // 1 MB
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])

async function detectImageType(file: File): Promise<string | null> {
  const buf = await file.slice(0, 12).arrayBuffer()
  const b = new Uint8Array(buf)
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return 'image/jpeg'
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return 'image/png'
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'image/webp'
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

  // Verify caller is a seller
  const { data: seller } = await adminClient
    .from('sellers')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!seller) {
    return NextResponse.json({ error: 'Seller profile not found' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type.toLowerCase())) {
    return NextResponse.json({ error: 'Only JPG, PNG, WebP or HEIC images are allowed' }, { status: 400 })
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: 'Image must be 1MB or smaller' }, { status: 400 })
  }

  const detectedType = await detectImageType(file)
  if (!detectedType) {
    return NextResponse.json({ error: 'File content does not match a supported image format' }, { status: 400 })
  }

  const extMap: Record<string, string> = { 'image/webp': 'webp', 'image/png': 'png', 'image/heic': 'heic', 'image/heif': 'heif' }
  const ext = extMap[detectedType] ?? 'jpg'
  const path = `products/${seller.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error: uploadError } = await adminClient.storage
    .from('product-images')
    .upload(path, file, { contentType: detectedType, cacheControl: '31536000', upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = adminClient.storage.from('product-images').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
