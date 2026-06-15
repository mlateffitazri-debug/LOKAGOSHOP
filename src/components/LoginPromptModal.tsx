'use client'

const STYLES = `
.lpm-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:10000;display:flex;align-items:flex-end;justify-content:center;}
@media(min-width:500px){.lpm-overlay{align-items:center;}}
.lpm-sheet{background:#fff;width:100%;max-width:430px;border-radius:24px 24px 0 0;padding:28px 24px 40px;}
@media(min-width:500px){.lpm-sheet{border-radius:24px;}}
.lpm-icon{width:52px;height:52px;background:#fff0f3;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;}
.lpm-title{font-size:17px;font-weight:800;color:#111;margin-bottom:8px;line-height:1.3;}
.lpm-body{font-size:13px;color:#555;line-height:1.6;margin-bottom:24px;}
.lpm-btn{width:100%;border:none;border-radius:14px;padding:15px 20px;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;min-height:44px;transition:transform 0.12s;}
.lpm-btn:active{transform:scale(0.97);}
.lpm-btn-login{background:#7B1533;color:#fff;box-shadow:0 4px 16px rgba(123,21,51,0.3);margin-bottom:10px;}
.lpm-btn-skip{background:#f5f5f5;color:#555;}
`

type Props = {
  open: boolean
  onClose: () => void
}

export function LoginPromptModal({ open, onClose }: Props) {
  if (!open) return null

  const handleLogin = () => {
    const next = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.href = `/auth?next=${next}`
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        className="lpm-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Log masuk diperlukan"
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div className="lpm-sheet">
          <div className="lpm-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1533" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <div className="lpm-title">Log masuk untuk tambah ke troli</div>
          <div className="lpm-body">
            Untuk simpan produk dalam troli, sila log masuk dahulu. Anda boleh teruskan selepas log masuk.
          </div>
          <button className="lpm-btn lpm-btn-login" onClick={handleLogin}>
            Log Masuk
          </button>
          <button className="lpm-btn lpm-btn-skip" onClick={onClose}>
            Nanti dulu
          </button>
        </div>
      </div>
    </>
  )
}
