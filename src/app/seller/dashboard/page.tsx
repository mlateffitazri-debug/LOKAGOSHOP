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
      <div class="produk-status-txt" id="product-status-${index}" data-mode-label="${escapeHtml(product.id)}">● ${productModeLabel(product)}</div>
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

const styles = ":root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-green:#25D366;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}\nbody{background:#0a0a0a;min-height:100vh;font-family:\u0027Plus Jakarta Sans\u0027,-apple-system,sans-serif;font-size:14px;color:var(--c-text);}\n.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}\n@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}\n@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}\n.scroll{height:812px;overflow-y:auto;}.scroll::-webkit-scrollbar{display:none;}\n\n/* HEADER */\n.header{background:var(--c-primary);padding:14px 20px 12px;}\n.header-r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;}\n.header-sub{font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:10px;}\n.header-r2{display:flex;gap:8px;align-items:center;}\n.sokong-btn{background:rgba(255,255,255,0.15);border:none;border-radius:20px;padding:6px 12px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;}.logout-btn{background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.18);border-radius:20px;padding:6px 12px;color:#fff;font-size:11px;font-weight:700;font-family:inherit;cursor:pointer;white-space:nowrap;}\n.search-wrap{flex:1;background:rgba(255,255,255,0.92);border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:8px;}\n.search-wrap span{font-size:13px;color:#aaa;}\n.lang-btn{background:rgba(255,255,255,0.15);border:none;border-radius:8px;padding:8px 10px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;}\n\n/* DASHBOARD TITLE */\n.dash-title{font-size:18px;font-weight:800;color:var(--c-text);text-align:center;padding:16px 20px 0;}\n\n/* SHOP NAME ROW */\n.shop-name-row{padding:12px 20px 0;display:flex;align-items:flex-start;justify-content:space-between;}\n.shop-name{font-size:20px;font-weight:800;color:var(--c-text);letter-spacing:-0.3px;}\n.notif-row{display:flex;gap:8px;}\n.notif-btn{position:relative;width:34px;height:34px;background:#f0f0f0;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;}\n.notif-badge{position:absolute;top:-2px;right:-2px;background:#e44;color:#fff;font-size:9px;font-weight:700;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1.5px solid #fff;}\n.verified-row{padding:4px 16px 0;display:flex;align-items:center;gap:5px;}\n.verified-txt{font-size:13px;font-weight:700;color:var(--c-accent);}\n\n/* STATUS TOGGLE */\n.toggle-card{margin:12px 20px 0;background:var(--c-primary);border-radius:14px;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;}\n.toggle-left{}\n.toggle-title{font-size:13px;font-weight:700;color:#fff;margin-bottom:2px;}\n.toggle-status{font-size:11px;color:rgba(255,255,255,0.75);}\n.toggle-status.open{color:var(--c-accent);}\n.switch{position:relative;width:48px;height:26px;cursor:pointer;}\n.switch input{opacity:0;width:0;height:0;}\n.slider{position:absolute;inset:0;background:#555;border-radius:34px;transition:0.3s;}\n.slider:before{content:\u0027\u0027;position:absolute;width:20px;height:20px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:0.3s;}\ninput:checked+.slider{background:var(--c-accent);}\ninput:checked+.slider:before{transform:translateX(22px);}\n\n/* DOA SECTION */\n.doa-section{margin:12px 20px 0;background:#fff;border-radius:14px;padding:14px 20px;border:1px solid #eee;}\n.doa-arabic{font-family:\u0027Noto Naskh Arabic\u0027,serif;font-size:16px;color:var(--c-text);text-align:right;line-height:1.6;margin-bottom:8px;direction:rtl;}\n.doa-trans{font-size:11px;color:var(--c-text3);line-height:1.6;font-style:italic;}\n\n/* STATS GRID */\n.stats-grid{padding:12px 20px 0;display:grid;grid-template-columns:1fr 1fr;gap:10px;}\n.stat-card{background:var(--c-primary);border-radius:14px;padding:14px;}\n.stat-num{font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;margin-bottom:2px;}\n.stat-lbl{font-size:11px;color:rgba(255,255,255,0.65);margin-bottom:6px;}\n.stat-change{font-size:11px;color:var(--c-accent);font-weight:600;}\n.stat-change.neutral{color:rgba(255,255,255,0.5);}\n\n/* PRODUK LIST */\n.produk-head{padding:14px 20px 8px;display:flex;align-items:center;justify-content:space-between;}\n.produk-title{font-size:14px;font-weight:700;color:var(--c-text);}\n.tambah-btn{background:var(--c-primary);border:none;border-radius:20px;padding:6px 14px;color:#fff;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;display:flex;align-items:center;gap:5px;}\n\n.produk-list{padding:0 20px;display:flex;flex-direction:column;gap:8px;padding-bottom:24px;}\n.produk-row{background:#fff;border-radius:12px;border:1px solid #eee;padding:12px;display:flex;align-items:center;gap:12px;}\n.produk-thumb{width:48px;height:48px;border-radius:10px;background:#f5f5f5;flex-shrink:0;display:flex;align-items:center;justify-content:center;border:1px solid #eee;}\n.produk-meta{flex:1;}\n.produk-name{font-size:13px;font-weight:700;color:var(--c-text);margin-bottom:3px;}\n.produk-status-txt{font-size:11px;font-weight:600;}\n.ps-avail{color:#4A7C10;}\n.ps-unavail{color:#e44;}\n.ps-preorder{color:#856404;}\n.produk-actions{display:flex;align-items:center;gap:8px;}\n\n/* PRODUK TOGGLE SWITCH */\n.p-switch{position:relative;width:44px;height:24px;cursor:pointer;flex-shrink:0;}\n.p-switch input{opacity:0;width:0;height:0;position:absolute;}\n.p-slider{position:absolute;inset:0;background:#ddd;border-radius:34px;transition:0.25s;}\n.p-slider:before{content:\u0027\u0027;position:absolute;width:18px;height:18px;left:3px;bottom:3px;background:#fff;border-radius:50%;transition:0.25s;box-shadow:0 1px 3px rgba(0,0,0,0.2);}\n.p-switch input:checked+.p-slider{background:var(--c-accent);}\n.p-switch input:checked+.p-slider:before{transform:translateX(20px);}\n\n.edit-btn{width:28px;height:28px;border-radius:8px;background:#f5f5f5;border:1px solid #eee;display:flex;align-items:center;justify-content:center;cursor:pointer;}\n.nota-card{background:#fff;border-radius:14px;padding:16px;margin:0 0 16px 0;box-shadow:0 1px 4px rgba(0,0,0,0.06);}\n.nota-head{display:flex;align-items:center;gap:8px;margin-bottom:10px;}\n.nota-title{font-size:14px;font-weight:700;color:#1E1E1E;}\n.nota-text{font-size:13px;color:#3A3A3A;line-height:1.5;word-break:break-word;}\n.nota-time{font-size:10px;color:#999;margin-top:4px;}\n.nota-empty{font-size:12px;color:#999;line-height:1.5;}\n.nota-actions{display:flex;align-items:center;gap:12px;margin-top:10px;}\n.nota-btn-outline{border:1.5px solid #7B1533;color:#7B1533;background:#fff;border-radius:8px;padding:6px 18px;font-size:13px;font-weight:600;cursor:pointer;}\n.nota-btn-fill{border:none;background:#7B1533;color:#fff;border-radius:8px;padding:7px 20px;font-size:13px;font-weight:600;cursor:pointer;}\n.nota-btn-fill:disabled{opacity:0.4;cursor:default;}\n.nota-btn-text{border:none;background:none;color:#C0392B;font-size:13px;font-weight:600;cursor:pointer;padding:6px 4px;}\n.nota-textarea{width:100%;border:1px solid #DDD;border-radius:8px;padding:10px;font-size:13px;font-family:inherit;resize:none;box-sizing:border-box;}\n.nota-counter{font-size:11px;color:#999;text-align:right;margin-top:4px;}"
const markup = "\u003cdiv class=\"page\"\u003e\n\u003cform id=\"signOutForm\" action=\"/auth/signout\" method=\"post\" style=\"display:none;\"\u003e\u003c/form\u003e\n\u003cdiv class=\"scroll\"\u003e\n\n\u003c!-- HEADER --\u003e\n\u003cdiv class=\"header\"\u003e\n  \u003cdiv class=\"header-r1\"\u003e\n    \u003ca href=\"lokalgo_home.html\" title=\"Ke Halaman Utama\" style=\"display:flex;align-items:center;\"\u003e\n    \u003cimg src=\"/icons/Logo-LOKALGO.png\" alt=\"LokalGo\u2122\" style=\"height:40px;width:auto;display:block;\"\u003e\n    \u003c/a\u003e\n    \u003cbutton class=\"sokong-btn\"\u003e\n      \u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\n      Sokong Pembangun Anda\n    \u003c/button\u003e\n    \u003cbutton class=\"logout-btn\" onclick=\"submitSignOut()\"\u003eLog Keluar\u003c/button\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"header-sub\"\u003e\u003cspan data-i18n=\"tagline\"\u003ePlatform perniagaan lokal setempat\u003c/span\u003e\u003c/div\u003e\n  \u003cdiv class=\"header-r2\"\u003e\n    \u003cdiv class=\"search-wrap\"\u003e\n      \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#aaa\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"11\" cy=\"11\" r=\"8\"/\u003e\u003cline x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/\u003e\u003c/svg\u003e\n      \u003cspan\u003eCari kedai atau produk\u003c/span\u003e\n    \u003c/div\u003e\n    \u003cbutton class=\"lang-btn\" onclick=\"i18n.toggle()\"\u003e\n      \u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"10\"/\u003e\u003cline x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"/\u003e\u003cpath d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/\u003e\u003c/svg\u003e\n      \u003cspan class=\"lang-btn-txt\"\u003eEnglish\u003c/span\u003e\n    \u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- DASHBOARD TITLE --\u003e\n\u003cdiv class=\"dash-title\"\u003e\u003cspan data-i18n=\"dashboard\"\u003eDashboard\u003c/span\u003e\u003c/div\u003e\n\n\u003c!-- SHOP NAME --\u003e\n\u003cdiv class=\"shop-name-row\"\u003e\n  \u003cdiv\u003e\n    \u003cdiv class=\"shop-name\"\u003eResepi Kak Mila\u003c/div\u003e\n    \u003ca href=\"lokalgo_shop.html\" style=\"font-size:11px;color:#7B1533;font-weight:600;text-decoration:none;display:flex;align-items:center;gap:3px;margin-top:3px;\"\u003e\n      \u003csvg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7B1533\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"/\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"3\"/\u003e\u003c/svg\u003e\n      Lihat kedai saya\n    \u003c/a\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"notif-row\"\u003e\n    \u003ca href=\"lokalgo_notifikasi.html\" style=\"text-decoration:none;\"\u003e\n      \u003cbutton class=\"notif-btn\" title=\"Notifikasi — views, review, badge\"\u003e\n        \u003csvg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#555\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9\"/\u003e\u003cpath d=\"M13.73 21a2 2 0 0 1-3.46 0\"/\u003e\u003c/svg\u003e\n        \u003cdiv class=\"notif-badge\"\u003e3\u003c/div\u003e\n      \u003c/button\u003e\n    \u003c/a\u003e\n    \u003ca href=\"lokalgo_inbox.html\" style=\"text-decoration:none;\"\u003e\n      \u003cbutton class=\"notif-btn\" title=\"Mesej Admin — warning, flag, announcement\"\u003e\n        \u003csvg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#555\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z\"/\u003e\u003cpolyline points=\"22,6 12,13 2,6\"/\u003e\u003c/svg\u003e\n        \u003cdiv class=\"notif-badge\" style=\"background:#F0A500;\"\u003e1\u003c/div\u003e\n      \u003c/button\u003e\n    \u003c/a\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"verified-row\"\u003e\n  \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#ADD036\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"/\u003e\u003cpolyline points=\"22 4 12 14.01 9 11.01\"/\u003e\u003c/svg\u003e\n  \u003cspan class=\"verified-txt\"\u003e\u003cspan data-i18n=\"verified_shop\"\u003eVerified Shop\u003c/span\u003e\u003c/span\u003e\n\u003c/div\u003e\n\n\u003c!-- STATUS TOGGLE --\u003e\n\u003cdiv class=\"toggle-card\"\u003e\n  \u003cdiv class=\"toggle-left\"\u003e\n    \u003cdiv class=\"toggle-title\"\u003e\u003cspan data-i18n=\"status_kedai\"\u003eStatus Kedai\u003c/span\u003e\u003c/div\u003e\n    \u003cdiv class=\"toggle-status open\" id=\"toggleStatus\"\u003e● Kedai sedang dibuka\u003c/div\u003e\n  \u003c/div\u003e\n  \u003clabel class=\"switch\"\u003e\n    \u003cinput type=\"checkbox\" checked id=\"shopToggle\" onchange=\"toggleShop(this)\"\u003e\n    \u003cspan class=\"slider\"\u003e\u003c/span\u003e\n  \u003c/label\u003e\n\u003c/div\u003e\n\n\u003c!-- DOA --\u003e\n\u003cdiv class=\"doa-section\"\u003e\n  \u003cdiv class=\"doa-arabic\"\u003eاللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا\u003c/div\u003e\n  \u003cdiv style=\"font-size:11px;color:#7B1533;font-style:italic;margin:6px 0 6px;line-height:1.6;\"\u003eAllahumma inni as\u0027aluka \u0027ilman nafi\u0027an, wa rizqan tayyiban, wa \u0027amalan mutaqabbalan.\u003c/div\u003e\n  \u003cdiv class=\"doa-trans\"\u003e\"Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amalan yang diterima.\"\u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- STATS --\u003e\n\u003cdiv class=\"stats-grid\"\u003e\n  \u003cdiv class=\"stat-card\"\u003e\n    \u003cdiv class=\"stat-num\"\u003e248\u003c/div\u003e\n    \u003cdiv class=\"stat-lbl\"\u003ePaparan Hari Ini\u003c/div\u003e\n    \u003cdiv class=\"stat-change\"\u003e↑ +12 dari semalam\u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"stat-card\"\u003e\n    \u003cdiv class=\"stat-num\"\u003e43\u003c/div\u003e\n    \u003cdiv class=\"stat-lbl\"\u003eWA Clicks\u003c/div\u003e\n    \u003cdiv class=\"stat-change\"\u003e↑ +5 dari semalam\u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"stat-card\"\u003e\n    \u003cdiv class=\"stat-num\"\u003e12\u003c/div\u003e\n    \u003cdiv class=\"stat-lbl\"\u003eTestimoni\u003c/div\u003e\n    \u003cdiv class=\"stat-change neutral\"\u003e1 pending\u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"stat-card\"\u003e\n    \u003cdiv class=\"stat-num\"\u003e87%\u003c/div\u003e\n    \u003cdiv class=\"stat-lbl\"\u003eSkor Populariti\u003c/div\u003e\n    \u003cdiv class=\"stat-change\"\u003e↑ Naik minggu ini\u003c/div\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"nota-card\" id=\"notaCard\"\u003e\u003cdiv class=\"nota-head\"\u003e\u003csvg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7B1D2E\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"m3 11 18-5v12L3 14v-3z\"/\u003e\u003cpath d=\"M11.6 16.8a3 3 0 1 1-5.8-1.6\"/\u003e\u003c/svg\u003e\u003cspan class=\"nota-title\"\u003eNota Kedai\u003c/span\u003e\u003c/div\u003e\u003cdiv id=\"notaView\"\u003e\u003cdiv class=\"nota-empty\" id=\"notaEmpty\"\u003eTiada nota. Pelanggan akan nampak nota ini di halaman kedai anda.\u003c/div\u003e\u003cdiv class=\"nota-text\" id=\"notaText\" style=\"display:none;\"\u003e\u003c/div\u003e\u003cdiv class=\"nota-time\" id=\"notaTime\" style=\"display:none;\"\u003e\u003c/div\u003e\u003cdiv class=\"nota-actions\"\u003e\u003cbutton class=\"nota-btn-fill\" id=\"notaAddBtn\"\u003eTambah Nota\u003c/button\u003e\u003cbutton class=\"nota-btn-outline\" id=\"notaEditBtn\" style=\"display:none;\"\u003eEdit\u003c/button\u003e\u003cbutton class=\"nota-btn-text\" id=\"notaDeleteBtn\" style=\"display:none;\"\u003ePadam\u003c/button\u003e\u003c/div\u003e\u003c/div\u003e\u003cdiv id=\"notaEdit\" style=\"display:none;\"\u003e\u003ctextarea class=\"nota-textarea\" id=\"notaInput\" maxlength=\"120\" rows=\"3\" placeholder=\"Cth: Hari ni cuaca hujan, sediakan payung\"\u003e\u003c/textarea\u003e\u003cdiv class=\"nota-counter\"\u003e\u003cspan id=\"notaCount\"\u003e0\u003c/span\u003e/120\u003c/div\u003e\u003cdiv class=\"nota-actions\"\u003e\u003cbutton class=\"nota-btn-fill\" id=\"notaSaveBtn\" disabled\u003eSimpan\u003c/button\u003e\u003cbutton class=\"nota-btn-text\" id=\"notaCancelBtn\" style=\"color:#888;\"\u003eBatal\u003c/button\u003e\u003c/div\u003e\u003c/div\u003e\u003c/div\u003e\n\n\u003c!-- PRODUK --\u003e\n\u003cdiv class=\"produk-head\"\u003e\n  \u003cspan class=\"produk-title\"\u003e\u003cspan data-i18n=\"produk_saya\"\u003eProduk Saya\u003c/span\u003e\u003c/span\u003e\n  \u003cbutton class=\"tambah-btn\"\u003e\n    \u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cline x1=\"12\" y1=\"5\" x2=\"12\" y2=\"19\"/\u003e\u003cline x1=\"5\" y1=\"12\" x2=\"19\" y2=\"12\"/\u003e\u003c/svg\u003e\n    Tambah\n  \u003c/button\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"produk-list\"\u003e\n\n  \u003cdiv class=\"produk-row\"\u003e\n    \u003cdiv class=\"produk-thumb\"\u003e\u003csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7B1533\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M3 11h18v2a9 9 0 0 1-18 0v-2z\"/\u003e\u003cpath d=\"M12 3a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"produk-meta\"\u003e\n      \u003cdiv class=\"produk-name\"\u003eKuih Talam\u003c/div\u003e\n      \u003cdiv class=\"produk-status-txt ps-avail\" id=\"s1\"\u003e● Tersedia\u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"produk-actions\"\u003e\n      \u003clabel class=\"p-switch\"\u003e\u003cinput type=\"checkbox\" checked onchange=\"toggleProduk(this,\u0027s1\u0027)\"\u003e\u003cspan class=\"p-slider\"\u003e\u003c/span\u003e\u003c/label\u003e\n      \u003cdiv class=\"edit-btn\"\u003e\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#555\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"/\u003e\u003cpath d=\"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"produk-row\"\u003e\n    \u003cdiv class=\"produk-thumb\"\u003e\u003csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7B1533\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003crect x=\"2\" y=\"14\" width=\"20\" height=\"7\" rx=\"2\"/\u003e\u003crect x=\"4\" y=\"9\" width=\"16\" height=\"5\"/\u003e\u003crect x=\"6\" y=\"5\" width=\"12\" height=\"4\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"produk-meta\"\u003e\n      \u003cdiv class=\"produk-name\"\u003eKuih Koci\u003c/div\u003e\n      \u003cdiv class=\"produk-status-txt ps-unavail\" id=\"s2\"\u003e● Tidak Tersedia\u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"produk-actions\"\u003e\n      \u003clabel class=\"p-switch\"\u003e\u003cinput type=\"checkbox\" onchange=\"toggleProduk(this,\u0027s2\u0027)\"\u003e\u003cspan class=\"p-slider\"\u003e\u003c/span\u003e\u003c/label\u003e\n      \u003cdiv class=\"edit-btn\"\u003e\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#555\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"/\u003e\u003cpath d=\"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"produk-row\"\u003e\n    \u003cdiv class=\"produk-thumb\"\u003e\u003csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7B1533\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M12 3C10 3 8 5 8 7h8c0-2-2-4-4-4z\"/\u003e\u003cline x1=\"9\" y1=\"7\" x2=\"9\" y2=\"11\"/\u003e\u003cline x1=\"12\" y1=\"7\" x2=\"12\" y2=\"11\"/\u003e\u003cline x1=\"15\" y1=\"7\" x2=\"15\" y2=\"11\"/\u003e\u003crect x=\"3\" y=\"11\" width=\"18\" height=\"10\" rx=\"2\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"produk-meta\"\u003e\n      \u003cdiv class=\"produk-name\"\u003eKuih Karipap\u003c/div\u003e\n      \u003cdiv class=\"produk-status-txt ps-avail\" id=\"s3\"\u003e● Tersedia\u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"produk-actions\"\u003e\n      \u003clabel class=\"p-switch\"\u003e\u003cinput type=\"checkbox\" checked onchange=\"toggleProduk(this,\u0027s3\u0027)\"\u003e\u003cspan class=\"p-slider\"\u003e\u003c/span\u003e\u003c/label\u003e\n      \u003cdiv class=\"edit-btn\"\u003e\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#555\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"/\u003e\u003cpath d=\"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"produk-row\"\u003e\n    \u003cdiv class=\"produk-thumb\"\u003e\u003csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7B1533\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M17 8h1a4 4 0 1 1 0 8h-1\"/\u003e\u003cpath d=\"M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"produk-meta\"\u003e\n      \u003cdiv class=\"produk-name\"\u003eKuih Seri Muka\u003c/div\u003e\n      \u003cdiv class=\"produk-status-txt ps-avail\" id=\"s4\"\u003e● Tersedia\u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"produk-actions\"\u003e\n      \u003clabel class=\"p-switch\"\u003e\u003cinput type=\"checkbox\" checked onchange=\"toggleProduk(this,\u0027s4\u0027)\"\u003e\u003cspan class=\"p-slider\"\u003e\u003c/span\u003e\u003c/label\u003e\n      \u003cdiv class=\"edit-btn\"\u003e\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#555\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7\"/\u003e\u003cpath d=\"M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n\u003c/div\u003e\n\u003c/div\u003e\n\u003c/div\u003e"
const scripts: string[] = ["function submitSignOut() {\n  document.getElementById(\u0027signOutForm\u0027).submit();\n}\n\nfunction toggleShop(cb) {\n  var status = document.getElementById(\u0027toggleStatus\u0027);\n  if (cb.checked) {\n    status.textContent = \u0027● Kedai sedang dibuka\u0027;\n    status.className = \u0027toggle-status open\u0027;\n  } else {\n    status.textContent = \u0027● Kedai ditutup\u0027;\n    status.className = \u0027toggle-status\u0027;\n  }\n}\n\nfunction toggleProduk(cb, statusId) {\n  var el = document.getElementById(statusId);\n  if (cb.checked) {\n    el.textContent = \u0027● Tersedia\u0027;\n    el.className = \u0027produk-status-txt ps-avail\u0027;\n  } else {\n    el.textContent = \u0027● Tidak Tersedia\u0027;\n    el.className = \u0027produk-status-txt ps-unavail\u0027;\n  }\n}"]
const externalScripts: string[] = []
const externalStylesheets: string[] = ["https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800\u0026family=Noto+Naskh+Arabic:wght@400;700\u0026display=swap"]

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

      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (sellerError || !seller) {
        setText('.shop-name', 'Kedai belum didaftarkan')
        setHtml('.produk-list', '<div class="produk-row"><div class="produk-meta"><div class="produk-name">Tiada permohonan seller</div><div class="produk-status-txt ps-unavail">Daftar kedai dahulu melalui onboarding.</div></div></div>')
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
      setText('.stats-grid .stat-card:nth-child(2) .stat-num', currentSeller.wa_click_count ?? 0)
      setText('.stats-grid .stat-card:nth-child(3) .stat-num', sellerTestimonials.length || currentSeller.testimonial_count || 0)
      setText('.stats-grid .stat-card:nth-child(4) .stat-num', `${Math.min(100, Math.round(((currentSeller.view_count ?? 0) + (currentSeller.wa_click_count ?? 0) + (sellerTestimonials.length * 10)) / 5))}%`)
      setHtml('.produk-list', renderDashboardProducts(sellerProducts))

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
          const { error } = await supabase.from('products').update({ [field]: toggle.checked }).eq('id', id)
          if (error) {
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
