import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const revalidate = 3600

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function nameFontSize(name: string): number {
  const len = name.length
  if (len <= 18) return 72
  if (len <= 28) return 62
  if (len <= 42) return 52
  return 42
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

  // Primary: look up by slug (no status filter — service key bypasses RLS)
  try {
    const { data, error } = await supabase
      .from('sellers')
      .select('id, shop_name, slug')
      .eq('slug', slug)
      .maybeSingle()

    if (error) {
      console.error('[OG SHOP FETCH ERROR] slug lookup:', error)
    } else if (data) {
      return data as SellerRow
    }
  } catch (err) {
    console.error('[OG SHOP FETCH ERROR] slug lookup threw:', err)
  }

  // Fallback: UUID lookup only when param looks like a UUID
  if (UUID_RE.test(slug)) {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('id, shop_name, slug')
        .eq('id', slug)
        .maybeSingle()

      if (error) {
        console.error('[OG SHOP FETCH ERROR] id lookup:', error)
      } else if (data) {
        return data as SellerRow
      }
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

// Pre-fetch product images and convert to base64 data URIs so Satori never
// makes external requests during render (which fail silently inside the stream).
async function prefetchImages(urls: string[]): Promise<string[]> {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const ab = await res.arrayBuffer()
      const ct = res.headers.get('content-type') || 'image/jpeg'
      return `data:${ct};base64,${Buffer.from(ab).toString('base64')}`
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
  if (!seller) {
    return new Response(`Shop not found: ${slug}`, { status: 404 })
  }

  const shopName = seller.shop_name
  const nameSize = nameFontSize(shopName)

  const bgBuffer = fs.readFileSync(
    path.join(process.cwd(), 'public/assets/SocialSharePoster.png'),
  )
  const bgSrc = `data:image/png;base64,${bgBuffer.toString('base64')}`

  // Pre-fetch product images as base64 so Satori never makes external requests.
  // If any image URL is unreachable it is silently dropped; if all fail we get [].
  const rawProducts = await fetchProducts(seller.id)
  const productUrls = rawProducts
    .filter((p) => isHttpUrl(p.images[0]))
    .map((p) => p.images[0])
  const productImgs = await prefetchImages(productUrls)

  // Force eager rendering: consume the ImageResponse stream inside our handler
  // so any Satori error is caught by our try/catch instead of crashing Next.js's
  // response pipe (which produces an unrecoverable HTML 500).
  const buildResponse = async (thumbDataUrls: string[]) => {
    const imgRes = new ImageResponse(
      (
        <div style={{ display: 'flex', width: 1200, height: 630, position: 'relative' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgSrc}
            alt=""
            style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630 }}
          />

          {/* SHOP_NAME overlay — left:430 top:250 width:650 height:120 */}
          <div
            style={{
              position: 'absolute',
              left: 430,
              top: 250,
              width: 650,
              height: 120,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '0 8px',
            }}
          >
            <span
              style={{
                fontSize: nameSize,
                fontWeight: 900,
                color: '#B9E51B',
                lineHeight: 1.05,
                letterSpacing: '-1px',
                textAlign: 'center',
                wordBreak: 'break-word',
              }}
            >
              {shopName.toUpperCase()}
            </span>
          </div>

          {/* PRODUCT THUMBNAILS — up to 3, below shop name (base64 data URIs) */}
          {thumbDataUrls.length > 0 && (
            <div
              style={{
                position: 'absolute',
                left: 440,
                top: 382,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {thumbDataUrls.map((src, i) => (
                <div
                  key={i}
                  style={{
                    width: 196,
                    height: 110,
                    marginRight: i < thumbDataUrls.length - 1 ? 12 : 0,
                    borderRadius: 10,
                    overflow: 'hidden',
                    flexShrink: 0,
                    display: 'flex',
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    style={{ width: 196, height: 110, objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ),
      { width: 1200, height: 630 },
    )
    // Consume the stream now — throws here if Satori fails, not during pipe
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
