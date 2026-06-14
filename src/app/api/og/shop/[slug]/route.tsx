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

async function fetchSeller(slug: string): Promise<SellerRow | null> {
  // Use service role key to bypass RLS — this route is server-only
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

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

  return new ImageResponse(
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
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
