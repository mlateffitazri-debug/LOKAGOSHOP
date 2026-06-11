'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      padding: '32px 24px',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>⚠️</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#7B1533', marginBottom: 8 }}>
        Sesuatu Tidak Kena
      </div>
      <div style={{ fontSize: 14, color: '#888', marginBottom: 32, maxWidth: 280, lineHeight: 1.5 }}>
        Ralat berlaku semasa memuatkan halaman ini. Sila cuba semula.
      </div>
      <button
        onClick={reset}
        style={{
          background: '#7B1533',
          color: '#fff',
          borderRadius: 12,
          padding: '13px 28px',
          fontWeight: 700,
          fontSize: 15,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Cuba Semula
      </button>
    </div>
  )
}
