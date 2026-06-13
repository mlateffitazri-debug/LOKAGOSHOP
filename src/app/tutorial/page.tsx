'use client'

import { useRouter } from 'next/navigation'

// ── Icons ────────────────────────────────────────────────────────────────────

function IconBuyer() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B1533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  )
}

function IconSeller() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B1533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7B1533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
      <line x1="12" y1="18" x2="12.01" y2="18"/>
    </svg>
  )
}

function IconBack() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepRow({ num, text }: { num: number | string; text: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: '#7B1533', color: '#fff',
        fontSize: 11, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, marginTop: 1,
      }}>
        {num}
      </div>
      <span style={{
        fontSize: 14, color: '#2D2D2D', lineHeight: 1.6,
        fontWeight: 500, flex: 1,
      }}>
        {text}
      </span>
    </div>
  )
}

function PlatformLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, marginTop: 4,
    }}>
      <div style={{
        height: 1, flex: 1, background: '#F0F0F0',
      }} />
      <span style={{
        fontSize: 11, fontWeight: 700, color: '#7B1533',
        letterSpacing: '0.06em', textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        {children}
      </span>
      <div style={{ height: 1, flex: 1, background: '#F0F0F0' }} />
    </div>
  )
}

function TutorialCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #EBEBEB',
      borderRadius: 20,
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Card header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20,
        paddingBottom: 16, borderBottom: '1px solid #F5F5F5',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: '#FBF0F2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#111', lineHeight: 1.3 }}>{title}</div>
          <div style={{ fontSize: 13, color: '#888', lineHeight: 1.45, marginTop: 3 }}>{subtitle}</div>
        </div>
      </div>
      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {children}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TutorialPage() {
  const router = useRouter()

  return (
    <main style={{
      position: 'fixed', inset: 0, height: '100dvh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#F5F5F5',
      paddingTop: 'env(safe-area-inset-top)',
    }}>
      <div style={{
        width: '100%', maxWidth: 430, margin: '0 auto',
        flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column',
      }}>

        {/* ── Header ── */}
        <div style={{
          height: 60, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '0 16px',
          background: '#7B1533',
        }}>
          <button
            onClick={() => router.back()}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
            aria-label="Kembali"
          >
            <IconBack />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/Logo-LOKALGO.png" alt="LokalGo™" style={{ height: 26, width: 'auto' }} />
        </div>

        {/* ── Scrollable body ── */}
        <div style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
        }}>
          <div style={{
            padding: '24px 20px',
            paddingBottom: 'max(32px, calc(env(safe-area-inset-bottom) + 24px))',
            display: 'flex', flexDirection: 'column', gap: 12,
          }}>

            {/* ── Page title ── */}
            <div style={{ marginBottom: 8 }}>
              <h1 style={{
                fontSize: 24, fontWeight: 800, color: '#111',
                lineHeight: 1.25, margin: 0,
              }}>
                Cara Guna LokalGo
              </h1>
              <p style={{
                fontSize: 14, color: '#777', marginTop: 6,
                lineHeight: 1.55, fontWeight: 400,
              }}>
                Panduan ringkas untuk pembeli, seller dan pemasangan PWA.
              </p>
            </div>

            {/* ── Card 1: Pembeli ── */}
            <TutorialCard
              icon={<IconBuyer />}
              title="Saya Pembeli"
              subtitle="Cara cari kedai dan hantar pesanan."
            >
              <StepRow num={1} text="Log masuk menggunakan Google" />
              <StepRow num={2} text="Benarkan akses lokasi apabila diminta" />
              <StepRow num={3} text="Pilih kedai berhampiran dari senarai" />
              <StepRow num={4} text="Buka produk dan tekan Add to Cart" />
              <StepRow num={5} text="Pilih kaedah penghantaran — COD atau Ambil Sendiri" />
              <StepRow num={6} text="Tekan Checkout dan hantar pesanan melalui WhatsApp" />
            </TutorialCard>

            {/* ── Card 2: Seller ── */}
            <TutorialCard
              icon={<IconSeller />}
              title="Saya Seller"
              subtitle="Cara daftar kedai dan mula terima order."
            >
              <StepRow num={1} text="Log masuk menggunakan Google" />
              <StepRow num={2} text="Isi maklumat kedai — nama, lokasi dan nombor WhatsApp" />
              <StepRow num={3} text="Muat naik produk dengan gambar dan harga" />
              <StepRow num={4} text="Tunggu kelulusan admin — biasanya dalam 1–2 hari" />
              <StepRow num={5} text="Buka kedai dari dashboard apabila bersedia terima order" />
              <StepRow num={6} text="Terima pesanan terus melalui WhatsApp anda" />
            </TutorialCard>

            {/* ── Card 3: PWA ── */}
            <TutorialCard
              icon={<IconPhone />}
              title="Add ke Home Screen"
              subtitle="Guna LokalGo seperti aplikasi biasa."
            >
              <PlatformLabel>Android</PlatformLabel>
              <StepRow num={1} text="Buka LokalGo dalam Chrome" />
              <StepRow num={2} text="Tekan menu tiga titik (⋮) di penjuru kanan atas" />
              <StepRow num={3} text="Pilih Add to Home Screen" />
              <StepRow num={4} text="Tekan Add untuk sahkan" />

              <PlatformLabel>iPhone · Safari</PlatformLabel>
              <StepRow num={1} text="Buka LokalGo dalam Safari" />
              <StepRow num={2} text="Tekan ikon Share — kotak dengan anak panah ke atas" />
              <StepRow num={3} text="Tatal ke bawah dan pilih Add to Home Screen" />
              <StepRow num={4} text="Tekan Add di penjuru kanan atas" />
            </TutorialCard>

            {/* ── Footer note ── */}
            <p style={{
              textAlign: 'center', fontSize: 12, color: '#BBBBBB',
              lineHeight: 1.6, marginTop: 8,
            }}>
              Soal jawab? Hubungi kami melalui WhatsApp komuniti LokalGo.
            </p>

          </div>
        </div>
      </div>
    </main>
  )
}
