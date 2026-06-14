import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { ShopSlugRedirect } from '@/app/shop/_ShopSlugRedirect'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://lokalgo.app'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type SellerRow = { id: string; shop_name: string; slug?: string | null }

async function fetchSellerBySlug(slug: string): Promise<SellerRow | null> {
  // Service role key bypasses RLS — required for server-side metadata generation
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Primary: slug lookup
  try {
    const { data, error } = await supabase
      .from('sellers')
      .select('id, shop_name, slug')
      .eq('slug', slug)
      .maybeSingle()

    if (error) console.error('[SHOP METADATA FETCH ERROR] slug lookup:', error)
    if (data) return data as SellerRow
  } catch (err) {
    console.error('[SHOP METADATA FETCH ERROR] slug lookup threw:', err)
  }

  // Fallback: UUID lookup only when param is actually a UUID
  if (UUID_RE.test(slug)) {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('id, shop_name, slug')
        .eq('id', slug)
        .maybeSingle()

      if (error) console.error('[SHOP METADATA FETCH ERROR] id lookup:', error)
      if (data) return data as SellerRow
    } catch (err) {
      console.error('[SHOP METADATA FETCH ERROR] id lookup threw:', err)
    }
  }

  return null
}

export async function generateMetadata(
  { params }: { params: { id: string } },
): Promise<Metadata> {
  const slug = params.id
  const seller = await fetchSellerBySlug(slug)

  if (!seller) {
    return {
      metadataBase: new URL(SITE_URL),
      title: 'Kedai | LokalGo',
    }
  }

  const shopName = seller.shop_name
  const shopSlug = seller.slug ?? seller.id
  const shopUrl  = `${SITE_URL}/shop/${shopSlug}`
  const ogImage  = `${SITE_URL}/api/og/shop/${shopSlug}`

  return {
    metadataBase: new URL(SITE_URL),
    title: `${shopName} di LokalGo`,
    description: `Cari ${shopName} di LokalGo.`,
    openGraph: {
      title: `${shopName} di LokalGo`,
      description: `Cari ${shopName} di LokalGo.`,
      url: shopUrl,
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${shopName} di LokalGo` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${shopName} di LokalGo`,
      description: `Cari ${shopName} di LokalGo.`,
      images: [ogImage],
    },
  }
}

export default async function ShopBySlugPage({ params }: { params: { id: string } }) {
  const seller = await fetchSellerBySlug(params.id)
  if (!seller) notFound()
  return <ShopSlugRedirect sellerId={seller.id} />
}
