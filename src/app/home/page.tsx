'use client'

import { FormEvent, MouseEvent, useEffect, useMemo, useState } from 'react'
import { translations, useLang, type Lang } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import type { Buyer, Seller, Product } from '@/types/database'
import { PRODUCT_CATEGORIES } from '@/types/database'

type HomeProfile = {
  buyerId: string | null
  name: string
  email: string
  kawasan: string
  avatarUrl: string | null
  whatsappNumber: string
}

// SVG icons per category
const CAT_ICONS: Record<string, string> = {
  'Pastri & Kek': `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11h18v2a9 9 0 0 1-18 0v-2z"/><path d="M12 3a4 4 0 0 1 4 4H8a4 4 0 0 1 4-4z"/><line x1="12" y1="3" x2="12" y2="7"/></svg>`,
  'Set Makanan & Lauk': `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><line x1="12" y1="11" x2="12" y2="21"/><line x1="9" y1="16" x2="23" y2="16"/></svg>`,
  'Frozen & Simpanan': `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="22"/><path d="m20 6-8 4-8-4"/><path d="m20 18-8-4-8 4"/><path d="m2 12 10 4 10-4"/></svg>`,
  'Minuman': `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="5"/><line x1="10" y1="2" x2="10" y2="5"/><line x1="14" y1="2" x2="14" y2="5"/></svg>`,
  'Fresh & Semulajadi': `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>`,
  'Snek': `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-3.92-8.84-5.6-17.5-5.6"/></svg>`,
}

