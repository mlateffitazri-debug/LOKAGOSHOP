'use client'

import { useEffect } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'
import { createClient } from '@/lib/supabase/client'
import type { Product, Seller, Testimonial } from '@/types/database'

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function setText(selector: string, text: string | number) {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) element.textContent = String(text)
}

function setHtml(selector: string, html: string) {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) element.innerHTML = html
}

function renderDashboardProducts(products: Product[]) {
  if (products.length === 0) {
    return '<div class="produk-row"><div class="produk-meta"><div class="produk-name">Belum ada produk diluluskan</div><div class="produk-status-txt ps-unavail">Tambah produk selepas kedai diluluskan.</div></div></div>'
  }

  const rows = products.map((product, index) => {
    const displayName = (product as Product & { name?: string | null }).name?.trim() || product.category || 'Produk'
    return `<div class="produk-row" data-product-row="${escapeHtml(product.id)}">
    <div class="produk-thumb">${product.images?.[0] ? `<img src="${escapeHtml(product.images[0])}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">` : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'}</div>
    <div class="produk-meta">
      <div class="produk-name">${escapeHtml(displayName)}</div>
      <div class="produk-status-txt" id="product-status-${index}" data-mode-label="${escapeHtml(product.id)}">&#9679; ${productModeLabel(product)}</div>
      <a class="edit-btn" href="/produk?product=${escapeHtml(product.id)}&seller=${escapeHtml(product.seller_id)}" style="width:auto;height:auto;background:none;border:none;font-size:10px;color:#7B1533;font-weight:600;text-decoration:underline;display:inline;">Lihat</a>
    </div>
    <div class="produk-actions" style="flex-direction:column;align-items:flex-end;gap:5px;">
      <div style="display:flex;align-items:center;gap:6px;"><span style="font-size:9px;color:#888;font-weight:600;">Jual Terus</span><label class="p-switch"><input type="checkbox" data-product-id="${escapeHtml(product.id)}" data-field="is_available" ${product.is_available ? 'checked' : ''}><span class="p-slider"></span></label></div>
      <div style="display:flex;align-items:center;gap:6px;"><span style="font-size:9px;color:#888;font-weight:600;">Terima Pre-Order</span><label class="p-switch"><input type="checkbox" data-product-id="${escapeHtml(product.id)}" data-field="is_preorder" ${product.is_preorder ? 'checked' : ''}><span class="p-slider"></span></label></div>
    </div>
  </div>`
  }).join('')

  return `${rows}<div style="font-size:11px;color:#999;line-height:1.6;padding:4px 2px 0;">Jual Terus = pesanan hari ini. Pre-Order = tempahan esok dan seterusnya.</div>`
}

function productModeLabel(flags: { is_available: boolean; is_preorder: boolean }) {
  if (flags.is_available && flags.is_preorder) return 'Jual Terus + Pre-Order'
  if (flags.is_preorder) return 'Pre-Order Sahaja'
  if (flags.is_available) return 'Jual Terus'
  return 'Tidak Aktif (tersembunyi dari pembeli)'
}

type DashboardWindow = Window & {
  toggleShop?: (checkbox: HTMLInputElement) => void
}

