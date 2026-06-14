'use client'

import { useEffect } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'

const styles = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
body{background:#7B1533;min-height:100vh;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;padding:20px;}
@media(min-width:500px){body{padding:40px 20px;}}
@media(min-width:1024px){body{padding:40px;}}
.modal{width:100%;max-width:390px;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.45);position:relative;}
@media(min-width:500px){.modal{border-radius:28px;}}
.close-btn{position:absolute;top:14px;left:14px;z-index:10;width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,0.12);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#555;font-size:16px;font-weight:700;font-family:inherit;}
.close-btn:active{background:rgba(0,0,0,0.2);}
.card-img-wrap{width:100%;background:#7B1533;display:flex;align-items:center;justify-content:center;padding:28px 20px 20px;min-height:220px;}
.phone-mock{width:140px;height:auto;display:block;filter:drop-shadow(0 8px 20px rgba(0,0,0,0.4));}
.card-brand{display:flex;flex-direction:column;align-items:center;gap:10px;padding:0 24px;}
.brand-logo{height:28px;width:auto;display:block;filter:brightness(10);}
.brand-tagline{font-size:13px;color:rgba(255,255,255,0.85);text-align:center;line-height:1.6;}
.brand-tagline strong{color:#ADD036;}
.brand-url{font-size:11px;color:#ADD036;font-weight:700;letter-spacing:0.5px;margin-top:4px;}
.card-body{padding:20px 24px 24px;}
.card-heading{font-size:18px;font-weight:800;color:#1E1E1E;margin-bottom:6px;line-height:1.3;}
.card-sub{font-size:13px;color:#6B6B6B;line-height:1.6;margin-bottom:20px;}
.btn-group{display:flex;flex-direction:column;gap:10px;}
.btn-png{width:100%;background:#ADD036;border:none;border-radius:12px;padding:13px 18px;display:flex;align-items:center;justify-content:center;gap:8px;color:#1E1E1E;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;transition:transform 0.12s;}
.btn-png:active{transform:scale(0.97);}
.btn-share{width:100%;background:#F0F0F0;border:none;border-radius:12px;padding:13px 18px;display:flex;align-items:center;justify-content:center;gap:8px;color:#1E1E1E;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;transition:transform 0.12s;}
.btn-share:active{transform:scale(0.97);}
.btn-wa{width:100%;background:#25D366;border:none;border-radius:12px;padding:13px 18px;display:flex;align-items:center;justify-content:center;gap:8px;color:#fff;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;transition:transform 0.12s;}
.btn-wa:active{transform:scale(0.97);}
.toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;font-size:13px;font-weight:600;padding:10px 20px;border-radius:20px;pointer-events:none;opacity:0;transition:opacity 0.25s;white-space:nowrap;}
.toast.show{opacity:1;}
`

const markup = `
<div class="modal">
  <button class="close-btn" onclick="window.location.href='/home'" title="Tutup">✕</button>

  <!-- Branded card area -->
  <div class="card-img-wrap">
    <div class="card-brand">
      <img class="brand-logo" src="/icons/Logo-LOKALGO.png" alt="LokalGo">
      <div class="brand-tagline">
        Helo! Saya sudah berada di LokalGo.<br>
        Cari saya <strong id="shopNameCard">Kedai Saya</strong><br>
        di www.lokalgo.app
      </div>
      <div class="brand-url">www.lokalgo.app</div>
    </div>
  </div>

  <!-- Text + buttons -->
  <div class="card-body">
    <div class="card-heading">Kedai anda berjaya dibuat! 🎉</div>
    <div class="card-sub">Share kedai anda supaya customer boleh cari di LokalGo.</div>

    <div class="btn-group">
      <button class="btn-png" onclick="downloadPNG()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        Download PNG
      </button>
      <button class="btn-share" onclick="shareSuccess()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
        Share
      </button>
      <button class="btn-wa" onclick="shareWhatsApp()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
        Share WhatsApp
      </button>
    </div>
  </div>
</div>
<div class="toast" id="toast"></div>
`

const scripts: string[] = [`
var shopName = 'Kedai Saya';
try {
  var saved = localStorage.getItem('lokalgo_seller_onboarding');
  if (saved) { var d = JSON.parse(saved); if (d.shop_name) shopName = d.shop_name; }
} catch(e){}
var el = document.getElementById('shopNameCard');
if (el) el.textContent = shopName;

function showToast(msg) {
  var t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2200);
}

async function downloadPNG() {
  var canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 480;
  var ctx = canvas.getContext('2d');
  if (!ctx) { showToast('Tidak dapat jana PNG.'); return; }

  ctx.fillStyle = '#7B1533';
  ctx.fillRect(0, 0, 800, 480);

  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.roundRect(40, 40, 720, 400, 20);
  ctx.fill();

  ctx.font = 'bold 22px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillStyle = '#ADD036';
  ctx.textAlign = 'center';
  ctx.fillText('LokalGo™ Shop', 400, 130);

  ctx.font = 'bold 30px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(shopName, 400, 210);

  ctx.font = '18px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('Helo! Saya sudah berada di LokalGo.', 400, 270);
  ctx.fillText('Cari saya di www.lokalgo.app', 400, 300);

  ctx.font = 'bold 16px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillStyle = '#ADD036';
  ctx.fillText('www.lokalgo.app', 400, 370);

  try {
    var link = document.createElement('a');
    link.download = 'lokal-go-' + shopName.toLowerCase().replace(/\\s+/g, '-') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch(e) {
    showToast('Tidak dapat muat turun. Cuba Share.');
  }
}

async function shareSuccess() {
  var text = 'Helo! Saya sudah berada di LokalGo. Cari saya ' + shopName + ' di www.lokalgo.app';
  if (navigator.share) {
    try { await navigator.share({ title: shopName + ' di LokalGo!', text: text, url: 'https://lokalgo.app' }); } catch(e) {}
  } else {
    try { await navigator.clipboard.writeText(text + '\\n\\nhttps://lokalgo.app'); showToast('Teks disalin!'); } catch(e) { showToast('Tidak dapat menyalin teks.'); }
  }
}

function shareWhatsApp() {
  var text = 'Helo! Saya sudah berada di LokalGo. Cari saya *' + shopName + '* di www.lokalgo.app 🎉';
  window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
}
`]

export default function Page() {
  useEffect(() => {
    localStorage.removeItem('lokalgo_after_login')
    localStorage.removeItem('lokalgo_seller_onboarding_success')
  }, [])

  return (
    <HtmlPrototypePage
      styles={styles}
      markup={markup}
      scripts={scripts}
    />
  )
}
