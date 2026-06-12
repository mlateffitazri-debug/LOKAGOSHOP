'use client'

import { useEffect, useState } from 'react'
import { Heart, Download, Check, ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { MAROON, MAROON_DARK } from '@/lib/theme'

type DlState = 'idle' | 'loading' | 'success' | 'error'

export default function FounderPage() {
  const [dlCount, setDlCount] = useState<number>(0)
  const [dlState, setDlState] = useState<DlState>('idle')

  useEffect(() => {
    async function fetchCount() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('support_stats')
          .select('qr_download_count')
          .eq('id', 1)
          .maybeSingle()
        if (data?.qr_download_count != null) {
          setDlCount(Number(data.qr_download_count))
          return
        }
      } catch { /* table may not exist */ }
      const local = parseInt(localStorage.getItem('qrDownloadCount') || '0', 10)
      setDlCount(local)
    }
    fetchCount()
  }, [])

  async function handleDownload() {
    if (dlState === 'loading') return
    setDlState('loading')

    try {
      const response = await fetch('/assets/lokago-sokong-qr.jpg')
      if (!response.ok) throw new Error('fetch failed')
      const blob = await response.blob()
      const file = new File([blob], 'LokalGo_QR_Sokong.jpg', { type: 'image/jpeg' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // iOS Safari PWA — only reliable save-to-device method
        await navigator.share({ files: [file], title: 'LokalGo QR Sokong' })
      } else {
        // Android PWA + desktop
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'LokalGo_QR_Sokong.jpg'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      const newCount = dlCount + 1
      setDlCount(newCount)
      localStorage.setItem('qrDownloadCount', String(newCount))
      try {
        const supabase = createClient()
        await supabase.rpc('increment_qr_download_count')
      } catch { /* ignore — RPC may not exist yet */ }

      setDlState('success')
      setTimeout(() => setDlState('idle'), 2500)
    } catch {
      window.open('/assets/lokago-sokong-qr.jpg', '_blank')
      setDlState('error')
      setTimeout(() => setDlState('idle'), 3000)
    }
  }

  const buttonLabel = {
    idle: 'Muat Turun QR Code',
    loading: 'Sedang muat turun...',
    success: 'Berjaya dimuat turun!',
    error: 'Cuba lagi',
  }[dlState]

  return (
    <div style={{
      position: 'fixed', inset: 0, height: '100dvh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      background: MAROON,
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{
        width: '100%', maxWidth: 430, margin: '0 auto', flex: 1, minHeight: 0,
        display: 'flex', flexDirection: 'column',
      }}>

        {/* ── HEADER (64px) ── */}
        <div style={{
          height: 64, flexShrink: 0, display: 'flex', alignItems: 'center',
          gap: 12, padding: '0 16px', background: MAROON,
        }}>
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = '/home')}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
            aria-label="Kembali"
          >
            <ChevronLeft size={20} color="#fff" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/Logo-LOKALGO.png" alt="LokalGo™" style={{ height: 28, width: 'auto', display: 'block' }} />
        </div>

        {/* ── WHITE CARD (fills, no scroll) ── */}
        <div style={{
          background: '#fff', borderRadius: '16px 16px 0 0', flex: 1, minHeight: 0,
          display: 'flex', flexDirection: 'column', padding: '16px 20px 0',
          overflow: 'hidden',
        }}>

          {/* Founder row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/dev.png"
              alt="Lateffi"
              onError={(e) => { e.currentTarget.style.display = 'none' }}
              style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1E1E1E' }}>Lateffi</div>
              <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 1 }}>Pengasas LokalGo™</div>
            </div>
          </div>

          {/* Body text (~60 words) */}
          <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 12 }}>
            Saya faham tekanan ekonomi yang kita hadapi. Ramai jiran kita mencari rezeki
            bukan untuk menjadi kaya, tetapi sekadar untuk{' '}
            <strong style={{ color: '#1E1E1E' }}>dapat tidur lena pada hari esok.</strong>{' '}
            Jika platform ini memberi nilai kepada anda dan komuniti,{' '}
            <strong style={{ color: '#1E1E1E' }}>secangkir kopi dari anda</strong>{' '}
            sudah cukup untuk memastikan ia terus bergerak ke hadapan.
          </p>

          {/* Quote block */}
          <blockquote style={{
            borderLeft: `3px solid ${MAROON}`, background: '#fdf4f5',
            padding: '8px 12px', borderRadius: '0 8px 8px 0',
            fontSize: 13, color: '#555', lineHeight: 1.6, fontStyle: 'italic',
            marginBottom: 8,
          }}>
            &ldquo;Setiap kita ada bakat tersendiri, tetapi{' '}
            <strong style={{ fontStyle: 'normal', color: MAROON }}>kekangan modal menjadi penghalang.</strong>
            {' '}LokalGo™ wujud untuk memecahkan halangan itu — percuma, dan sentiasa akan percuma.&rdquo;
          </blockquote>

          {/* Signature — inline SVG, right aligned */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 8 }}>
            <svg width="110" height="34" viewBox="0 0 110 34" fill="none">
              <path d="M8 26 C18 8, 28 30, 38 18 C46 8, 50 28, 60 20 C68 13, 73 28, 83 23 C90 19, 96 26, 104 22"
                stroke={MAROON} strokeWidth="1.7" strokeLinecap="round" />
              <line x1="8" y1="31" x2="104" y2="31" stroke="#ddd" strokeWidth="0.5" />
            </svg>
            <div style={{ fontSize: 11, color: '#6B6B6B', marginTop: 2 }}>Mohd Lateffi Tazri, Pengasas LokalGo™</div>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1, minHeight: 0 }} />

          {/* Divider */}
          <div style={{ height: 1, background: '#ECECEC', marginBottom: 12, flexShrink: 0 }} />

          {/* QR section */}
          <div style={{ flexShrink: 0, paddingBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1E1E1E', textAlign: 'center', marginBottom: 4 }}>
              Imbas QR untuk menyokong
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, marginBottom: 12,
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: '#E6F9EE', borderRadius: 999, padding: '4px 12px',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/icons/touch-n-go-ewallet-seeklogo.png"
                  alt="TNG eWallet"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                  style={{ height: 18, width: 'auto', borderRadius: 4 }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#0B7A3E' }}>TNG eWallet</span>
              </span>
              <span style={{ fontSize: 12, color: '#6B6B6B' }}>Maybank · CIMB · lain-lain</span>
            </div>

            <button
              onClick={handleDownload}
              disabled={dlState === 'loading'}
              style={{
                width: '100%', minHeight: 48,
                background: dlState === 'success'
                  ? 'linear-gradient(180deg, #2e7d32 0%, #1b5e20 100%)'
                  : `linear-gradient(180deg, ${MAROON} 0%, ${MAROON_DARK} 100%)`,
                border: 'none', borderRadius: 12, padding: '12px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
                cursor: dlState === 'loading' ? 'default' : 'pointer',
                opacity: dlState === 'loading' ? 0.75 : 1,
                boxShadow: '0 6px 20px rgba(123,29,46,0.4)',
                transition: 'background 0.3s',
              }}
            >
              {dlState === 'success' ? <Check size={18} /> : <Download size={18} />}
              {buttonLabel}
            </button>
          </div>
        </div>

        {/* ── STATS BAR pinned bottom ── */}
        <div style={{
          background: MAROON, padding: '12px 24px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{dlCount}</div>
          <Heart size={20} color="rgba(255,255,255,0.45)" fill="rgba(255,255,255,0.45)" />
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
            kali QR dimuat turun<br />terima kasih atas sokongan anda
          </div>
        </div>

      </div>
    </div>
  )
}