const styles = `
:root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-accent:#ADD036;--c-green:#25D366;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
body{background:#0a0a0a;min-height:100vh;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:14px;color:var(--c-text);}
.page{width:100%;max-width:430px;margin:0 auto;min-height:100dvh;background:var(--c-bg);}
@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);overflow:hidden;}}
@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}
.scroll{height:100dvh;overflow-y:auto;}.scroll::-webkit-scrollbar{display:none;}
@media(min-width:500px){.scroll{height:812px;}}

.header{background:var(--c-primary);padding:12px 16px 10px;}
.header-r1{display:flex;align-items:center;gap:8px;}
.home-btn{width:34px;height:34px;background:rgba(255,255,255,0.15);border:none;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;text-decoration:none;}
.header-logo{flex:1;display:flex;align-items:center;}
@keyframes cup-bounce{0%,100%{transform:translateY(0);}50%{transform:translateY(-3px);}}
.cup-icon{display:inline-flex;animation:cup-bounce 1.4s ease-in-out infinite;}
.sokong-btn{background:rgba(255,255,255,0.15);border:none;border-radius:20px;padding:6px 12px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;}
.logout-btn{background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.18);border-radius:20px;padding:6px 12px;color:#fff;font-size:11px;font-weight:700;font-family:inherit;cursor:pointer;white-space:nowrap;}
.header-sub{font-size:11px;color:rgba(255,255,255,0.55);margin-top:6px;}

.dash-title{font-size:18px;font-weight:800;color:var(--c-text);text-align:center;padding:16px 20px 0;}
.shop-name-row{padding:12px 20px 0;display:flex;align-items:flex-start;justify-content:space-between;}
.shop-name{font-size:20px;font-weight:800;color:var(--c-text);letter-spacing:-0.3px;}
.notif-row{display:flex;gap:8px;}
.notif-btn{position:relative;width:34px;height:34px;background:#f0f0f0;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.notif-badge{position:absolute;top:-2px;right:-2px;background:#e44;color:#fff;font-size:9px;font-weight:700;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1.5px solid #fff;}
.verified-row{padding:4px 16px 0;display:flex;align-items:center;gap:5px;}
.verified-txt{font-size:13px;font-weight:700;color:var(--c-accent);}

.toggle-card{margin:12px 20px 0;background:var(--c-primary);border-radius:14px;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;}
.toggle-title{font-size:13px;font-weight:700;color:#fff;margin-bottom:2px;}
.toggle-status{font-size:11px;color:rgba(255,255,255,0.75);}
.toggle-status.open{color:var(--c-accent);}
.switch{position:relative;width:48px;height:26px;cursor:pointer;}
.switch input{opacity:0;width:0;height:0;}
.slider{position:absolute;inset:0;background:#555;border-radius:34px;transition:0.3s;}
.slider:before{content:'';position:absolute;width:20px;height:20px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:0.3s;}
input:checked+.slider{background:var(--c-accent);}
input:checked+.slider:before{transform:translateX(22px);}

.doa-section{margin:12px 20px 0;background:#fff;border-radius:14px;padding:14px 20px;border:1px solid #eee;}
.doa-arabic{font-family:'Noto Naskh Arabic',serif;font-size:16px;color:var(--c-text);text-align:right;line-height:1.6;margin-bottom:8px;direction:rtl;}
.doa-trans{font-size:11px;color:var(--c-text3);line-height:1.6;font-style:italic;}

.stats-grid{padding:12px 20px 0;display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.stat-card{background:var(--c-primary);border-radius:14px;padding:14px;}
.stat-num{font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;margin-bottom:2px;}
.stat-lbl{font-size:11px;color:rgba(255,255,255,0.65);margin-bottom:6px;}
.stat-change{font-size:11px;color:var(--c-accent);font-weight:600;}
.stat-change.neutral{color:rgba(255,255,255,0.5);}

.nota-card{background:#fff;border-radius:14px;padding:16px;margin:12px 20px 16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
.nota-head{display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.nota-title{font-size:14px;font-weight:700;color:#1E1E1E;}
.nota-text{font-size:13px;color:#3A3A3A;line-height:1.5;word-break:break-word;}
.nota-time{font-size:10px;color:#999;margin-top:4px;}
.nota-empty{font-size:12px;color:#999;line-height:1.5;}
.nota-actions{display:flex;align-items:center;gap:12px;margin-top:10px;}
.nota-btn-outline{border:1.5px solid #7B1533;color:#7B1533;background:#fff;border-radius:8px;padding:6px 18px;font-size:13px;font-weight:600;cursor:pointer;}
.nota-btn-fill{border:none;background:#7B1533;color:#fff;border-radius:8px;padding:7px 20px;font-size:13px;font-weight:600;cursor:pointer;}
.nota-btn-fill:disabled{opacity:0.4;cursor:default;}
.nota-btn-text{border:none;background:none;color:#C0392B;font-size:13px;font-weight:600;cursor:pointer;padding:6px 4px;}
.nota-textarea{width:100%;border:1px solid #DDD;border-radius:8px;padding:10px;font-size:13px;font-family:inherit;resize:none;box-sizing:border-box;}
.nota-counter{font-size:11px;color:#999;text-align:right;margin-top:4px;}
.nota-err{font-size:12px;color:#C0392B;font-weight:600;padding:6px 0 0;display:none;}

.produk-head{padding:0 20px 8px;display:flex;align-items:center;justify-content:space-between;}
.produk-title{font-size:14px;font-weight:700;color:var(--c-text);}
.tambah-btn{background:var(--c-primary);border:none;border-radius:20px;padding:6px 14px;color:#fff;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:5px;}
.produk-list{padding:0 20px;display:flex;flex-direction:column;gap:8px;padding-bottom:24px;}
.produk-row{background:#fff;border-radius:12px;border:1px solid #eee;padding:12px;display:flex;align-items:center;gap:12px;}
.produk-thumb{width:48px;height:48px;border-radius:10px;background:#f5f5f5;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1px solid #eee;}
.produk-meta{flex:1;}
.produk-name{font-size:13px;font-weight:700;color:var(--c-text);margin-bottom:3px;}
.produk-status-txt{font-size:11px;font-weight:600;}
.ps-avail{color:#4A7C10;}.ps-unavail{color:#e44;}.ps-preorder{color:#856404;}
.produk-actions{display:flex;align-items:center;gap:8px;}
.p-switch{position:relative;width:44px;height:24px;cursor:pointer;flex-shrink:0;}
.p-switch input{opacity:0;width:0;height:0;position:absolute;}
.p-slider{position:absolute;inset:0;background:#ddd;border-radius:34px;transition:0.25s;}
.p-slider:before{content:'';position:absolute;width:18px;height:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:0.25s;box-shadow:0 1px 3px rgba(0,0,0,0.2);}
.p-switch input:checked+.p-slider{background:var(--c-accent);}
.p-switch input:checked+.p-slider:before{transform:translateX(20px);}
.edit-btn{width:28px;height:28px;border-radius:8px;background:#f5f5f5;border:1px solid #eee;display:flex;align-items:center;justify-content:center;cursor:pointer;}

.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:200;opacity:0;pointer-events:none;transition:opacity 0.25s;display:flex;align-items:flex-end;justify-content:center;}
.modal-overlay.open{opacity:1;pointer-events:all;}
.modal-sheet{background:#fff;border-radius:20px 20px 0 0;width:100%;max-width:430px;padding:20px 20px 40px;max-height:85dvh;overflow-y:auto;transform:translateY(100%);transition:transform 0.3s ease;}
.modal-overlay.open .modal-sheet{transform:translateY(0);}
.modal-handle{width:40px;height:4px;background:#ddd;border-radius:2px;margin:0 auto 16px;}
.modal-title{font-size:16px;font-weight:800;color:#111;margin-bottom:16px;}
.modal-field{margin-bottom:14px;}
.modal-label{font-size:12px;font-weight:600;color:#555;margin-bottom:5px;display:block;}
.modal-input,.modal-select{width:100%;border:1.5px solid #DDD;border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;outline:none;background:#fff;box-sizing:border-box;}
.modal-input:focus,.modal-select:focus{border-color:#7B1533;}
.modal-hint{font-size:11px;color:#999;margin-top:3px;}
.modal-msg{font-size:13px;border-radius:10px;padding:10px 12px;margin-bottom:12px;display:none;}
.modal-msg.error{background:#fff0f3;color:#7B1533;border:1px solid #f3c4d2;display:block;}
.modal-msg.success{background:#f0fff4;color:#2d7a3a;border:1px solid #b2dfbd;display:block;}
.modal-submit{width:100%;background:#7B1533;color:#fff;border:none;border-radius:12px;padding:13px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;}
.modal-submit:disabled{opacity:0.5;cursor:default;}
.modal-cancel{width:100%;background:none;color:#888;border:none;padding:10px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;margin-top:2px;}
`

