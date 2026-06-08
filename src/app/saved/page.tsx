'use client'

import { useEffect } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'
import { createClient } from '@/lib/supabase/client'
import type { Seller } from '@/types/database'

type SavedWindow = Window & {
  __lokalgoUnsave?: (id: string, event?: Event) => void
}

function getSavedIds() {
  const keys = ['lokalgo_saved_shop_ids', 'lokalgo_saved_sellers', 'lokalgo_saved_shops']

  for (const key of keys) {
    const raw = localStorage.getItem(key)
    if (!raw) continue

    try {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string')
      }
    } catch {
      return raw.split(',').map((item) => item.trim()).filter(Boolean)
    }
  }

  return []
}

function setSavedIds(ids: string[]) {
  localStorage.setItem('lokalgo_saved_shop_ids', JSON.stringify(Array.from(new Set(ids))))
}

function savedShopCard(seller: Seller, index: number) {
  const statusClass = seller.is_open ? 'status-open' : 'status-closed'
  const statusText = seller.is_open ? 'BUKA' : 'TUTUP'
  const bgClass = `bg${(index % 3) + 1}`

  return `<div class="shop-card" onclick="window.location.href='/shop?seller=${seller.id}'">
    <div class="img-wrap">
      ${seller.profile_image_url ? `<img src="${seller.profile_image_url}" alt="" style="width:100%;height:100%;object-fit:cover;">` : `<div class="img-bg ${bgClass}"></div>`}
      ${seller.badge === 'verified_seller' ? '<div class="badge-tl">Verified Shop</div>' : ''}
      <button class="unsave-btn" onclick="window.__lokalgoUnsave('${seller.id}', event)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#e44" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      </button>
    </div>
    <div class="shop-footer">
      <div class="shop-name">${seller.shop_name}</div>
      <div class="shop-loc">${seller.taman_name}</div>
      <div class="shop-bottom"><div class="tags"><span class="tag">${seller.badge.replaceAll('_', ' ')}</span></div><span class="${statusClass}">${statusText}</span></div>
    </div>
  </div>`
}

