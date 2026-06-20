'use client'

import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react'
import { SplashScreen } from '@/components/SplashScreen'
import { MapPin, Heart, MessageSquare, Coffee, Info, Globe, LogOut, LogIn, BookOpen, Store } from 'lucide-react'
import { translations, useLang, type Lang } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import type { Buyer, Seller, Product } from '@/types/database'
import {
  BUSINESS_TYPE_LABELS,
  BUSINESS_TYPE_OPTIONS,
  CATEGORIES_BY_BUSINESS_TYPE,
  normalizeBusinessType,
  type BusinessType,
} from '@/lib/business-types'

type HomeProfile = {
  buyerId: string | null
  name: string
  email: string
  kawasan: string
  avatarUrl: string | null
}

const styles = `:root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-green:#25D366;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
html,body{overflow:hidden;height:100%;}
body{background:#0a0a0a;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:14px;color:var(--c-text);}
.page{position:relative;width:100%;max-width:430px;margin:0 auto;height:100dvh;background:var(--c-bg);overflow:hidden;}
@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{height:calc(100dvh - 80px);border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}
@media(min-width:1024px){body{align-items:center;padding:40px;}}
.home-shell{height:100%;display:flex;flex-direction:column;overflow:hidden;}
.home-fixed{flex-shrink:0;position:relative;z-index:10;transition:box-shadow 0.2s;}
.home-fixed.scrolled{box-shadow:0 2px 8px rgba(0,0,0,0.05);}
.home-scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;padding-bottom:env(safe-area-inset-bottom);}
.home-scroll::-webkit-scrollbar{display:none;}
.empty-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:48px 24px;text-align:center;}
.empty-state-txt{font-size:13px;color:#888;line-height:1.6;}
.header{background:var(--c-primary);padding:calc(env(safe-area-inset-top) + 10px) 20px 10px;}
.header-r1{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;}
.header-tagline{font-size:12px;font-weight:400;color:rgba(255,255,255,0.85);line-height:1.3;min-width:0;}
.header-r2{display:flex;gap:8px;align-items:center;}
.header-actions{display:flex;align-items:center;gap:10px;}
.coin-btn{width:44px;height:44px;border-radius:50%;border:none;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}
@keyframes coffeeWobble{0%,80%,100%{transform:rotate(0deg);}83%{transform:rotate(-14deg);}87%{transform:rotate(14deg);}91%{transform:rotate(-9deg);}95%{transform:rotate(9deg);}98%{transform:rotate(-4deg);}}
.coin-btn svg{animation:coffeeWobble 3.5s ease-in-out infinite;transform-origin:50% 80%;}
.home-avatar{width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,255,255,0.7);background:#7B1533;color:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;box-shadow:0 6px 16px rgba(0,0,0,0.18);flex-shrink:0;}
.home-avatar img{width:100%;height:100%;object-fit:cover;display:block;}
.search-wrap{flex:1;background:rgba(255,255,255,0.92);border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:8px;}
.search-wrap input{border:none;background:transparent;font-size:13px;color:#555;outline:none;width:100%;font-family:inherit;}
.search-wrap input::placeholder{color:#aaa;}
.lang-btn{background:rgba(255,255,255,0.15);border:none;border-radius:8px;padding:8px 10px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;}
.filter-section{background:#F5F5F5;}
.main-cat-row{display:flex;gap:12px;overflow-x:auto;padding:12px 20px 6px;scroll-snap-type:x mandatory;}
.main-cat-row::-webkit-scrollbar{display:none;}
.main-cat-item{flex-shrink:0;width:78px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;scroll-snap-align:start;background:none;border:none;font-family:inherit;padding:0;}
.main-cat-icon{width:58px;height:58px;border-radius:16px;display:flex;align-items:center;justify-content:center;overflow:hidden;border:2px solid transparent;transition:border-color 0.15s;}
.main-cat-icon img{width:100%;height:100%;object-fit:cover;display:block;}
.main-cat-icon-outline{background:#fff;border-color:#E5E5EA;}
.main-cat-icon-fallback{background:var(--c-primary);}
.main-cat-item.active .main-cat-icon{border-color:var(--c-primary);}
.main-cat-lbl{font-size:13px;font-weight:600;color:#555;white-space:nowrap;}
.main-cat-item.active .main-cat-lbl{color:var(--c-primary);font-weight:700;}
.subcat-wrap{max-height:0;opacity:0;overflow:hidden;padding:0 20px;transition:max-height 200ms ease,opacity 200ms ease,padding 200ms ease;}
.subcat-wrap.open{max-height:48px;opacity:1;padding:2px 20px 12px;}
.subcat-row{display:flex;gap:8px;overflow-x:auto;scroll-snap-type:x mandatory;animation:subcatFadeIn 200ms ease;}
.subcat-row::-webkit-scrollbar{display:none;}
@keyframes subcatFadeIn{from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:translateY(0);}}
.subcat-chip{flex-shrink:0;height:44px;display:flex;align-items:center;padding:0 14px;border-radius:999px;background:#fff;border:1px solid var(--c-primary);font-size:12px;font-weight:600;color:var(--c-primary);white-space:nowrap;cursor:pointer;scroll-snap-align:start;font-family:inherit;transition:background 0.15s,color 0.15s,border-color 0.15s;}
.subcat-chip.active{background:var(--c-accent);border-color:var(--c-accent);color:#3D4D0E;}
.sec-head{padding:14px 20px 10px;display:flex;justify-content:space-between;align-items:center;}
.sec-head-title{font-size:14px;font-weight:700;color:var(--c-text);}
.sec-head-link{font-size:12px;color:var(--c-primary);font-weight:500;text-decoration:none;display:flex;align-items:center;gap:3px;}
.shop-list{padding:0 20px 24px;display:flex;flex-direction:column;gap:12px;}
.shop-card{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.07);}
.img-wrap{position:relative;height:150px;}
.img-bg{position:absolute;inset:0;background-size:cover;background-position:center;}
.img-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(0,0,0,0.55) 100%);}
.badge-tl{position:absolute;top:10px;left:10px;background:rgba(0,0,0,0.45);color:var(--c-accent);font-size:10px;font-weight:600;padding:4px 10px;border-radius:6px;display:flex;align-items:center;gap:4px;border:1px solid rgba(173,208,54,0.3);}
.badge-tr{position:absolute;top:10px;right:10px;display:flex;gap:6px;}
.icon-btn{width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;cursor:pointer;}
.shop-footer{background:var(--c-primary);padding:10px 12px 12px;}
.shop-name-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:5px;}
.shop-name{font-size:15px;font-weight:700;color:#fff;}
.shop-loc{font-size:12px;color:rgba(255,255,255,0.85);display:flex;align-items:center;gap:3px;margin-bottom:7px;}
.shop-bottom{display:flex;justify-content:space-between;align-items:flex-end;}
.cod-row{display:flex;align-items:center;gap:4px;margin-top:5px;}
.cod-txt{font-size:12px;color:rgba(255,255,255,0.75);}
.status-open{background:var(--brand-lime,#C8E44A);color:var(--brand-maroon,#7B1D2E);font-size:11px;font-weight:700;padding:5px 14px;border-radius:6px;align-self:flex-end;text-transform:uppercase;}
.status-closed{background:#E0E0E0;color:#666;font-size:11px;font-weight:700;padding:5px 12px;border-radius:6px;align-self:flex-end;text-transform:uppercase;}
.status-preorder{background:#FFF3E0;color:#B45D00;font-size:11px;font-weight:700;padding:5px 10px;border-radius:6px;align-self:flex-end;}
.img-bg-fallback{background:linear-gradient(135deg,#7B1D2E,#4A0F1A);display:flex;align-items:center;justify-content:center;}
.shop-initial{font-size:32px;font-weight:700;color:#fff;}
.sidebar-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.4);z-index:40;}
.profile-sidebar{position:absolute;top:0;right:0;width:280px;height:100%;background:#fff;z-index:50;transform:translateX(100%);transition:transform 0.3s ease;overflow:hidden;display:flex;flex-direction:column;font-family:'Plus Jakarta Sans',sans-serif;box-shadow:-18px 0 50px rgba(0,0,0,0.22);}
.profile-sidebar.open{transform:translateX(0);}
.profile-sidebar-header{position:relative;background:#7B1533;padding:20px;color:#fff;}
.sidebar-close{position:absolute;top:10px;right:10px;width:44px;height:44px;border:0;border-radius:50%;background:rgba(255,255,255,0.15);color:#fff;font-size:16px;font-weight:800;line-height:1;cursor:pointer;}
.sidebar-profile{display:flex;align-items:center;gap:12px;padding-right:36px;}
.sidebar-profile-text{min-width:0;flex:1;}
.sidebar-name{font-size:16px;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sidebar-email{margin-top:2px;font-size:12px;color:rgba(255,255,255,0.7);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sidebar-chip{display:inline-flex;max-width:100%;margin-top:8px;border-radius:999px;background:rgba(255,255,255,0.15);padding:4px 10px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sidebar-body{flex:1;background:#fff;overflow-y:auto;}
.sidebar-link,.sidebar-lang{display:flex;width:100%;align-items:center;gap:12px;border:0;border-bottom:1px solid #f5f5f5;background:#fff;padding:14px 20px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#111;text-align:left;text-decoration:none;cursor:pointer;}
.sidebar-icon{width:24px;height:24px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.sidebar-label{flex:1;font-weight:600;}
.sidebar-arrow{color:#bbb;}
.sidebar-lang-pill{border-radius:999px;background:#ADD036;padding:4px 10px;font-size:10px;font-weight:800;color:#3D4D0E;}
.sidebar-footer{background:#fff;padding:16px 16px max(16px,env(safe-area-inset-bottom));border-top:1px solid var(--border,#ECECEC);}
.logout-btn{width:100%;min-height:44px;display:flex;align-items:center;justify-content:center;gap:8px;border:1.5px solid var(--brand-maroon,#7B1D2E);border-radius:12px;background:#fff;padding:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:800;color:var(--brand-maroon,#7B1D2E);cursor:pointer;}
.toast{position:absolute;bottom:90px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.82);color:#fff;padding:10px 22px;border-radius:20px;font-size:13px;font-weight:600;z-index:200;white-space:nowrap;pointer-events:none;animation:toastIn 0.2s ease;}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}
.sheet-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.45);z-index:60;}
.seller-sheet{position:absolute;bottom:0;left:0;right:0;background:#fff;border-radius:24px 24px 0 0;padding:28px 24px max(40px,env(safe-area-inset-bottom,0px));z-index:70;display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px;animation:sheetUp 0.28s cubic-bezier(0.32,0.72,0,1);}
@keyframes sheetUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
.sheet-icon{width:56px;height:56px;background:#fdf0f3;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:4px;}
.sheet-title{font-size:18px;font-weight:800;color:#111;letter-spacing:-0.3px;}
.sheet-body{font-size:13px;color:#555;line-height:1.6;max-width:280px;}
.sheet-cta{width:100%;background:#7B1D2E;border:none;border-radius:14px;padding:15px 20px;color:#fff;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;margin-top:4px;}
.sheet-dismiss{border:none;background:none;color:#888;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;padding:8px;}
.appr-backdrop{position:absolute;inset:0;background:rgba(0,0,0,0.6);z-index:80;display:flex;align-items:center;justify-content:center;padding:24px;}
.appr-popup{background:#fff;border-radius:24px;padding:28px 24px 24px;width:100%;max-width:360px;position:relative;animation:popIn 0.28s cubic-bezier(0.32,0.72,0,1);}
@keyframes popIn{from{transform:scale(0.88);opacity:0;}to{transform:scale(1);opacity:1;}}
.appr-close{position:absolute;top:8px;right:8px;width:44px;height:44px;border-radius:50%;border:none;background:#f0f0f0;color:#555;font-size:14px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;}
.appr-badge{display:inline-block;background:#ADD036;color:#2a2a2a;font-size:11px;font-weight:800;padding:4px 12px;border-radius:20px;margin-bottom:14px;letter-spacing:0.4px;}
.appr-title{font-size:21px;font-weight:800;color:#111;margin-bottom:8px;letter-spacing:-0.3px;}
.appr-body{font-size:13px;color:#555;line-height:1.7;margin-bottom:20px;}
.appr-card{background:#fdf4f6;border:1px solid #f0d4db;border-radius:14px;padding:14px 16px;margin-bottom:20px;}
.appr-card-logo{margin-bottom:8px;}
.appr-card-shop{font-size:15px;font-weight:800;color:#7B1533;margin-bottom:3px;}
.appr-card-tagline{font-size:12px;color:#888;line-height:1.5;}
.appr-card-url{font-size:11px;color:#ADD036;font-weight:700;margin-top:6px;}
.appr-share-btn{width:100%;background:#7B1533;border:none;border-radius:12px;padding:13px 20px;display:flex;align-items:center;justify-content:center;gap:8px;color:#fff;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;margin-bottom:10px;}
.appr-setting-btn{width:100%;background:transparent;border:1.5px solid #e5e5ea;border-radius:12px;padding:12px 20px;color:#555;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;}`

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

function safeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('/')) {
    return trimmed
  }
  return null
}

function firstInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'L'
}

function readCoord(val: number | string | null | undefined): number | null {
  if (val == null || val === '') return null
  const n = typeof val === 'number' ? val : parseFloat(val as string)
  return isFinite(n) ? n : null
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function renderAvatar(profile: HomeProfile | null) {
  if (!profile) return '<span class="home-avatar-initial">L</span>'
  const safeAvatar = safeImageUrl(profile.avatarUrl)
  if (safeAvatar) return `<img src="${escapeHtml(safeAvatar)}" alt="${escapeHtml(profile.name)}">`
  return `<span class="home-avatar-initial">${escapeHtml(firstInitial(profile.name))}</span>`
}

function badgeLabel(badge: Seller['badge']) {
  if (badge === 'verified_seller') return 'Verified Shop'
  if (badge === 'seller_aktif') return 'Active Seller'
  return 'New Seller'
}

type SellerDisplayMode = 'open_normal' | 'preorder_only' | 'hidden'
type HomeLocationMode = 'resolving' | 'gps' | 'kawasan' | 'none'

function getDisplayMode(seller: Seller, hasNormal: boolean, hasPreorder: boolean, productsUnavailable: boolean): SellerDisplayMode {
  // Products query failed — we have no normal/preorder signal to trust.
  // Fall back to the seller's own open/closed flag instead of hiding everyone.
  if (productsUnavailable) {
    return seller.is_open ? 'open_normal' : 'hidden'
  }
  if (!hasNormal && !hasPreorder) return 'hidden'
  if (seller.is_open && hasNormal) return 'open_normal'
  if (hasPreorder) return 'preorder_only'
  return 'hidden'
}

// Legacy FOOD category aliases — products approved before the FOOD subcategory
// list existed used these older category strings. Selecting the new subcategory
// must still surface sellers tagged with the old equivalent (no data migration).
const LEGACY_CATEGORY_ALIASES: Record<string, string[]> = {
  'Nasi': ['Set Makanan & Lauk'],
  'Frozen': ['Frozen & Simpanan', 'Fresh & Semulajadi'],
}

function categoryMatchesSelection(cats: string[], selected: string): boolean {
  if (cats.includes(selected)) return true
  return (LEGACY_CATEGORY_ALIASES[selected] ?? []).some((alias) => cats.includes(alias))
}

// Display order only — does not change CATEGORIES_BY_BUSINESS_TYPE (the shared
// source of truth also used by the seller add-listing dropdown), so that page
// is unaffected. Any category missing from this list still renders (appended),
// so nothing from the shared list is ever silently dropped.
const SUBCATEGORY_DISPLAY_ORDER: Record<BusinessType, readonly string[]> = {
  FOOD: ['Nasi', 'Minuman', 'Snek', 'Pastri & Kek', 'Kuih', 'Dessert', 'Frozen'],
  SERVICE: ['Aircond', 'Plumbing', 'Electrical', 'Cleaning', 'Grass Cutting', 'Repair'],
  PRODUCT: ['Grocery', 'Fresh Fish', 'Vegetables', 'Beauty', 'Homemade Product', 'Household'],
  HOMESTAY: ['Homestay', 'Apartment', 'House', 'Room', 'Villa'],
}

function getDisplayOrderedCategories(type: BusinessType): readonly string[] {
  const canonical = CATEGORIES_BY_BUSINESS_TYPE[type]
  const order = SUBCATEGORY_DISPLAY_ORDER[type]
  const ordered = order.filter((c) => canonical.includes(c))
  const extras = canonical.filter((c) => !order.includes(c))
  return [...ordered, ...extras]
}

// Main category icons — provided design assets (public/icons/New Icon). No PNG
// was supplied for "Semua" (a meta-filter, not a real category), so it uses an
// inline icon instead of a remote asset. HomestayIcon below is kept as a
// fallback for MAIN_CATEGORY_ICON_SRC in case a future business type ships
// without a matching asset.
const MAIN_CATEGORY_ICON_SRC: Record<BusinessType, string | null> = {
  FOOD: '/icons/New Icon/food.png',
  SERVICE: '/icons/New Icon/service.png',
  PRODUCT: '/icons/New Icon/product.png',
  HOMESTAY: '/icons/New Icon/homestay.png',
}

function SemuaIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7B1533" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  )
}

function HomestayIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 10 9-7 9 7" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </svg>
  )
}

// Real React component (not an HTML string) — required for genuine CSS
// transitions. The rest of this page renders via dangerouslySetInnerHTML,
// which fully replaces its subtree on every state change, so CSS `transition`
// can never animate it (the browser sees a fresh node, not a style change).
// This component is a persistent DOM node across re-renders, so toggling its
// className lets the open/close animation actually run in both directions.
function FilterSection({
  selectedBusinessType,
  selectedCategory,
  lang,
  onSelectType,
  onSelectCategory,
}: {
  selectedBusinessType: BusinessType | null
  selectedCategory: string | null
  lang: Lang
  onSelectType: (type: BusinessType | null) => void
  onSelectCategory: (cat: string | null) => void
}) {
  const resetLabel = lang === 'en' ? 'All' : 'Semua'
  const isOpen = !!selectedBusinessType

  // Keep showing the last-selected type's chips while the row collapses, so
  // the content doesn't pop away mid-animation — only the wrapper's
  // max-height/opacity animate when returning to Semua.
  const lastTypeRef = useRef<BusinessType | null>(selectedBusinessType)
  if (selectedBusinessType) lastTypeRef.current = selectedBusinessType
  const displayType = selectedBusinessType ?? lastTypeRef.current

  return (
    <div className="filter-section">
      <div className="main-cat-row">
        <button type="button" className={`main-cat-item${!selectedBusinessType ? ' active' : ''}`} onClick={() => onSelectType(null)}>
          <span className="main-cat-icon main-cat-icon-outline"><SemuaIcon /></span>
          <span className="main-cat-lbl">{resetLabel}</span>
        </button>
        {BUSINESS_TYPE_OPTIONS.map((type) => {
          const iconSrc = MAIN_CATEGORY_ICON_SRC[type]
          return (
            <button
              key={type}
              type="button"
              className={`main-cat-item${selectedBusinessType === type ? ' active' : ''}`}
              onClick={() => onSelectType(type)}
            >
              <span className={`main-cat-icon${iconSrc ? '' : ' main-cat-icon-fallback'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {iconSrc ? <img src={iconSrc} alt="" /> : <HomestayIcon />}
              </span>
              <span className="main-cat-lbl">{BUSINESS_TYPE_LABELS[type]}</span>
            </button>
          )
        })}
      </div>
      <div className={`subcat-wrap${isOpen ? ' open' : ''}`}>
        {displayType ? (
          <div className="subcat-row" key={displayType}>
            <button type="button" className={`subcat-chip${!selectedCategory ? ' active' : ''}`} onClick={() => onSelectCategory(null)}>
              {resetLabel}
            </button>
            {getDisplayOrderedCategories(displayType).map((cat) => (
              <button
                key={cat}
                type="button"
                className={`subcat-chip${selectedCategory === cat ? ' active' : ''}`}
                onClick={() => onSelectCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}


function renderSellerCard(
  seller: Seller,
  index: number,
  lang: Lang,
  savedShopIds: Set<string>,
  sellerCategories: Map<string, string[]>,
  displayMode: Exclude<SellerDisplayMode, 'hidden'>,
) {
  const safeImgUrl = safeImageUrl(seller.profile_image_url)
  const posX = seller.profile_image_position_x ?? 50
  const posY = seller.profile_image_position_y ?? 50
  const imageStyle = safeImgUrl
    ? ` style="background-image:url('${escapeHtml(safeImgUrl)}');background-position:${posX}% ${posY}%"`
    : ''
  const imageClass = safeImgUrl ? 'img-bg' : 'img-bg img-bg-fallback'
  const initialHtml = safeImgUrl
    ? ''
    : `<span class="shop-initial">${escapeHtml((seller.shop_name || 'L').trim().charAt(0).toUpperCase())}</span>`

  const cats = sellerCategories.get(seller.id) ?? []
  const tags = cats.slice(0, 3)
    .map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`)
    .join('')

  const catsAttr = escapeHtml(cats.join(','))
  const typeAttr = escapeHtml(normalizeBusinessType(seller.business_type))
  const nameAttr = escapeHtml((seller.shop_name ?? '').toLowerCase())
  const locAttr = escapeHtml((seller.taman_name || seller.kawasan || '').toLowerCase())
  return `
  <div class="shop-card" data-seller-id="${escapeHtml(seller.id)}" data-cats="${catsAttr}" data-type="${typeAttr}" data-name="${nameAttr}" data-loc="${locAttr}">
    <div class="img-wrap">
      <div class="${imageClass}"${imageStyle}>${initialHtml}</div>
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
          <div class="cod-row"><svg width="14" height="11" viewBox="0 0 36 24" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="18" r="4"/><circle cx="28" cy="18" r="4"/><path d="M12 18h12"/><path d="M8 14V8l6-4h6l4 6h-4l-2-4h-3l-4 4H8z"/><path d="M20 10l2 4"/></svg><span class="cod-txt">${copy('cod_available', lang)}</span></div>
        </div>
        <span class="${displayMode === 'open_normal' ? 'status-open' : 'status-preorder'}">${displayMode === 'open_normal' ? copy('buka', lang) : 'Pre-Order sahaja'}</span>
      </div>
    </div>
  </div>`
}

const EMPTY_STORE_ICON = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#CCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/></svg>'

function emptyStateHtml(line1: string, line2?: string) {
  return `<div class="empty-state">${EMPTY_STORE_ICON}<span class="empty-state-txt">${escapeHtml(line1)}${line2 ? `<br>${escapeHtml(line2)}` : ''}</span></div>`
}

function renderShopList(
  lang: Lang,
  sellers: Seller[],
  isLoading: boolean,
  error: string | null,
  savedShopIds: Set<string>,
  sellerCategories: Map<string, string[]>,
  sellerHasNormal: Set<string>,
  sellerHasPreorder: Set<string>,
  productsLoadFailed: boolean,
  locationMode: HomeLocationMode,
  buyerKawasan: string | null,
) {
  if (isLoading) {
    return '<div class="shop-card"><div class="shop-footer"><span class="shop-name">Memuatkan kedai...</span></div></div>'
  }
  if (error) {
    return `<div class="shop-card"><div class="shop-footer"><span class="shop-name">${escapeHtml(error)}</span></div></div>`
  }

  if (sellers.length === 0) {
    if (locationMode === 'resolving') {
      return emptyStateHtml('Mencari kedai berdekatan...', 'Sila tunggu sebentar.')
    }
    if (locationMode === 'none' || (locationMode === 'kawasan' && !buyerKawasan)) {
      return emptyStateHtml('Aktifkan lokasi untuk melihat kedai berdekatan.', 'Benarkan akses lokasi dalam tetapan peranti anda.')
    }
    if (locationMode === 'kawasan') {
      return emptyStateHtml('Tiada kedai berdekatan kawasan anda buat masa ini.', 'Cuba semak semula kemudian.')
    }
    return emptyStateHtml('Tiada kedai berdekatan buat masa ini.', 'Cuba semak semula kemudian.')
  }

  return sellers.map((seller, index) => {
    const displayMode = getDisplayMode(seller, sellerHasNormal.has(seller.id), sellerHasPreorder.has(seller.id), productsLoadFailed) as Exclude<SellerDisplayMode, 'hidden'>
    return renderSellerCard(seller, index, lang, savedShopIds, sellerCategories, displayMode)
  }).join('')
}

function renderHeaderMarkup(
  lang: Lang,
  profile: HomeProfile | null,
  locationLabel: string | null,
) {
  const avatarHtml = profile?.avatarUrl
    ? `<img src="${escapeHtml(profile.avatarUrl)}" alt="${escapeHtml(profile.name)}">`
    : `<span class="home-avatar-initial">${escapeHtml(firstInitial(profile?.name ?? 'LokalGo'))}</span>`

  const langBtnTxt = lang === 'ms' ? 'English' : 'BM'

  return `
<div class="header">
  <div class="header-r1">
    <span class="header-tagline"><span data-i18n="tagline">${copy('tagline', lang)}</span>${locationLabel ? ` &nbsp;·&nbsp; <span style="opacity:0.85">${escapeHtml(locationLabel)}</span>` : ''}</span>
    <div class="header-actions">
      <button class="coin-btn" aria-label="Sokong Pembangun"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C8E44A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg></button>
      <button class="home-avatar" aria-label="Buka menu profil">${avatarHtml}</button>
    </div>
  </div>
  <div class="header-r2">
    <div class="search-wrap">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" placeholder="${copy('search_placeholder', lang)}" oninput="var q=this.value.toLowerCase().trim();document.querySelectorAll('.shop-card[data-name]').forEach(function(c){var el=c;el.style.display=(!q||el.dataset.name.includes(q)||el.dataset.loc.includes(q))?'':'none';})">
    </div>
    <button class="lang-btn">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      <span class="lang-btn-txt">${langBtnTxt}</span>
    </button>
  </div>
</div>
`
}

function renderMainMarkup(
  lang: Lang,
  sellers: Seller[],
  isLoading: boolean,
  error: string | null,
  savedShopIds: Set<string>,
  sellerCategories: Map<string, string[]>,
  sellerHasNormal: Set<string>,
  sellerHasPreorder: Set<string>,
  productsLoadFailed: boolean,
  locationMode: HomeLocationMode,
  buyerKawasan: string | null,
) {
  const shopListHtml = renderShopList(lang, sellers, isLoading, error, savedShopIds, sellerCategories, sellerHasNormal, sellerHasPreorder, productsLoadFailed, locationMode, buyerKawasan)

  return `
<main class="home-scroll" onscroll="document.querySelector('.home-fixed').classList.toggle('scrolled', this.scrollTop > 4)">
<!-- POPULAR -->
<div class="sec-head">
  <span class="sec-head-title">${copy('popular_title', lang)}</span>
  <a class="sec-head-link" href="#">${copy('lihat_semua', lang)} <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></a>
</div>

<div class="shop-list">
${shopListHtml}
</div>
</main>
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

function SidebarLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a href={href} className="sidebar-link">
      <span className="sidebar-icon">{icon}</span>
      <span className="sidebar-label">{label}</span>
      <span className="sidebar-arrow">&gt;</span>
    </a>
  )
}

export default function HomePage() {
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('lokalgo_splash_home_seen')) {
      setSplashDone(true)
    }
  }, [])

  if (!splashDone) {
    return (
      <SplashScreen
        onDone={() => {
          sessionStorage.setItem('lokalgo_splash_home_seen', '1')
          setSplashDone(true)
        }}
      />
    )
  }

  return <HomePageContent />
}

function HomePageContent() {
  const { lang, toggle } = useLang()
  const [allSellers, setAllSellers] = useState<Seller[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [locationMode, setLocationMode] = useState<HomeLocationMode>('resolving')
  const [buyerKawasan, setBuyerKawasan] = useState<string | null>(null)
  const [sellerCategories, setSellerCategories] = useState<Map<string, string[]>>(new Map())
  const [sellerHasNormal, setSellerHasNormal] = useState<Set<string>>(new Set())
  const [sellerHasPreorder, setSellerHasPreorder] = useState<Set<string>>(new Set())
  const [productsLoadFailed, setProductsLoadFailed] = useState(false)
  const [selectedBusinessType, setSelectedBusinessType] = useState<BusinessType | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [profile, setProfile] = useState<HomeProfile | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSeller, setIsSeller] = useState(false)
  const [isSellerSheetOpen, setIsSellerSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savedShopIds, setSavedShopIds] = useState<Set<string>>(new Set())
  const [toast, setToast] = useState<string | null>(null)
  const [approvalSeller, setApprovalSeller] = useState<{ id: string; shopName: string } | null>(null)

  const sellers = useMemo(() => {
    if (locationMode === 'resolving' || locationMode === 'none') return []

    let locationFiltered: Seller[]

    if (locationMode === 'gps' && userLocation) {
      locationFiltered = allSellers.filter((s) => {
        const lat = readCoord(s.latitude)
        const lng = readCoord(s.longitude)
        // sellers without coordinates are excluded in GPS mode — no bypass
        if (lat == null || lng == null) return false
        return haversineKm(userLocation.lat, userLocation.lng, lat, lng) <= 50
      })
    } else if (locationMode === 'kawasan') {
      const kw = (buyerKawasan ?? '').toLowerCase().trim()
      if (!kw || kw === 'kawasan belum ditetapkan') return []
      locationFiltered = allSellers.filter((s) => {
        const sk = (s.kawasan ?? '').toLowerCase()
        const st = (s.taman_name ?? '').toLowerCase()
        return (sk && (sk.includes(kw) || kw.includes(sk))) || (st && (st.includes(kw) || kw.includes(st)))
      })
      // no silent fallback — if no kawasan match, return empty for proper empty state
    } else {
      // gps mode but userLocation not yet set (brief race between state updates)
      return []
    }

    let visibleSellers = locationFiltered.filter((s) =>
      getDisplayMode(s, sellerHasNormal.has(s.id), sellerHasPreorder.has(s.id), productsLoadFailed) !== 'hidden',
    )

    if (selectedBusinessType) {
      visibleSellers = visibleSellers.filter((s) => normalizeBusinessType(s.business_type) === selectedBusinessType)
    }

    if (selectedCategory) {
      visibleSellers = visibleSellers.filter((s) => categoryMatchesSelection(sellerCategories.get(s.id) ?? [], selectedCategory))
    }

    return visibleSellers
  }, [allSellers, locationMode, userLocation, buyerKawasan, sellerHasNormal, sellerHasPreorder, productsLoadFailed, selectedBusinessType, selectedCategory, sellerCategories])

  const locationLabel = useMemo(() => {
    if (locationMode === 'gps' && userLocation) return '📍 Sekitar 50km dari anda'
    if (locationMode === 'kawasan' && buyerKawasan && buyerKawasan !== 'Kawasan belum ditetapkan') {
      return `📍 Kawasan: ${buyerKawasan}`
    }
    return null
  }, [locationMode, userLocation, buyerKawasan])

  const headerMarkup = useMemo(
    () => renderHeaderMarkup(lang, profile, locationLabel),
    [lang, profile, locationLabel],
  )

  const mainMarkup = useMemo(
    () => renderMainMarkup(lang, sellers, isLoading, error, savedShopIds, sellerCategories, sellerHasNormal, sellerHasPreorder, productsLoadFailed, locationMode, buyerKawasan),
    [lang, sellers, isLoading, error, savedShopIds, sellerCategories, sellerHasNormal, sellerHasPreorder, productsLoadFailed, locationMode, buyerKawasan],
  )

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function loadData() {
      setIsLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (cancelled) return

      if (user) {
        const metadata = user.user_metadata ?? {}
        const metadataName = typeof metadata.full_name === 'string' ? metadata.full_name : undefined
        const metadataFallbackName = typeof metadata.name === 'string' ? metadata.name : undefined
        const metadataAvatar = typeof metadata.avatar_url === 'string'
          ? metadata.avatar_url
          : typeof metadata.picture === 'string' ? metadata.picture : null

        const { data: sellerRecord } = await supabase
          .from('sellers').select('id, shop_name, approved_at').eq('user_id', user.id).maybeSingle()
        if (!cancelled) {
          setIsSeller(!!sellerRecord)
          if (sellerRecord?.approved_at) {
            const key = `lk_appr_${sellerRecord.id}`
            if (!localStorage.getItem(key)) {
              setApprovalSeller({ id: sellerRecord.id, shopName: (sellerRecord as { id: string; shop_name: string | null; approved_at: string | null }).shop_name || 'Kedai anda' })
            }
          }
        }

        const { data: buyerData } = await supabase
          .from('buyers').select('*').eq('user_id', user.id).maybeSingle()
        if (cancelled) return

        const buyer = buyerData as Buyer | null
        setProfile({
          buyerId: buyer?.id ?? null,
          name: metadataName || metadataFallbackName || user.email || 'LokalGo',
          email: user.email || buyer?.email || '',
          kawasan: buyer?.kawasan || 'Kawasan belum ditetapkan',
          avatarUrl: metadataAvatar,
        })
        setBuyerKawasan(buyer?.kawasan ?? null)

        if (buyer?.id) {
          const { data: savedData } = await supabase
            .from('saved_shops').select('shop_id').eq('buyer_id', buyer.id)
          if (!cancelled && savedData) {
            setSavedShopIds(new Set(savedData.map((r: { shop_id: string }) => r.shop_id)))
          }
        }
      }

      // Load sellers + products in parallel
      const [sellersRes, productsRes] = await Promise.all([
        supabase
          .from('sellers')
          .select('*')
          .eq('status', 'active')
          .order('approved_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(100),
        supabase
          .from('products')
          .select('seller_id,category,listing_type,is_available,is_preorder')
          .eq('status', 'approved')
          .or('is_available.eq.true,is_preorder.eq.true'),
      ])

      if (cancelled) return

      if (productsRes.error) {
        // Don't let a products-query failure silently hide every seller — log it
        // clearly and let getDisplayMode fall back to seller.is_open instead.
        console.error('[Home] Failed to load products for seller availability filtering. Falling back to seller open/closed status so shops are not hidden.', productsRes.error)
      }
      setProductsLoadFailed(!!productsRes.error)

      if (sellersRes.error) {
        setError('Tidak dapat memuatkan senarai kedai')
        setAllSellers([])
      } else {
        const loadedSellers = (sellersRes.data ?? []) as Seller[]
        setAllSellers(loadedSellers)

        // Build maps: seller categories, normal product set, preorder product set
        const catMap = new Map<string, string[]>()
        const normalSet = new Set<string>()
        const preorderSet = new Set<string>()
        for (const p of (productsRes.data ?? []) as Pick<Product, 'seller_id' | 'category' | 'listing_type' | 'is_available' | 'is_preorder'>[]) {
          if (!p.seller_id) continue
          if (p.category) {
            const existing = catMap.get(p.seller_id) ?? []
            if (!existing.includes(p.category)) existing.push(p.category)
            catMap.set(p.seller_id, existing)
          }
          if (p.is_available) normalSet.add(p.seller_id)
          if (p.is_preorder) preorderSet.add(p.seller_id)
        }
        setSellerCategories(catMap)
        setSellerHasNormal(normalSet)
        setSellerHasPreorder(preorderSet)
      }

      setIsLoading(false)
    }

    loadData()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocationMode('none')
      return
    }
    let lastLat = 0
    let lastLng = 0
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const moved = lastLat === 0 ? Infinity : haversineKm(lastLat, lastLng, lat, lng)
        if (moved >= 1) {
          lastLat = lat
          lastLng = lng
          setUserLocation({ lat, lng })
          setLocationMode('gps')
        }
      },
      () => setLocationMode('kawasan'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
    return () => navigator.geolocation.clearWatch(watchId)
  }, [])

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2500)
  }

  function handleSelectType(type: BusinessType | null) {
    setSelectedBusinessType(type)
    setSelectedCategory(null)
  }

  function handleSelectCategory(cat: string | null) {
    setSelectedCategory(cat)
  }

  async function handleClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement

    if (target.closest('.lang-btn')) { toggle(); showToast(lang === 'ms' ? 'Language: English' : 'Bahasa: Melayu'); return }
    if (target.closest('.coin-btn')) { window.location.href = '/sokong'; return }
    if (target.closest('.home-avatar')) { setIsSidebarOpen(true); return }

    // Main category / subcategory filter clicks are handled directly by
    // FilterSection's own onClick props (it's a real React component, not
    // part of this delegated dangerouslySetInnerHTML handler).

    // Share button
    if (target.closest('.share-btn')) {
      event.stopPropagation()
      const card = target.closest<HTMLElement>('.shop-card')
      const sellerId = card?.dataset.sellerId
      const shopName = card?.querySelector('.shop-name')?.textContent?.trim() || 'Kedai LokalGo™'
      const url = `${process.env.NEXT_PUBLIC_APP_URL || ''}/shop/${sellerId}`
      if (navigator.share) {
        try { await navigator.share({ title: shopName, text: 'Tengok kedai ini di LokalGo™!', url }) } catch { /* dismissed */ }
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

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  function goToSellerArea() {
    setIsSidebarOpen(false)
    if (isSeller) {
      window.location.href = '/seller/dashboard'
    } else {
      setIsSellerSheetOpen(true)
    }
  }

  function handleToggleLang() {
    toggle()
    setIsSidebarOpen(false)
    showToast(lang === 'ms' ? 'Language: English' : 'Bahasa: Melayu')
  }



  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="page" onClick={handleClick}>
        <div className="home-shell">
          <header className="home-fixed">
            <div dangerouslySetInnerHTML={{ __html: headerMarkup }} />
            <FilterSection
              selectedBusinessType={selectedBusinessType}
              selectedCategory={selectedCategory}
              lang={lang}
              onSelectType={handleSelectType}
              onSelectCategory={handleSelectCategory}
            />
          </header>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: mainMarkup }} />
        </div>
        {isSidebarOpen ? (
          <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} aria-hidden="true" />
        ) : null}

        {toast ? <div className="toast">{toast}</div> : null}

        {isSellerSheetOpen ? (
          <>
            <div className="sheet-backdrop" onClick={() => setIsSellerSheetOpen(false)} aria-hidden="true" />
            <div className="seller-sheet" role="dialog" aria-modal="true">
              <div className="sheet-icon"><Store size={32} color="#7B1D2E" /></div>
              <p className="sheet-title">Berminat untuk menjadi penjual?</p>
              <p className="sheet-body">Jualan di LokalGo adalah percuma dan akan kekal percuma. Daftar kedai anda dan mula berjual hari ini.</p>
              <button type="button" className="sheet-cta" onClick={() => { setIsSellerSheetOpen(false); window.location.href = '/onboarding/step0' }}>
                Daftar Sebagai Penjual
              </button>
              <button type="button" className="sheet-dismiss" onClick={() => setIsSellerSheetOpen(false)}>
                Tidak sekarang
              </button>
            </div>
          </>
        ) : null}

        {approvalSeller ? (
          <div className="appr-backdrop" onClick={(e) => { if (e.target === e.currentTarget) { localStorage.setItem(`lk_appr_${approvalSeller.id}`, '1'); setApprovalSeller(null) } }}>
            <div className="appr-popup" role="dialog" aria-modal="true">
              <button className="appr-close" onClick={() => { localStorage.setItem(`lk_appr_${approvalSeller.id}`, '1'); setApprovalSeller(null) }} aria-label="Tutup">✕</button>
              <div className="appr-badge">✅ DILULUSKAN</div>
              <div className="appr-title">Tahniah! Kedai anda telah diluluskan 🎉</div>
              <div className="appr-body">
                Sila ke bahagian <strong>Dashboard Penjual → Setting</strong> untuk lengkapkan tetapan kedai anda dan mula menjual.
              </div>
              <div className="appr-card">
                <div className="appr-card-logo">
                  <img src="/icons/Logo-LOKALGO.png" alt="LokalGo" style={{ height: 24, width: 'auto', display: 'block' }} />
                </div>
                <div className="appr-card-shop">{approvalSeller.shopName}</div>
                <div className="appr-card-tagline">Kini tersenarai sebagai penjual di LokalGo!<br />Dapatkan produk tempatan berkualiti dari jiran anda.</div>
                <div className="appr-card-url">lokalgo.app</div>
              </div>
              <button className="appr-share-btn" onClick={async () => {
                const text = `Kedai saya "${approvalSeller.shopName}" kini tersenarai di LokalGo! 🎉\n\nBeli produk tempatan berkualiti dari jiran anda. Jom tengok:`
                const url = process.env.NEXT_PUBLIC_APP_URL || 'https://lokalgo.app'
                if (navigator.share) {
                  try { await navigator.share({ title: approvalSeller.shopName + ' di LokalGo!', text, url }) } catch { /* dismissed */ }
                } else {
                  try { await navigator.clipboard.writeText(`${text}\n${url}`); showToast('Teks disalin!') } catch { /* ignore */ }
                }
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Kongsi Kejayaan Saya
              </button>
              <button className="appr-setting-btn" onClick={() => { localStorage.setItem(`lk_appr_${approvalSeller.id}`, '1'); setApprovalSeller(null); window.location.href = '/seller/dashboard' }}>
                Ke Dashboard Penjual
              </button>
            </div>
          </div>
        ) : null}

        <aside className={`profile-sidebar${isSidebarOpen ? ' open' : ''}`} aria-hidden={!isSidebarOpen}>
          <header className="profile-sidebar-header">
            <button type="button" onClick={() => setIsSidebarOpen(false)} className="sidebar-close" aria-label="Tutup menu">X</button>
            <div className="sidebar-profile">
              <AvatarCircle profile={profile} size={56} />
              <div className="sidebar-profile-text">
                <p className="sidebar-name">{profile?.name || 'LokalGo'}</p>
                <p className="sidebar-email">{profile?.email || 'Belum log masuk'}</p>
              </div>
            </div>
          </header>

          <div className="sidebar-body">
            <SidebarLink href="/profile/address" icon={<MapPin size={20} color="#7B1D2E" />} label={lang === 'en' ? 'Delivery Address' : 'Alamat Penghantaran'} />
            <SidebarLink href="/saved" icon={<Heart size={20} color="#7B1D2E" />} label={lang === 'en' ? 'Saved Shops' : 'Kedai Disimpan'} />
            <SidebarLink href="/testimonials" icon={<MessageSquare size={20} color="#7B1D2E" />} label={lang === 'en' ? 'My Reviews' : 'Testimoni Saya'} />
            <SidebarLink href="/sokong" icon={<Coffee size={20} color="#7B1D2E" />} label={lang === 'en' ? 'Support Developer' : 'Sokong Pembangun'} />
            <button type="button" onClick={goToSellerArea} className="sidebar-link">
              <span className="sidebar-icon"><Store size={20} color="#7B1D2E" /></span>
              <span className="sidebar-label">{lang === 'en' ? 'Seller Dashboard' : 'Dashboard Penjual'}</span>
              <span className="sidebar-arrow">&gt;</span>
            </button>
            <SidebarLink href="/about" icon={<Info size={20} color="#7B1D2E" />} label={lang === 'en' ? 'About LokalGo™' : 'Tentang LokalGo™'} />
            <SidebarLink href="/tutorial" icon={<BookOpen size={20} color="#7B1D2E" />} label="Tutorial" />
            <button type="button" onClick={handleToggleLang} className="sidebar-lang">
              <span className="sidebar-icon"><Globe size={20} color="#7B1D2E" /></span>
              <span className="sidebar-label">{lang === 'en' ? 'Change Language' : 'Tukar Bahasa'}</span>
              <span className="sidebar-lang-pill">{lang === 'ms' ? 'English' : 'BM'}</span>
            </button>
          </div>

          <div className="sidebar-footer">
            {profile ? (
              <button type="button" onClick={handleSignOut} className="logout-btn">
                <LogOut size={18} />
                {lang === 'en' ? 'Sign Out' : 'Log Keluar'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`
                }}
                className="logout-btn"
              >
                <LogIn size={18} />
                {lang === 'en' ? 'Sign In' : 'Log Masuk'}
              </button>
            )}
          </div>
        </aside>
      </div>
    </>
  )
}
