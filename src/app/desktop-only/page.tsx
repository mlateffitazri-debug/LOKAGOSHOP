import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'LokalGo — Guna Mobile',
}

export default function DesktopOnlyPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .desktop-only-page{
          background:#07070a;
          color:#f0f0f0;
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:24px;
          text-align:center;
        }
        .desktop-only-page .wrap{max-width:440px;}
        .desktop-only-page .logo{font-size:28px;font-weight:900;color:#acd036;letter-spacing:-0.5px;margin-bottom:32px;}
        .desktop-only-page .icon{font-size:72px;margin-bottom:24px;display:block;}
        .desktop-only-page h1{font-size:22px;font-weight:800;margin-bottom:12px;}
        .desktop-only-page p{font-size:15px;color:rgba(240,240,240,0.55);line-height:1.6;margin-bottom:24px;}
        .desktop-only-page .badge{
          display:inline-block;
          background:rgba(172,208,54,0.12);
          border:1px solid rgba(172,208,54,0.3);
          color:#acd036;
          font-size:13px;
          font-weight:700;
          padding:8px 20px;
          border-radius:100px;
        }
      ` }} />
      <div className="desktop-only-page">
        <div className="wrap">
          <div className="logo">LokalGo</div>
          <span className="icon">📱</span>
          <h1>Sila Guna Telefon Anda</h1>
          <p>
            LokalGo direka khas untuk pengalaman mobile.<br />
            Sila buka laman ini menggunakan telefon pintar anda untuk akses penuh.
          </p>
          <span className="badge">Mobile Only</span>
        </div>
      </div>
    </>
  )
}