const styles = ":root{--c-primary:#7B1533;--c-accent:#ADD036;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}\nbody{background:#0a0a0a;min-height:100vh;font-family:\u0027Plus Jakarta Sans\u0027,-apple-system,sans-serif;font-size:14px;color:var(--c-text);}\n.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;max-height:100vh;background:var(--c-bg);overflow-y:auto;overflow-x:hidden;}\n@media(min-width:500px){body{padding:0 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:100vh;max-height:100vh;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}\n@media(min-width:1024px){body{align-items:center;min-height:100vh;}}\n.scroll{min-height:100vh;display:flex;flex-direction:column;padding-bottom:40px;}.scroll::-webkit-scrollbar,.page::-webkit-scrollbar{display:none;}\n\n.header{background:var(--c-primary);padding:14px 20px 14px;flex-shrink:0;}\n.header-r1{display:flex;align-items:center;gap:12px;}\n.back-btn{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}\n.header-title{font-size:17px;font-weight:700;color:#fff;flex:1;}\n.count-txt{font-size:12px;color:rgba(255,255,255,0.6);}\n\n.shop-list{padding:12px 20px;display:flex;flex-direction:column;gap:10px;flex:1;}\n.shop-list.empty{min-height:calc(100vh - 60px);align-items:center;justify-content:center;padding:24px 20px 40px;}\n.empty-state{width:100%;background:#fff;border-radius:16px;padding:30px 18px;text-align:center;border:1px solid #eee;box-shadow:0 2px 10px rgba(0,0,0,0.05);}\n.empty-icon{width:60px;height:60px;margin:0 auto 14px;border-radius:50%;background:#F7F0F3;color:var(--c-primary);display:flex;align-items:center;justify-content:center;font-size:28px;}\n.empty-title{font-size:15px;font-weight:800;color:var(--c-text);line-height:1.5;margin-bottom:6px;}\n.empty-copy{font-size:12px;color:var(--c-text2);line-height:1.6;margin-bottom:18px;}\n.empty-btn{display:inline-flex;align-items:center;justify-content:center;border-radius:12px;background:var(--c-primary);color:#fff;text-decoration:none;font-size:13px;font-weight:800;padding:11px 18px;}\n.shop-card{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);}\n.img-wrap{position:relative;height:120px;}\n.img-bg{position:absolute;inset:0;}\n.bg1{background:linear-gradient(160deg,#5a0e24,#3d0918);}\n.bg2{background:linear-gradient(160deg,#4a0b1e,#2d0712);}\n.bg3{background:linear-gradient(160deg,#3d0918,#250510);}\n.badge-tl{position:absolute;top:8px;left:8px;font-size:10px;font-weight:600;padding:3px 9px;border-radius:5px;display:flex;align-items:center;gap:4px;background:rgba(0,0,0,0.45);color:var(--c-accent);border:1px solid rgba(173,208,54,0.3);}\n.unsave-btn{position:absolute;top:8px;right:8px;width:28px;height:28px;border-radius:50%;background:rgba(0,0,0,0.4);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;}\n.shop-footer{background:var(--c-primary);padding:10px 14px 12px;}\n.shop-name{font-size:15px;font-weight:700;color:#fff;margin-bottom:4px;}\n.shop-loc{font-size:11px;color:rgba(255,255,255,0.65);display:flex;align-items:center;gap:3px;margin-bottom:6px;}\n.shop-bottom{display:flex;justify-content:space-between;align-items:flex-end;}\n.tags{display:flex;gap:5px;flex-wrap:wrap;}\n.tag{font-size:10px;background:rgba(255,255,255,0.15);color:#fff;padding:2px 8px;border-radius:20px;}\n.status-open{background:var(--c-accent);color:#fff;font-size:10px;font-weight:700;padding:4px 12px;border-radius:5px;}\n.status-closed{background:rgba(255,255,255,0.2);color:rgba(255,255,255,0.85);font-size:10px;font-weight:700;padding:4px 10px;border-radius:5px;}"
const markup = "\u003cdiv class=\"page\"\u003e\n\u003cdiv class=\"scroll\"\u003e\n\n\u003cdiv class=\"header\"\u003e\n  \u003cdiv class=\"header-r1\"\u003e\n    \u003cbutton class=\"back-btn\" onclick=\"history.back()\"\u003e\u003csvg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"15 18 9 12 15 6\"/\u003e\u003c/svg\u003e\u003c/button\u003e\n    \u003cspan class=\"header-title\"\u003e\u003cspan data-i18n=\"kedai_disimpan\"\u003eKedai Disimpan\u003c/span\u003e\u003c/span\u003e\n    \u003cspan class=\"count-txt\"\u003e12 kedai\u003c/span\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"shop-list\"\u003e\n\n  \u003cdiv class=\"shop-card\"\u003e\n    \u003cdiv class=\"img-wrap\"\u003e\n      \u003cdiv class=\"img-bg bg1\"\u003e\u003c/div\u003e\n      \u003cdiv class=\"badge-tl\"\u003e\u003csvg width=\"9\" height=\"9\" viewBox=\"0 0 24 24\" fill=\"#ADD036\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e Verified Shop\u003c/div\u003e\n      \u003cbutton class=\"unsave-btn\" onclick=\"unsave(this)\"\u003e\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"#e44\" stroke=\"none\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\u003c/button\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"shop-footer\"\u003e\n      \u003cdiv class=\"shop-name\"\u003eResepi Kak Mila\u003c/div\u003e\n      \u003cdiv class=\"shop-loc\"\u003e\u003csvg width=\"9\" height=\"9\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.65)\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e Taman Desa Baiduri\u003c/div\u003e\n      \u003cdiv class=\"shop-bottom\"\u003e\u003cdiv class=\"tags\"\u003e\u003cspan class=\"tag\"\u003eKuih \u0026 Kek\u003c/span\u003e\u003cspan class=\"tag\"\u003ePastry\u003c/span\u003e\u003c/div\u003e\u003cspan class=\"status-open\"\u003e\u003cspan data-i18n=\"buka\"\u003eBUKA\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"shop-card\"\u003e\n    \u003cdiv class=\"img-wrap\"\u003e\n      \u003cdiv class=\"img-bg bg2\"\u003e\u003c/div\u003e\n      \u003cbutton class=\"unsave-btn\" onclick=\"unsave(this)\"\u003e\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"#e44\" stroke=\"none\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\u003c/button\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"shop-footer\"\u003e\n      \u003cdiv class=\"shop-name\"\u003eDapur Kak Ros\u003c/div\u003e\n      \u003cdiv class=\"shop-loc\"\u003e\u003csvg width=\"9\" height=\"9\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.65)\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e Taman Sri Muda\u003c/div\u003e\n      \u003cdiv class=\"shop-bottom\"\u003e\u003cdiv class=\"tags\"\u003e\u003cspan class=\"tag\"\u003eLauk\u003c/span\u003e\u003cspan class=\"tag\"\u003eMasakan\u003c/span\u003e\u003c/div\u003e\u003cspan class=\"status-closed\"\u003e\u003cspan data-i18n=\"tutup\"\u003eTUTUP\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"shop-card\"\u003e\n    \u003cdiv class=\"img-wrap\"\u003e\n      \u003cdiv class=\"img-bg bg3\"\u003e\u003c/div\u003e\n      \u003cdiv class=\"badge-tl\"\u003e\u003csvg width=\"9\" height=\"9\" viewBox=\"0 0 24 24\" fill=\"#ADD036\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e Verified Shop\u003c/div\u003e\n      \u003cbutton class=\"unsave-btn\" onclick=\"unsave(this)\"\u003e\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"#e44\" stroke=\"none\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\u003c/button\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"shop-footer\"\u003e\n      \u003cdiv class=\"shop-name\"\u003eDapur Budak Gemok\u003c/div\u003e\n      \u003cdiv class=\"shop-loc\"\u003e\u003csvg width=\"9\" height=\"9\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.65)\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e Taman Desa Baiduri\u003c/div\u003e\n      \u003cdiv class=\"shop-bottom\"\u003e\u003cdiv class=\"tags\"\u003e\u003cspan class=\"tag\"\u003eLauk\u003c/span\u003e\u003c/div\u003e\u003cspan class=\"status-open\"\u003e\u003cspan data-i18n=\"buka\"\u003eBUKA\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n\u003c/div\u003e\n\u003c/div\u003e\n\u003c/div\u003e"
const scripts: string[] = ["function unsave(btn) {\n  var card = btn.closest(\u0027.shop-card\u0027);\n  card.style.opacity = \u00270.4\u0027;\n  card.style.pointerEvents = \u0027none\u0027;\n  setTimeout(() =\u003e card.remove(), 400);\n}"]
const externalScripts: string[] = []
const externalStylesheets: string[] = ["https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800\u0026display=swap"]

