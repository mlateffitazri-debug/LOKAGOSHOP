'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Buyer } from '@/types/database'

type ProfileData = {
  name: string
  email: string
  kawasan: string
  avatarUrl: string | null
  createdAt: string | null
}

type Counts = {
  savedShops: number
  testimonials: number
}

function initialFor(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'L'
}

function activeDays(createdAt: string | null) {
  if (!createdAt) return 0
  const created = new Date(createdAt).getTime()
  if (Number.isNaN(created)) return 0
  return Math.max(1, Math.ceil((Date.now() - created) / 86400000))
}

function metadataString(metadata: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = metadata[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return null
}

function MenuIcon({ children, tone }: { children: React.ReactNode; tone: string }) {
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
      {children}
    </span>
  )
}

function MenuRow({
  href,
  title,
  subtitle,
  badge,
  children,
}: {
  href: string
  title: string
  subtitle: string
  badge?: number
  children: React.ReactNode
}) {
  return (
    <Link href={href} className="flex items-center gap-3 border-b border-[#F3F3F3] px-4 py-4 last:border-b-0">
      {children}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#111111]">{title}</span>
        <span className="mt-0.5 block truncate text-[11px] text-[#888888]">{subtitle}</span>
      </span>
      {typeof badge === 'number' ? (
        <span className="rounded-full bg-[#7B1533] px-2.5 py-1 text-[10px] font-bold text-white">{badge}</span>
      ) : null}
      <span className="text-[#BBBBBB]">›</span>
    </Link>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData>({
    name: 'LokalGo',
    email: '',
    kawasan: 'Kawasan belum ditetapkan',
    avatarUrl: null,
    createdAt: null,
  })
  const [counts, setCounts] = useState<Counts>({ savedShops: 0, testimonials: 0 })
  const [isLoading, setIsLoading] = useState(true)

  const daysActive = useMemo(() => activeDays(profile.createdAt), [profile.createdAt])

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/auth')
        return
      }

      const metadata = user.user_metadata ?? {}
      const nameFromGoogle = metadataString(metadata, ['full_name', 'name'])
      const avatarUrl = metadataString(metadata, ['avatar_url', 'picture'])

      const { data: buyerData } = await supabase
        .from('buyers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (cancelled) return

      const buyer = buyerData as Buyer | null
      const nextProfile: ProfileData = {
        name: nameFromGoogle || buyer?.name || user.email || 'LokalGo',
        email: user.email || buyer?.email || '',
        kawasan: buyer?.kawasan || 'Kawasan belum ditetapkan',
        avatarUrl,
        createdAt: buyer?.created_at || user.created_at || null,
      }

      setProfile(nextProfile)

      let localSavedCount = 0
      try {
        const savedIds = JSON.parse(localStorage.getItem('lokalgo_saved_shop_ids') || '[]') as unknown
        localSavedCount = Array.isArray(savedIds) ? savedIds.length : 0
      } catch {
        localSavedCount = 0
      }

      const [{ count: savedCount }, { count: testimonialCount }] = await Promise.all([
        buyer
          ? supabase
              .from('saved_shops')
              .select('id', { count: 'exact', head: true })
              .eq('buyer_id', buyer.id)
          : Promise.resolve({ count: localSavedCount }),
        buyer
          ? supabase
              .from('testimonials')
              .select('id', { count: 'exact', head: true })
              .eq('buyer_id', buyer.id)
          : Promise.resolve({ count: 0 }),
      ])

      if (!cancelled) {
        setCounts({
          savedShops: savedCount ?? localSavedCount,
          testimonials: testimonialCount ?? 0,
        })
        setIsLoading(false)
      }
    }

    loadProfile().catch((err) => {
      console.error(err)
      if (!cancelled) setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [router])

  function signOut() {
    void fetch('/auth/signout', { method: 'POST' }).then(() => {
      router.replace('/auth')
    })
  }

  function deleteAccount() {
    if (confirm('Padam akaun? Data anda akan dijadualkan untuk dipadam dalam 30 hari.')) {
      alert('Permintaan padam akaun diterima.')
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-['Plus_Jakarta_Sans',sans-serif] text-[#111111] min-[500px]:flex min-[500px]:items-start min-[500px]:justify-center min-[500px]:p-10 min-[1024px]:items-center">
      <section className="min-h-screen w-full max-w-[430px] overflow-hidden bg-[#F5F5F5] min-[500px]:min-h-0 min-[500px]:rounded-[36px] min-[500px]:border-8 min-[500px]:border-[#1a1a1a] min-[500px]:shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
        <div className="h-[812px] overflow-y-auto">
          <header className="relative overflow-hidden bg-[#7B1533]">
            <div className="relative z-10 flex items-center justify-between px-5 pt-4">
              <button
                type="button"
                onClick={() => router.push('/home')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white"
                aria-label="Kembali"
              >
                ‹
              </button>
              <span className="text-sm font-semibold tracking-wide text-white/65">Profil Saya</span>
              <span className="h-9 w-9" />
            </div>

            <div className="relative z-10 mx-5 mt-5 flex items-center gap-4 rounded-[24px] border border-white/15 bg-white/10 p-5 shadow-[0_18px_45px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/45 bg-[#7B1533] text-3xl font-extrabold text-white">
                {profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  initialFor(profile.name)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-xl font-extrabold text-white">{profile.name}</h1>
                <p className="mt-1 truncate text-xs text-white/60">{profile.email}</p>
                <p className="mt-2 inline-flex max-w-full items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/75">
                  {profile.kawasan}
                </p>
              </div>
            </div>

            <div className="relative z-10 mx-5 mt-4 grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
              <div className="border-r border-white/10 p-3 text-center">
                <p className="text-xl font-extrabold text-white">{isLoading ? '—' : counts.savedShops}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-white/45">Kedai Disimpan</p>
              </div>
              <div className="border-r border-white/10 p-3 text-center">
                <p className="text-xl font-extrabold text-white">{isLoading ? '—' : counts.testimonials}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-white/45">Testimoni</p>
              </div>
              <div className="p-3 text-center">
                <p className="text-xl font-extrabold text-white">{isLoading ? '—' : daysActive}</p>
                <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-white/45">Hari Aktif</p>
              </div>
            </div>

            <svg className="relative z-10 mt-6 block w-full" viewBox="0 0 430 32" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0 Q107 32 215 16 Q322 0 430 24 L430 32 L0 32 Z" fill="#F5F5F5" />
            </svg>
          </header>

          <div className="px-5 pb-8 pt-1">
            <h2 className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-[#888888]">Aktiviti</h2>
            <div className="overflow-hidden rounded-[18px] border border-[#E5E5EA] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
              <MenuRow href="/saved" title="Kedai Disimpan" subtitle={`${counts.savedShops} kedai dalam senarai kegemaran`} badge={counts.savedShops}>
                <MenuIcon tone="bg-[#FFF0F3]">
                  <span className="text-lg text-[#7B1533]">♡</span>
                </MenuIcon>
              </MenuRow>
              <MenuRow href="/testimonials" title="Testimoni Saya" subtitle={`${counts.testimonials} ulasan yang pernah ditulis`}>
                <MenuIcon tone="bg-[#E8F4FD]">
                  <span className="text-lg text-[#185FA5]">✎</span>
                </MenuIcon>
              </MenuRow>
            </div>

            <h2 className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-[#888888]">Alamat Penghantaran</h2>
            <div className="overflow-hidden rounded-[18px] border border-[#E5E5EA] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
              <MenuRow href="/profile/address" title="Alamat Rumah" subtitle="Tetapkan alamat penghantaran utama">
                <MenuIcon tone="bg-[#EAF5D8]">
                  <span className="text-lg text-[#4A7C10]">⌂</span>
                </MenuIcon>
              </MenuRow>
              <MenuRow href="/profile/address" title="Alamat Pejabat (Optional)" subtitle="Tetapkan alamat pejabat jika perlu">
                <MenuIcon tone="bg-[#E8F4FD]">
                  <span className="text-lg text-[#185FA5]">▣</span>
                </MenuIcon>
              </MenuRow>
            </div>

            <h2 className="mb-2 mt-4 text-[11px] font-bold uppercase tracking-wide text-[#888888]">Akaun</h2>
            <div className="overflow-hidden rounded-[18px] border border-[#E5E5EA] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
              <MenuRow href="/sokong" title="Sokong Pembangun" subtitle="Bantu LokalGo terus berkembang">
                <MenuIcon tone="bg-[#FFF8E1]">
                  <span className="text-lg text-[#856404]">♡</span>
                </MenuIcon>
              </MenuRow>
              <MenuRow href="/about" title="Tentang LokalGo™" subtitle="Versi 1.1">
                <MenuIcon tone="bg-[#F5F5F5]">
                  <span className="text-lg text-[#888888]">i</span>
                </MenuIcon>
              </MenuRow>
              <button type="button" onClick={signOut} className="flex w-full items-center gap-3 border-b border-[#F3F3F3] px-4 py-4 text-left">
                <MenuIcon tone="bg-[#F5F5F5]">
                  <span className="text-lg text-[#888888]">↪</span>
                </MenuIcon>
                <span className="flex-1 text-sm font-semibold text-[#555555]">Log Keluar</span>
                <span className="text-[#BBBBBB]">›</span>
              </button>
              <button type="button" onClick={deleteAccount} className="flex w-full items-center justify-center gap-2 px-4 py-4 text-sm font-semibold text-[#A32D2D]">
                Padam Akaun
              </button>
            </div>

            <p className="pb-2 pt-5 text-center text-[10px] text-[#BBBBBB]">lokalgo.app | Versi 1.1 | Jun 2026</p>
          </div>
        </div>
      </section>
    </main>
  )
}