const styles = `:root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-green:#25D366;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
body{background:#0a0a0a;min-height:100vh;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:14px;color:var(--c-text);}
.page{position:relative;width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}
@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:100vh;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}
@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}
.scroll{height:812px;overflow-y:auto;}.scroll::-webkit-scrollbar{display:none;}
.header{background:var(--c-primary);padding:14px 20px 12px;}
.header-r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;}
.header-sub{font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:10px;}
.header-r2{display:flex;gap:8px;align-items:center;}
.header-actions{display:flex;align-items:center;gap:10px;}
.coin-btn{width:32px;height:32px;border-radius:50%;border:none;background:rgba(255,255,255,0.16);color:#fff;font-size:16px;font-weight:800;font-family:inherit;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,0.14);flex-shrink:0;}
.home-avatar{width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,255,255,0.7);background:#7B1533;color:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,0.18);flex-shrink:0;}
.home-avatar img{width:100%;height:100%;object-fit:cover;display:block;}
.search-wrap{flex:1;background:rgba(255,255,255,0.92);border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:8px;}
.search-wrap input{border:none;background:transparent;font-size:13px;color:#555;outline:none;width:100%;font-family:inherit;}
.search-wrap input::placeholder{color:#aaa;}
.lang-btn{background:rgba(255,255,255,0.15);border:none;border-radius:8px;padding:8px 10px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;}
.cat-section{background:#fff;padding:14px 20px;border-bottom:1px solid #eee;}
.cat-scroll{display:flex;gap:12px;overflow-x:auto;}.cat-scroll::-webkit-scrollbar{display:none;}
.cat-item{display:flex;flex-direction:column;align-items:center;gap:6px;flex-shrink:0;cursor:pointer;padding:4px;border-radius:10px;transition:background 0.15s;}
.cat-item:active{background:#f5f5f5;}
.cat-box{width:68px;height:68px;background:#fff;border-radius:12px;display:flex;align-items:center;justify-content:center;border:1.5px solid #eee;padding:12px;transition:all 0.15s;}
.cat-item.active .cat-box{background:#fff5f7;border-color:#7B1533;}
.cat-item.active .cat-box svg{stroke:#7B1533;}
.cat-lbl{font-size:10px;color:#555;text-align:center;max-width:70px;line-height:1.3;font-weight:500;}
.cat-item.active .cat-lbl{color:#7B1533;font-weight:700;}
.sec-head{padding:14px 20px 10px;display:flex;justify-content:space-between;align-items:center;}
.sec-head-title{font-size:14px;font-weight:700;color:var(--c-text);}
.sec-head-link{font-size:12px;color:var(--c-primary);font-weight:500;text-decoration:none;display:flex;align-items:center;gap:3px;}
.filter-active-bar{background:#fff5f7;border-bottom:1px solid #f0d0d8;padding:8px 20px;display:flex;align-items:center;justify-content:space-between;}
.filter-active-label{font-size:12px;color:#7B1533;font-weight:600;}
.filter-clear-btn{font-size:11px;color:#888;background:none;border:none;cursor:pointer;font-family:inherit;padding:2px 6px;border-radius:6px;}
.shop-list{padding:0 20px 24px;display:flex;flex-direction:column;gap:12px;}
.shop-card{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.07);}
.img-wrap{position:relative;height:150px;}
.img-bg{position:absolute;inset:0;background-size:cover;background-position:center;}
.img-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.55) 100%);}
.badge-tl{position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.45);color:var(--c-accent);font-size:10px;font-weight:600;padding:4px 10px;border-radius:6px;display:flex;align-items:center;gap:4px;border:1px solid rgba(173,208,54,0.3);}
.badge-tr{position:absolute;top:10px;right:10px;display:flex;gap:6px;}
.icon-btn{width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.shop-footer{background:var(--c-primary);padding:10px 12px 12px;}
.shop-name-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;}
.shop-name{font-size:15px;font-weight:700;color:#fff;}
.shop-loc{font-size:11px;color:rgba(255,255,255,0.7);display:flex;align-items:center;gap:3px;margin-bottom:7px;}
.shop-bottom{display:flex;justify-content:space-between;align-items:flex-end;}
.tags{display:flex;gap:5px;flex-wrap:wrap;}
.tag{font-size:10px;background:rgba(255,255,255,0.15);color:#fff;padding:3px 9px;border-radius:20px;font-weight:500;}
.cod-row{display:flex;align-items:center;gap:4px;margin-top:5px;}
.cod-txt{font-size:10px;color:rgba(255,255,255,0.6);}
.status-open{background:var(--c-accent);color:#fff;font-size:11px;font-weight:700;padding:5px 14px;border-radius:6px;align-self:flex-end;}
.status-closed{background:rgba(255,255,255,0.2);color:rgba(255,255,255,0.85);font-size:11px;font-weight:700;padding:5px 12px;border-radius:6px;align-self:flex-end;}
.img-bg1{background:linear-gradient(160deg,#5a0e24,#3d0918);}
.img-bg2{background:linear-gradient(160deg,#4a0b1e,#2d0712);}
.img-bg3{background:linear-gradient(160deg,#3d0918,#250510);}
.sidebar-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.5);z-index:40;}
.profile-sidebar{position:absolute;top:0;right:0;width:280px;height:100%;background:#fff;z-index:50;transform:translateX(100%);transition:transform 0.3s ease;overflow-y:auto;display:flex;flex-direction:column;font-family:'Plus Jakarta Sans',sans-serif;box-shadow:-18px 0 50px rgba(0,0,0,0.22);}
.profile-sidebar.open{transform:translateX(0);}
.profile-sidebar-header{position:relative;background:#7B1533;padding:20px;color:#fff;}
.sidebar-close{position:absolute;top:16px;right:16px;width:32px;height:32px;border:0;border-radius:50%;background:rgba(255,255,255,0.15);color:#fff;font-size:16px;font-weight:800;line-height:1;cursor:pointer;}
.sidebar-profile{display:flex;align-items:center;gap:12px;padding-right:36px;}
.sidebar-profile-text{min-width:0;flex:1;}
.sidebar-name{font-size:16px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sidebar-email{margin-top:2px;font-size:12px;color:rgba(255,255,255,0.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sidebar-chip{display:inline-flex;max-width:100%;margin-top:8px;border-radius:999px;background:rgba(255,255,255,0.15);padding:4px 10px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sidebar-body{flex:1;background:#fff;}
.sidebar-link,.sidebar-lang{display:flex;width:100%;align-items:center;gap:12px;border:0;border-bottom:1px solid #f5f5f5;background:#fff;padding:14px 20px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#111;text-align:left;text-decoration:none;cursor:pointer;}
.sidebar-icon{width:24px;font-size:16px;line-height:1;}
.sidebar-label{flex:1;font-weight:600;}
.sidebar-arrow{color:#bbb;}
.whatsapp-form{border-bottom:1px solid #f5f5f5;background:#fff;padding:14px 20px;}
.whatsapp-label{display:flex;align-items:center;gap:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:600;color:#111;}
.whatsapp-input{width:100%;margin-top:12px;border:1px solid #E5E5EA;border-radius:12px;background:#FAFAFA;padding:10px 12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#111;outline:none;}
.whatsapp-input:focus{border-color:#7B1533;background:#fff;}
.whatsapp-save{width:100%;margin-top:8px;border:0;border-radius:12px;background:#7B1533;padding:10px 12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:800;color:#fff;cursor:pointer;}
.whatsapp-status{margin-top:8px;font-size:11px;font-weight:700;color:#7B1533;}
.sidebar-lang-pill{border-radius:999px;background:#ADD036;padding:4px 10px;font-size:10px;font-weight:800;color:#3D4D0E;}
.sidebar-footer{background:#fff;padding:16px;}
.logout-btn{width:100%;border:1.5px solid #7B1533;border-radius:12px;background:#fff;padding:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:800;color:#7B1533;cursor:pointer;}
.toast{position:absolute;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.82);color:#fff;padding:10px 22px;border-radius:20px;font-size:13px;font-weight:600;z-index:200;white-space:nowrap;pointer-events:none;animation:toastIn 0.2s ease;}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}`