const markup = `
<div class="page">
<form id="signOutForm" action="/auth/signout" method="post" style="display:none;"></form>
<div class="scroll">

<div class="header">
  <div class="header-r1">
    <a href="/home" class="home-btn" title="Ke Halaman Utama">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
    </a>
    <div class="header-logo">
      <img src="/icons/Logo-LOKALGO.png" alt="LokalGo&#8482;" style="height:36px;width:auto;display:block;">
    </div>
    <button class="sokong-btn">
      <span class="cup-icon">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/></svg>
      </span>
      Sokong
    </button>
    <button class="logout-btn" onclick="submitSignOut()">Keluar</button>
  </div>
  <div class="header-sub"><span data-i18n="tagline">Platform perniagaan lokal setempat</span></div>
</div>

<div class="dash-title"><span data-i18n="dashboard">Dashboard</span></div>

<div class="shop-name-row">
  <div>
    <div class="shop-name">Resepi Kak Mila</div>
    <a href="/shop" style="font-size:11px;color:#7B1533;font-weight:600;text-decoration:none;display:flex;align-items:center;gap:3px;margin-top:3px;">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      Lihat kedai saya
    </a>
  </div>
  <div class="notif-row">
    <a href="/notifikasi" style="text-decoration:none;">
      <button class="notif-btn" title="Notifikasi">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <div class="notif-badge">3</div>
      </button>
    </a>
    <a href="/inbox" style="text-decoration:none;">
      <button class="notif-btn" title="Mesej Admin">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <div class="notif-badge" style="background:#F0A500;">1</div>
      </button>
    </a>
  </div>
</div>

<div class="verified-row">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ADD036" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  <span class="verified-txt"><span data-i18n="verified_shop">Verified Shop</span></span>
</div>

<div class="toggle-card">
  <div>
    <div class="toggle-title"><span data-i18n="status_kedai">Status Kedai</span></div>
    <div class="toggle-status open" id="toggleStatus">&#9679; Kedai sedang dibuka</div>
  </div>
  <label class="switch">
    <input type="checkbox" checked id="shopToggle" onchange="toggleShop(this)">
    <span class="slider"></span>
  </label>
</div>

<div class="doa-section">
  <div class="doa-arabic">&#x627;&#x644;&#x644;&#x651;&#x647;&#x64F;&#x645;&#x651; &#x625;&#x650;&#x646;&#x651;&#x650;&#x64A; &#x623;&#x64E;&#x633;&#x652;&#x623;&#x64E;&#x644;&#x64F;&#x643;&#x64E; &#x639;&#x650;&#x644;&#x652;&#x645;&#x64B;&#x627; &#x646;&#x64E;&#x627;&#x641;&#x650;&#x639;&#x64B;&#x627; &#x648;&#x64E;&#x631;&#x650;&#x632;&#x652;&#x642;&#x64B;&#x627; &#x637;&#x64E;&#x64A;&#x651;&#x650;&#x628;&#x64B;&#x627; &#x648;&#x64E;&#x639;&#x64E;&#x645;&#x64E;&#x644;&#x64B;&#x627; &#x645;&#x64F;&#x62A;&#x64E;&#x642;&#x64E;&#x628;&#x651;&#x64E;&#x644;&#x64B;&#x627;</div>
  <div style="font-size:11px;color:#7B1533;font-style:italic;margin:6px 0 6px;line-height:1.6;">Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbalan.</div>
  <div class="doa-trans">"Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amalan yang diterima."</div>
</div>

<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-num">0</div>
    <div class="stat-lbl">Paparan Hari Ini</div>
    <div class="stat-change neutral">memuat...</div>
  </div>
  <div class="stat-card">
    <div class="stat-num">0</div>
    <div class="stat-lbl">WA Clicks</div>
    <div class="stat-change neutral">memuat...</div>
  </div>
  <div class="stat-card">
    <div class="stat-num">0</div>
    <div class="stat-lbl">Testimoni</div>
    <div class="stat-change neutral">memuat...</div>
  </div>
  <div class="stat-card">
    <div class="stat-num">0%</div>
    <div class="stat-lbl">Skor Populariti</div>
    <div class="stat-change neutral">memuat...</div>
  </div>
</div>

<div class="nota-card" id="notaCard">
  <div class="nota-head">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B1D2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>
    <span class="nota-title">Nota Kedai</span>
  </div>
  <div id="notaView">
    <div class="nota-empty" id="notaEmpty">Tiada nota. Pelanggan akan nampak nota ini di halaman kedai anda.</div>
    <div class="nota-text" id="notaText" style="display:none;"></div>
    <div class="nota-time" id="notaTime" style="display:none;"></div>
    <div class="nota-actions">
      <button class="nota-btn-fill" id="notaAddBtn">Tambah Nota</button>
      <button class="nota-btn-outline" id="notaEditBtn" style="display:none;">Edit</button>
      <button class="nota-btn-text" id="notaDeleteBtn" style="display:none;">Padam</button>
    </div>
  </div>
  <div id="notaEdit" style="display:none;">
    <textarea class="nota-textarea" id="notaInput" maxlength="120" rows="3" placeholder="Cth: Hari ni cuaca hujan, sediakan payung"></textarea>
    <div class="nota-counter"><span id="notaCount">0</span>/120</div>
    <div class="nota-actions">
      <button class="nota-btn-fill" id="notaSaveBtn" disabled>Simpan</button>
      <button class="nota-btn-text" id="notaCancelBtn" style="color:#888;">Batal</button>
    </div>
  </div>
  <div class="nota-err" id="notaErr"></div>
</div>

<div class="produk-head">
  <span class="produk-title"><span data-i18n="produk_saya">Produk Saya</span></span>
  <button class="tambah-btn" id="openTambahBtn">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    Tambah
  </button>
</div>

<div class="produk-list">
  <div class="produk-row">
    <div class="produk-thumb"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
    <div class="produk-meta"><div class="produk-name">Memuat produk...</div><div class="produk-status-txt" style="color:#bbb;">&#9679; tunggu sebentar</div></div>
  </div>
</div>

</div>
</div>

<div class="modal-overlay" id="tambahModal">
  <div class="modal-sheet">
    <div class="modal-handle"></div>
    <div class="modal-title">Tambah Produk Baru</div>
    <div class="modal-field">
      <label class="modal-label">Nama Produk *</label>
      <input class="modal-input" id="prodNama" placeholder="Cth: Kuih Talam Pandan" maxlength="80">
    </div>
    <div class="modal-field">
      <label class="modal-label">Kategori *</label>
      <select class="modal-select" id="prodKategori">
        <option value="">-- Pilih Kategori --</option>
        <option>Pastri &amp; Kek</option>
        <option>Set Makanan &amp; Lauk</option>
        <option>Frozen &amp; Simpanan</option>
        <option>Minuman</option>
        <option>Fresh &amp; Semulajadi</option>
        <option>Snek</option>
      </select>
    </div>
    <div class="modal-field">
      <label class="modal-label">Harga Dari (RM) *</label>
      <input class="modal-input" id="prodHarga" type="number" step="0.5" min="0.5" placeholder="Cth: 5.00">
    </div>
    <div class="modal-field">
      <label class="modal-label">Keterangan (pilihan)</label>
      <textarea class="modal-input" id="prodDesc" rows="3" placeholder="Terangkan produk anda..." maxlength="200" style="resize:none;"></textarea>
    </div>
    <div class="modal-field">
      <label class="modal-label">Unit (pilihan)</label>
      <input class="modal-input" id="prodUnit" placeholder="Cth: biji, kotak, pek" maxlength="20">
      <div class="modal-hint">Contoh paparan: RM5 / biji</div>
    </div>
    <div class="modal-msg" id="tambahMsg"></div>
    <button class="modal-submit" id="tambahSaveBtn">Hantar untuk Semakan</button>
    <button class="modal-cancel" id="tambahCancelBtn">Batal</button>
  </div>
</div>
`

