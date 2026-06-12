'use client'

import { useEffect } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'
import { createClient } from '@/lib/supabase/client'
import type { Product, Seller } from '@/types/database'

function esc(value: string | number | null | undefined) {
  return String(value ?? '')
    .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;').replaceAll("'", '&#039;')
}

function safeUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const t = url.trim()
  return (t.startsWith('https://') || t.startsWith('http://') || t.startsWith('/')) ? t : null
}

function searchShopCard(seller: Seller, products: Product[], index: number) {
  const sellerProducts = products.filter((product) => product.seller_id === seller.id)
  const tags = Array.from(new Set(sellerProducts.map((product) => product.category))).slice(0, 2)
  const statusClass = seller.is_open ? 'status-open' : 'status-closed'
  const statusText = seller.is_open ? 'BUKA' : 'TUTUP'
  const bgClass = `bg${(index % 3) + 1}`
  const imgUrl = safeUrl(seller.profile_image_url)

  return `<div class="shop-card" onclick="window.location.href='/shop?seller=${esc(seller.id)}'">
    <div class="img-wrap">
      ${imgUrl ? `<img src="${esc(imgUrl)}" alt="" style="width:100%;height:100%;object-fit:cover;">` : `<div class="img-bg ${bgClass}"></div>`}
      ${seller.badge === 'verified_seller' ? '<div class="badge-tl">Verified Shop</div>' : ''}
      <div class="badge-tr"><div class="icon-btn">♡</div></div>
    </div>
    <div class="shop-footer">
      <div class="shop-name">${esc(seller.shop_name)}</div>
      <div class="shop-loc">${esc(seller.taman_name)}${seller.kawasan ? `, ${esc(seller.kawasan)}` : ''}</div>
      <div class="shop-bottom">
        <div><div class="cat-tags">${(tags.length ? tags : [(seller.badge ?? '').replaceAll('_', ' ')]).map((tag) => `<span class="tag">${esc(tag)}</span>`).join('')}</div></div>
        <span class="${statusClass}">${statusText}</span>
      </div>
    </div>
  </div>`
}