function copy(key: string, lang: Lang) {
  return translations[key]?.[lang] ?? key
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function firstInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'L'
}

function renderAvatar(profile: HomeProfile | null) {
  if (!profile) return '<span class="home-avatar-initial">L</span>'
  if (profile.avatarUrl) return `<img src="${escapeHtml(profile.avatarUrl)}" alt="${escapeHtml(profile.name)}">`
  return `<span class="home-avatar-initial">${escapeHtml(firstInitial(profile.name))}</span>`
}

function badgeLabel(badge: Seller['badge']) {
  if (badge === 'verified_seller') return 'Verified Shop'
  if (badge === 'seller_aktif') return 'Active Seller'
  return 'New Seller'
}

function renderCatSection(selectedCategory: string | null) {
  const items = PRODUCT_CATEGORIES.map((cat) => {
    const isActive = selectedCategory === cat
    return `
    <div class="cat-item${isActive ? ' active' : ''}" data-cat="${escapeHtml(cat)}">
      <div class="cat-box">${CAT_ICONS[cat] ?? ''}</div>
      <span class="cat-lbl">${escapeHtml(cat)}</span>
    </div>`
  }).join('')

  return `<div class="cat-section"><div class="cat-scroll">${items}</div></div>`
}

function renderFilterBar(selectedCategory: string | null) {
  if (!selectedCategory) return ''
  return `
  <div class="filter-active-bar">
    <span class="filter-active-label">Filter: ${escapeHtml(selectedCategory)}</span>
    <button class="filter-clear-btn" data-clear-filter="1">Papar Semua ×</button>
  </div>`
}

function renderSellerCard(
  seller: Seller,
  index: number,
  lang: Lang,
  savedShopIds: Set<string>,
  sellerCategories: Map<string, string[]>,
) {
  const imageStyle = seller.profile_image_url
    ? ` style="background-image:url('${escapeHtml(seller.profile_image_url)}')"`
    : ''
  const imageClass = seller.profile_image_url ? 'img-bg' : `img-bg img-bg${(index % 3) + 1}`

  const cats = sellerCategories.get(seller.id) ?? []
  const tags = cats.slice(0, 3)
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join('')

  return `
  <div class="shop-card" data-seller-id="${escapeHtml(seller.id)}">
    <div class="img-wrap">
      <div class="${imageClass}"${imageStyle}></div>
      <div class="img-overlay"></div>
      <div class="badge-tl">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#ADD036"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        ${escapeHtml(badgeLabel(seller.badge))}
      </div>
      <div class="badge-tr">
        <div class="icon-btn share-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></div>
        <div class="icon-btn heart-btn"><svg width="13" height="13" viewBox="0 0 24 24" fill="${savedShopIds.has(seller.id) ? '#ff4d4d' : 'none'}" stroke="${savedShopIds.has(seller.id) ? '#ff4d4d' : '#fff'}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div>
      </div>
    </div>
    <div class="shop-footer">
      <div class="shop-name-row">
        <span class="shop-name">${escapeHtml(seller.shop_name)}</span>
        <div class="shop-loc"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${escapeHtml(seller.taman_name || seller.kawasan)}</div>
      </div>
      <div class="shop-bottom">
        <div>
          <div class="tags">${tags}</div>
          <div class="cod-row"><svg width="14" height="11" viewBox="0 0 36 24" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="18" r="4"/><circle cx="28" cy="18" r="4"/><path d="M12 18h12"/><path d="M8 14V8l6-4h6l4 6h-4l-2-4h-3l-4 4H8z"/><path d="M20 10l2 4"/></svg><span class="cod-txt">${copy('cod_available', lang)}</span></div>
        </div>
        <span class="${seller.is_open ? 'status-open' : 'status-closed'}">${seller.is_open ? copy('buka', lang) : copy('tutup', lang)}</span>
      </div>
    </div>
  </div>`
}