export default function Page() {
  useEffect(() => {
    let sellers: Seller[] = []
    const supabase = createClient()
    const runtime = window as SavedWindow

    function render() {
      const list = document.querySelector<HTMLElement>('.shop-list')
      const count = document.querySelector<HTMLElement>('.count-txt')

      if (count) count.textContent = `${sellers.length} kedai`
      if (!list) return

      list.classList.toggle('empty', sellers.length === 0)
      list.innerHTML = sellers.length
        ? sellers.map(savedShopCard).join('')
        : `<div class="empty-state">
            <div class="empty-icon">♡</div>
            <div class="empty-title">Belum ada kedai disimpan</div>
            <div class="empty-copy">Simpan kedai kegemaran anda supaya mudah dicari semula.</div>
            <a class="empty-btn" href="/home">Terokai Kedai</a>
          </div>`
    }

    async function loadSaved() {
      const ids = getSavedIds()

      if (!ids.length) {
        sellers = []
        render()
        return
      }

      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('status', 'active')
        .in('id', ids)

      if (error) {
        console.error(error)
        sellers = []
      } else {
        sellers = (data ?? []) as Seller[]
      }

      render()
    }

    runtime.__lokalgoUnsave = (id: string, event?: Event) => {
      event?.stopPropagation()
      const nextIds = getSavedIds().filter((savedId) => savedId !== id)
      setSavedIds(nextIds)
      sellers = sellers.filter((seller) => seller.id !== id)
      render()
    }

    loadSaved().catch(console.error)

    return () => {
      delete runtime.__lokalgoUnsave
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
