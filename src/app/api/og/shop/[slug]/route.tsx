import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const revalidate = 3600

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function nameFontSize(name: string): number {
  const len = name.length
  if (len <= 15) return 68
  if (len <= 22) return 58
  if (len <= 32) return 48
  return 38
}

type SellerRow = { id: string; shop_name: string; slug?: string | null }
type ProductRow = { id: string; name: string | null; images: string[] }

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}

async function fetchSeller(slug: string): Promise<SellerRow | null> {
  const supabase = getSupabase()
  console.log('[OG SHOP SLUG]', slug)

  try {
    const { data, error } = await supabase
      .from('sellers')
      .select('id, shop_name, slug')
      .eq('slug', slug)
      .maybeSingle()
    if (error) console.error('[OG SHOP FETCH ERROR] slug lookup:', error)
    else if (data) return data as SellerRow
  } catch (err) {
    console.error('[OG SHOP FETCH ERROR] slug lookup threw:', err)
  }

  if (UUID_RE.test(slug)) {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('id, shop_name, slug')
        .eq('id', slug)
        .maybeSingle()
      if (error) console.error('[OG SHOP FETCH ERROR] id lookup:', error)
      else if (data) return data as SellerRow
    } catch (err) {
      console.error('[OG SHOP FETCH ERROR] id lookup threw:', err)
    }
  }

  console.error('[OG SHOP FETCH ERROR] seller not found for slug:', slug)
  return null
}

async function fetchProducts(sellerId: string): Promise<ProductRow[]> {
  try {
    const supabase = getSupabase()
    const { data } = await supabase
      .from('products')
      .select('id, name, images')
      .eq('seller_id', sellerId)
      .eq('status', 'approved')
      .limit(10)
      .order('created_at', { ascending: false })
    return ((data ?? []) as ProductRow[])
      .filter((p) => Array.isArray(p.images) && p.images.length > 0)
      .slice(0, 3)
  } catch {
    return []
  }
}

function isHttpUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

async function prefetchImages(urls: string[]): Promise<string[]> {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const ab = await res.arrayBuffer()
      const jpegBuf = await sharp(Buffer.from(ab))
        .resize(460, 180, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 82 })
        .toBuffer()
      return `data:image/jpeg;base64,${jpegBuf.toString('base64')}`
    }),
  )
  return results
    .filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled')
    .map((r) => r.value)
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = params

  const seller = await fetchSeller(slug)
  if (!seller) return new Response(`Shop not found: ${slug}`, { status: 404 })

  const shopName = seller.shop_name
  const nameSize = nameFontSize(shopName)

  // card.png is the full OG background — logo, phone mockup, and www text are
  // already baked in. Only shop name, product images, and CTA are overlaid.
  const bgBuffer = fs.readFileSync(path.join(process.cwd(), 'public/assets/card.png'))
  const bgSrc = `data:image/png;base64,${bgBuffer.toString('base64')}`

  const rawProducts = await fetchProducts(seller.id)
  const productUrls = rawProducts
    .filter((p) => isHttpUrl(p.images[0]))
    .map((p) => p.images[0])
  const productImgs = await prefetchImages(productUrls)

  const buildResponse = async (thumbDataUrls: string[]) => {
    const hasImages = thumbDataUrls.length > 0
    const imgCount = thumbDataUrls.length

    const imgW = imgCount === 1 ? 430 : imgCount === 2 ? 260 : 205
    const imgH = imgCount === 1 ? 170 : imgCount === 2 ? 150 : 140
    const imgGap = imgCount === 1 ? 0 : imgCount === 2 ? 18 : 16

    // When no products: vertically centre the name+CTA block in the content zone
    const nameTop = hasImages ? 95 : 226
    const ctaTop = hasImages ? 420 : 365

    const imgRes = new ImageResponse(
      (
        <div style={{ display: 'flex', width: 1200, height: 630, position: 'relative' }}>
          {/* card.png — full bleed background; all branding baked in */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgSrc}
            alt=""
            style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630 }}
          />

          {/* ① Shop name — safe zone x:430–1150, starts at y:95 */}
          <div
            style={{
              position: 'absolute',
              left: 430,
              top: nameTop,
              width: 720,
              height: 115,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 12px',
            }}
          >
            <span
              style={{
                fontSize: nameSize,
                fontWeight: 900,
                color: '#B9E51B',
                lineHeight: 1.1,
                letterSpacing: '-0.5px',
                textAlign: 'center',
                wordBreak: 'break-word',
              }}
            >
              {shopName.toUpperCase()}
            </span>
          </div>

          {/* ② Product images — flex row centered, 3/2/1 count variants */}
          {hasImages && (
            <div
              style={{
                position: 'absolute',
                left: 430,
                top: 235,
                width: 720,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: imgGap,
              }}
            >
              {thumbDataUrls.map((src, i) => (
                <div
                  key={i}
                  style={{
                    width: imgW,
                    height: imgH,
                    borderRadius: 12,
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    style={{ width: imgW, height: imgH, objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* ③ CTA "Lihat Menu" — pill button, #B9E51B on #7B1533 text */}
          <div
            style={{
              position: 'absolute',
              left: 430,
              top: ctaTop,
              width: 720,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: 240,
                height: 58,
                borderRadius: 29,
                backgroundColor: '#B9E51B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: '#7B1533',
                  letterSpacing: '0.5px',
                }}
              >
                Lihat Menu
              </span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
    )
    const buf = await imgRes.arrayBuffer()
    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
  }

  try {
    return await buildResponse(productImgs)
  } catch (err) {
    console.error('[OG SHOP] Render with thumbnails failed, falling back:', err)
    try {
      return await buildResponse([])
    } catch (err2) {
      console.error('[OG SHOP] Fallback render also failed:', err2)
      return new Response('Error generating image', { status: 500 })
    }
  }
}