function renderShopList(
  lang: Lang,
  sellers: Seller[],
  isLoading: boolean,
  error: string | null,
  savedShopIds: Set<string>,
  sellerCategories: Map<string, string[]>,
  selectedCategory: string | null,
) {
  if (isLoading) {
    return '<div class="shop-card"><div class="shop-footer"><span class="shop-name">Loading sellers...</span></div></div>'
  }
  if (error) {
    return `<div class="shop-card"><div class="shop-footer"><span class="shop-name">${escapeHtml(error)}</span></div></div>`
  }

  const filtered = selectedCategory
    ? sellers.filter((s) => sellerCategories.get(s.id)?.includes(selectedCategory))
    : sellers

  if (filtered.length === 0) {
    const msg = selectedCategory
      ? `Tiada kedai dengan produk "${selectedCategory}" buat masa ini.`
      : 'Tiada penjual aktif buat masa ini.'
    return `<div class="shop-card"><div class="shop-footer"><span class="shop-name">${escapeHtml(msg)}</span></div></div>`
  }

  return filtered
    .map((seller, index) => renderSellerCard(seller, index, lang, savedShopIds, sellerCategories))
    .join('')
}

function renderHomeMarkup(
  lang: Lang,
  sellers: Seller[],
  isLoading: boolean,
  error: string | null,
  profile: HomeProfile | null,
  savedShopIds: Set<string>,
  sellerCategories: Map<string, string[]>,
  selectedCategory: string | null,
) {
  const avatarHtml = profile?.avatarUrl
    ? `<img src="${escapeHtml(profile.avatarUrl)}" alt="${escapeHtml(profile.name)}">`
    : `<span class="home-avatar-initial">${escapeHtml(firstInitial(profile?.name ?? 'LokalGo'))}</span>`

  const langBtnTxt = lang === 'ms' ? 'English' : 'BM'
  const shopListHtml = renderShopList(lang, sellers, isLoading, error, savedShopIds, sellerCategories, selectedCategory)

  return `
<div class="scroll">
<!-- HEADER -->
<div class="header">
  <div class="header-r1">
    <svg viewBox="0 0 1080 365" xmlns="http://www.w3.org/2000/svg" style="height:40px;width:auto;">
      <style>.s0{fill:#FFF}.s1{fill:#ADD036}</style>
      <path class="s0" d="M133,61v175c0,13-11,24-24,24h-4c-13,0-24-11-24-24V61c0-13,11-24,24-24h4C122,37,133,48,133,61z"/>
      <path class="s0" d="M180,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11s31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11S193,258,180,251z M249,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C234,218,242,214,249,207z"/>
      <path class="s0" d="M411,248l-43-59v49c0,12-9,21-21,21h-7c-13,0-23-10-23-23V56c0-11,9-19,19-19h15c10,0,17,8,17,17v106l43-57c5-7,13-11,22-11h32c7,0,11,8,6,14l-58,70l54,65c6,7,1,19-9,19h-25C425,259,416,255,411,248z"/>
      <path class="s0" d="M470,130c7-13,15-23,27-30c11-7,24-11,38-11c12,0,22,2,31,7s16,11,21,19v-8c0-9,7-16,16-16h20c8,0,15,7,15,15v139c0,7-6,13-13,13h-21c-10,0-17-8-17-17v-6c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-37-11c-11-7-20-17-27-30c-7-13-10-28-10-46C460,158,464,143,470,130z M575,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C586,163,582,153,575,145z"/>
      <path class="s1" d="M747,96c9,5,16,11,21,19v-7c0-9,7-17,17-17h19c9,0,16,7,16,16v152c0,15-3,29-9,42c-6,13-15,23-28,30c-13,7-28,11-47,11c-25,0-45-6-60-18c-11-8-18-19-23-31c-3-8,3-17,12-17h21c8,0,14,4,19,10c2,2,4,4,7,6c6,4,13,6,22,6c11,0,19-3,25-9c6-6,10-16,10-29v-24c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-38-11c-11-7-20-17-27-30c-7-13-10-28-10-46c0-17,3-32,10-45c7-13,15-23,27-30c11-7,24-11,38-11C728,89,738,91,747,96z M757,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C768,163,764,153,757,145z"/>
      <path class="s1" d="M866,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11c16,0,31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11C894,262,879,258,866,251z M935,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C920,218,928,214,935,207z"/>
    </svg>
    <div class="header-actions">
      <button class="coin-btn" aria-label="Sokong Pembangun"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#F7C948" stroke="#FFFFFF" stroke-width="1.6"/><circle cx="12" cy="12" r="5.6" fill="#FFE082" stroke="#B7791F" stroke-width="1.2"/><path d="M12 8.2v7.6M9.5 10.1h3.7a1.8 1.8 0 0 1 0 3.6H10" stroke="#7B1533" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
      <button class="home-avatar" aria-label="Buka menu profil">${avatarHtml}</button>
    </div>
  </div>
  <div class="header-sub"><span data-i18n="tagline">${copy('tagline', lang)}</span></div>
  <div class="header-r2">
    <div class="search-wrap">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" placeholder="${copy('search_placeholder', lang)}">
    </div>
    <button class="lang-btn">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      <span class="lang-btn-txt">${langBtnTxt}</span>
    </button>
  </div>
</div>

<!-- CATEGORY FILTER -->
${renderCatSection(selectedCategory)}
${renderFilterBar(selectedCategory)}

<!-- POPULAR -->
<div class="sec-head">
  <span class="sec-head-title">${copy('popular_title', lang)}</span>
  <a class="sec-head-link" href="#">Lihat Semuanya <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></a>
</div>

<div class="shop-list">
${shopListHtml}
</div>
`
}