const styles = "*{box-sizing:border-box;margin:0;padding:0;}\nbody{background:#1a1a2e;display:flex;justify-content:center;padding:20px;font-family:-apple-system,BlinkMacSystemFont,\u0027Segoe UI\u0027,sans-serif;min-height:100vh;}\n.phone{width:375px;background:#F5F5F5;border-radius:40px;border:8px solid #111;box-shadow:0 24px 80px rgba(0,0,0,0.5);overflow:hidden;}\n.scroll-area{height:812px;overflow-y:auto;}\n.scroll-area::-webkit-scrollbar{display:none;}\n.header{background:#7B1533;padding:14px 20px 14px;}\n.header-top{display:flex;align-items:center;gap:10px;margin-bottom:10px;}\n.back-btn{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}\n.search-active{flex:1;background:#fff;border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:8px;}\n.search-active input{border:none;background:transparent;font-size:14px;color:#111;outline:none;width:100%;}\n.clear-btn{width:18px;height:18px;background:#ddd;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}\n.result-count{font-size:12px;color:rgba(255,255,255,0.7);padding:0 2px;}\n.filter-row{background:#fff;padding:10px 20px;display:flex;gap:8px;overflow-x:auto;border-bottom:1px solid #eee;}\n.filter-row::-webkit-scrollbar{display:none;}\n.pill{padding:6px 14px;border-radius:20px;border:1.5px solid #ddd;font-size:12px;color:#666;background:#fff;white-space:nowrap;font-weight:500;cursor:pointer;flex-shrink:0;}\n.pill.active{background:#7B1533;border-color:#7B1533;color:#fff;}\n.result-section{padding:12px 20px 6px;font-size:12px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.5px;}\n.shop-list{padding:0 20px 24px;display:flex;flex-direction:column;gap:10px;}\n.shop-card{background:#fff;border-radius:14px;overflow:hidden;border:1px solid #eee;box-shadow:0 2px 6px rgba(0,0,0,0.05);}\n.img-wrap{position:relative;height:120px;}\n.img-bg{position:absolute;inset:0;}\n.bg1{background:linear-gradient(160deg,#6b1128,#3d0918);}\n.bg2{background:linear-gradient(160deg,#7B1533,#4a0b1e);}\n.bg3{background:linear-gradient(160deg,#5a0e24,#350812);}\n.badge-tl{position:absolute;top:8px;left:8px;font-size:10px;font-weight:600;padding:3px 9px;border-radius:5px;display:flex;align-items:center;gap:4px;background:rgba(0,0,0,0.5);color:#8DC63F;border:1px solid rgba(141,198,63,0.35);}\n.badge-tr{position:absolute;top:8px;right:8px;display:flex;gap:5px;}\n.icon-btn{width:26px;height:26px;border-radius:50%;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;}\n.shop-footer{padding:10px 12px 12px;background:#7B1533;}\n.shop-name{font-size:14px;font-weight:700;color:#fff;margin-bottom:4px;}\n.shop-loc{font-size:11px;color:rgba(255,255,255,0.65);display:flex;align-items:center;gap:3px;margin-bottom:6px;}\n.shop-bottom{display:flex;justify-content:space-between;align-items:flex-end;}\n.cat-tags{display:flex;gap:4px;flex-wrap:wrap;}\n.tag{font-size:10px;background:rgba(255,255,255,0.15);color:#fff;padding:2px 8px;border-radius:20px;font-weight:500;}\n.cod-row{display:flex;align-items:center;gap:3px;margin-top:4px;}\n.cod-txt{font-size:10px;color:rgba(255,255,255,0.55);}\n.status-open{background:#8DC63F;color:#fff;font-size:10px;font-weight:700;padding:4px 12px;border-radius:5px;}\n.status-closed{background:rgba(255,255,255,0.2);color:rgba(255,255,255,0.8);font-size:10px;font-weight:700;padding:4px 10px;border-radius:5px;}\n.no-result{padding:40px 16px;text-align:center;}\n.no-result-icon{width:60px;height:60px;background:#f0f0f0;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;}\n.no-result-title{font-size:15px;font-weight:700;color:#111;margin-bottom:6px;}\n.no-result-sub{font-size:13px;color:#aaa;line-height:1.6;}"
const markup = "\u003cdiv class=\"phone\"\u003e\n \u003cdiv class=\"scroll-area\"\u003e\n\n  \u003cdiv class=\"header\"\u003e\n   \u003cdiv class=\"header-top\"\u003e\n    \u003cdiv class=\"back-btn\"\u003e\u003csvg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"15 18 9 12 15 6\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"search-active\"\u003e\n     \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#aaa\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"11\" cy=\"11\" r=\"8\"/\u003e\u003cline x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/\u003e\u003c/svg\u003e\n     \u003cinput type=\"text\" value=\"kuih talam\"\u003e\n     \u003cdiv class=\"clear-btn\"\u003e\u003csvg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#888\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cline x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/\u003e\u003cline x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003c/div\u003e\n   \u003c/div\u003e\n   \u003cdiv class=\"result-count\"\u003e3 kedai ditemui untuk \"kuih talam\"\u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"filter-row\"\u003e\n   \u003cdiv class=\"pill active\"\u003eSemua\u003c/div\u003e\n   \u003cdiv class=\"pill\"\u003e● Buka Sekarang\u003c/div\u003e\n   \u003cdiv class=\"pill\"\u003e★ Verified\u003c/div\u003e\n   \u003cdiv class=\"pill\"\u003eCOD\u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cdiv class=\"result-section\"\u003eKedai di Kawasan Anda\u003c/div\u003e\n  \u003cdiv class=\"shop-list\"\u003e\n\n   \u003cdiv class=\"shop-card\"\u003e\n    \u003cdiv class=\"img-wrap\"\u003e\n     \u003cdiv class=\"img-bg bg1\"\u003e\u003c/div\u003e\n     \u003cdiv class=\"badge-tl\"\u003e\u003csvg width=\"9\" height=\"9\" viewBox=\"0 0 24 24\" fill=\"#8DC63F\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e Verified Shop\u003c/div\u003e\n     \u003cdiv class=\"badge-tr\"\u003e\n      \u003cdiv class=\"icon-btn\"\u003e\u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n     \u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"shop-footer\"\u003e\n     \u003cdiv class=\"shop-name\"\u003eResepi Kak Mila\u003c/div\u003e\n     \u003cdiv class=\"shop-loc\"\u003e\u003csvg width=\"9\" height=\"9\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.65)\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e Taman Desa Baiduri\u003c/div\u003e\n     \u003cdiv class=\"shop-bottom\"\u003e\n      \u003cdiv\u003e\u003cdiv class=\"cat-tags\"\u003e\u003cspan class=\"tag\"\u003eKuih \u0026 Kek\u003c/span\u003e\u003cspan class=\"tag\"\u003ePastry\u003c/span\u003e\u003c/div\u003e\u003cdiv class=\"cod-row\"\u003e\u003csvg width=\"14\" height=\"11\" viewBox=\"0 0 36 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.55)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"8\" cy=\"18\" r=\"4\"/\u003e\u003ccircle cx=\"28\" cy=\"18\" r=\"4\"/\u003e\u003cpath d=\"M12 18h12\"/\u003e\u003cpath d=\"M8 14V8l6-4h6l4 6h-4l-2-4h-3l-4 4H8z\"/\u003e\u003cpath d=\"M20 10l2 4\"/\u003e\u003c/svg\u003e\u003cspan class=\"cod-txt\"\u003e\u003cspan data-i18n=\"cod_available\"\u003eCOD Available\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\u003c/div\u003e\n      \u003cspan class=\"status-open\"\u003e\u003cspan data-i18n=\"buka\"\u003eBUKA\u003c/span\u003e\u003c/span\u003e\n     \u003c/div\u003e\n    \u003c/div\u003e\n   \u003c/div\u003e\n\n   \u003cdiv class=\"shop-card\"\u003e\n    \u003cdiv class=\"img-wrap\"\u003e\n     \u003cdiv class=\"img-bg bg2\"\u003e\u003c/div\u003e\n     \u003cdiv class=\"badge-tl\"\u003e\u003csvg width=\"9\" height=\"9\" viewBox=\"0 0 24 24\" fill=\"#8DC63F\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e Verified Shop\u003c/div\u003e\n     \u003cdiv class=\"badge-tr\"\u003e\n      \u003cdiv class=\"icon-btn\"\u003e\u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n     \u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"shop-footer\"\u003e\n     \u003cdiv class=\"shop-name\"\u003eDapur Mak Teh\u003c/div\u003e\n     \u003cdiv class=\"shop-loc\"\u003e\u003csvg width=\"9\" height=\"9\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.65)\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e Taman Desa Baiduri\u003c/div\u003e\n     \u003cdiv class=\"shop-bottom\"\u003e\n      \u003cdiv\u003e\u003cdiv class=\"cat-tags\"\u003e\u003cspan class=\"tag\"\u003eKuih \u0026 Kek\u003c/span\u003e\u003cspan class=\"tag\"\u003eLauk\u003c/span\u003e\u003c/div\u003e\u003cdiv class=\"cod-row\"\u003e\u003csvg width=\"14\" height=\"11\" viewBox=\"0 0 36 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.55)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"8\" cy=\"18\" r=\"4\"/\u003e\u003ccircle cx=\"28\" cy=\"18\" r=\"4\"/\u003e\u003cpath d=\"M12 18h12\"/\u003e\u003cpath d=\"M8 14V8l6-4h6l4 6h-4l-2-4h-3l-4 4H8z\"/\u003e\u003cpath d=\"M20 10l2 4\"/\u003e\u003c/svg\u003e\u003cspan class=\"cod-txt\"\u003e\u003cspan data-i18n=\"cod_available\"\u003eCOD Available\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\u003c/div\u003e\n      \u003cspan class=\"status-open\"\u003e\u003cspan data-i18n=\"buka\"\u003eBUKA\u003c/span\u003e\u003c/span\u003e\n     \u003c/div\u003e\n    \u003c/div\u003e\n   \u003c/div\u003e\n\n   \u003cdiv class=\"shop-card\"\u003e\n    \u003cdiv class=\"img-wrap\"\u003e\n     \u003cdiv class=\"img-bg bg3\"\u003e\u003c/div\u003e\n     \u003cdiv class=\"badge-tr\"\u003e\n      \u003cdiv class=\"icon-btn\"\u003e\u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n     \u003c/div\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"shop-footer\"\u003e\n     \u003cdiv class=\"shop-name\"\u003eKuih Muih Kak Zah\u003c/div\u003e\n     \u003cdiv class=\"shop-loc\"\u003e\u003csvg width=\"9\" height=\"9\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.65)\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e Taman Sri Muda\u003c/div\u003e\n     \u003cdiv class=\"shop-bottom\"\u003e\n      \u003cdiv\u003e\u003cdiv class=\"cat-tags\"\u003e\u003cspan class=\"tag\"\u003eKuih \u0026 Kek\u003c/span\u003e\u003c/div\u003e\u003cdiv class=\"cod-row\"\u003e\u003csvg width=\"14\" height=\"11\" viewBox=\"0 0 36 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.55)\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"8\" cy=\"18\" r=\"4\"/\u003e\u003ccircle cx=\"28\" cy=\"18\" r=\"4\"/\u003e\u003cpath d=\"M12 18h12\"/\u003e\u003cpath d=\"M8 14V8l6-4h6l4 6h-4l-2-4h-3l-4 4H8z\"/\u003e\u003cpath d=\"M20 10l2 4\"/\u003e\u003c/svg\u003e\u003cspan class=\"cod-txt\"\u003e\u003cspan data-i18n=\"cod_available\"\u003eCOD Available\u003c/span\u003e\u003c/span\u003e\u003c/div\u003e\u003c/div\u003e\n      \u003cspan class=\"status-closed\"\u003e\u003cspan data-i18n=\"tutup\"\u003eTUTUP\u003c/span\u003e\u003c/span\u003e\n     \u003c/div\u003e\n    \u003c/div\u003e\n   \u003c/div\u003e\n\n  \u003c/div\u003e\n \u003c/div\u003e\n\u003c/div\u003e"
const scripts: string[] = []
const externalScripts: string[] = []
const externalStylesheets: string[] = []
const uxStyles = `
.back-btn,.clear-btn,.icon-btn{min-width:44px;min-height:44px}
.pill{min-height:44px;display:flex;align-items:center;font-weight:700}
.shop-card{cursor:pointer}
`

