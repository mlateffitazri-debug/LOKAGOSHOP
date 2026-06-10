'use client'

import { useRouter } from 'next/navigation'

export default function TutorialPage() {
  const router = useRouter()

  return (
    <main style={{
      position: 'fixed', inset: 0, height: '100dvh', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      background: '#F5F5F5',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <div style={{ width: '100%', maxWidth: 430, margin: '0 auto', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', background: '#7B1D2E' }}>
          <button
            onClick={() => router.back()}
            style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label="Kembali"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/Logo-LOKALGO.png" alt="LokalGo™" style={{ height: 28, width: 'auto' }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1E1E1E', marginBottom: 8 }}>Tutorial</div>
          <div style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.6 }}>Tutorial akan datang</div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#BBBBBB' }}>Kandungan diurus oleh admin</div>
        </div>
      </div>
    </main>
  )
}
