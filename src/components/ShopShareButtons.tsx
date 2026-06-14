'use client'

import { useState, useCallback } from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.lokalgo.app'

const BTN_BASE: React.CSSProperties = {
  width: '100%',
  border: 'none',
  borderRadius: 14,
  padding: '14px 20px',
  fontSize: 15,
  fontWeight: 700,
  fontFamily: 'inherit',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  transition: 'transform 0.12s',
}

export type ShopShareButtonsProps = {
  shopName: string
  slug: string
}

export function ShopShareButtons({ shopName, slug }: ShopShareButtonsProps) {
  const shopUrl = `${SITE_URL}/shop/${slug}`
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${shopName} di LokalGo`,
          text: `Cari ${shopName} di LokalGo`,
          url: shopUrl,
        })
      } catch { /* user dismissed */ }
    } else {
      try {
        await navigator.clipboard.writeText(shopUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch { /* ignore */ }
    }
  }, [shopName, shopUrl])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shopUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }, [shopUrl])

  const handleWhatsApp = useCallback(() => {
    const text = `Hello! Cari ${shopName} di LokalGo: ${shopUrl}`
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener,noreferrer',
    )
  }, [shopName, shopUrl])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        style={{ ...BTN_BASE, background: '#ADD036', color: '#2a2a2a' }}
        onClick={handleShare}
      >
        <ShareIcon />
        Share Kedai
      </button>
      <button
        style={{ ...BTN_BASE, background: 'rgba(255,255,255,0.13)', color: '#fff', border: '1.5px solid rgba(255,255,255,0.28)' }}
        onClick={handleCopy}
      >
        <CopyIcon />
        {copied ? 'Link kedai disalin ✓' : 'Copy Link'}
      </button>
      <button
        style={{ ...BTN_BASE, background: '#25D366', color: '#fff' }}
        onClick={handleWhatsApp}
      >
        <WhatsAppIcon />
        Share WhatsApp
      </button>
    </div>
  )
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.989.576 3.842 1.571 5.405L2 22l4.714-1.546A9.957 9.957 0 0011.999 22c5.523 0 10-4.477 10-10s-4.477-10-10-10z" />
    </svg>
  )
}
