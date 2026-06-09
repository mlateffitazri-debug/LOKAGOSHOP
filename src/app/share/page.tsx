'use client'

import { useMemo, useState } from 'react'

function iconPath(name: 'x' | 'link' | 'send') {
  if (name === 'x') return <path d="M18 6 6 18M6 6l12 12" />
  if (name === 'link') return <path d="M10 13a5 5 0 0 0 7.1.5l2.8-2.8a5 5 0 0 0-7.1-7.1l-1.6 1.6M14 11a5 5 0 0 0-7.1-.5l-2.8 2.8a5 5 0 0 0 7.1 7.1l1.6-1.6" />
  return <path d="m22 2-7 20-4-9-9-4 20-7Z" />
}

function Icon({ name }: { name: 'x' | 'link' | 'send' }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4">
        {iconPath(name)}
      </g>
    </svg>
  )
}

export default function SharePage() {
  const [copied, setCopied] = useState(false)
  const shopName = 'Kedai Mak Minah'
  const shopUrl = 'https://lokalgo.app/kedaimakminah'
  const shareText = useMemo(
    () => `${shopName} kini ada di LokalGo! Jom tengok dan order terus - percuma untuk semua. ${shopUrl}`,
    [],
  )

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shopUrl)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = shopUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }

    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  function openShare(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <main className="share-page">
      <section className="share-panel" aria-label="Kongsi kedai">
        <button className="close-btn" type="button" aria-label="Tutup" onClick={() => { window.location.href = '/home' }}>
          <Icon name="x" />
        </button>

        <div className="poster">
          <div className="brand">
            <span>Lokal</span>
            <strong>Go</strong>
          </div>
          <div className="phone">
            <div className="phone-top" />
            <div className="shop-mark">KG</div>
            <div className="phone-line wide" />
            <div className="phone-line" />
            <div className="phone-grid">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="poster-copy">
            <p>Kedai lokal kini boleh dikongsi terus.</p>
            <h1>{shopName}</h1>
          </div>
        </div>

        <div className="bottom-section">
          <button className="url-row" type="button" onClick={copyLink}>
            <Icon name="link" />
            <span>{shopUrl}</span>
            <strong>{copied ? 'Disalin' : 'Salin'}</strong>
          </button>

          <p className="share-label">Kongsi ke</p>

          <div className="share-grid">
            <button type="button" className="share-btn btn-wa" onClick={() => openShare(`https://wa.me/?text=${encodeURIComponent(shareText)}`)}>
              WhatsApp
            </button>
            <button type="button" className="share-btn btn-fb" onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shopUrl)}`)}>
              Facebook
            </button>
            <button type="button" className="share-btn btn-th" onClick={() => openShare(`https://www.threads.net/intent/post?text=${encodeURIComponent(shareText)}`)}>
              Threads
            </button>
            <button type="button" className="share-btn btn-tg" onClick={() => openShare(`https://t.me/share/url?url=${encodeURIComponent(shopUrl)}&text=${encodeURIComponent(shareText)}`)}>
              Telegram
            </button>
            <button type="button" className="share-btn btn-copy" onClick={copyLink}>
              <Icon name="send" />
              {copied ? 'Pautan disalin' : 'Salin Pautan Kedai'}
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
        :global(*), :global(*::before), :global(*::after) { box-sizing: border-box; }
        :global(body) {
          margin: 0;
          background: #141414;
          color: #fff;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .share-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 20px;
          background:
            radial-gradient(circle at top left, rgba(173, 208, 54, 0.18), transparent 34%),
            linear-gradient(135deg, #221018 0%, #0f0f12 72%);
        }
        .share-panel {
          width: 100%;
          max-width: 420px;
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 28px 70px rgba(0, 0, 0, 0.42);
          background: #5a0f24;
        }
        .close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          z-index: 2;
          width: 44px;
          height: 44px;
          border: 0;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #fff;
          background: rgba(0, 0, 0, 0.32);
          cursor: pointer;
        }
        :global(.icon) {
          width: 18px;
          height: 18px;
          flex: 0 0 18px;
        }
        .poster {
          min-height: 392px;
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          align-items: center;
          padding: 34px 24px 24px;
          background: linear-gradient(150deg, #7b1533 0%, #5a0f24 64%, #42101f 100%);
        }
        .brand {
          position: absolute;
          top: 22px;
          left: 24px;
          font-size: 24px;
          font-weight: 800;
          letter-spacing: 0;
        }
        .brand strong { color: #add036; }
        .phone {
          width: min(180px, 43vw);
          aspect-ratio: 0.58;
          margin-top: 34px;
          border: 10px solid #f0f0f5;
          border-radius: 32px;
          background: #fff;
          padding: 18px 14px;
          box-shadow: 0 18px 40px rgba(0, 0, 0, 0.22);
        }
        .phone-top {
          width: 48px;
          height: 5px;
          margin: -7px auto 20px;
          border-radius: 999px;
          background: #d7d7de;
        }
        .shop-mark {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          background: #7b1533;
          color: #add036;
          font-weight: 800;
          margin-bottom: 16px;
        }
        .phone-line {
          height: 10px;
          width: 62%;
          border-radius: 999px;
          background: #dcdce4;
          margin-bottom: 10px;
        }
        .phone-line.wide { width: 86%; }
        .phone-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 18px;
        }
        .phone-grid i {
          aspect-ratio: 1;
          border-radius: 10px;
          background: #edf3d8;
        }
        .poster-copy { align-self: end; padding-bottom: 18px; }
        .poster-copy p {
          margin: 0 0 12px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          line-height: 1.5;
        }
        .poster-copy h1 {
          margin: 0;
          font-size: 28px;
          line-height: 1.1;
          letter-spacing: 0;
        }
        .bottom-section { padding: 16px 20px 20px; }
        .url-row {
          width: 100%;
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 10px;
          color: rgba(255, 255, 255, 0.8);
          background: rgba(0, 0, 0, 0.25);
          cursor: pointer;
          font: inherit;
        }
        .url-row span {
          flex: 1;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: left;
          font-size: 12px;
        }
        .url-row strong {
          color: #add036;
          font-size: 12px;
        }
        .share-label {
          margin: 14px 0 10px;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: rgba(255, 255, 255, 0.5);
          font-size: 11px;
        }
        .share-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .share-btn {
          min-height: 46px;
          border: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #fff;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }
        .share-btn:active { transform: scale(0.98); }
        .btn-wa { background: #25d366; }
        .btn-fb { background: #1877f2; }
        .btn-th { background: #fff; color: #111; }
        .btn-tg { background: #229ed9; }
        .btn-copy {
          grid-column: 1 / -1;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: rgba(255, 255, 255, 0.82);
        }
        @media (max-width: 380px) {
          .poster {
            grid-template-columns: 1fr;
            padding-top: 74px;
          }
          .phone {
            width: min(168px, 58vw);
            margin: 0 auto;
          }
          .poster-copy {
            text-align: center;
            padding-bottom: 0;
          }
        }
      `}</style>
    </main>
  )
}