export default function Page() {
  useEffect(() => {
    const supabase = createClient()
    const params = new URLSearchParams(window.location.search)
    const input = document.querySelector<HTMLInputElement>('.search-active input')
    const list = document.querySelector<HTMLElement>('.shop-list')
    const count = document.querySelector<HTMLElement>('.result-count')
    const filterRow = document.querySelector<HTMLElement>('.filter-row')
    let selectedCategory = params.get('category') || 'Semua'
    let products: Product[] = []

    if (input) {
      input.value = params.get('q') || ''
    }

    async function loadCategories() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('status', 'approved')
        .or('is_available.eq.true,is_preorder.eq.true')

      products = (data ?? []) as Product[]
      const categories = ['Semua', ...Array.from(new Set(products.map((product) => product.category).filter(Boolean))).slice(0, 8)]

      if (filterRow) {
        filterRow.innerHTML = categories
          .map((category) => `<button type="button" class="pill ${category === selectedCategory ? 'active' : ''}" data-category="${category}">${category}</button>`)
          .join('')

        filterRow.querySelectorAll<HTMLElement>('.pill').forEach((pill) => {
          pill.addEventListener('click', () => {
            selectedCategory = pill.dataset.category || 'Semua'
            filterRow.querySelectorAll('.pill').forEach((item) => item.classList.remove('active'))
            pill.classList.add('active')
            void search()
          })
        })
      }
    }

    async function search() {
      const query = input?.value.trim() || ''
      let sellerIdsByCategory: string[] | null = null

      if (selectedCategory !== 'Semua') {
        sellerIdsByCategory = products
          .filter((product) => product.category === selectedCategory)
          .map((product) => product.seller_id)

        if (!sellerIdsByCategory.length) {
          if (list) list.innerHTML = '<div class="no-result"><div class="no-result-title">Tiada kedai ditemui</div><div class="no-result-sub">Cuba kategori lain.</div></div>'
          if (count) count.textContent = `0 kedai ditemui`
          return
        }
      }

      let request = supabase
        .from('sellers')
        .select('*')
        .eq('status', 'active')
        .eq('is_open', true)
        .order('created_at', { ascending: false })

      if (query) {
        // Strip PostgREST filter syntax chars to prevent filter injection
        const safeQuery = query.replace(/[(),.]/g, '')
        request = request.or(`taman_name.ilike.%${safeQuery}%,kawasan.ilike.%${safeQuery}%,shop_name.ilike.%${safeQuery}%`)
      }

      if (sellerIdsByCategory) {
        request = request.in('id', sellerIdsByCategory)
      }

      const { data, error } = await request

      if (error) {
        console.error(error)
        if (list) list.innerHTML = '<div class="no-result"><div class="no-result-title">Carian gagal</div><div class="no-result-sub">Sila cuba semula.</div></div>'
        return
      }

      const sellers = (data ?? []) as Seller[]

      if (count) {
        count.textContent = query
          ? `${sellers.length} kedai ditemui untuk "${query}"`
          : `${sellers.length} kedai ditemui`
      }

      if (!list) return

      list.innerHTML = sellers.length
        ? sellers.map((seller, index) => searchShopCard(seller, products, index)).join('')
        : '<div class="no-result"><div class="no-result-icon"></div><div class="no-result-title">Tiada kedai ditemui</div><div class="no-result-sub">Cuba nama taman, kawasan atau kategori lain.</div></div>'
    }

    input?.addEventListener('input', () => {
      window.clearTimeout(Number(input.dataset.searchTimer || 0))
      const timer = window.setTimeout(() => void search(), 250)
      input.dataset.searchTimer = String(timer)
    })

    document.querySelector<HTMLElement>('.clear-btn')?.addEventListener('click', () => {
      if (input) input.value = ''
      void search()
    })

    document.querySelector<HTMLElement>('.back-btn')?.addEventListener('click', () => {
      window.location.href = '/home'
    })

    loadCategories().then(search).catch(console.error)
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
