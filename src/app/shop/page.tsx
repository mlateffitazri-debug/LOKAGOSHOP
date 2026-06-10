'use client'

import { useEffect } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'
import { createClient } from '@/lib/supabase/client'
import type { Product, Seller, Testimonial } from '@/types/database'

type SellerWithCoordinates = Seller & Record<string, unknown>
type ProductRow = Product & Record<string, unknown>
type ShopWindow = Window & {
  __renderShopMap?: (sellerLat: number, sellerLng: number, shopName: string, tamanName: string) => void
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatMonth(value: string) {
  return new Intl.DateTimeFormat('ms-MY', { month: 'short', year: 'numeric' }).format(new Date(value))
}

function productStatus(product: Product) {
  if (product.is_preorder) return { className: 's-preorder', label: 'Produk Pra Tempahan' }
  if (product.is_available) return { className: 's-avail', label: 'Produk Tersedia' }
  return { className: 's-unavail', label: 'Produk Tidak Tersedia' }
}

function optionalString(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

function productName(product: ProductRow) {
  return optionalString(product, ['name', 'product_name', 'title']) || product.category || 'Produk'
}

function productUnit(product: ProductRow) {
  const configured = optionalString(product, ['unit', 'unit_label', 'selling_unit'])
  if (configured) return configured

  const descriptionUnit = product.description?.match(/\/\s*([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)?)/)?.[1]
  return descriptionUnit?.trim() || 'unit'
}

function productPrice(product: ProductRow) {
  const raw = product.price ?? product.price_from
  const value = typeof raw === 'number' ? raw : typeof raw === 'string' ? Number(raw) : Number.NaN
  return Number.isFinite(value) && value > 0 ? value : 0
}

function renderProductCards(products: Product[]) {
  if (products.length === 0) {
    return '<div style="background:#fff;border-radius:12px;padding:18px;text-align:center;color:#888;font-size:13px;">Belum ada produk diluluskan.</div>'
  }

  return products.map((product, index) => {
    const row = product as ProductRow
    const status = productStatus(product)
    const name = productName(row)
    const unit = productUnit(row)
    const price = productPrice(row)
    const description = product.description || name
    const image = product.images?.[0]
    const priceHtml = price
      ? `<div class="produk-price-mini">RM${price.toFixed(2)}<span>/${escapeHtml(unit)}</span></div>`
      : '<div class="produk-price-mini muted">Harga ikut pesanan</div>'
    const imageHtml = image
      ? `<img src="${escapeHtml(image)}" alt="" style="width:100%;height:100%;object-fit:cover;">`
      : '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'

    return `<div class="produk-card" data-category="${escapeHtml(product.category)}" onclick="window.location.href='/produk?product=${escapeHtml(product.id)}&seller=${escapeHtml(product.seller_id)}'">
    <div class="produk-img pi${(index % 3) + 1}">${imageHtml}</div>
    <div class="produk-body">
      <div class="produk-info"><div class="produk-name">${escapeHtml(name)}</div>${priceHtml}<div class="produk-desc">${escapeHtml(description)}</div></div>
      <div class="produk-footer"><span class="produk-status ${status.className}">${status.label}</span></div>
    </div>
  </div>`
  }).join('')
}

function renderCategoryTabs(products: Product[]) {
  const categories = Array.from(new Set(products.map((product) => product.category).filter(Boolean)))
  const onclick = `document.querySelectorAll('.cat-filter .cat-tab').forEach(function(t){t.classList.remove('active')});this.classList.add('active');var cat=this.getAttribute('data-cat');document.querySelectorAll('.produk-card').forEach(function(c){c.classList.toggle('cat-hidden',cat!=='Semua'&amp;&amp;c.getAttribute('data-category')!==cat)})`
  return ['Semua', ...categories].map((category, index) => (
    `<button class="cat-tab${index === 0 ? ' active' : ''}" data-cat="${escapeHtml(category)}" onclick="${onclick}">${escapeHtml(category)}</button>`
  )).join('')
}

function renderTestimonials(testimonials: Testimonial[]) {
  if (testimonials.length === 0) {
    return '<div style="background:#EBEBEB;border-radius:12px;padding:14px;color:#888;font-size:12px;text-align:center;">Belum ada testimoni diluluskan.</div>'
  }

  return testimonials.map((testimonial) => `<div class="testi-card">
    <div class="testi-avatar"></div>
    <div style="flex:1;">
      <div class="testi-name">${escapeHtml(testimonial.buyer_name)}</div>
      <div class="testi-loc">${escapeHtml(testimonial.buyer_kawasan || 'Pembeli LokalGo')}</div>
      <div class="testi-text">${escapeHtml(testimonial.content)}</div>
      <div class="testi-date">${formatMonth(testimonial.created_at)}</div>
    </div>
  </div>`).join('')
}

function badgeText(badge: Seller['badge']) {
  if (badge === 'verified_seller') return 'Verified Shop'
  if (badge === 'seller_aktif') return 'Seller Aktif'
  return 'Seller Baharu'
}

function setHtml(selector: string, html: string) {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) element.innerHTML = html
}

function setText(selector: string, text: string | number) {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) element.textContent = String(text)
}