function AvatarCircle({ profile, size = 60 }: { profile: HomeProfile | null; size?: number }) {
  const dimension = `${size}px`
  return (
    <div
      style={{
        alignItems: 'center',
        background: '#7B1533',
        border: '2px solid rgba(255,255,255,0.45)',
        borderRadius: '50%',
        color: '#fff',
        display: 'flex',
        flexShrink: 0,
        fontSize: size >= 60 ? 24 : 15,
        fontWeight: 800,
        height: dimension,
        justifyContent: 'center',
        overflow: 'hidden',
        width: dimension,
      }}
    >
      {profile?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatarUrl} alt={profile.name} style={{ display: 'block', height: '100%', objectFit: 'cover', width: '100%' }} />
      ) : (
        firstInitial(profile?.name ?? 'LokalGo')
      )}
    </div>
  )
}

function SidebarLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <a href={href} className="sidebar-link">
      <span className="sidebar-icon">{icon}</span>
      <span className="sidebar-label">{label}</span>
      <span className="sidebar-arrow">&gt;</span>
    </a>
  )
}

export default function HomePage() {
  const { lang, toggle } = useLang()
  const [sellers, setSellers] = useState<Seller[]>([])
  const [sellerCategories, setSellerCategories] = useState<Map<string, string[]>>(new Map())
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [profile, setProfile] = useState<HomeProfile | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [whatsappStatus, setWhatsappStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savedShopIds, setSavedShopIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)

  const pageInnerMarkup = useMemo(
    () => renderHomeMarkup(lang, sellers, isLoading, error, profile, savedShopIds, sellerCategories, selectedCategory),
    [error, isLoading, lang, profile, sellers, savedShopIds, sellerCategories, selectedCategory],
  )

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function loadData() {
      setIsLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return
      if (!user) { window.location.href = '/auth'; return }

      const metadata = user.user_metadata ?? {}
      const metadataName = typeof metadata.full_name === 'string' ? metadata.full_name : undefined
      const metadataFallbackName = typeof metadata.name === 'string' ? metadata.name : undefined
      const metadataAvatar = typeof metadata.avatar_url === 'string'
        ? metadata.avatar_url
        : typeof metadata.picture === 'string' ? metadata.picture : null

      const { data: buyerData } = await supabase
        .from('buyers').select('*').eq('user_id', user.id).maybeSingle()
      if (cancelled) return

      const buyer = buyerData as Buyer | null
      const buyerWhatsapp = typeof buyer?.whatsapp_number === 'string' ? buyer.whatsapp_number : ''

      setProfile({
        buyerId: buyer?.id ?? null,
        name: metadataName || metadataFallbackName || user.email || 'LokalGo',
        email: user.email || buyer?.email || '',
        kawasan: buyer?.kawasan || 'Kawasan belum ditetapkan',
        avatarUrl: metadataAvatar,
        whatsappNumber: buyerWhatsapp,
      })
      setWhatsappNumber(buyerWhatsapp)

      if (buyer?.id) {
        const { data: savedData } = await supabase
          .from('saved_shops').select('shop_id').eq('buyer_id', buyer.id)
        if (!cancelled && savedData) {
          setSavedShopIds(new Set(savedData.map((r: { shop_id: string }) => r.shop_id)))
        }
      }

      // Load sellers + products in parallel
      const [sellersRes, productsRes] = await Promise.all([
        supabase
          .from('sellers')
          .select('*')
          .eq('status', 'active')
          .order('is_open', { ascending: false })
          .order('approved_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('products')
          .select('seller_id,category')
          .eq('status', 'approved')
          .eq('is_available', true),
      ])

      if (cancelled) return

      if (sellersRes.error) {
        setError('Unable to load sellers')
        setSellers([])
      } else {
        const loadedSellers = (sellersRes.data ?? []) as Seller[]
        setSellers(loadedSellers)

        // Build map: sellerId → unique sorted categories
        const catMap = new Map<string, string[]>()
        for (const p of (productsRes.data ?? []) as Pick<Product, 'seller_id' | 'category'>[]) {
          if (!p.seller_id || !p.category) continue
          const existing = catMap.get(p.seller_id) ?? []
          if (!existing.includes(p.category)) existing.push(p.category)
          catMap.set(p.seller_id, existing)
        }
        setSellerCategories(catMap)
      }

      setIsLoading(false)
    }

    loadData()
    return () => { cancelled = true }
  }, [])

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  async function handleClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement

    if (target.closest('.lang-btn')) { toggle(); return }
    if (target.closest('.coin-btn')) { window.location.href = '/sokong'; return }
    if (target.closest('.home-avatar')) { setIsSidebarOpen(true); return }

    // Category filter
    const catItem = target.closest<HTMLElement>('.cat-item[data-cat]')
    if (catItem) {
      const cat = catItem.dataset.cat ?? null
      setSelectedCategory((prev) => (prev === cat ? null : cat))
      return
    }

    // Clear filter
    if (target.closest('[data-clear-filter]')) {
      setSelectedCategory(null)
      return
    }

    // Share button
    if (target.closest('.share-btn')) {
      event.stopPropagation()
      const card = target.closest<HTMLElement>('.shop-card')
      const sellerId = card?.dataset.sellerId
      const shopName = card?.querySelector('.shop-name')?.textContent?.trim() || 'Kedai LokaGo'
      const url = `https://lokagoshop-dm2m.vercel.app/shop/${sellerId}`
      if (navigator.share) {
        try { await navigator.share({ title: shopName, text: 'Tengok kedai ini di LokaGo!', url }) } catch { /* dismissed */ }
      } else {
        try { await navigator.clipboard.writeText(url) } catch { /* ignore */ }
        showToast('Pautan disalin!')
      }
      return
    }

    // Heart / Favourite button
    if (target.closest('.heart-btn')) {
      event.stopPropagation()
      if (!profile?.buyerId) { window.location.href = '/auth'; return }
      const card = target.closest<HTMLElement>('.shop-card')
      const sellerId = card?.dataset.sellerId
      if (!sellerId) return
      const supabase = createClient()
      if (savedShopIds.has(sellerId)) {
        await supabase.from('saved_shops').delete().eq('buyer_id', profile.buyerId).eq('shop_id', sellerId)
        setSavedShopIds((prev) => { const next = new Set(prev); next.delete(sellerId); return next })
      } else {
        await supabase.from('saved_shops').insert({ buyer_id: profile.buyerId, shop_id: sellerId })
        setSavedShopIds((prev) => new Set(Array.from(prev).concat(sellerId)))
      }
      return
    }

    const shopCard = target.closest<HTMLElement>('.shop-card')
    if (shopCard?.dataset.sellerId) {
      window.location.href = `/shop?seller=${shopCard.dataset.sellerId}`
    }
  }

  function handleSignOut() {
    void fetch('/auth/signout', { method: 'POST' }).then(() => { window.location.href = '/auth' })
  }

  async function handleWhatsappSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setWhatsappStatus('')
    if (!profile?.buyerId) { setWhatsappStatus('Profil pembeli belum tersedia'); return }
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from('buyers').update({ whatsapp_number: whatsappNumber.trim() }).eq('id', profile.buyerId)
    if (updateError) { setWhatsappStatus('Gagal simpan nombor WhatsApp'); return }
    setProfile({ ...profile, whatsappNumber: whatsappNumber.trim() })
    setWhatsappStatus('Nombor WhatsApp disimpan')
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="page" onClick={handleClick}>
        <div dangerouslySetInnerHTML={{ __html: pageInnerMarkup }} />
        {isSidebarOpen ? (
          <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
        ) : null}

        {toast ? <div className="toast">{toast}</div> : null}

        <aside className={`profile-sidebar${isSidebarOpen ? ' open' : ''}`} aria-hidden={!isSidebarOpen}>
          <header className="profile-sidebar-header">
            <button type="button" onClick={() => setIsSidebarOpen(false)} className="sidebar-close" aria-label="Tutup menu">X</button>
            <div className="sidebar-profile">
              <AvatarCircle profile={profile} size={56} />
              <div className="sidebar-profile-text">
                <p className="sidebar-name">{profile?.name || 'LokalGo'}</p>
                <p className="sidebar-email">{profile?.email || 'Belum log masuk'}</p>
                <span className="sidebar-chip">{profile?.kawasan || 'Kawasan belum ditetapkan'}</span>
              </div>
            </div>
          </header>

          <div className="sidebar-body">
            <SidebarLink href="/profile/address" icon={'\u{1F4CD}'} label="Alamat Penghantaran" />
            <form onSubmit={handleWhatsappSubmit} className="whatsapp-form">
              <label htmlFor="buyer-whatsapp" className="whatsapp-label">
                <span className="sidebar-icon">{'\u{1F4F1}'}</span>
                <span>Tetapan WhatsApp</span>
              </label>
              <input
                id="buyer-whatsapp"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="cth: 60123456789"
                className="whatsapp-input"
              />
              <button type="submit" className="whatsapp-save">Simpan</button>
              {whatsappStatus ? <p className="whatsapp-status">{whatsappStatus}</p> : null}
            </form>
            <SidebarLink href="/saved" icon={'\u{2764}\u{FE0F}'} label="Kedai Disimpan" />
            <SidebarLink href="/testimonials" icon={'\u{1F4AC}'} label="Testimoni Saya" />
            <SidebarLink href="/sokong" icon={'\u{1F64F}'} label="Sokong Pembangun" />
            <SidebarLink href="/about" icon={'\u{2139}\u{FE0F}'} label="Tentang LokaGo" />
            <button type="button" onClick={toggle} className="sidebar-lang">
              <span className="sidebar-icon">{'\u{1F310}'}</span>
              <span className="sidebar-label">Tukar Bahasa</span>
              <span className="sidebar-lang-pill">{lang === 'ms' ? 'English' : 'BM'}</span>
            </button>
          </div>

          <div className="sidebar-footer">
            <button type="button" onClick={handleSignOut} className="logout-btn">Log Keluar</button>
          </div>
        </aside>
      </div>
    </>
  )
}
