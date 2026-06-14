import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ShopSlugRedirect } from '@/app/shop/_ShopSlugRedirect'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lokalgo.app'

async function fetchSellerBySlug(slug: string) {
  const supabase = createClient()

  // Try slug + id combined lookup (graceful fallback if slug column missing)
  try {
    const { data } = await supabase
      .from('sellers')
      .select('id, shop_name, slug')
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .eq('status', 'active')
      .maybeSingle()
    if (data) return data as { id: string; shop_name: string; slug?: string | null }
  } catch {
    // slug column not yet migrated — fall through to id-only lookup
  }

  const { data } = await supabase
    .from('sellers')
    .select('id, shop_name')
    .eq('id', slug)
    .eq('status', 'active')
    .maybeSingle()
  return data as { id: string; shop_name: string; slug?: string | null } | null
}

export async function generateMetadata(
  { params }: { params: { id: string } },
): Promise<Metadata> {
  const seller = await fetchSellerBySlug(params.id)
  if (!seller) return { title: 'Kedai | LokalGo' }

  const shopName = seller.shop_name
  const shopSlug = seller.slug ?? seller.id
  const shopUrl  = `${SITE_URL}/shop/${shopSlug}`
  const ogImage  = `${SITE_URL}/api/og/shop/${shopSlug}`

  return {
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