function renderPickupInstruction(value: string | null | undefined) {
  const element = document.querySelector<HTMLElement>('.pickup-instruction-banner')
  const text = document.querySelector<HTMLElement>('.pickup-instruction-text')
  const instruction = value?.trim()

  if (!element || !text) return
  if (!instruction) {
    element.style.display = 'none'
    text.textContent = ''
    return
  }

  element.style.display = 'flex'
  text.textContent = instruction
}

function readCoordinate(seller: SellerWithCoordinates, keys: string[]) {
  for (const key of keys) {
    const value = seller[key]
    const parsed = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN
    if (Number.isFinite(parsed)) return parsed
  }

  return null
}

async function renderSellerMap(seller: SellerWithCoordinates) {
  const sellerLat = readCoordinate(seller, ['lat', 'latitude', 'shop_lat', 'seller_lat'])
  const sellerLng = readCoordinate(seller, ['lng', 'longitude', 'shop_lng', 'shop_longitude', 'seller_lng'])

  if (sellerLat === null || sellerLng === null) return

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const renderer = (window as ShopWindow).__renderShopMap
    if (renderer) {
      renderer(sellerLat, sellerLng, seller.shop_name, seller.taman_name)
      return
    }

    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

const styles = ":root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-green:#25D366;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}\nbody{background:#0a0a0a;min-height:100vh;font-family:\u0027Plus Jakarta Sans\u0027,-apple-system,sans-serif;font-size:14px;color:var(--c-text);}\n.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}\n@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}\n@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}\n.scroll{height:812px;overflow-y:auto;}.scroll::-webkit-scrollbar{display:none;}\n\n/* HEADER */\n.header{background:var(--c-primary);padding:14px 20px 12px;}\n.header-r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;}\n.header-sub{font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:10px;}\n.header-r2{display:flex;gap:8px;align-items:center;}\n.sokong-btn{background:rgba(255,255,255,0.15);border:none;border-radius:20px;padding:6px 12px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;}\n.search-wrap{flex:1;background:rgba(255,255,255,0.92);border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:8px;}\n.search-wrap span{font-size:13px;color:#aaa;}\n.lang-btn{background:rgba(255,255,255,0.15);border:none;border-radius:8px;padding:8px 10px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;}\n\n/* MAP */\n#map{height:170px;width:100%;z-index:1;}\n.leaflet-control-zoom{display:none;}.distance-badge-wrap{height:0;position:relative;z-index:2;display:none;justify-content:center;}.distance-badge-wrap.show{display:flex;}.distance-badge{background:#7B1533;color:#fff;font-size:11px;font-weight:700;border-radius:999px;padding:5px 10px;line-height:1;box-shadow:0 6px 16px rgba(123,21,51,0.28);transform:translateY(-14px);}.pickup-instruction-banner{display:none;align-items:flex-start;gap:8px;background:#FFF8E1;border-top:1px solid #FFE082;border-bottom:1px solid #FFE082;padding:10px 20px;color:#856404;}.pickup-instruction-banner svg{flex-shrink:0;margin-top:1px;}.pickup-instruction-label{font-size:11px;font-weight:800;margin-bottom:2px;}.pickup-instruction-text{font-size:12px;line-height:1.5;}\n\n/* SHOP INFO */\n.shop-info{background:#fff;padding:14px 20px 12px;border-bottom:1px solid #eee;}\n.shop-name-row{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:4px;}\n.shop-name{font-size:22px;font-weight:800;color:var(--c-text);letter-spacing:-0.3px;}\n.action-btns{display:flex;gap:8px;}\n.act-btn{width:32px;height:32px;border-radius:50%;background:#f5f5f5;border:1px solid #eee;display:flex;align-items:center;justify-content:center;cursor:pointer;}\n.verified-row{display:flex;align-items:center;gap:5px;margin-bottom:4px;}\n.verified-txt{font-size:13px;font-weight:700;color:var(--c-accent);}\n.shop-loc-row{font-size:12px;color:var(--c-text3);display:flex;align-items:center;gap:3px;margin-bottom:10px;}\n.shop-desc{font-size:13px;color:var(--c-text2);line-height:1.6;}\n\n/* STATS */\n.stats{background:#fff;display:flex;border-top:1px solid #eee;border-bottom:1px solid #eee;margin-top:1px;}\n.stat{flex:1;padding:12px 0;text-align:center;}\n.stat+.stat{border-left:1px solid #eee;}\n.stars-row{display:flex;justify-content:center;gap:2px;margin-bottom:2px;}\n.stat-num{font-size:18px;font-weight:800;color:var(--c-text);}\n.stat-lbl{font-size:10px;color:var(--c-hint);margin-top:2px;}\n\n/* PRODUK */\n.produk-head{padding:14px 20px 0;display:flex;align-items:center;justify-content:space-between;}\n.produk-title{font-size:15px;font-weight:700;color:var(--c-text);}\n.cat-filter{padding:10px 20px;display:flex;gap:8px;overflow-x:auto;}\n.cat-filter::-webkit-scrollbar{display:none;}\n.cat-tab{padding:5px 14px;border-radius:20px;border:1.5px solid #ddd;font-size:12px;color:#666;background:#fff;white-space:nowrap;font-weight:500;cursor:pointer;font-family:inherit;flex-shrink:0;transition:all 0.15s;}\n.cat-tab.active{background:var(--c-primary);border-color:var(--c-primary);color:#fff;}\n.produk-list{padding:0 20px;display:flex;flex-direction:column;gap:10px;padding-bottom:12px;}\n.produk-card{background:var(--c-primary);border-radius:12px;overflow:hidden;display:flex;height:88px;cursor:pointer;}\n.produk-img{width:80px;height:88px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}\n.pi1{background:rgba(0,0,0,0.2);}\n.pi2{background:rgba(0,0,0,0.28);}\n.pi3{background:rgba(0,0,0,0.15);}\n.produk-body{flex:1;display:flex;flex-direction:column;justify-content:space-between;min-width:0;}\n.produk-info{padding:10px 12px 0 12px;}\n.produk-name{font-size:14px;font-weight:700;color:#fff;margin-bottom:3px;font-family:\u0027Plus Jakarta Sans\u0027,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}\n.produk-desc{font-size:11px;color:rgba(255,255,255,0.65);line-height:1.5;font-family:\u0027Plus Jakarta Sans\u0027,sans-serif;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}\n.produk-footer{display:flex;justify-content:flex-end;align-items:center;padding:0 12px 10px 12px;}\n.produk-status{font-size:11px;font-weight:600;font-family:\u0027Plus Jakarta Sans\u0027,sans-serif;padding:3px 10px;border-radius:20px;}\n.s-avail{color:var(--c-accent);background:rgba(173,208,54,0.15);}\n.s-unavail{color:rgba(255,255,255,0.5);background:rgba(255,255,255,0.08);}\n.s-preorder{color:#F0C040;background:rgba(240,192,64,0.15);}\n\n/* TESTIMONI DROPDOWN */\n.testi-section{margin:0 0 28px;}\n.testi-toggle{display:flex;align-items:center;justify-content:space-between;padding:14px 20px;cursor:pointer;background:#fff;border-top:1px solid #eee;border-bottom:1px solid #eee;user-select:none;}\n.testi-toggle-title{font-size:15px;font-weight:700;color:var(--c-text);}\n.testi-toggle-right{display:flex;align-items:center;gap:8px;}\n.testi-count{font-size:12px;color:var(--c-hint);font-weight:500;}\n.testi-chevron{transition:transform 0.25s ease;}\n.testi-chevron.open{transform:rotate(180deg);}\n.testi-body{overflow:hidden;max-height:0;transition:max-height 0.35s ease;}\n.testi-body.open{max-height:600px;}\n.testi-inner{padding:10px 20px 16px;display:flex;flex-direction:column;gap:8px;}\n.testi-card{background:#EBEBEB;border-radius:12px;padding:12px;display:flex;gap:10px;align-items:flex-start;}\n.testi-avatar{width:36px;height:36px;border-radius:8px;background:var(--c-primary);flex-shrink:0;}\n.testi-name{font-size:13px;font-weight:700;color:var(--c-text);}\n.testi-loc{font-size:11px;color:var(--c-text3);display:flex;align-items:center;gap:3px;margin-top:1px;}\n.testi-text{font-size:12px;color:var(--c-text2);margin-top:5px;line-height:1.6;}\n.testi-date{font-size:10px;color:var(--c-hint);margin-top:4px;text-align:right;}.back-btn{width:40px;height:40px;min-width:40px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}"
const markup = "\u003cdiv class=\"page\"\u003e\n\u003cdiv class=\"scroll\"\u003e\n\n\u003c!-- HEADER --\u003e\n\u003cdiv class=\"header\"\u003e\n  \u003cdiv class=\"header-r1\"\u003e\n    \u003cbutton class=\"back-btn\" onclick=\"history.length>1?history.back():location.href='/home'\" aria-label=\"Kembali\"\u003e\u003csvg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"15 18 9 12 15 6\"/\u003e\u003c/svg\u003e\u003c/button\u003e\n    \u003csvg viewBox=\"0 0 1080 365\" xmlns=\"http://www.w3.org/2000/svg\" style=\"height:40px;width:auto;\"\u003e\n      \u003cstyle\u003e.s0{fill:#FFF}.s1{fill:#ADD036}\u003c/style\u003e\n      \u003cpath class=\"s0\" d=\"M133,61v175c0,13-11,24-24,24h-4c-13,0-24-11-24-24V61c0-13,11-24,24-24h4C122,37,133,48,133,61z\"/\u003e\n      \u003cpath class=\"s0\" d=\"M180,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11s31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11S193,258,180,251z M249,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C234,218,242,214,249,207z\"/\u003e\n      \u003cpath class=\"s0\" d=\"M411,248l-43-59v49c0,12-9,21-21,21h-7c-13,0-23-10-23-23V56c0-11,9-19,19-19h15c10,0,17,8,17,17v106l43-57c5-7,13-11,22-11h32c7,0,11,8,6,14l-58,70l54,65c6,7,1,19-9,19h-25C425,259,416,255,411,248z\"/\u003e\n      \u003cpath class=\"s0\" d=\"M470,130c7-13,15-23,27-30c11-7,24-11,38-11c12,0,22,2,31,7s16,11,21,19v-8c0-9,7-16,16-16h20c8,0,15,7,15,15v139c0,7-6,13-13,13h-21c-10,0-17-8-17-17v-6c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-37-11c-11-7-20-17-27-30c-7-13-10-28-10-46C460,158,464,143,470,130z M575,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C586,163,582,153,575,145z\"/\u003e\n      \u003cpath class=\"s1\" d=\"M747,96c9,5,16,11,21,19v-7c0-9,7-17,17-17h19c9,0,16,7,16,16v152c0,15-3,29-9,42c-6,13-15,23-28,30c-13,7-28,11-47,11c-25,0-45-6-60-18c-11-8-18-19-23-31c-3-8,3-17,12-17h21c8,0,14,4,19,10c2,2,4,4,7,6c6,4,13,6,22,6c11,0,19-3,25-9c6-6,10-16,10-29v-24c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-38-11c-11-7-20-17-27-30c-7-13-10-28-10-46c0-17,3-32,10-45c7-13,15-23,27-30c11-7,24-11,38-11C728,89,738,91,747,96z M757,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C768,163,764,153,757,145z\"/\u003e\n      \u003cpath class=\"s1\" d=\"M866,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11c16,0,31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11C894,262,879,258,866,251z M935,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C920,218,928,214,935,207z\"/\u003e\n    \u003c/svg\u003e\n    \u003cbutton class=\"sokong-btn\"\u003e\n      \u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\n      Sokong Pembangun Anda\n    \u003c/button\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"header-sub\"\u003e\u003cspan data-i18n=\"tagline\"\u003ePlatform perniagaan lokal setempat\u003c/span\u003e\u003c/div\u003e\n  \u003cdiv class=\"header-r2\"\u003e\n    \u003cdiv class=\"search-wrap\"\u003e\n      \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#aaa\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"11\" cy=\"11\" r=\"8\"/\u003e\u003cline x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/\u003e\u003c/svg\u003e\n      \u003cspan\u003eCari kedai atau produk\u003c/span\u003e\n    \u003c/div\u003e\n    \u003cbutton class=\"lang-btn\" onclick=\"i18n.toggle()\"\u003e\n      \u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"10\"/\u003e\u003cline x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"/\u003e\u003cpath d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/\u003e\u003c/svg\u003e\n      \u003cspan class=\"lang-btn-txt\"\u003eEnglish\u003c/span\u003e\n    \u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- OSM MAP --\u003e\n\u003cdiv id=\"map\"\u003e\u003c/div\u003e\n\u003cdiv class=\"distance-badge-wrap\"\u003e\u003cspan class=\"distance-badge\"\u003e\u003c/span\u003e\u003c/div\u003e\n\u003cdiv class=\"pickup-instruction-banner\"\u003e\n  \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#856404\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e\n  \u003cdiv\u003e\u003cdiv class=\"pickup-instruction-label\"\u003eArahan Pickup / COD\u003c/div\u003e\u003cdiv class=\"pickup-instruction-text\"\u003e\u003c/div\u003e\u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- SHOP INFO --\u003e\n\u003cdiv class=\"shop-info\"\u003e\n  \u003cdiv class=\"shop-name-row\"\u003e\n    \u003cspan class=\"shop-name\"\u003eResepi Kak Mila\u003c/span\u003e\n    \u003cdiv class=\"action-btns\"\u003e\n      \u003cdiv class=\"act-btn\"\u003e\u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#555\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"18\" cy=\"5\" r=\"3\"/\u003e\u003ccircle cx=\"6\" cy=\"12\" r=\"3\"/\u003e\u003ccircle cx=\"18\" cy=\"19\" r=\"3\"/\u003e\u003cline x1=\"8.59\" y1=\"13.51\" x2=\"15.42\" y2=\"17.49\"/\u003e\u003cline x1=\"15.41\" y1=\"6.51\" x2=\"8.59\" y2=\"10.49\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n      \u003cdiv class=\"act-btn\"\u003e\u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"#e44\" stroke=\"none\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"verified-row\"\u003e\n    \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#ADD036\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"/\u003e\u003cpolyline points=\"22 4 12 14.01 9 11.01\"/\u003e\u003c/svg\u003e\n    \u003cspan class=\"verified-txt\"\u003e\u003cspan data-i18n=\"verified_shop\"\u003eVerified Shop\u003c/span\u003e\u003c/span\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"shop-loc-row\"\u003e\n    \u003csvg width=\"11\" height=\"11\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#888\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e\n    Taman Desa Baiduri\n  \u003c/div\u003e\n  \u003cdiv class=\"shop-desc\"\u003eKuih-kuih tradisional \u0026 kek untuk harijadi. Tempah sehari awal untuk tempahan secara pukal untuk majlis harijadi. Self pickup didepan rumah atau penghantaran COD dikawasan sekitar secara percuma.\u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- STATS --\u003e\n\u003cdiv class=\"stats\"\u003e\n  \u003cdiv class=\"stat\"\u003e\n    \u003cdiv class=\"stars-row\"\u003e\n      \u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"#F0C040\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e\n      \u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"#F0C040\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e\n      \u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"#F0C040\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e\n      \u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"#F0C040\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e\n      \u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"#ddd\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"stat\"\u003e\u003cdiv class=\"stat-num\"\u003e12\u003c/div\u003e\u003cdiv class=\"stat-lbl\"\u003eTestimoni\u003c/div\u003e\u003c/div\u003e\n  \u003cdiv class=\"stat\"\u003e\u003cdiv class=\"stat-num\"\u003e248\u003c/div\u003e\u003cdiv class=\"stat-lbl\"\u003ePaparan\u003c/div\u003e\u003c/div\u003e\n  \u003cdiv class=\"stat\"\u003e\u003cdiv class=\"stat-num\"\u003e39\u003c/div\u003e\u003cdiv class=\"stat-lbl\"\u003ePesanan\u003c/div\u003e\u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- PRODUK --\u003e\n\u003cdiv class=\"produk-head\"\u003e\u003cspan class=\"produk-title\"\u003eProduk kami\u003c/span\u003e\u003c/div\u003e\n\u003cdiv class=\"cat-filter\"\u003e\n  \u003cbutton class=\"cat-tab active\" onclick=\"filterTab(this)\"\u003eSemua\u003c/button\u003e\n  \u003cbutton class=\"cat-tab\" onclick=\"filterTab(this)\"\u003eKuih\u003c/button\u003e\n  \u003cbutton class=\"cat-tab\" onclick=\"filterTab(this)\"\u003ePastry\u003c/button\u003e\n  \u003cbutton class=\"cat-tab\" onclick=\"filterTab(this)\"\u003eCake\u003c/button\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"produk-list\"\u003e\n  \u003cdiv class=\"produk-card\"\u003e\n    \u003cdiv class=\"produk-img pi1\"\u003e\u003csvg width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.22)\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M3 11h18v2a9 9 0 0 1-18 0v-2z\"/\u003e\u003cpath d=\"M12 3a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"produk-body\"\u003e\n      \u003cdiv class=\"produk-info\"\u003e\u003cdiv class=\"produk-name\"\u003eKuih Talam\u003c/div\u003e\u003cdiv class=\"produk-desc\"\u003eKuih talam pineapple, kuih serimuka dan pelbagai lagi.\u003c/div\u003e\u003c/div\u003e\n      \u003cdiv class=\"produk-footer\"\u003e\u003cspan class=\"produk-status s-avail\"\u003e\u003cspan data-i18n=\"tersedia\"\u003eProduk Tersedia\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"produk-card\"\u003e\n    \u003cdiv class=\"produk-img pi2\"\u003e\u003csvg width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.22)\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003crect x=\"2\" y=\"14\" width=\"20\" height=\"7\" rx=\"2\"/\u003e\u003crect x=\"4\" y=\"9\" width=\"16\" height=\"5\"/\u003e\u003crect x=\"6\" y=\"5\" width=\"12\" height=\"4\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"produk-body\"\u003e\n      \u003cdiv class=\"produk-info\"\u003e\u003cdiv class=\"produk-name\"\u003eKek Lapis\u003c/div\u003e\u003cdiv class=\"produk-desc\"\u003eKuih talam pineapple, kuih serimuka dan pelbagai lagi.\u003c/div\u003e\u003c/div\u003e\n      \u003cdiv class=\"produk-footer\"\u003e\u003cspan class=\"produk-status s-unavail\"\u003e\u003cspan data-i18n=\"tidak_tersedia\"\u003eProduk Tidak Tersedia\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"produk-card\"\u003e\n    \u003cdiv class=\"produk-img pi3\"\u003e\u003csvg width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.22)\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M12 3C10 3 8 5 8 7h8c0-2-2-4-4-4z\"/\u003e\u003cline x1=\"9\" y1=\"7\" x2=\"9\" y2=\"11\"/\u003e\u003cline x1=\"12\" y1=\"7\" x2=\"12\" y2=\"11\"/\u003e\u003cline x1=\"15\" y1=\"7\" x2=\"15\" y2=\"11\"/\u003e\u003crect x=\"3\" y=\"11\" width=\"18\" height=\"10\" rx=\"2\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"produk-body\"\u003e\n      \u003cdiv class=\"produk-info\"\u003e\u003cdiv class=\"produk-name\"\u003eKek Harijadi\u003c/div\u003e\u003cdiv class=\"produk-desc\"\u003eKuih talam pineapple, kuih serimuka dan pelbagai lagi.\u003c/div\u003e\u003c/div\u003e\n      \u003cdiv class=\"produk-footer\"\u003e\u003cspan class=\"produk-status s-preorder\"\u003e\u003cspan data-i18n=\"pra_tempahan\"\u003eProduk Pra Tempahan\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"produk-card\"\u003e\n    \u003cdiv class=\"produk-img pi2\"\u003e\u003csvg width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.22)\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003crect x=\"2\" y=\"14\" width=\"20\" height=\"7\" rx=\"2\"/\u003e\u003crect x=\"4\" y=\"9\" width=\"16\" height=\"5\"/\u003e\u003crect x=\"6\" y=\"5\" width=\"12\" height=\"4\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"produk-body\"\u003e\n      \u003cdiv class=\"produk-info\"\u003e\u003cdiv class=\"produk-name\"\u003eKek Lapis\u003c/div\u003e\u003cdiv class=\"produk-desc\"\u003eKuih talam pineapple, kuih serimuka dan pelbagai lagi.\u003c/div\u003e\u003c/div\u003e\n      \u003cdiv class=\"produk-footer\"\u003e\u003cspan class=\"produk-status s-unavail\"\u003e\u003cspan data-i18n=\"tidak_tersedia\"\u003eProduk Tidak Tersedia\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"produk-card\"\u003e\n    \u003cdiv class=\"produk-img pi1\"\u003e\u003csvg width=\"36\" height=\"36\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.22)\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M12 3C10 3 8 5 8 7h8c0-2-2-4-4-4z\"/\u003e\u003cline x1=\"9\" y1=\"7\" x2=\"9\" y2=\"11\"/\u003e\u003cline x1=\"12\" y1=\"7\" x2=\"12\" y2=\"11\"/\u003e\u003cline x1=\"15\" y1=\"7\" x2=\"15\" y2=\"11\"/\u003e\u003crect x=\"3\" y=\"11\" width=\"18\" height=\"10\" rx=\"2\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"produk-body\"\u003e\n      \u003cdiv class=\"produk-info\"\u003e\u003cdiv class=\"produk-name\"\u003eKek Harijadi\u003c/div\u003e\u003cdiv class=\"produk-desc\"\u003eKuih talam pineapple, kuih serimuka dan pelbagai lagi.\u003c/div\u003e\u003c/div\u003e\n      \u003cdiv class=\"produk-footer\"\u003e\u003cspan class=\"produk-status s-preorder\"\u003e\u003cspan data-i18n=\"pra_tempahan\"\u003eProduk Pra Tempahan\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- TESTIMONI DROPDOWN --\u003e\n\u003cdiv class=\"testi-section\"\u003e\n  \u003cdiv class=\"testi-toggle\" onclick=\"toggleTesti(this)\"\u003e\n    \u003cspan class=\"testi-toggle-title\"\u003e\u003cspan data-i18n=\"testi_reviu\"\u003eTestimoni / Reviu\u003c/span\u003e\u003c/span\u003e\n    \u003cdiv class=\"testi-toggle-right\"\u003e\n      \u003cspan class=\"testi-count\"\u003e12 ulasan\u003c/span\u003e\n      \u003csvg class=\"testi-chevron\" width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#888\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"6 9 12 15 18 9\"/\u003e\u003c/svg\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"testi-body\"\u003e\n    \u003cdiv class=\"testi-inner\"\u003e\n      \u003cdiv class=\"testi-card\"\u003e\n        \u003cdiv class=\"testi-avatar\"\u003e\u003c/div\u003e\n        \u003cdiv style=\"flex:1;\"\u003e\n          \u003cdiv class=\"testi-name\"\u003eKak Ros\u003c/div\u003e\n          \u003cdiv class=\"testi-loc\"\u003e\u003csvg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#aaa\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e Taman Sri Muda\u003c/div\u003e\n          \u003cdiv class=\"testi-text\"\u003eKuih lapis dia lembut sangat, anak-anak suka. Selalu order tiap minggu!\u003c/div\u003e\n          \u003cdiv class=\"testi-date\"\u003eJun 2026\u003c/div\u003e\n        \u003c/div\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"testi-card\"\u003e\n        \u003cdiv class=\"testi-avatar\"\u003e\u003c/div\u003e\n        \u003cdiv style=\"flex:1;\"\u003e\n          \u003cdiv class=\"testi-name\"\u003eAbang Faris\u003c/div\u003e\n          \u003cdiv class=\"testi-loc\"\u003e\u003csvg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#aaa\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e Taman Subang Maju\u003c/div\u003e\n          \u003cdiv class=\"testi-text\"\u003eRendang dia sedap, rasa macam masakan rumah. COD pun mudah je.\u003c/div\u003e\n          \u003cdiv class=\"testi-date\"\u003eMei 2026\u003c/div\u003e\n        \u003c/div\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"testi-card\"\u003e\n        \u003cdiv class=\"testi-avatar\"\u003e\u003c/div\u003e\n        \u003cdiv style=\"flex:1;\"\u003e\n          \u003cdiv class=\"testi-name\"\u003eNora Z.\u003c/div\u003e\n          \u003cdiv class=\"testi-loc\"\u003e\u003csvg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#aaa\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e Taman Sri Muda\u003c/div\u003e\n          \u003cdiv class=\"testi-text\"\u003eOnde-onde dia berisi penuh, tak kedekut. Harga pun berpatutan!\u003c/div\u003e\n          \u003cdiv class=\"testi-date\"\u003eMei 2026\u003c/div\u003e\n        \u003c/div\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c/div\u003e\n\u003c/div\u003e"
const scripts: string[] = [`
var __shopMap = null;
var __shopMapLayers = [];

function clearShopMapLayers() {
  __shopMapLayers.forEach(function(layer) {
    if (__shopMap) __shopMap.removeLayer(layer);
  });
  __shopMapLayers = [];
}

function createSellerIcon() {
  return L.divIcon({
    className: '',
    html: '<svg width="30" height="38" viewBox="0 0 30 38"><path d="M15 0C6.72 0 0 6.72 0 15c0 11.25 15 23 15 23S30 26.25 30 15C30 6.72 23.28 0 15 0z" fill="#7B1533"/><circle cx="15" cy="15" r="7" fill="#fff"/><circle cx="15" cy="15" r="3" fill="#7B1533"/></svg>',
    iconSize: [30, 38],
    iconAnchor: [15, 38]
  });
}

function createBuyerIcon() {
  return L.divIcon({
    className: '',
    html: '<div style="width:14px;height:14px;border-radius:50%;background:#1877F2;border:2px solid #fff;box-shadow:0 1px 6px rgba(24,119,242,0.45);"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
}

function haversineMeters(from, to) {
  var radius = 6371000;
  var lat1 = from[0] * Math.PI / 180;
  var lat2 = to[0] * Math.PI / 180;
  var deltaLat = (to[0] - from[0]) * Math.PI / 180;
  var deltaLng = (to[1] - from[1]) * Math.PI / 180;
  var a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
    + Math.cos(lat1) * Math.cos(lat2)
    * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
}

function formatDistance(meters) {
  return meters < 1000
    ? Math.round(meters) + 'm dari anda'
    : (meters / 1000).toFixed(1) + 'km dari anda';
}

function setDistanceBadge(meters) {
  var wrap = document.querySelector('.distance-badge-wrap');
  var badge = document.querySelector('.distance-badge');
  if (!wrap || !badge) return;
  badge.textContent = '\uD83D\uDCCD ' + formatDistance(meters);
  wrap.classList.add('show');
}

function hideDistanceBadge() {
  var wrap = document.querySelector('.distance-badge-wrap');
  if (wrap) wrap.classList.remove('show');
}

window.__renderShopMap = function(sellerLat, sellerLng, shopName, tamanName) {
  var sellerPosition = [sellerLat, sellerLng];
  var mapElement = document.getElementById('map');
  if (!mapElement || typeof L === 'undefined') return;

  if (!__shopMap) {
    __shopMap = L.map('map', {
      center: sellerPosition,
      zoom: 16,
      zoomControl: false,
      scrollWheelZoom: false,
      dragging: false,
      touchZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(__shopMap);
  }

  clearShopMapLayers();
  hideDistanceBadge();

  var sellerMarker = L.marker(sellerPosition, { icon: createSellerIcon() })
    .addTo(__shopMap)
    .bindPopup('<b>' + shopName + '</b><br>' + tamanName);
  __shopMapLayers.push(sellerMarker);
  __shopMap.setView(sellerPosition, 16);

  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(function(position) {
    var buyerPosition = [position.coords.latitude, position.coords.longitude];
    var buyerMarker = L.marker(buyerPosition, { icon: createBuyerIcon() }).addTo(__shopMap);
    var line = L.polyline([buyerPosition, sellerPosition], {
      color: '#7B1533',
      opacity: 0.5,
      dashArray: '6,6',
      weight: 3
    }).addTo(__shopMap);

    __shopMapLayers.push(buyerMarker, line);
    __shopMap.fitBounds(L.latLngBounds([buyerPosition, sellerPosition]), { padding: [30, 30] });
    setDistanceBadge(haversineMeters(buyerPosition, sellerPosition));
  }, function() {
    __shopMap.setView(sellerPosition, 16);
  }, {
    enableHighAccuracy: false,
    maximumAge: 60000,
    timeout: 8000
  });
};

function toggleTesti(header) {
  var body = header.nextElementSibling;
  var chevron = header.querySelector('.testi-chevron');
  body.classList.toggle('open');
  chevron.classList.toggle('open');
}

`]
const externalScripts: string[] = ["https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"]
const externalStylesheets: string[] = ["https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"]
const uxStyles = `
.produk-price-mini{font-size:13px;font-weight:800;color:#fff;margin-bottom:3px;line-height:1.2}
.produk-price-mini span{font-size:11px;font-weight:700;color:rgba(255,255,255,0.78)}
.produk-price-mini.muted{font-size:12px;color:rgba(255,255,255,0.72)}
.cat-hidden{display:none!important}
`

export default function Page() {
  useEffect(() => {
    let cancelled = false

    async function loadShop() {
      const params = new URLSearchParams(window.location.search)
      const sellerId = params.get('seller') || params.get('shop') || params.get('id')

      if (!sellerId) {
        setText('.shop-name', 'Kedai tidak ditemui')
        setHtml('.produk-list', '<div style="background:#fff;border-radius:12px;padding:18px;text-align:center;color:#888;font-size:13px;">Sila buka kedai dari halaman utama.</div>')
        return
      }

      const supabase = createClient()

      // Auth guard — redirect to /auth if not logged in
      const { data: { user: shopUser } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!shopUser) {
        window.location.href = '/auth'
        return
      }

      const { data: seller, error: sellerError } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', sellerId)
        .eq('status', 'active')
        .single()

      if (cancelled) return

      if (sellerError || !seller) {
        setText('.shop-name', 'Kedai tidak ditemui')
        setHtml('.produk-list', '<div style="background:#fff;border-radius:12px;padding:18px;text-align:center;color:#888;font-size:13px;">Kedai ini belum aktif atau tidak wujud.</div>')
        return
      }

      await supabase
        .from('sellers')
        .update({ view_count: (seller.view_count ?? 0) + 1 })
        .eq('id', seller.id)

      const [{ data: products }, { data: testimonials }, { data: buyerData }] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .eq('seller_id', seller.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false }),
        supabase
          .from('testimonials')
          .select('*')
          .eq('seller_id', seller.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('buyers')
          .select('id')
          .eq('user_id', shopUser.id)
          .maybeSingle(),
      ])

      if (cancelled) return

      const sellerProducts = (products ?? []) as Product[]
      const sellerTestimonials = (testimonials ?? []) as Testimonial[]

      setText('.shop-name', seller.shop_name)
      setText('.verified-txt', badgeText(seller.badge))
      setHtml('.shop-loc-row', `${escapeHtml(seller.taman_name)}${seller.kawasan ? `, ${escapeHtml(seller.kawasan)}` : ''}`)
      setText('.shop-desc', seller.kawasan ? `Kedai lokal di ${seller.kawasan}. Hubungi penjual melalui WhatsApp untuk maklumat lanjut.` : 'Kedai lokal di kawasan anda. Hubungi penjual melalui WhatsApp untuk maklumat lanjut.')
      setText('.stats .stat:nth-child(2) .stat-num', sellerTestimonials.length || seller.testimonial_count || 0)
      setText('.stats .stat:nth-child(3) .stat-num', (seller.view_count ?? 0) + 1)
      setText('.stats .stat:nth-child(4) .stat-num', seller.wa_click_count ?? 0)
      setHtml('.cat-filter', renderCategoryTabs(sellerProducts))
      setHtml('.produk-list', renderProductCards(sellerProducts))

      setText('.testi-count', `${sellerTestimonials.length} ulasan`)
      setHtml('.testi-inner', renderTestimonials(sellerTestimonials))
      renderPickupInstruction(seller.pickup_instruction)
      void renderSellerMap(seller as SellerWithCoordinates)

      // ── Share & Heart buttons ──────────────────────────────────────
      const buyerIdForSave = (buyerData as { id: string } | null)?.id ?? null

      // Check if this shop is already saved
      let isSaved = false
      if (buyerIdForSave) {
        const { data: savedRow } = await supabase
          .from('saved_shops')
          .select('id')
          .eq('buyer_id', buyerIdForSave)
          .eq('shop_id', seller.id)
          .maybeSingle()
        isSaved = !!savedRow
      }

      if (cancelled) return

      const actionBtns = document.querySelectorAll<HTMLElement>('.act-btn')
      const shareBtn = actionBtns[0]
      const heartBtn = actionBtns[1]

      const heartFilled = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#e44" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'
      const heartEmpty = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>'

      function updateHeart(saved: boolean) {
        if (heartBtn) heartBtn.innerHTML = saved ? heartFilled : heartEmpty
      }
      updateHeart(isSaved)

      function showShopToast(msg: string) {
        document.querySelector('.shop-toast')?.remove()
        const el = document.createElement('div')
        el.className = 'shop-toast'
        el.textContent = msg
        el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.82);color:#fff;padding:10px 22px;border-radius:20px;font-size:13px;font-weight:600;z-index:9999;white-space:nowrap;pointer-events:none;'
        document.body.appendChild(el)
        setTimeout(() => el.remove(), 2500)
      }

      if (shareBtn) {
        shareBtn.style.cursor = 'pointer'
        shareBtn.onclick = async () => {
          const url = `${window.location.origin}/shop?seller=${seller.id}`
          if (navigator.share) {
            try { await navigator.share({ title: seller.shop_name, text: 'Tengok kedai ini di LokalGo™!', url }) } catch { /* dismissed */ }
          } else {
            try { await navigator.clipboard.writeText(url); showShopToast('Pautan disalin!') } catch { showShopToast('Gagal salin pautan') }
          }
        }
      }

      if (heartBtn) {
        heartBtn.style.cursor = 'pointer'
        heartBtn.onclick = async () => {
          if (!buyerIdForSave) { window.location.href = '/auth'; return }
          isSaved = !isSaved
          updateHeart(isSaved)
          if (isSaved) {
            await supabase.from('saved_shops').upsert(
              { buyer_id: buyerIdForSave, shop_id: seller.id },
              { onConflict: 'buyer_id,shop_id' }
            )
          } else {
            await supabase.from('saved_shops').delete()
              .eq('buyer_id', buyerIdForSave).eq('shop_id', seller.id)
          }
        }
      }
    }

    // Sokong-btn — coin icon only, no text
    const sokongBtn = document.querySelector<HTMLElement>('.sokong-btn')
    if (sokongBtn) {
      sokongBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#F7C948" stroke="#fff" stroke-width="1.6"/><circle cx="12" cy="12" r="5.6" fill="#FFE082" stroke="#B7791F" stroke-width="1.2"/><path d="M12 8.2v7.6M9.5 10.1h3.7a1.8 1.8 0 0 1 0 3.6H10" stroke="#7B1533" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
      sokongBtn.setAttribute('aria-label', 'Sokong Pembangun')
      sokongBtn.style.cssText = 'width:32px;height:32px;border-radius:50%;padding:0;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;'
      sokongBtn.onclick = () => { window.location.href = '/sokong' }
    }

    loadShop().catch((error) => {
      console.error(error)
      setHtml('.produk-list', '<div style="background:#fff;border-radius:12px;padding:18px;text-align:center;color:#888;font-size:13px;">Data kedai tidak dapat dimuatkan.</div>')
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <HtmlPrototypePage
      styles={`${styles}${uxStyles}`}
      markup={markup}
      scripts={scripts}
      externalScripts={externalScripts}
      externalStylesheets={externalStylesheets}
    />
  )
}
