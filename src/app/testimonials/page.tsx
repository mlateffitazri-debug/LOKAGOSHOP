'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Buyer, Seller, Testimonial } from '@/types/database'

type TestimonialWithShop = Testimonial & {
  shopName: string
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box}
body{margin:0;background:#0a0a0a;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111}
.page-wrap{width:100%;max-width:430px;min-height:100vh;margin:0 auto;background:#fff;overflow:hidden}
.scroll{min-height:100vh;background:#F5F5F5}
.header{background:#7B1533;color:#fff;padding:16px 20px 22px}
.back-btn{width:38px;height:38px;border:1px solid rgba(255,255,255,0.18);border-radius:999px;background:rgba(255,255,255,0.12);color:#fff;font-size:20px;font-weight:800;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer}
.title{margin:20px 0 0;font-size:24px;font-weight:800;line-height:1.15}
.subtitle{margin:6px 0 0;font-size:12px;font-weight:600;color:rgba(255,255,255,0.66)}
.body{padding:4px 0 22px;background:#F5F5F5}
.card{margin:12px 16px;padding:14px;border-radius:12px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.05)}
.card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.shop-name{min-width:0;font-size:15px;font-weight:800;color:#111;line-height:1.3}
.date{margin-top:4px;font-size:11px;font-weight:600;color:#888}
.stars{display:flex;gap:1px;white-space:nowrap;font-size:15px;letter-spacing:0}
.star-filled{color:#F0C040}
.star-empty{color:#D7D7D7}
.review{margin:12px 0 0;font-size:13px;line-height:1.65;color:#555}
.visit-btn{display:inline-flex;align-items:center;justify-content:center;margin-top:12px;border:1.5px solid #7B1533;border-radius:10px;background:#fff;color:#7B1533;text-decoration:none;font-size:12px;font-weight:800;padding:8px 12px}
.state-card{margin:18px 16px;padding:28px 18px;border-radius:12px;background:#fff;text-align:center;box-shadow:0 2px 10px rgba(0,0,0,0.05)}
.state-icon{width:56px;height:56px;margin:0 auto 14px;border-radius:999px;background:#F7F0F3;color:#7B1533;display:flex;align-items:center;justify-content:center;font-size:26px}
.state-text{margin:0;font-size:14px;font-weight:800;color:#111;line-height:1.5}
.state-muted{margin:0;font-size:13px;font-weight:700;color:#555}
.error{color:#7B1533}
@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center}.page-wrap{min-height:812px;border:8px solid #1a1a1a;border-radius:36px;box-shadow:0 32px 80px rgba(0,0,0,0.7)}.scroll{min-height:812px}}
@media(min-width:1024px){body{min-height:100vh;align-items:center}}
`

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
    <span aria-label={`${safeRating} bintang`} className="stars">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < safeRating ? 'star-filled' : 'star-empty'}>
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
            shopName: sellersById.get(item.seller_id)?.shop_name || 'Kedai LokaGo',
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
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <main className="page-wrap">
        <div className="scroll">
          <header className="header">
            <button type="button" onClick={() => router.push('/home')} className="back-btn" aria-label="Kembali ke home">
              {'<'}
            </button>
            <h1 className="title">Testimoni Saya</h1>
            <p className="subtitle">Sejarah ulasan yang pernah anda tulis</p>
          </header>

          <section className="body">
            {isLoading ? (
              <div className="state-card">
                <p className="state-muted">Memuatkan testimoni...</p>
              </div>
            ) : error ? (
              <div className="state-card">
                <p className="state-text error">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="state-card">
                <div className="state-icon">{'\u{1F4AC}'}</div>
                <p className="state-text">Anda belum menulis sebarang testimoni</p>
              </div>
            ) : (
              items.map((item) => (
                <article key={item.id} className="card">
                  <div className="card-top">
                    <div>
                      <h2 className="shop-name">{item.shopName}</h2>
                      <p className="date">{formatDate(item.created_at)}</p>
                    </div>
                    <Stars rating={item.rating} />
                  </div>
                  <p className="review">{item.content}</p>
                  <Link href={`/shop/${item.seller_id}`} className="visit-btn">
                    Lawati Kedai
                  </Link>
                </article>
              ))
            )}
          </section>
        </div>
      </main>
    </>
  )
}
