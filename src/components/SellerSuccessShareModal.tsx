'use client'

import { useRef, useState, useCallback } from 'react'

const MODAL_STYLES = `
.ssm-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.80);z-index:9999;display:flex;align-items:flex-end;justify-content:center;}
@media(min-width:500px){.ssm-overlay{align-items:center;}}
.ssm-sheet{background:#7B1533;width:100%;max-width:430px;border-radius:28px 28px 0 0;padding:24px 20px 36px;max-height:92vh;overflow-y:auto;-webkit-overflow-scrolling:touch;}
@media(min-width:500px){.ssm-sheet{border-radius:28px;}}
.ssm-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;}
.ssm-title{font-size:18px;font-weight:800;color:#fff;margin-bottom:4px;line-height:1.3;}
.ssm-sub{font-size:13px;color:rgba(255,255,255,0.65);line-height:1.5;}
.ssm-close{width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:inherit;}
.ssm-close:active{background:rgba(255,255,255,0.25);}
.ssm-card-wrap{margin-bottom:16px;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.45);}
.ssm-card{position:relative;width:100%;line-height:0;display:block;}
.ssm-bg{width:100%;height:auto;display:block;}
.ssm-name-overlay{position:absolute;left:7%;top:50%;width:43%;height:16%;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 6px;overflow:hidden;}
.ssm-shop-name{font-size:clamp(18px,4.5vw,52px);font-weight:900;text-transform:uppercase;color:#ADD036;line-height:1.05;word-break:break-word;overflow-wrap:break-word;max-width:100%;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;}
.ssm-status{font-size:13px;font-weight:600;color:#ADD036;text-align:center;padding:6px 0 10px;}
.ssm-btns{display:flex;flex-direction:column;gap:10px;margin-bottom:14px;}
.ssm-btn{width:100%;border:none;border-radius:14px;padding:15px 20px;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:transform 0.12s;letter-spacing:0.1px;}
.ssm-btn:active:not(:disabled){transform:scale(0.97);}
.ssm-btn:disabled{opacity:0.5;cursor:not-allowed;}
.ssm-btn-dl{background:#ADD036;color:#2a2a2a;box-shadow:0 4px 20px rgba(173,208,54,0.3);}
.ssm-btn-share{background:rgba(255,255,255,0.13);color:#fff;border:1.5px solid rgba(255,255,255,0.28);}
.ssm-btn-wa{background:#25D366;color:#fff;box-shadow:0 4px 16px rgba(37,211,102,0.25);}
.ssm-skip{width:100%;background:transparent;border:none;color:rgba(255,255,255,0.4);font-size:13px;font-family:inherit;cursor:pointer;padding:10px 8px;text-align:center;line-height:1.5;}
.ssm-skip:hover{color:rgba(255,255,255,0.65);}
`

export type SellerSuccessShareModalProps = {
  open: boolean
  shopName: string
  onClose: () => void
}

function slugifyShopName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'kedai'
  )
}

export function SellerSuccessShareModal({ open, shopName, onClose }: SellerSuccessShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const generateCanvas = useCallback(async () => {
    if (!cardRef.current) return null
    // Wait for fonts to be ready before capturing
    await document.fonts.ready
    const html2canvas = (await import('html2canvas')).default
    return html2canvas(cardRef.current, {
      useCORS: true,
      allowTaint: false,
      scale: 2,
      logging: false,
      imageTimeout: 5000,
    })
  }, [])

  const downloadPNG = useCallback(async () => {
    setLoading(true)
    setStatus('Menjana PNG...')
    try {
      const canvas = await generateCanvas()
      if (!canvas) return
      const slug = slugifyShopName(shopName)
      const link = document.createElement('a')
      link.download = `lokalgo-${slug}-share.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setStatus(null)
    } catch {
      setStatus('Gagal jana PNG. Sila cuba semula.')
    } finally {
      setLoading(false)
    }
  }, [generateCanvas, shopName])

  const sharePNG = useCallback(async () => {
    setLoading(true)
    setStatus('Menjana PNG...')
    try {
      const canvas = await generateCanvas()
      if (!canvas) return
      const slug = slugifyShopName(shopName)
      const filename = `lokalgo-${slug}-share.png`
      const shareTitle = 'Cari saya di LokalGo'
      const shareText = `Cari ${shopName} di LokalGo: https://www.lokalgo.app`

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) throw new Error('canvas blob failed')

      const file = new File([blob], filename, { type: 'image/png' })

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: shareTitle, text: shareText, files: [file] })
      } else if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url: 'https://www.lokalgo.app' })
      } else {
        // Fallback: trigger download
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.download = filename
        link.href = url
        link.click()
        URL.revokeObjectURL(url)
        setStatus('Web Share tidak disokong. PNG dimuat turun.')
        setLoading(false)
        return
      }
      setStatus(null)
    } catch (e) {
      if ((e as { name?: string }).name !== 'AbortError') {
        setStatus('Gagal share. Cuba butang Download PNG.')
      } else {
        setStatus(null)
      }
    } finally {
      setLoading(false)
    }
  }, [generateCanvas, shopName])

  const shareWhatsApp = useCallback(() => {
    const text = `Hello! Cari ${shopName} di LokalGo: https://www.lokalgo.app`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
  }, [shopName])

  if (!open) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MODAL_STYLES }} />
      <div
        className="ssm-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Kongsi kedai anda"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div className="ssm-sheet">
          {/* Header */}
          <div className="ssm-header">
            <div>
              <div className="ssm-title">Kedai anda berjaya dibuat! 🎉</div>
              <div className="ssm-sub">Share kedai anda supaya customer boleh cari di LokalGo.</div>
            </div>
            <button className="ssm-close" onClick={onClose} aria-label="Tutup">✕</button>
          </div>

          {/* Share card — captured by html2canvas */}
          <div className="ssm-card-wrap">
            <div ref={cardRef} className="ssm-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/success-onboarding.png"
                alt="LokalGo Share Banner"
                className="ssm-bg"
                crossOrigin="anonymous"
              />
              <div className="ssm-name-overlay">
                <span className="ssm-shop-name">{shopName.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {status && <div className="ssm-status">{status}</div>}

          {/* Action buttons */}
          <div className="ssm-btns">
            <button className="ssm-btn ssm-btn-dl" onClick={downloadPNG} disabled={loading}>
              {loading ? 'Menjana...' : '⬇ Download PNG'}
            </button>
            <button className="ssm-btn ssm-btn-share" onClick={sharePNG} disabled={loading}>
              ↗ Share
            </button>
            <button className="ssm-btn ssm-btn-wa" onClick={shareWhatsApp} disabled={loading}>
              <WhatsAppIcon />
              Share WhatsApp
            </button>
          </div>

          <button className="ssm-skip" onClick={onClose}>
            Langkau, ke halaman seterusnya →
          </button>
        </div>
      </div>
    </>
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
