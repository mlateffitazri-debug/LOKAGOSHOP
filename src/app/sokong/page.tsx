'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const PRIMARY = '#7B1533'
const ACCENT = '#ADD036'

export default function FounderPage() {
  const [dlCount, setDlCount] = useState<number>(0)
  const [downloading, setDownloading] = useState(false)
  const [qrVisible, setQrVisible] = useState(false)
  const qrRef = useRef<HTMLImageElement>(null)

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
    if (downloading) return
    setDownloading(true)
    setQrVisible(true)
    const newCount = dlCount + 1
    setDlCount(newCount)

    const link = document.createElement('a')
    link.href = '/assets/lokago-sokong-qr.jpg'
    link.download = 'LokalGo_QR_Sokong_Lateffi.jpg'
    link.click()

    localStorage.setItem('qrDownloadCount', String(newCount))
    try {
      const supabase = createClient()
      await supabase.from('support_stats').upsert({ id: 1, qr_download_count: newCount })
    } catch { /* ignore */ }

    setDownloading(false)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100dvh', maxWidth: 430,
      margin: '0 auto', fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      overflow: 'hidden', background: PRIMARY,
    }}>

      {/* ── HEADER ── */}
      <div style={{ background: PRIMARY, padding: '18px 20px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : (window.location.href = '/home')}
            style={{
              width: 38, height: 38, borderRadius: '50%', border: 'none',
              background: 'rgba(255,255,255,0.15)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
            aria-label="Kembali"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/Logo-LOKALGO.png" alt="LokalGo™" style={{ height: 36, width: 'auto', display: 'block' }} />
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>
          Platform perniagaan lokal setempat
        </p>
      </div>

      {/* ── WHITE CARD ── */}
      <div style={{
        background: '#fff', borderRadius: '20px 20px 0 0', flex: 1,
        display: 'flex', flexDirection: 'column', padding: '20px 22px 0',
        overflowY: 'auto',
      }}>

        {/* Founder row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%', background: PRIMARY,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 18, flexShrink: 0,
          }}>
            <span style={{ color: ACCENT }}>L</span>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#111' }}>Lateffi</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>Pengasas LokalGo™ · NS0308474-A</div>
          </div>
        </div>

        {/* Body text */}
        <p style={{ fontSize: 12, color: '#555', lineHeight: 1.75, marginBottom: 12 }}>
          Saya faham tekanan ekonomi yang kita hadapi. Ramai di antara jiran kita yang mencari
          rezeki bukan untuk menjadi kaya, tetapi sekadar untuk{' '}
          <strong style={{ color: '#111' }}>dapat tidur lena pada hari esok.</strong>
        </p>

        {/* Blockquote */}
        <blockquote style={{
          borderLeft: `3px solid ${PRIMARY}`, background: '#fdf4f5',
          padding: '10px 14px', borderRadius: '0 10px 10px 0',
          fontSize: 12, color: '#444', lineHeight: 1.75, fontStyle: 'italic',
          marginBottom: 12,
        }}>
          &ldquo;Setiap kita ada bakat tersendiri. Ada yang pandai membuat kek, ada yang
          pandai memasak lauk dan ada yang mencari masa lapang menjual kecil-kecilan untuk
          mengisi masa tua. Akan tetapi{' '}
          <strong style={{ fontStyle: 'normal', color: PRIMARY }}>kekangan modal dan faktor tekanan menjadi penghalang.</strong>
          {' '}LokalGo™ wujud untuk memecahkan halangan itu — ianya percuma, dan sentiasa akan percuma.&rdquo;
        </blockquote>

        <p style={{ fontSize: 12, color: '#555', lineHeight: 1.75, marginBottom: 16 }}>
          Walau bagaimanapun, kos penyelenggaraan platform ini tidak murah. Untuk menjadi
          sebuah platform yang mampu berdiri sebelah platform yang sedia ada, ia pastinya
          memerlukan modal yang besar. Jika ia memberi nilai kepada anda dan komuniti,{' '}
          <strong style={{ color: '#111' }}>secangkir kopi dari anda</strong>{' '}
          sudah cukup untuk memastikan ia terus bergerak ke hadapan untuk kebaikan semua
          dan sekaligus membantu memudahkan insan lain.
        </p>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Signature */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: 14 }}>
          <svg width="110" height="34" viewBox="0 0 110 34" fill="none">
            <path d="M6 26 Q16 6 26 18 Q36 30 46 14 Q56 0 66 18 Q76 34 86 20 Q96 8 104 16" stroke={PRIMARY} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.65"/>
            <path d="M4 28 Q24 26 44 24 Q64 22 84 24 Q96 24 106 22" stroke={PRIMARY} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3"/>
          </svg>
          <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>Mohd Lateffi Tazri</div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#f0f0f0', marginBottom: 16 }} />

        {/* QR Section */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111', textAlign: 'center', marginBottom: 4 }}>
            Imbas QR untuk menyokong
          </div>
          <div style={{ fontSize: 11, color: '#888', textAlign: 'center', marginBottom: 14 }}>
            Sokongan anda amat dihargai. Terima kasih 🙏
          </div>

          {/* QR image — shown after download */}
          {qrVisible && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={qrRef}
              src="/assets/lokago-sokong-qr.jpg"
              alt="QR TNG LokalGo™"
              style={{
                display: 'block', width: 180, height: 'auto', borderRadius: 14,
                margin: '0 auto 16px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}
            />
          )}

          {/* TNG logo + other banks label */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/touch-n-go-ewallet-seeklogo.png"
              alt="TNG eWallet"
              style={{ height: 24, width: 'auto', borderRadius: 6 }}
            />
            <span style={{ fontSize: 11, color: '#888' }}>Maybank · CIMB · dan lain-lain</span>
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              width: '100%',
              background: 'linear-gradient(180deg, #8f1a3a 0%, #6a1029 100%)',
              border: 'none', borderRadius: 14, padding: '14px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'inherit',
              cursor: downloading ? 'default' : 'pointer',
              opacity: downloading ? 0.75 : 1,
              boxShadow: '0 6px 20px rgba(123,21,51,0.4)',
            }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {downloading ? 'Sedang dimuat turun...' : 'Muat Turun QR Code'}
          </button>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{
        background: PRIMARY, padding: '12px 24px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
      }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{dlCount}</div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
          kali QR dimuat turun<br />terima kasih atas sokongan anda
        </div>
      </div>

    </div>
  )
}
