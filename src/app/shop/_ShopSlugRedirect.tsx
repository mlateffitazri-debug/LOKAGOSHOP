'use client'

import { useEffect } from 'react'

export function ShopSlugRedirect({ sellerId }: { sellerId: string }) {
  useEffect(() => {
    window.location.replace(`/shop?seller=${encodeURIComponent(sellerId)}`)
  }, [sellerId])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fff',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 14,
      }}
    >
      Memuatkan kedai...
    </div>
  )
}
