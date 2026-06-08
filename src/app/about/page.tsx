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
  return (
    <svg className="logo" viewBox="0 0 1080 365" xmlns="http://www.w3.org/2000/svg" aria-label="LokaGo">
      <style>{'.s0{fill:#FFF}.s1{fill:#ADD036}'}</style>
      <path className="s0" d="M133,61v175c0,13-11,24-24,24h-4c-13,0-24-11-24-24V61c0-13,11-24,24-24h4C122,37,133,48,133,61z" />
      <path className="s0" d="M180,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11s31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11S193,258,180,251z M249,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C234,218,242,214,249,207z" />
      <path className="s0" d="M411,248l-43-59v49c0,12-9,21-21,21h-7c-13,0-23-10-23-23V56c0-11,9-19,19-19h15c10,0,17,8,17,17v106l43-57c5-7,13-11,22-11h32c7,0,11,8,6,14l-58,70l54,65c6,7,1,19-9,19h-25C425,259,416,255,411,248z" />
      <path className="s0" d="M470,130c7-13,15-23,27-30c11-7,24-11,38-11c12,0,22,2,31,7s16,11,21,19v-8c0-9,7-16,16-16h20c8,0,15,7,15,15v139c0,7-6,13-13,13h-21c-10,0-17-8-17-17v-6c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-37-11c-11-7-20-17-27-30c-7-13-10-28-10-46C460,158,464,143,470,130z M575,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C586,163,582,153,575,145z" />
      <path className="s1" d="M747,96c9,5,16,11,21,19v-7c0-9,7-17,17-17h19c9,0,16,7,16,16v152c0,15-3,29-9,42c-6,13-15,23-28,30c-13,7-28,11-47,11c-25,0-45-6-60-18c-11-8-18-19-23-31c-3-8,3-17,12-17h21c8,0,14,4,19,10c2,2,4,4,7,6c6,4,13,6,22,6c11,0,19-3,25-9c6-6,10-16,10-29v-24c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-38-11c-11-7-20-17-27-30c-7-13-10-28-10-46c0-17,3-32,10-45c7-13,15-23,27-30c11-7,24-11,38-11C728,89,738,91,747,96z M757,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C768,163,764,153,757,145z" />
      <path className="s1" d="M866,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11c16,0,31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11C894,262,879,258,866,251z M935,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C920,218,928,214,935,207z" />
    </svg>
  )
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
              <InfoRow label="Platform" value="LokaGo Shop" />
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
