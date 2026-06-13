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

function safeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('/')) {
    return trimmed
  }
  return null
}

function renderDashboardProducts(products: Product[]) {
  if (products.length === 0) {
    return '<div class="produk-row"><div class="produk-meta"><div class="produk-name">Belum ada produk</div><div class="produk-status-txt ps-unavail">Klik "Tambah" untuk muat naik produk pertama anda.</div></div></div>'
  }

  const rows = products.map((product, index) => {
    const displayName = (product as Product & { name?: string | null }).name?.trim() || product.category || 'Produk'
    const isPending = product.status === 'pending'
    const pendingBadge = isPending ? '<span style="font-size:9px;background:#FFF3CD;color:#856404;border-radius:6px;padding:1px 6px;font-weight:700;margin-left:4px;">Dalam Semakan</span>' : ''
    return `<div class="produk-row" data-product-row="${escapeHtml(product.id)}">
    <div class="produk-thumb">${product.images?.[0] ? `<img src="${escapeHtml(product.images[0])}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:10px;">` : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'}</div>
    <div class="produk-meta">
      <div class="produk-name">${escapeHtml(displayName)}${pendingBadge}</div>
      <div class="produk-status-txt" id="product-status-${index}" data-mode-label="${escapeHtml(product.id)}">● ${isPending ? 'Menunggu kelulusan admin' : productModeLabel(product)}</div>
      ${!isPending ? `<a class="edit-btn" href="/produk?product=${escapeHtml(product.id)}&seller=${escapeHtml(product.seller_id)}" style="width:auto;height:auto;background:none;border:none;font-size:10px;color:#7B1533;font-weight:600;text-decoration:underline;display:inline;">Lihat</a>` : ''}
    </div>
    <div class="produk-actions" style="flex-direction:column;align-items:flex-end;gap:5px;${isPending ? 'opacity:0.4;pointer-events:none;' : ''}">
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

// Shell ikut /home: html/body terkunci, scroll hanya dalam .dash-scroll —
// elak pinch/pan keluar skrin (rubber-band) pada iOS Safari.
// Nota: jangan guna nama kelas .scroll/.page-scroll — globals.css paksa
// height penuh viewport pada kelas itu dan pecahkan layout header tetap.
const styles = `:root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-green:#25D366;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
html,body{overflow:hidden;height:100%;}
body{background:#0a0a0a;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:14px;color:var(--c-text);}
.page{position:relative;width:100%;max-width:430px;margin:0 auto;height:100dvh;background:var(--c-bg);overflow:hidden;display:flex;flex-direction:column;}
@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{height:calc(100dvh - 80px);border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}
@media(min-width:1024px){body{align-items:center;padding:40px;}}
.dash-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;padding-bottom:env(safe-area-inset-bottom);}
.dash-scroll::-webkit-scrollbar{display:none;}

/* HEADER — ikut gaya /home: logo + ikon bulat (kopi + avatar) */
.header{flex-shrink:0;background:var(--c-primary);padding:calc(env(safe-area-inset-top) + 14px) 20px 12px;}
.header-r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;}
.header-sub{font-size:11px;color:rgba(255,255,255,0.55);}
.header-actions{display:flex;align-items:center;gap:10px;}
.coin-btn{width:40px;height:40px;border-radius:50%;border:none;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}
@keyframes coffeeWobble{0%,80%,100%{transform:rotate(0deg);}83%{transform:rotate(-14deg);}87%{transform:rotate(14deg);}91%{transform:rotate(-9deg);}95%{transform:rotate(9deg);}98%{transform:rotate(-4deg);}}
.coin-btn svg{animation:coffeeWobble 3.5s ease-in-out infinite;transform-origin:50% 80%;}
.home-avatar{width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,255,255,0.7);background:#7B1533;color:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,0.18);flex-shrink:0;}
.home-avatar img{width:100%;height:100%;object-fit:cover;display:block;}

/* DASHBOARD TITLE */
.dash-title{font-size:18px;font-weight:800;color:var(--c-text);text-align:center;padding:16px 20px 0;}

/* SHOP NAME ROW */
.shop-name-row{padding:12px 20px 0;display:flex;align-items:flex-start;justify-content:space-between;}
.shop-name{font-size:20px;font-weight:800;color:var(--c-text);letter-spacing:-0.3px;}
.notif-row{display:flex;gap:8px;}
.notif-btn{position:relative;width:34px;height:34px;background:#f0f0f0;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.notif-badge{position:absolute;top:-2px;right:-2px;background:#e44;color:#fff;font-size:9px;font-weight:700;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1.5px solid #fff;}
.verified-row{padding:4px 16px 0;display:flex;align-items:center;gap:5px;}
.verified-txt{font-size:13px;font-weight:700;color:var(--c-accent);}

/* STATUS TOGGLE */
.toggle-card{margin:12px 20px 0;background:var(--c-primary);border-radius:14px;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;}
.toggle-left{}
.toggle-title{font-size:13px;font-weight:700;color:#fff;margin-bottom:2px;}
.toggle-status{font-size:11px;color:rgba(255,255,255,0.75);}
.toggle-status.open{color:var(--c-accent);}
.switch{position:relative;width:48px;height:26px;cursor:pointer;}
.switch input{opacity:0;width:0;height:0;}
.slider{position:absolute;inset:0;background:#555;border-radius:34px;transition:0.3s;}
.slider:before{content:'';position:absolute;width:20px;height:20px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:0.3s;}
input:checked+.slider{background:var(--c-accent);}
input:checked+.slider:before{transform:translateX(22px);}

/* DOA SECTION */
.doa-section{margin:12px 20px 0;background:#fff;border-radius:14px;padding:14px 20px;border:1px solid #eee;}
.doa-arabic{font-family:'Noto Naskh Arabic',serif;font-size:16px;color:var(--c-text);text-align:right;line-height:1.6;margin-bottom:8px;direction:rtl;}
.doa-trans{font-size:11px;color:var(--c-text3);line-height:1.6;font-style:italic;}

/* STATS GRID */
.stats-grid{padding:12px 20px 0;display:grid;grid-template-columns:1fr 1fr;gap:10px;}
.stat-card{background:var(--c-primary);border-radius:14px;padding:14px;}
.stat-num{font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;margin-bottom:2px;}
.stat-lbl{font-size:11px;color:rgba(255,255,255,0.65);margin-bottom:6px;}
.stat-change{font-size:11px;color:var(--c-accent);font-weight:600;}
.stat-change.neutral{color:rgba(255,255,255,0.5);}

/* PRODUK LIST */
.produk-head{padding:14px 20px 8px;display:flex;align-items:center;justify-content:space-between;}
.produk-title{font-size:14px;font-weight:700;color:var(--c-text);}
.tambah-btn{background:var(--c-primary);border:none;border-radius:20px;padding:6px 14px;color:#fff;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:5px;}

.produk-list{padding:0 20px;display:flex;flex-direction:column;gap:8px;padding-bottom:24px;}
.produk-row{background:#fff;border-radius:12px;border:1px solid #eee;padding:12px;display:flex;align-items:center;gap:12px;}
.produk-thumb{width:48px;height:48px;border-radius:10px;background:#f5f5f5;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1px solid #eee;}
.produk-meta{flex:1;}
.produk-name{font-size:13px;font-weight:700;color:var(--c-text);margin-bottom:3px;}
.produk-status-txt{font-size:11px;font-weight:600;}
.ps-avail{color:#4A7C10;}
.ps-unavail{color:#e44;}
.ps-preorder{color:#856404;}
.produk-actions{display:flex;align-items:center;gap:8px;}

/* PRODUK TOGGLE SWITCH */
.p-switch{position:relative;width:44px;height:24px;cursor:pointer;flex-shrink:0;}
.p-switch input{opacity:0;width:0;height:0;position:absolute;}
.p-slider{position:absolute;inset:0;background:#ddd;border-radius:34px;transition:0.25s;}
.p-slider:before{content:'';position:absolute;width:18px;height:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:0.25s;box-shadow:0 1px 3px rgba(0,0,0,0.2);}
.p-switch input:checked+.p-slider{background:var(--c-accent);}
.p-switch input:checked+.p-slider:before{transform:translateX(20px);}

.edit-btn{width:28px;height:28px;border-radius:8px;background:#f5f5f5;border:1px solid #eee;display:flex;align-items:center;justify-content:center;cursor:pointer;}
.nota-card{background:#fff;border-radius:14px;padding:16px;margin:0 0 16px 0;box-shadow:0 1px 4px rgba(0,0,0,0.06);}
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

/* SIDEBAR PROFIL — ikut gaya /home */
.sidebar-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.4);z-index:40;}
.profile-sidebar{position:absolute;top:0;right:0;width:280px;height:100%;background:#fff;z-index:50;transform:translateX(100%);transition:transform 0.3s ease;overflow:hidden;display:flex;flex-direction:column;font-family:'Plus Jakarta Sans',sans-serif;box-shadow:-18px 0 50px rgba(0,0,0,0.22);padding-bottom:env(safe-area-inset-bottom);}
.profile-sidebar.open{transform:translateX(0);}
.profile-sidebar-header{position:relative;background:#7B1533;padding:20px;color:#fff;}
.sidebar-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border:0;border-radius:50%;background:rgba(255,255,255,0.15);color:#fff;font-size:16px;font-weight:800;line-height:1;cursor:pointer;}
.sidebar-profile{display:flex;align-items:center;gap:12px;padding-right:36px;}
.sidebar-avatar{width:56px;height:56px;border-radius:50%;border:2px solid rgba(255,255,255,0.45);background:#7B1533;color:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:22px;font-weight:800;flex-shrink:0;}
.sidebar-avatar img{width:100%;height:100%;object-fit:cover;display:block;}
.sidebar-profile-text{min-width:0;flex:1;}
.sidebar-name{font-size:16px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sidebar-email{margin-top:2px;font-size:12px;color:rgba(255,255,255,0.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sidebar-body{flex:1;background:#fff;overflow-y:auto;}
.sidebar-link,.sidebar-lang{display:flex;width:100%;align-items:center;gap:12px;border:0;border-bottom:1px solid #f5f5f5;background:#fff;padding:14px 20px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#111;text-align:left;text-decoration:none;cursor:pointer;}
.sidebar-icon{width:24px;height:24px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sidebar-label{flex:1;font-weight:600;}
.sidebar-arrow{color:#bbb;}
.sidebar-lang-pill{border-radius:999px;background:#ADD036;padding:4px 10px;font-size:10px;font-weight:800;color:#3D4D0E;}
.sidebar-footer{background:#fff;padding:16px 16px max(16px,env(safe-area-inset-bottom));border-top:1px solid var(--c-border);}
.logout-btn{width:100%;min-height:44px;display:flex;align-items:center;justify-content:center;gap:8px;border:1.5px solid var(--c-primary);border-radius:12px;background:#fff;padding:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:800;color:var(--c-primary);cursor:pointer;}`

const markup = `<div class="page">
<form id="signOutForm" action="/auth/signout" method="post" style="display:none;"></form>

<!-- HEADER -->
<div class="header">
  <div class="header-r1">
    <button onclick="window.location.reload()" style="background:none;border:none;padding:0;cursor:pointer;display:flex;align-items:center;" aria-label="Muat semula">
    <img src="/icons/Logo-LOKALGO.png" alt="LokalGo™" style="height:40px;width:auto;display:block;">
    </button>
    <div class="header-actions">
      <button class="coin-btn sokong-btn" aria-label="Sokong Pembangun"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8E44A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg></button>
      <button class="home-avatar" id="dashAvatarBtn" onclick="dashOpenSidebar()" aria-label="Buka menu profil">L</button>
    </div>
  </div>
  <div class="header-sub"><span data-i18n="tagline">Platform perniagaan lokal setempat</span></div>
</div>

<div class="dash-scroll">

<!-- DASHBOARD TITLE -->
<div class="dash-title"><span data-i18n="dashboard">Dashboard</span></div>

<!-- SHOP NAME -->
<div class="shop-name-row">
  <div>
    <div class="shop-name">Resepi Kak Mila</div>
    <a id="viewShopLink" href="/shop" style="font-size:11px;color:#7B1533;font-weight:600;text-decoration:none;display:flex;align-items:center;gap:3px;margin-top:3px;">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      Lihat kedai saya
    </a>
  </div>
  <div class="notif-row">
    <a href="/notifikasi" style="text-decoration:none;">
      <button class="notif-btn" title="Notifikasi — views, review, badge">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        <div class="notif-badge" id="notifBadge" style="display:none;">0</div>
      </button>
    </a>
    <a href="/inbox" style="text-decoration:none;">
      <button class="notif-btn" title="Mesej Admin — warning, flag, announcement">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        <div class="notif-badge" id="msgBadge" style="background:#F0A500;display:none;">0</div>
      </button>
    </a>
  </div>
</div>

<div class="verified-row">
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ADD036" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  <span class="verified-txt"><span data-i18n="verified_shop">Verified Shop</span></span>
</div>

<!-- STATUS TOGGLE -->
<div class="toggle-card">
  <div class="toggle-left">
    <div class="toggle-title"><span data-i18n="status_kedai">Status Kedai</span></div>
    <div class="toggle-status open" id="toggleStatus">● Kedai sedang dibuka</div>
  </div>
  <label class="switch">
    <input type="checkbox" checked id="shopToggle" onchange="toggleShop(this)">
    <span class="slider"></span>
  </label>
</div>

<!-- DOA -->
<div class="doa-section">
  <div class="doa-arabic" id="doaArabic">اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا</div>
  <div class="doa-trans" id="doaTrans">"Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amalan yang diterima."</div>
</div>

<!-- STATS -->
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-num">248</div>
    <div class="stat-lbl">Paparan Hari Ini</div>
    <div class="stat-change">↑ +12 dari semalam</div>
  </div>
  <div class="stat-card">
    <div class="stat-num">43</div>
    <div class="stat-lbl">WA Clicks</div>
    <div class="stat-change">↑ +5 dari semalam</div>
  </div>
  <div class="stat-card">
    <div class="stat-num">12</div>
    <div class="stat-lbl">Testimoni</div>
    <div class="stat-change neutral">1 pending</div>
  </div>
  <div class="stat-card">
    <div class="stat-num">87%</div>
    <div class="stat-lbl">Skor Populariti</div>
    <div class="stat-change">↑ Naik minggu ini</div>
  </div>
</div>

<div class="nota-card" id="notaCard"><div class="nota-head"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B1D2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg><span class="nota-title">Nota Kedai</span></div><div id="notaView"><div class="nota-empty" id="notaEmpty">Tiada nota. Pelanggan akan nampak nota ini di halaman kedai anda.</div><div class="nota-text" id="notaText" style="display:none;"></div><div class="nota-time" id="notaTime" style="display:none;"></div><div class="nota-actions"><button class="nota-btn-fill" id="notaAddBtn">Tambah Nota</button><button class="nota-btn-outline" id="notaEditBtn" style="display:none;">Edit</button><button class="nota-btn-text" id="notaDeleteBtn" style="display:none;">Padam</button></div></div><div id="notaEdit" style="display:none;"><textarea class="nota-textarea" id="notaInput" maxlength="120" rows="3" placeholder="Cth: Hari ni cuaca hujan, sediakan payung"></textarea><div class="nota-counter"><span id="notaCount">0</span>/120</div><div class="nota-actions"><button class="nota-btn-fill" id="notaSaveBtn" disabled>Simpan</button><button class="nota-btn-text" id="notaCancelBtn" style="color:#888;">Batal</button></div></div></div>

<!-- PRODUK -->
<div class="produk-head">
  <span class="produk-title"><span data-i18n="produk_saya">Produk Saya</span></span>
  <button class="tambah-btn" onclick="location.href='/seller/produk/tambah'">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    Tambah
  </button>
</div>

<div class="produk-list">

  <div class="produk-row">
    <div class="produk-thumb"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18v2a9 9 0 0 1-18 0v-2z"/><path d="M12 3a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4z"/></svg></div>
    <div class="produk-meta">
      <div class="produk-name">Kuih Talam</div>
      <div class="produk-status-txt ps-avail" id="s1">● Tersedia</div>
    </div>
    <div class="produk-actions">
      <label class="p-switch"><input type="checkbox" checked onchange="toggleProduk(this,'s1')"><span class="p-slider"></span></label>
      <div class="edit-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
    </div>
  </div>

  <div class="produk-row">
    <div class="produk-thumb"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="14" width="20" height="7" rx="2"/><rect x="4" y="9" width="16" height="5"/><rect x="6" y="5" width="12" height="4"/></svg></div>
    <div class="produk-meta">
      <div class="produk-name">Kuih Koci</div>
      <div class="produk-status-txt ps-unavail" id="s2">● Tidak Tersedia</div>
    </div>
    <div class="produk-actions">
      <label class="p-switch"><input type="checkbox" onchange="toggleProduk(this,'s2')"><span class="p-slider"></span></label>
      <div class="edit-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
    </div>
  </div>

  <div class="produk-row">
    <div class="produk-thumb"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3C10 3 8 5 8 7h8c0-2-2-4-4-4z"/><line x1="9" y1="7" x2="9" y2="11"/><line x1="12" y1="7" x2="12" y2="11"/><line x1="15" y1="7" x2="15" y2="11"/><rect x="3" y="11" width="18" height="10" rx="2"/></svg></div>
    <div class="produk-meta">
      <div class="produk-name">Kuih Karipap</div>
      <div class="produk-status-txt ps-avail" id="s3">● Tersedia</div>
    </div>
    <div class="produk-actions">
      <label class="p-switch"><input type="checkbox" checked onchange="toggleProduk(this,'s3')"><span class="p-slider"></span></label>
      <div class="edit-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
    </div>
  </div>

  <div class="produk-row">
    <div class="produk-thumb"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/></svg></div>
    <div class="produk-meta">
      <div class="produk-name">Kuih Seri Muka</div>
      <div class="produk-status-txt ps-avail" id="s4">● Tersedia</div>
    </div>
    <div class="produk-actions">
      <label class="p-switch"><input type="checkbox" checked onchange="toggleProduk(this,'s4')"><span class="p-slider"></span></label>
      <div class="edit-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></div>
    </div>
  </div>

</div>
</div>

<!-- SIDEBAR PROFIL — ikut /home, "Kembali ke Halaman Utama" ganti "Dashboard Penjual" -->
<div class="sidebar-backdrop" id="dashSidebarBackdrop" style="display:none;" onclick="dashCloseSidebar()" aria-hidden="true"></div>
<aside class="profile-sidebar" id="dashSidebar" aria-hidden="true">
  <header class="profile-sidebar-header">
    <button type="button" class="sidebar-close" onclick="dashCloseSidebar()" aria-label="Tutup menu">X</button>
    <div class="sidebar-profile">
      <div class="sidebar-avatar" id="dashSidebarAvatar">L</div>
      <div class="sidebar-profile-text">
        <p class="sidebar-name" id="dashSidebarName">LokalGo</p>
        <p class="sidebar-email" id="dashSidebarEmail">&nbsp;</p>
      </div>
    </div>
  </header>
  <div class="sidebar-body">
    <a href="/home" class="sidebar-link">
      <span class="sidebar-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B1D2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
      <span class="sidebar-label">Kembali ke Halaman Utama</span>
      <span class="sidebar-arrow">&gt;</span>
    </a>
    <a href="/profile/address" class="sidebar-link">
      <span class="sidebar-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B1D2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
      <span class="sidebar-label">Alamat Penghantaran</span>
      <span class="sidebar-arrow">&gt;</span>
    </a>
    <a href="/saved" class="sidebar-link">
      <span class="sidebar-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B1D2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></span>
      <span class="sidebar-label">Kedai Disimpan</span>
      <span class="sidebar-arrow">&gt;</span>
    </a>
    <a href="/testimonials" class="sidebar-link">
      <span class="sidebar-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B1D2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></span>
      <span class="sidebar-label">Testimoni Saya</span>
      <span class="sidebar-arrow">&gt;</span>
    </a>
    <a href="/sokong" class="sidebar-link">
      <span class="sidebar-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B1D2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg></span>
      <span class="sidebar-label">Sokong Pembangun</span>
      <span class="sidebar-arrow">&gt;</span>
    </a>
    <a href="/about" class="sidebar-link">
      <span class="sidebar-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B1D2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg></span>
      <span class="sidebar-label">Tentang LokalGo™</span>
      <span class="sidebar-arrow">&gt;</span>
    </a>
    <a href="/tutorial" class="sidebar-link">
      <span class="sidebar-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B1D2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg></span>
      <span class="sidebar-label">Tutorial</span>
      <span class="sidebar-arrow">&gt;</span>
    </a>
    <button type="button" class="sidebar-lang" onclick="i18n.toggle()">
      <span class="sidebar-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7B1D2E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
      <span class="sidebar-label">Tukar Bahasa</span>
      <span class="sidebar-lang-pill lang-btn-txt">English</span>
    </button>
  </div>
  <div class="sidebar-footer">
    <button type="button" class="logout-btn" onclick="submitSignOut()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      Log Keluar
    </button>
  </div>
</aside>
</div>`

const scripts: string[] = [`function submitSignOut() {
  document.getElementById('signOutForm').submit();
}

function dashOpenSidebar() {
  var sidebar = document.getElementById('dashSidebar');
  var backdrop = document.getElementById('dashSidebarBackdrop');
  if (sidebar) { sidebar.classList.add('open'); sidebar.setAttribute('aria-hidden', 'false'); }
  if (backdrop) { backdrop.style.display = 'block'; }
}

function dashCloseSidebar() {
  var sidebar = document.getElementById('dashSidebar');
  var backdrop = document.getElementById('dashSidebarBackdrop');
  if (sidebar) { sidebar.classList.remove('open'); sidebar.setAttribute('aria-hidden', 'true'); }
  if (backdrop) { backdrop.style.display = 'none'; }
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
}`]
const externalScripts: string[] = []
const externalStylesheets: string[] = ["https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Noto+Naskh+Arabic:wght@400;700&display=swap"]

export default function Page() {
  useEffect(() => {
    let currentSeller: Seller | null = null
    const supabase = createClient()

    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/auth'
        return
      }

      // Header avatar + profil sidebar — ikut gaya /home
      const metadata = (user.user_metadata ?? {}) as Record<string, unknown>
      const displayName =
        (typeof metadata.full_name === 'string' && metadata.full_name.trim()) ? metadata.full_name :
        (typeof metadata.name === 'string' && metadata.name.trim()) ? metadata.name :
        user.email || 'LokalGo'
      const avatarUrl = safeImageUrl(
        typeof metadata.avatar_url === 'string' ? metadata.avatar_url :
        typeof metadata.picture === 'string' ? metadata.picture : null,
      )
      const initial = displayName.trim().charAt(0).toUpperCase() || 'L'
      const avatarHtml = avatarUrl
        ? `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(displayName)}">`
        : escapeHtml(initial)
      setHtml('#dashAvatarBtn', avatarHtml)
      setHtml('#dashSidebarAvatar', avatarHtml)
      setText('#dashSidebarName', displayName)
      setText('#dashSidebarEmail', user.email || '')

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
          .in('status', ['pending', 'approved'])
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
      setText('.stats-grid .stat-card:nth-child(2) .stat-num', currentSeller.wa_click_count ?? 0)
      setText('.stats-grid .stat-card:nth-child(3) .stat-num', sellerTestimonials.length || currentSeller.testimonial_count || 0)
      setText('.stats-grid .stat-card:nth-child(4) .stat-num', `${Math.min(100, Math.round(((currentSeller.view_count ?? 0) + (currentSeller.wa_click_count ?? 0) + (sellerTestimonials.length * 10)) / 5))}%`)
      setHtml('.produk-list', renderDashboardProducts(sellerProducts))

      // Fix "Lihat kedai saya" link to point to this seller's actual shop
      const viewShopLink = document.getElementById('viewShopLink') as HTMLAnchorElement | null
      if (viewShopLink) viewShopLink.href = `/shop?seller=${currentSeller.id}`

      // Bell notification — count unseen approved products + new verified status
      const seenKey = `lk_seen_${currentSeller.id}`
      let seen: { products: string[]; active: boolean } = { products: [], active: false }
      try { seen = JSON.parse(localStorage.getItem(seenKey) || '{}') } catch { /* ignore */ }
      seen.products = seen.products ?? []
      const approvedProducts = sellerProducts.filter((p) => p.status === 'approved')
      const unseenApproved = approvedProducts.filter((p) => !seen.products.includes(p.id))
      const isNewlyActive = currentSeller.status === 'active' && !seen.active
      const notifCount = unseenApproved.length + (isNewlyActive ? 1 : 0)
      const notifBadge = document.getElementById('notifBadge')
      if (notifBadge) {
        notifBadge.textContent = notifCount > 9 ? '9+' : String(notifCount)
        notifBadge.style.display = notifCount > 0 ? 'flex' : 'none'
      }
      // Mark as seen when bell is clicked
      const bellLink = document.querySelector<HTMLAnchorElement>('a[href="/notifikasi"]')
      if (bellLink) {
        bellLink.addEventListener('click', () => {
          if (!currentSeller) return
          localStorage.setItem(seenKey, JSON.stringify({
            products: approvedProducts.map((p) => p.id),
            active: currentSeller.status === 'active',
          }))
        }, { once: true })
      }

      // Product mode toggles — Jual Terus / Terima Pre-Order
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
          try {
            const res = await fetch('/api/seller/product-toggle', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ productId: id, field, value: toggle.checked }),
            })
            if (!res.ok) throw new Error('toggle failed')
          } catch {
            flags[field] = previous
            toggle.checked = previous
            if (label) label.textContent = `● ${productModeLabel(flags)}`
            alert('Tidak dapat kemaskini produk. Cuba lagi.')
          }
        })
      })

      // ── Nota Kedai ─────────────────────────────────────────────
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

      async function saveNota(value: string | null) {
        if (!currentSeller) return
        const previous = { note: currentSeller.custom_note, time: currentSeller.custom_note_updated_at }
        currentSeller.custom_note = value
        currentSeller.custom_note_updated_at = value ? new Date().toISOString() : null
        renderNota()
        closeNotaEditor()
        const { error } = await supabase
          .from('sellers')
          .update({ custom_note: value, custom_note_updated_at: currentSeller.custom_note_updated_at })
          .eq('id', currentSeller.id)
        if (error) {
          currentSeller.custom_note = previous.note
          currentSeller.custom_note_updated_at = previous.time
          renderNota()
          alert('Nota tidak dapat disimpan. Cuba lagi.')
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

      // Live admin message unread count
      fetch('/api/admin-messages')
        .then((r) => r.json())
        .then((payload: { messages?: { is_read: boolean }[] }) => {
          const unread = (payload.messages ?? []).filter((m) => !m.is_read).length
          const badge = document.getElementById('msgBadge')
          if (badge) {
            badge.textContent = String(unread)
            badge.style.display = unread > 0 ? 'flex' : 'none'
          }
        })
        .catch(() => { /* silently ignore if offline */ })

      // Admin broadcast doa text
      fetch('/api/platform-settings')
        .then((r) => r.json())
        .then((payload: { settings?: Record<string, string> }) => {
          const s = payload.settings ?? {}
          const arabic = document.getElementById('doaArabic')
          const trans = document.getElementById('doaTrans')
          if (arabic && s.broadcast_doa) arabic.textContent = s.broadcast_doa
          if (trans && s.broadcast_doa_trans) trans.textContent = s.broadcast_doa_trans
        })
        .catch(() => { /* keep default text */ })
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
