'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Buyer, Seller, Testimonial } from '@/types/database'

type TestimonialWithShop = Testimonial & {
  shopName: string
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function Stars({ rating }: { rating: number }) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating || 0)))

  return (
    <span aria-label={`${safeRating} bintang`} className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < safeRating ? 'text-[#F0C040]' : 'text-[#D7D7D7]'}>
          {'\u2605'}
        </span>
      ))}
    </span>
  )
}

export default function TestimonialsPage() {
  const router = useRouter()
  const [items, setItems] = useState<TestimonialWithShop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const content = useMemo(() => {
    if (isLoading) {
      return (
        <div className="rounded-[18px] bg-white p-5 text-center text-sm font-semibold text-[#555555] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          Memuatkan testimoni...
        </div>
      )
    }

    if (error) {
      return (
        <div className="rounded-[18px] bg-white p-5 text-center text-sm font-semibold text-[#7B1533] shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          {error}
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div className="rounded-[18px] bg-white p-6 text-center shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F7F0F3] text-2xl text-[#7B1533]">
            {'\u{1F4AC}'}
          </div>
          <p className="mt-4 text-sm font-bold text-[#111111]">Anda belum menulis sebarang testimoni</p>
        </div>
      )
    }

    return (
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-[18px] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-base font-extrabold text-[#111111]">{item.shopName}</h2>
                <p className="mt-1 text-[11px] font-semibold text-[#888888]">{formatDate(item.created_at)}</p>
              </div>
              <Stars rating={item.rating} />
            </div>

            <p className="mt-3 text-sm leading-6 text-[#555555]">{item.content}</p>

            <Link
              href={`/shop/${item.seller_id}`}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#7B1533] px-4 py-3 text-sm font-extrabold text-white"
            >
              Lawati Kedai
            </Link>
          </article>
        ))}
      </div>
    )
  }, [error, isLoading, items])

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function loadTestimonials() {
      setIsLoading(true)
      setError(null)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.replace('/auth')
        return
      }

      const { data: buyerData, error: buyerError } = await supabase
        .from('buyers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (cancelled) return

      if (buyerError) {
        setError('Profil pembeli tidak dapat dimuatkan')
        setIsLoading(false)
        return
      }

      const buyer = buyerData as Buyer | null
      if (!buyer?.id) {
        setItems([])
        setIsLoading(false)
        return
      }

      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('buyer_id', buyer.id)
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (testimonialsError) {
        setError('Testimoni anda tidak dapat dimuatkan')
        setIsLoading(false)
        return
      }

      const testimonials = (testimonialsData ?? []) as Testimonial[]
      const sellerIds = Array.from(new Set(testimonials.map((item) => item.seller_id).filter(Boolean)))
      let sellersById = new Map<string, Seller>()

      if (sellerIds.length > 0) {
        const { data: sellersData } = await supabase
          .from('sellers')
          .select('*')
          .in('id', sellerIds)

        sellersById = new Map(((sellersData ?? []) as Seller[]).map((seller) => [seller.id, seller]))
      }

      if (!cancelled) {
        setItems(
          testimonials.map((item) => ({
            ...item,
            shopName: sellersById.get(item.seller_id)?.shop_name || 'Kedai LokalGo',
          })),
        )
        setIsLoading(false)
      }
    }

    loadTestimonials().catch((loadError) => {
      console.error(loadError)
      if (!cancelled) {
        setError('Testimoni anda tidak dapat dimuatkan')
        setIsLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-['Plus_Jakarta_Sans',sans-serif] text-[#111111] min-[500px]:flex min-[500px]:items-start min-[500px]:justify-center min-[500px]:p-10 min-[1024px]:items-center">
      <section className="min-h-screen w-full max-w-[430px] overflow-hidden bg-[#F5F5F5] min-[500px]:min-h-0 min-[500px]:rounded-[36px] min-[500px]:border-8 min-[500px]:border-[#1a1a1a] min-[500px]:shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        <div className="h-[812px] overflow-y-auto pb-6">
          <header className="bg-[#7B1533] px-5 pb-5 pt-4 text-white">
            <button
              type="button"
              onClick={() => router.push('/home')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-lg font-bold text-white"
              aria-label="Kembali ke home"
            >
              {'<'}
            </button>
            <h1 className="mt-5 text-2xl font-extrabold">Testimoni Saya</h1>
            <p className="mt-1 text-xs font-semibold text-white/65">Sejarah ulasan yang pernah anda tulis</p>
          </header>

          <div className="px-5 py-5">{content}</div>
        </div>
      </section>
    </main>
  )
}
