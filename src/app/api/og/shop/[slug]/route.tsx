import { ImageResponse } from 'next/og'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const revalidate = 3600

function nameFontSize(name: string): number {
  const len = name.length
  if (len <= 18) return 76
  if (len <= 28) return 64
  if (len <= 42) return 54
  return 44
}

function urlFontSize(display: string): number {
  return display.length > 40 ? 22 : 30
}

async function fetchSeller(slug: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Try slug lookup first, then fall back to UUID id lookup
  try {
    const { data } = await supabase
      .from('sellers')
      .select('id, shop_name, slug')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .eq('status', 'active')
      .maybeSingle()
    if (data) return data
  } catch {
    // slug column may not exist yet — try id-only
  }

  const { data } = await supabase
    .from('sellers')
    .select('id, shop_name')
    .eq('id', slug)
    .eq('status', 'active')
    .maybeSingle()
  return data as { id: string; shop_name: string; slug?: string | null } | null
}

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const { slug } = params

  const seller = await fetchSeller(slug)
  const shopName = seller?.shop_name ?? 'LokalGo'
  const shopSlug = seller?.slug ?? slug

  const bgBuffer = fs.readFileSync(
    path.join(process.cwd(), 'public/assets/SocialSharePoster.png'),
  )
  const bgSrc = `data:image/png;base64,${bgBuffer.toString('base64')}`

  const nameSize = nameFontSize(shopName)
  const displayUrl = `lokalgo.app/shop/${shopSlug}`
  const urlSize = urlFontSize(displayUrl)

  return new ImageResponse(
    (
      <div style={{ display: 'flex', width: 1200, height: 630, position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bgSrc}
          alt=""
          style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630 }}
        />

        {/* Shop name overlay — left:430 top:225 width:660 height:155 */}
        <div
          style={{
            position: 'absolute',
            left: 430,
            top: 225,
            width: 660,
            height: 155,
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

        {/* Shop URL overlay — left:455 top:420 width:610 height:42 */}
        <div
          style={{
            position: 'absolute',
            left: 455,
            top: 420,
            width: 610,
            height: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: urlSize,
              fontWeight: 800,
              color: '#FFFFFF',
              lineHeight: 1,
            }}
          >
            {displayUrl}
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