const scripts: string[] = [
  `function submitSignOut() {
  document.getElementById('signOutForm').submit();
}

function toggleShop(cb) {
  var status = document.getElementById('toggleStatus');
  if (cb.checked) {
    status.textContent = '● Kedai sedang dibuka';
    status.className = 'toggle-status open';
  } else {
    status.textContent = '● Kedai ditutup';
    status.className = 'toggle-status';
  }
}

function toggleProduk(cb, statusId) {
  var el = document.getElementById(statusId);
  if (cb.checked) {
    el.textContent = '● Tersedia';
    el.className = 'produk-status-txt ps-avail';
  } else {
    el.textContent = '● Tidak Tersedia';
    el.className = 'produk-status-txt ps-unavail';
  }
}`,
]
const externalScripts: string[] = []
const externalStylesheets: string[] = [
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Naskh+Arabic:wght@400;700&display=swap',
]

export default function Page() {
  useEffect(() => {
    let currentSeller: Seller | null = null
    const supabase = createClient()

    // ── Tambah modal — wire open/close immediately (no async needed) ──
    const tambahModal = document.getElementById('tambahModal')
    const openTambahBtn = document.getElementById('openTambahBtn')
    const tambahCancelBtn = document.getElementById('tambahCancelBtn')
    const tambahMsg = document.getElementById('tambahMsg')

    function resetTambahForm() {
      ;['prodNama', 'prodHarga', 'prodUnit'].forEach((id) => {
        const el = document.getElementById(id) as HTMLInputElement | null
        if (el) el.value = ''
      })
      const desc = document.getElementById('prodDesc') as HTMLTextAreaElement | null
      if (desc) desc.value = ''
      const sel = document.getElementById('prodKategori') as HTMLSelectElement | null
      if (sel) sel.value = ''
      const saveBtn = document.getElementById('tambahSaveBtn') as HTMLButtonElement | null
      if (saveBtn) saveBtn.disabled = false
      if (tambahMsg) { tambahMsg.className = 'modal-msg'; tambahMsg.textContent = '' }
    }

    openTambahBtn?.addEventListener('click', () => tambahModal?.classList.add('open'))
    tambahCancelBtn?.addEventListener('click', () => {
      tambahModal?.classList.remove('open')
      resetTambahForm()
    })
    tambahModal?.addEventListener('click', (e) => {
      if (e.target === tambahModal) {
        tambahModal.classList.remove('open')
        resetTambahForm()
      }
    })

    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/auth'
        return
      }

      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (sellerError || !seller) {
        window.location.href = '/home'
        return
      }

      currentSeller = seller as Seller

      const [{ data: products }, { data: testimonials }] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('seller_id', currentSeller.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false }),
        supabase
          .from('testimonials')
          .select('*')
          .eq('seller_id', currentSeller.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false }),
      ])

      const sellerProducts = (products ?? []) as Product[]
      const sellerTestimonials = (testimonials ?? []) as Testimonial[]
      const shopToggle = document.getElementById('shopToggle') as HTMLInputElement | null

      setText('.shop-name', currentSeller.shop_name)
      setText('.verified-txt', currentSeller.status === 'active' ? 'Verified Shop' : `Status: ${currentSeller.status}`)
      setText('.stats-grid .stat-card:nth-child(1) .stat-num', currentSeller.view_count ?? 0)
      setText('.stats-grid .stat-card:nth-child(1) .stat-change', `↑ ${currentSeller.view_count ?? 0} jumlah`)
      setText('.stats-grid .stat-card:nth-child(2) .stat-num', currentSeller.wa_click_count ?? 0)
      setText('.stats-grid .stat-card:nth-child(2) .stat-change', `↑ ${currentSeller.wa_click_count ?? 0} jumlah`)
      setText('.stats-grid .stat-card:nth-child(3) .stat-num', sellerTestimonials.length || currentSeller.testimonial_count || 0)
      setText('.stats-grid .stat-card:nth-child(3) .stat-change', `${sellerTestimonials.length} diluluskan`)
      const populariti = Math.min(100, Math.round(((currentSeller.view_count ?? 0) + (currentSeller.wa_click_count ?? 0) + (sellerTestimonials.length * 10)) / 5))
      setText('.stats-grid .stat-card:nth-child(4) .stat-num', `${populariti}%`)
      setText('.stats-grid .stat-card:nth-child(4) .stat-change', populariti >= 50 ? '↑ Bagus!' : 'Tingkatkan aktiviti')

      const statCards = document.querySelectorAll<HTMLElement>('.stats-grid .stat-card .stat-change')
      statCards.forEach(el => el.classList.remove('neutral'))

      setHtml('.produk-list', renderDashboardProducts(sellerProducts))

      // Product mode toggles
      const flagsById = new Map(sellerProducts.map((p) => [p.id, { is_available: p.is_available, is_preorder: p.is_preorder }]))
      document.querySelectorAll<HTMLInputElement>('.produk-list input[data-field]').forEach((toggle) => {
        toggle.addEventListener('change', async () => {
          const id = toggle.dataset.productId
          const field = toggle.dataset.field as 'is_available' | 'is_preorder'
          const flags = id ? flagsById.get(id) : undefined
          if (!id || !flags) return
          const previous = flags[field]
          flags[field] = toggle.checked
          const label = document.querySelector<HTMLElement>(`[data-mode-label="${id}"]`)
          if (label) label.textContent = `● ${productModeLabel(flags)}`
          const { error } = await supabase.from('products').update({ [field]: toggle.checked }).eq('id', id)
          if (error) {
            flags[field] = previous
            toggle.checked = previous
            if (label) label.textContent = `● ${productModeLabel(flags)}`
            alert('Tidak dapat kemaskini produk. Cuba lagi.')
          }
        })
      })

      // ── Nota Kedai ──
      const notaView = document.getElementById('notaView')
      const notaEdit = document.getElementById('notaEdit')
      const notaEmpty = document.getElementById('notaEmpty')
      const notaText = document.getElementById('notaText')
      const notaTime = document.getElementById('notaTime')
      const notaAddBtn = document.getElementById('notaAddBtn')
      const notaEditBtn = document.getElementById('notaEditBtn')
      const notaDeleteBtn = document.getElementById('notaDeleteBtn')
      const notaSaveBtn = document.getElementById('notaSaveBtn') as HTMLButtonElement | null
      const notaCancelBtn = document.getElementById('notaCancelBtn')
      const notaInput = document.getElementById('notaInput') as HTMLTextAreaElement | null
      const notaCount = document.getElementById('notaCount')
      const notaErr = document.getElementById('notaErr')

      function relativeTime(value: string | null) {
        if (!value) return 'baru-baru ini'
        const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000)
        if (mins < 1) return 'sebentar tadi'
        if (mins < 60) return `${mins} minit lalu`
        const hours = Math.floor(mins / 60)
        if (hours < 24) return `${hours} jam lalu`
        return `${Math.floor(hours / 24)} hari lalu`
      }

      function renderNota() {
        const note = currentSeller?.custom_note?.trim() || ''
        if (notaEmpty) notaEmpty.style.display = note ? 'none' : 'block'
        if (notaText) { notaText.style.display = note ? 'block' : 'none'; notaText.textContent = note }
        if (notaTime) {
          notaTime.style.display = note ? 'block' : 'none'
          notaTime.textContent = `Dikemaskini ${relativeTime(currentSeller?.custom_note_updated_at ?? null)}`
        }
        if (notaAddBtn) notaAddBtn.style.display = note ? 'none' : 'inline-block'
        if (notaEditBtn) notaEditBtn.style.display = note ? 'inline-block' : 'none'
        if (notaDeleteBtn) notaDeleteBtn.style.display = note ? 'inline-block' : 'none'
      }

      function openNotaEditor() {
        if (!notaView || !notaEdit || !notaInput) return
        notaInput.value = currentSeller?.custom_note?.trim() || ''
        if (notaCount) notaCount.textContent = String(notaInput.value.length)
        if (notaSaveBtn) notaSaveBtn.disabled = true
        notaView.style.display = 'none'
        notaEdit.style.display = 'block'
        notaInput.focus()
      }

      function closeNotaEditor() {
        if (notaView) notaView.style.display = 'block'
        if (notaEdit) notaEdit.style.display = 'none'
      }

      function showNotaErr(msg: string) {
        if (!notaErr) return
        notaErr.textContent = msg
        notaErr.style.display = 'block'
        setTimeout(() => { notaErr.style.display = 'none' }, 5000)
      }

      async function saveNota(value: string | null) {
        if (!currentSeller) return
        const previous = { note: currentSeller.custom_note, time: currentSeller.custom_note_updated_at }
        const now = value ? new Date().toISOString() : null
        currentSeller.custom_note = value
        currentSeller.custom_note_updated_at = now
        renderNota()
        closeNotaEditor()

        let { error } = await supabase
          .from('sellers')
          .update({ custom_note: value, custom_note_updated_at: now })
          .eq('id', currentSeller.id)

        // Fallback: if custom_note_updated_at column missing, retry without it
        if (error?.code === '42703' || error?.message?.toLowerCase().includes('custom_note_updated_at')) {
          const retry = await supabase
            .from('sellers')
            .update({ custom_note: value })
            .eq('id', currentSeller.id)
          error = retry.error
        }

        if (error) {
          currentSeller.custom_note = previous.note
          currentSeller.custom_note_updated_at = previous.time
          renderNota()
          showNotaErr('Nota tidak dapat disimpan. Cuba lagi.')
        }
      }

      notaInput?.addEventListener('input', () => {
        if (notaCount) notaCount.textContent = String(notaInput.value.length)
        if (notaSaveBtn) {
          const trimmed = notaInput.value.trim()
          notaSaveBtn.disabled = !trimmed || trimmed === (currentSeller?.custom_note?.trim() || '')
        }
      })
      notaAddBtn?.addEventListener('click', openNotaEditor)
      notaEditBtn?.addEventListener('click', openNotaEditor)
      notaCancelBtn?.addEventListener('click', closeNotaEditor)
      notaSaveBtn?.addEventListener('click', () => { void saveNota(notaInput?.value.trim() || null) })
      notaDeleteBtn?.addEventListener('click', () => {
        if (window.confirm('Padam nota kedai?')) void saveNota(null)
      })
      renderNota()

      if (shopToggle) {
        shopToggle.checked = Boolean(currentSeller.is_open)
        const status = document.getElementById('toggleStatus')
        if (status) {
          status.textContent = currentSeller.is_open ? '● Kedai sedang dibuka' : '● Kedai ditutup'
          status.className = currentSeller.is_open ? 'toggle-status open' : 'toggle-status'
        }
      }

      // ── Tambah produk save (needs currentSeller) ──
      const tambahSaveBtn = document.getElementById('tambahSaveBtn') as HTMLButtonElement | null

      tambahSaveBtn?.addEventListener('click', async () => {
        if (!currentSeller || !tambahSaveBtn) return

        const nama = (document.getElementById('prodNama') as HTMLInputElement | null)?.value.trim() ?? ''
        const kategori = (document.getElementById('prodKategori') as HTMLSelectElement | null)?.value ?? ''
        const hargaStr = (document.getElementById('prodHarga') as HTMLInputElement | null)?.value ?? ''
        const desc = (document.getElementById('prodDesc') as HTMLTextAreaElement | null)?.value.trim() ?? ''
        const unit = (document.getElementById('prodUnit') as HTMLInputElement | null)?.value.trim() ?? ''
        const harga = parseFloat(hargaStr)

        if (!nama) {
          if (tambahMsg) { tambahMsg.className = 'modal-msg error'; tambahMsg.textContent = 'Sila masukkan nama produk.' }
          return
        }
        if (!kategori) {
          if (tambahMsg) { tambahMsg.className = 'modal-msg error'; tambahMsg.textContent = 'Sila pilih kategori produk.' }
          return
        }
        if (!hargaStr || isNaN(harga) || harga <= 0) {
          if (tambahMsg) { tambahMsg.className = 'modal-msg error'; tambahMsg.textContent = 'Sila masukkan harga yang betul.' }
          return
        }

        tambahSaveBtn.disabled = true
        if (tambahMsg) { tambahMsg.className = 'modal-msg'; tambahMsg.textContent = '' }

        const { error } = await supabase.from('products').insert({
          seller_id: currentSeller.id,
          name: nama,
          category: kategori,
          price_from: harga,
          description: desc || null,
          unit: unit || null,
          images: [],
          is_available: false,
          is_preorder: false,
          status: 'pending',
        })

        if (error) {
          tambahSaveBtn.disabled = false
          if (tambahMsg) { tambahMsg.className = 'modal-msg error'; tambahMsg.textContent = 'Produk tidak dapat dihantar. Cuba lagi.' }
        } else {
          if (tambahMsg) {
            tambahMsg.className = 'modal-msg success'
            tambahMsg.textContent = 'Produk telah dihantar untuk semakan admin. Ia akan muncul selepas diluluskan.'
          }
          setTimeout(() => {
            tambahModal?.classList.remove('open')
            resetTambahForm()
          }, 3000)
        }
      })
    }

    const originalToggle = (window as DashboardWindow).toggleShop
    ;(window as DashboardWindow).toggleShop = (checkbox: HTMLInputElement) => {
      originalToggle?.(checkbox)
      if (currentSeller) {
        void supabase
          .from('sellers')
          .update({ is_open: checkbox.checked })
          .eq('id', currentSeller.id)
      }
    }

    loadDashboard().catch((error) => {
      console.error(error)
      setText('.shop-name', 'Dashboard tidak dapat dimuatkan')
    })

    return () => {
      ;(window as DashboardWindow).toggleShop = originalToggle
    }
  }, [])

  return (
    <HtmlPrototypePage
      styles={styles}
      markup={markup}
      scripts={scripts}
      externalScripts={externalScripts}
      externalStylesheets={externalStylesheets}
    />
  )
}
