'use client'

import Link from 'next/link'

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box}
body{margin:0;background:#0a0a0a;font-family:'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111}
.page-wrap{width:100%;max-width:430px;min-height:100vh;margin:0 auto;background:#fff;overflow:hidden}
.scroll{min-height:100vh;background:#F5F5F5}
.header{background:#7B1533;color:#fff;padding:16px 20px 28px}
.header-top{display:flex;align-items:center;justify-content:space-between;gap:14px}
.back-btn{width:38px;height:38px;border:1px solid rgba(255,255,255,0.18);border-radius:999px;background:rgba(255,255,255,0.12);color:#fff;font-size:20px;font-weight:800;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer}
.logo{height:42px;width:auto;display:block}
.tagline{margin:18px 0 0;font-size:13px;font-weight:700;line-height:1.5;color:rgba(255,255,255,0.72)}
.content{padding:4px 0 22px;background:#F5F5F5}
.card{margin:12px 16px;padding:16px;border-radius:12px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.05)}
.info-row{display:flex;justify-content:space-between;gap:14px;border-bottom:1px solid #F3F3F3;padding:12px 0}
.info-row:first-child{padding-top:0}
.info-row:last-child{border-bottom:0;padding-bottom:0}
.label{font-size:11px;font-weight:800;text-transform:uppercase;color:#888;letter-spacing:0}
.value{max-width:220px;text-align:right;font-size:13px;font-weight:800;color:#111;line-height:1.45}
.link-card{margin:12px 16px;overflow:hidden;border-radius:12px;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,0.05)}
.link-row{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #F3F3F3;padding:16px;color:#111;text-decoration:none;font-size:14px;font-weight:800}
.link-row:last-child{border-bottom:0}
.arrow{color:#bbb}
@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center}.page-wrap{min-height:812px;border:8px solid #1a1a1a;border-radius:36px;box-shadow:0 32px 80px rgba(0,0,0,0.7)}.scroll{min-height:812px}}
@media(min-width:1024px){body{min-height:100vh;align-items:center}}
`

function LogoSvg() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/icons/Logo-LOKALGO.png" alt="LokalGo™" className="logo" />
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-row">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  )
}

export default function AboutPage() {
  function goBack() {
    window.history.back()
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <main className="page-wrap">
        <div className="scroll">
          <header className="header">
            <div className="header-top">
              <button type="button" onClick={goBack} className="back-btn" aria-label="Kembali">
                {'<'}
              </button>
              <LogoSvg />
            </div>
            <p className="tagline">Platform perniagaan lokal setempat</p>
          </header>

          <section className="content">
            <div className="card">
              <InfoRow label="Platform" value="LokalGo™ Shop" />
              <InfoRow label="Versi" value="1.1" />
              <InfoRow label="SSM" value="NS0308474-A" />
              <InfoRow label="Domain" value="lokago.app" />
              <InfoRow label="Pengasas" value="Mohd Lateffi Tazri" />
              <InfoRow label="Email" value="admin@lokago.app" />
              <InfoRow label="Tagline" value="Platform perniagaan lokal setempat" />
            </div>

            <div className="link-card">
              <Link href="/privacy" className="link-row">
                <span>Dasar Privasi</span>
                <span className="arrow">&gt;</span>
              </Link>
              <Link href="/tnc" className="link-row">
                <span>Terma & Syarat</span>
                <span className="arrow">&gt;</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  )
}
