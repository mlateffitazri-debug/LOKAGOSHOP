'use client'

import { useEffect, useState } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'
import { SellerSuccessShareModal } from '@/components/SellerSuccessShareModal'

const styles = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
body{background:#0a0a0a;min-height:100vh;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;padding:20px;}
.page{width:100%;max-width:430px;min-height:100vh;background:#7B1533;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:40px 28px 36px;overflow-y:auto;}
@media(min-width:500px){body{padding:40px 20px;}.page{min-height:auto;height:812px;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);overflow:hidden;}}
@media(min-width:1024px){body{padding:40px;}}
.logo-wrap{margin-bottom:28px;}
.star-row{font-size:28px;letter-spacing:6px;margin-bottom:16px;text-align:center;}
.title{font-size:28px;font-weight:800;color:#fff;text-align:center;margin-bottom:10px;letter-spacing:-0.3px;}
.sub{font-size:14px;color:rgba(255,255,255,0.82);line-height:1.8;text-align:center;margin-bottom:28px;}
.sub .shop{color:#ADD036;font-weight:700;}
.share-card{background:#fff;border-radius:18px;padding:18px 20px;width:100%;margin-bottom:24px;box-shadow:0 8px 40px rgba(0,0,0,0.3);}
.sc-logo{margin-bottom:10px;}
.sc-badge{display:inline-block;background:#ADD036;color:#2a2a2a;font-size:10px;font-weight:800;padding:3px 10px;border-radius:20px;margin-bottom:8px;letter-spacing:0.5px;}
.sc-shop{font-size:17px;font-weight:800;color:#7B1533;margin-bottom:4px;}
.sc-tagline{font-size:12px;color:#888;line-height:1.5;}
.sc-divider{height:1px;background:#f0f0f0;margin:12px 0;}
.sc-footer{display:flex;align-items:center;justify-content:space-between;}
.sc-url{font-size:11px;color:#ADD036;font-weight:600;}
.sc-icon{width:28px;height:28px;background:#7B1533;border-radius:50%;display:flex;align-items:center;justify-content:center;}
.share-btn{width:100%;background:#ADD036;border:none;border-radius:14px;padding:15px 20px;display:flex;align-items:center;justify-content:center;gap:10px;color:#2a2a2a;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;margin-bottom:12px;box-shadow:0 4px 20px rgba(173,208,54,0.35);transition:transform 0.12s;}
.share-btn:active{transform:scale(0.97);}
.home-btn{width:100%;background:transparent;border:2px solid rgba(255,255,255,0.35);border-radius:14px;padding:14px 20px;color:#fff;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;transition:background 0.15s;}
.home-btn:active{background:rgba(255,255,255,0.1);}
.toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.95);color:#7B1533;font-size:13px;font-weight:700;padding:10px 20px;border-radius:20px;box-shadow:0 4px 16px rgba(0,0,0,0.2);pointer-events:none;opacity:0;transition:opacity 0.25s;}
.toast.show{opacity:1;}
`

const markup = `<div class="page">
  <div class="logo-wrap">
    <img src="/icons/Logo-LOKALGO.png" alt="LokalGo" style="height:36px;width:auto;display:block;">
  </div>
  <div class="star-row">⭐🎉⭐</div>
  <div class="title">Tahniah!</div>
  <div class="sub">
    Permohonan <span class="shop" id="shopNameSpan">kedai anda</span> telah berjaya dihantar!
    Admin akan menghubungi anda dalam masa <strong style="color:#ADD036;">24 jam</strong> melalui WhatsApp atau email.
  </div>

  <div class="share-card">
    <div class="sc-logo">
      <img src="/icons/Logo-LOKALGO.png" alt="LokalGo" style="height:28px;width:auto;display:block;filter:brightness(0) saturate(100%) invert(13%) sepia(58%) saturate(1200%) hue-rotate(318deg) brightness(90%);">
    </div>
    <div class="sc-badge">PENJUAL BARU ✨</div>
    <div class="sc-shop" id="shareShopName">Kedai Saya</div>
    <div class="sc-tagline">Kini menjual produk tempatan di LokalGo!<br>Dapatkan produk segar & berkualiti dari jiran anda.</div>
    <div class="sc-divider"></div>
    <div class="sc-footer">
      <div class="sc-url">lokalgo.app</div>
      <div class="sc-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ADD036" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </div>
    </div>
  </div>

  <button class="share-btn" onclick="shareSuccess()">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
    Kongsi ke Rakan-Rakan
  </button>
  <button class="home-btn" onclick="window.location.href='/home'">Ke Halaman Utama</button>
  <div class="toast" id="toast"></div>
</div>`

const scripts: string[] = [`
var shopName = 'Kedai Saya';
try {
  var saved = localStorage.getItem('lokalgo_seller_onboarding');
  if (saved) { var d = JSON.parse(saved); if (d.shop_name) shopName = d.shop_name; }
} catch(e){}
var span = document.getElementById('shopNameSpan');
if (span) span.textContent = shopName;
var shareEl = document.getElementById('shareShopName');
if (shareEl) shareEl.textContent = shopName;

function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2200);
}

async function shareSuccess() {
  var name = shopName;
  var text = 'Saya baru sahaja mendaftar sebagai penjual di LokalGo! 🎉\\n\\nKedai: ' + name + '\\n\\nJom beli produk tempatan berkualiti dari jiran anda. Muat turun LokalGo sekarang:';
  var url = (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_APP_URL) || 'https://lokalgo.app';
  if (navigator.share) {
    try { await navigator.share({ title: 'Saya Kini Penjual LokalGo! 🛒', text: text, url: url }); } catch(e) {}
  } else {
    try { await navigator.clipboard.writeText(text + '\\n' + url); showToast('Teks disalin! Tampal di WhatsApp anda.'); } catch(e) { showToast('Tidak dapat menyalin teks.'); }
  }
}
`]

export default function Page() {
  const [shopName, setShopName] = useState('Kedai Saya')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lokalgo_seller_onboarding')
      if (saved) {
        const d = JSON.parse(saved) as { shop_name?: string }
        if (d.shop_name) setShopName(d.shop_name)
      }
    } catch { /* ignore parse errors */ }

    setShowModal(true)
    localStorage.removeItem('lokalgo_after_login')
    localStorage.removeItem('lokalgo_seller_onboarding_success')
  }, [])

  return (
    <>
      <HtmlPrototypePage
        styles={styles}
        markup={markup}
        scripts={scripts}
      />
      <SellerSuccessShareModal
        open={showModal}
        shopName={shopName}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}
