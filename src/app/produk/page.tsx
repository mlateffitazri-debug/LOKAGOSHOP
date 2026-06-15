'use client'

import { useEffect, useState } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'
import { LoginPromptModal } from '@/components/LoginPromptModal'
import { createClient } from '@/lib/supabase/client'
import type { Product, Seller } from '@/types/database'

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function normalizeWhatsapp(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('60')) return digits
  if (digits.startsWith('0')) return `6${digits}`
  return digits
}

function setHtml(selector: string, html: string) {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) element.innerHTML = html
}

function setText(selector: string, text: string | number) {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) element.textContent = String(text)
}

function statusBadge(product: Product) {
  if (product.is_preorder) return { className: 'badge-preorder', label: 'Pra Tempahan' }
  if (product.is_available) return { className: 'badge-avail', label: 'Tersedia' }
  return { className: 'badge-unavail', label: 'Tidak Tersedia' }
}

type ProductRow = Product & Record<string, unknown>

type BuyerProfile = {
  name: string | null
  whatsapp_number: string | null
  address_rumah: string | null
  address_pejabat: string | null
}

type CartItem = {
  sellerId: string
  sellerName: string
  sellerWhatsapp: string
  shopUrl: string
  productId: string
  name: string
  unit: string
  price: number
  qty: number
  pickupDate: string | null
  isPreorder: boolean
}

type ProductContext = Pick<CartItem, 'sellerId' | 'sellerName' | 'sellerWhatsapp' | 'shopUrl' | 'productId' | 'name' | 'unit' | 'price'>

const CART_KEY = 'lokalgo_cart_v1'

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

function money(value: number) {
  return value.toFixed(2)
}

function readCart() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is CartItem => Boolean(item?.sellerId && item?.productId)) : []
  } catch {
    return []
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items))
}

function cartSubtotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0)
}

function renderCartFlow(runtime: ProductWindow, buyer: BuyerProfile | null, trackWhatsAppClick: () => void) {
  const currentSellerId = runtime.__lokalgoProductContext?.sellerId
  const cart = readCart().filter((item) => !currentSellerId || item.sellerId === currentSellerId)
  const cartBar = document.getElementById('cartBar')
  const orderPreview = document.getElementById('orderPreview')
  const list = document.getElementById('orderItemsList')
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0)

  if (!cartBar || !orderPreview || !list) return

  if (cart.length === 0) {
    cartBar.classList.remove('visible')
    orderPreview.style.display = 'none'
    list.innerHTML = ''
    return
  }

  cartBar.classList.add('visible')
  orderPreview.style.display = 'block'
  setText('#cartCount', `${totalQty} item dalam pesanan`)
  setText('#cartPreview', `Subtotal RM${money(cartSubtotal(cart))}`)
  list.innerHTML = cart.map((item, idx) => `
    <div class="order-item">
      <div>
        <div class="order-item-name">${escapeHtml(item.name)}</div>
        <div class="order-item-qty">x${item.qty} - RM${money(item.price * item.qty)} (RM${money(item.price)}/${escapeHtml(item.unit)})</div>
      </div>
      <button class="remove-item" onclick="removeItem(${idx})" aria-label="Remove item">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  `).join('')

  runtime.__lokalgoCartQty = (index, delta) => {
    const next = readCart()
    const target = cart[index]
    const actualIndex = next.findIndex((item) => item.productId === target?.productId && item.pickupDate === target?.pickupDate && item.isPreorder === target?.isPreorder)
    if (actualIndex < 0) return
    next[actualIndex].qty = Math.max(1, next[actualIndex].qty + delta)
    writeCart(next)
    renderCartFlow(runtime, buyer, trackWhatsAppClick)
  }

  runtime.__lokalgoCartRemove = (index) => {
    const target = cart[index]
    const next = readCart().filter((item) => !(item.productId === target?.productId && item.pickupDate === target?.pickupDate && item.isPreorder === target?.isPreorder))
    writeCart(next)
    renderCartFlow(runtime, buyer, trackWhatsAppClick)
  }

  runtime.__lokalgoCloseCart = () => {
    document.getElementById('cartReviewOverlay')?.remove()
  }

  runtime.__lokalgoCartCheckout = (method) => {
    const checkoutItems = readCart().filter((item) => item.sellerId === cart[0]?.sellerId)
    if (checkoutItems.length === 0) return
    const seller = checkoutItems[0]
    const address = buyer?.address_rumah?.trim() || null

    if (method === 'cod' && !address) {
      alert('Sila isi alamat penghantaran dahulu.')
      window.location.href = '/profile/address'
      return
    }

    const sellerPhone = normalizeWhatsapp(seller.sellerWhatsapp)
    if (!sellerPhone || sellerPhone.length < 9) {
      alert('Nombor WhatsApp penjual belum tersedia.')
      return
    }

    const isAllPreorder = checkoutItems.every((i) => i.isPreorder)
    const total = cartSubtotal(checkoutItems)
    const now = new Date()
    const dateStr = new Intl.DateTimeFormat('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }).format(now)
    const timeStr = new Intl.DateTimeFormat('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: true }).format(now)

    const lines: string[] = ['Assalamualaikum!', '', isAllPreorder ? 'Saya nak buat pre-order:' : 'Saya nak tempah:']
    for (const i of checkoutItems) {
      const pricePart = i.price > 0 ? ` = RM ${money(i.price)} x ${i.qty}` : ''
      lines.push(`${i.qty} x ${i.name}${pricePart}`)
      if (i.isPreorder && i.pickupDate) {
        const pickup = new Date(`${i.pickupDate}T00:00:00`).toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        lines.push(`  Tarikh pickup: ${pickup}`)
      }
    }
    lines.push('', '---', '', `Jumlah RM ${money(total)}`, '', '---', '')
    if (method === 'cod' && address) {
      lines.push('Dan tempahan ini dihantar di alamat:', address, '')
    }
    if (isAllPreorder) {
      lines.push('Boleh saya tahu tarikh ready, cara bayaran dan anggaran delivery?')
    } else if (method === 'cod') {
      lines.push('Boleh berikan saya harga tambahan untuk delivery?')
    } else {
      lines.push('Kaedah: Self Pickup (Ambil sendiri di lokasi anda)')
    }
    lines.push('', '---', '', 'Pesanan dari: https://lokalgo.app', `Masa: ${timeStr}`, `Tarikh: ${dateStr}`)
    const msg = lines.join('\n')

    trackWhatsAppClick()
    window.localStorage.removeItem(CART_KEY)

    // Save pending review — shown when user returns from WhatsApp
    window.localStorage.setItem('lokalgo_pending_review', JSON.stringify({
      sellerId: seller.sellerId,
      sellerName: seller.sellerName,
    }))
    const onReturn = () => {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', onReturn)
        window.setTimeout(() => { runtime.__showReviewPrompt?.() }, 600)
      }
    }
    document.addEventListener('visibilitychange', onReturn)

    // Use window.open so iOS opens WhatsApp app directly instead of navigating away
    window.open(`https://wa.me/${sellerPhone}?text=${encodeURIComponent(msg)}`, '_blank')
  }

  runtime.sendWhatsApp = () => {
    document.getElementById('cartReviewOverlay')?.remove()
    const rows = cart.map((item, index) => `
      <div style="display:grid;grid-template-columns:1fr auto;gap:10px;padding:10px 0;border-bottom:1px solid #f0f0f0;">
        <div>
          <div style="font-size:13px;font-weight:700;color:#111;">${escapeHtml(item.name)}</div>
          <div style="font-size:12px;color:#666;margin-top:2px;">RM${money(item.price)}/${escapeHtml(item.unit)} · Subtotal RM${money(item.price * item.qty)}</div>
        </div>
        <div style="display:flex;align-items:center;gap:6px;">
          <button onclick="window.__lokalgoCartQty(${index},-1)" style="width:28px;height:28px;border:1px solid #ddd;background:#fff;border-radius:8px;font-size:16px;cursor:pointer;line-height:1;">-</button>
          <strong style="min-width:18px;text-align:center;font-size:14px;">${item.qty}</strong>
          <button onclick="window.__lokalgoCartQty(${index},1)" style="width:28px;height:28px;border:1px solid #ddd;background:#fff;border-radius:8px;font-size:16px;cursor:pointer;line-height:1;">+</button>
          <button onclick="window.__lokalgoCartRemove(${index})" style="width:28px;height:28px;border:0;background:#f5f5f5;border-radius:8px;color:#999;cursor:pointer;font-size:16px;line-height:1;">×</button>
        </div>
      </div>
    `).join('')

    document.body.insertAdjacentHTML('beforeend', `
      <div id="cartReviewOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:10000;display:flex;align-items:flex-end;justify-content:center;">
        <div style="background:#fff;width:100%;max-width:430px;border-radius:20px 20px 0 0;padding:18px 18px 24px;max-height:88vh;overflow:auto;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <div style="font-size:15px;font-weight:800;color:#111;">Pesanan Anda</div>
            <button onclick="window.__lokalgoCloseCart()" style="width:32px;height:32px;border:0;border-radius:10px;background:#f5f5f5;color:#555;font-size:18px;cursor:pointer;line-height:1;">×</button>
          </div>
          ${rows}
          <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:14px;font-weight:800;color:#111;">
            <span>Subtotal</span><span>RM${money(cartSubtotal(cart))}</span>
          </div>
          <div style="margin:4px 0 16px;">
            <div style="font-size:12px;font-weight:700;color:#555;margin-bottom:8px;">Kaedah Penghantaran</div>
            <label id="methodLabelPickup" style="display:flex;align-items:center;gap:12px;padding:12px;border:1.5px solid #7B1533;border-radius:12px;margin-bottom:8px;cursor:pointer;">
              <input type="radio" name="deliveryMethod" value="pickup" style="width:18px;height:18px;accent-color:#7B1533;" checked onchange="document.getElementById('methodLabelPickup').style.borderColor='#7B1533';document.getElementById('methodLabelCod').style.borderColor='#eee'">
              <div style="width:36px;height:36px;background:#EAF5D8;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A7C10" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div><div style="font-size:13px;font-weight:700;color:#111;">Self Collect</div><div style="font-size:11px;color:#888;">Ambil sendiri di lokasi seller</div></div>
            </label>
            <label id="methodLabelCod" style="display:flex;align-items:center;gap:12px;padding:12px;border:1.5px solid #eee;border-radius:12px;cursor:pointer;">
              <input type="radio" name="deliveryMethod" value="cod" style="width:18px;height:18px;accent-color:#7B1533;" onchange="document.getElementById('methodLabelCod').style.borderColor='#7B1533';document.getElementById('methodLabelPickup').style.borderColor='#eee'">
              <div style="width:36px;height:36px;background:#fff0f3;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B1533" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              </div>
              <div><div style="font-size:13px;font-weight:700;color:#111;">COD — Penghantaran</div><div style="font-size:11px;color:#888;">Hantar ke alamat anda</div></div>
            </label>
          </div>
          <button onclick="var m=document.querySelector('input[name=deliveryMethod]:checked');window.__lokalgoCartCheckout(m?m.value:'pickup')" style="width:100%;border:0;background:#25D366;color:#fff;border-radius:14px;padding:15px;font-size:15px;font-weight:800;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.528 5.855L0 24l6.335-1.507C8.05 23.453 9.99 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.638-.518-5.145-1.416l-.369-.219-3.76.895.942-3.655-.24-.378A9.933 9.933 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            Hantar Pesanan via WhatsApp
          </button>
        </div>
      </div>
    `)
  }
}

function renderGallery(images: string[]) {
  if (images.length === 0) return

  setHtml('#galleryMain', `<img class="gallery-img" src="${escapeHtml(images[0])}" alt="">
    <div class="gallery-counter" id="galleryCounter">1 / ${images.length}</div>
    <div class="gallery-nav">
      <button class="nav-btn" onclick="changeSlide(-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
      <button class="nav-btn" onclick="changeSlide(1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
    </div>
    <div class="gallery-dots" id="galleryDots">${images.map((_, index) => `<div class="dot${index === 0 ? ' active' : ''}"></div>`).join('')}</div>`)
  setHtml('#thumbsRow', images.map((image, index) => `<div class="thumb${index === 0 ? ' active' : ''}" onclick="goSlide(${index})"><img src="${escapeHtml(image)}" alt=""></div>`).join(''))
}

type ProductWindow = Window & {
  PREORDER_MIN?: number
  SHOP_NAME?: string
  WA_NUMBER?: string
  PRODUK_NAME?: string
  PICKUP_INSTRUCTION?: string
  totalSlides?: number
  __lokalgoImages?: string[]
  __lokalgoProductContext?: ProductContext
  __lokalgoBuyerProfile?: BuyerProfile | null
  __lokalgoCartQty?: (index: number, delta: number) => void
  __lokalgoCartRemove?: (index: number) => void
  __lokalgoCartCheckout?: (method: 'pickup' | 'cod') => void
  __lokalgoCloseCart?: () => void
  __showReviewPrompt?: () => void
  addToOrder?: () => void | Promise<void>
  removeItem?: (index: number) => void
  updateCartUI?: () => void
  sendWhatsApp?: () => void
}

const styles = ":root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-green:#25D366;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}\nbody{background:#0a0a0a;min-height:100vh;font-family:\u0027Plus Jakarta Sans\u0027,-apple-system,sans-serif;font-size:14px;color:var(--c-text);}\n.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;position:relative;}\n@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}\n@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}\n.scroll{height:100dvh;overflow-y:auto;padding-bottom:160px;}.scroll::-webkit-scrollbar{display:none;}\n\n/* HEADER */\n.header{background:var(--c-primary);padding:14px 20px 12px;}\n.header-r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;}\n.header-sub{font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:10px;}\n.header-r2{display:flex;gap:8px;align-items:center;}\n.back-btn{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}\n.header-r1-left{display:flex;align-items:center;gap:10px;}\n.sokong-btn{background:rgba(255,255,255,0.15);border:none;border-radius:20px;padding:6px 12px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;}\n.search-wrap{flex:1;background:rgba(255,255,255,0.92);border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:8px;}\n.search-wrap span{font-size:13px;color:#aaa;}\n.lang-btn{background:rgba(255,255,255,0.15);border:none;border-radius:8px;padding:8px 10px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;}\n\n/* IMAGE GALLERY */\n.gallery{background:#000;position:relative;}\n.gallery-main{width:100%;height:260px;background:#F5F5F5;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;}\n.gallery-img{width:100%;height:260px;object-fit:cover;display:block;}\n.gallery-placeholder{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#CCCCCC;}\n.gallery-placeholder span{font-size:12px;}\n.gallery-dots{position:absolute;bottom:10px;left:50%;transform:translateX(-50%);display:flex;gap:6px;}\n.dot{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.4);}\n.dot.active{background:#fff;width:18px;border-radius:3px;}\n.gallery-counter{position:absolute;top:12px;right:12px;background:rgba(0,0,0,0.5);color:#fff;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;}\n.gallery-nav{position:absolute;top:50%;transform:translateY(-50%);width:100%;display:flex;justify-content:space-between;padding:0 8px;pointer-events:none;}\n.nav-btn{width:32px;height:32px;background:rgba(0,0,0,0.4);border-radius:50%;display:flex;align-items:center;justify-content:center;pointer-events:all;cursor:pointer;border:none;}\n\n/* THUMBNAILS */\n.thumbs{background:#1a1a1a;padding:8px 16px;display:flex;gap:8px;overflow-x:auto;}\n.thumbs::-webkit-scrollbar{display:none;}\n.thumb{width:52px;height:52px;border-radius:8px;background:rgba(255,255,255,0.1);flex-shrink:0;cursor:pointer;border:2px solid transparent;display:flex;align-items:center;justify-content:center;overflow:hidden;}\n.thumb.active{border-color:#ADD036;}\n.thumb img{width:100%;height:100%;object-fit:cover;}\n\n/* PRODUK INFO */\n.produk-info-section{background:#fff;padding:16px;border-bottom:1px solid #eee;margin-bottom:1px;}\n.produk-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;}\n.produk-name{font-size:20px;font-weight:800;color:var(--c-text);letter-spacing:-0.3px;}\n.produk-status-badge{font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap;}\n.badge-avail{background:#EAF5D8;color:#4A7C10;}\n.badge-unavail{background:#f5f5f5;color:#aaa;}\n.badge-preorder{background:#FFF8E1;color:#856404;}\n.produk-shop{font-size:12px;color:var(--c-text3);display:flex;align-items:center;gap:4px;margin-bottom:10px;}\n.verified-mini{color:var(--c-accent);font-size:11px;font-weight:600;}\n.produk-price{font-size:22px;font-weight:800;color:var(--c-primary);margin-bottom:10px;}\n.produk-desc-full{font-size:13px;color:var(--c-text2);line-height:1.6;}\n\n/* VARIETY */\n.variety-section{background:#fff;padding:16px;border-bottom:1px solid #eee;margin-bottom:1px;}\n.section-label{font-size:13px;font-weight:700;color:var(--c-text);margin-bottom:10px;}\n.variety-tags{display:flex;gap:8px;flex-wrap:wrap;}\n.variety-tag{padding:6px 16px;min-height:40px;border-radius:999px;border:1px solid #ddd;font-size:12px;color:#1E1E1E;background:#fff;font-weight:500;cursor:pointer;transition:all 0.15s;}\n.variety-tag.active{background:var(--c-primary);border-color:var(--c-primary);color:#fff;}\n\n/* ORDER TYPE BUTTONS */\n.order-type-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:7px;padding:11px 10px;border-radius:12px;border:2px solid var(--c-border);background:#fff;font-size:13px;font-weight:600;color:var(--c-text3);font-family:inherit;cursor:pointer;transition:all 0.15s;}\n.order-type-btn.active{border-color:var(--c-primary);background:#fff5f7;color:var(--c-primary);}\n.order-type-btn:first-child.active{border-color:var(--c-primary);color:var(--c-primary);}\n.order-type-btn:last-child.active{border-color:#856404;background:#FFFDE7;color:#856404;}\n\n/* QUANTITY + ADD TO ORDER */\n.order-section{background:#fff;padding:16px;border-bottom:1px solid #eee;margin-bottom:1px;}\n.qty-row{display:flex;align-items:center;justify-content:space-between;}\n.qty-label{font-size:13px;font-weight:700;color:var(--c-text);}\n.qty-control{display:flex;align-items:center;gap:0;}\n.qty-btn{width:36px;height:36px;border:1.5px solid var(--c-border);background:#fff;font-size:18px;font-weight:600;color:var(--c-primary);cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;transition:all 0.15s;}\n.qty-btn:first-child{border-radius:10px 0 0 10px;}\n.qty-btn:last-child{border-radius:0 10px 10px 0;}\n.qty-btn:hover{background:#f5f5f5;}\n.qty-num{width:48px;height:36px;border:1.5px solid var(--c-border);border-left:none;border-right:none;background:#fff;text-align:center;font-size:16px;font-weight:700;color:var(--c-text);font-family:inherit;outline:none;}\n.add-order-btn{width:100%;margin-top:14px;background:linear-gradient(180deg,var(--c-primary-lt) 0%,var(--c-primary-dark) 100%);border:none;border-radius:14px;padding:15px 20px;display:flex;align-items:center;justify-content:center;gap:10px;color:#fff;font-size:15px;font-weight:700;font-family:inherit;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 1px 0 rgba(255,255,255,0.16) inset,0 -1px 0 rgba(0,0,0,0.2) inset,0 6px 20px rgba(123,21,51,0.45);transition:transform 0.12s;}\n.add-order-btn::after{content:\u0027\u0027;position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.12) 0%,transparent 100%);border-radius:14px 14px 0 0;pointer-events:none;}\n.add-order-btn:active{transform:scale(0.985);}\n.add-order-btn.added{background:linear-gradient(180deg,#5a9e2f 0%,#3d7520 100%);box-shadow:0 1px 0 rgba(255,255,255,0.16) inset,0 6px 20px rgba(61,117,32,0.45);}\n\n/* PRE-ORDER SECTION */\n.preorder-section{background:#fff;padding:16px;border-bottom:1px solid #eee;margin-bottom:1px;}\n.preorder-banner{background:linear-gradient(135deg,#856404,#a07800);border-radius:12px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:center;gap:10px;}\n.preorder-icon{width:36px;height:36px;background:rgba(255,255,255,0.15);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}\n.preorder-info{flex:1;}\n.preorder-title{font-size:13px;font-weight:700;color:#fff;margin-bottom:2px;}\n.preorder-min{font-size:11px;color:rgba(255,255,255,0.8);}\n.preorder-fields{display:flex;flex-direction:column;gap:10px;}\n.preorder-field{display:flex;flex-direction:column;gap:6px;}\n.preorder-field-label{font-size:12px;font-weight:600;color:var(--c-text2);display:flex;align-items:center;gap:6px;}\n.date-input{width:100%;border:1.5px solid var(--c-border);border-radius:10px;padding:11px 14px;font-size:14px;color:var(--c-text);outline:none;font-family:inherit;background:#fafafa;transition:border 0.2s;}\n.date-input:focus{border-color:#856404;}\n.date-hint{font-size:11px;color:var(--c-hint);display:flex;align-items:center;gap:4px;}\n.deposit-note{background:#FFF8E1;border:1px solid #FFE082;border-radius:10px;padding:10px 12px;display:flex;gap:8px;align-items:flex-start;margin-top:4px;}\n.deposit-text{font-size:11px;color:#856404;line-height:1.6;}\n.cart-bar{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #eee;padding:12px 20px;padding-bottom:max(12px,env(safe-area-inset-bottom));box-shadow:0 -4px 20px rgba(0,0,0,0.1);display:none;z-index:9999;}\n.cart-bar.visible{display:block;}\n.cart-bar-inner{display:flex;align-items:center;gap:12px;}\n.cart-summary{flex:1;}\n.cart-count{font-size:13px;font-weight:700;color:var(--c-text);margin-bottom:2px;}\n.cart-items-preview{font-size:11px;color:var(--c-text3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;}\n.wa-order-btn{background:#25D366;border:none;border-radius:14px;padding:13px 20px;display:flex;align-items:center;gap:8px;color:#fff;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;white-space:nowrap;box-shadow:0 4px 14px rgba(37,211,102,0.4);transition:transform 0.12s;}\n.wa-order-btn:active{transform:scale(0.97);}\n\n/* ORDER LIST PREVIEW */\n.order-preview{background:#fff;padding:16px;margin-bottom:1px;}\n.order-item{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f5f5f5;}\n.order-item:last-child{border-bottom:none;}\n.order-item-name{font-size:13px;font-weight:600;color:var(--c-text);}\n.order-item-qty{font-size:12px;color:var(--c-text3);}\n.remove-item{width:24px;height:24px;border-radius:50%;background:#f5f5f5;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}"
const markup = "\u003cdiv class=\"page\"\u003e\n\u003cdiv class=\"scroll\"\u003e\n\n\u003c!-- HEADER --\u003e\n\u003cdiv class=\"header\"\u003e\n  \u003cdiv class=\"header-r1\"\u003e\n    \u003cdiv class=\"header-r1-left\"\u003e\n      \u003cbutton class=\"back-btn\" onclick=\"history.back()\" title=\"Kembali ke kedai\"\u003e\n        \u003csvg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"15 18 9 12 15 6\"/\u003e\u003c/svg\u003e\n      \u003c/button\u003e\n      \u003cimg src=\"/icons/Logo-LOKALGO.png\" alt=\"LokalGo\u2122\" style=\"height:40px;width:auto;display:block;\"\u003e\n    \u003c/div\u003e\n    \n  \u003c/div\u003e\n  \u003cdiv class=\"header-sub\"\u003e\u003cspan data-i18n=\"tagline\"\u003ePlatform perniagaan lokal setempat\u003c/span\u003e\u003c/div\u003e\n  \u003cdiv style=\"font-size:11px;color:rgba(255,255,255,0.5);margin-bottom:10px;display:flex;align-items:center;gap:5px;\"\u003e\n    \u003cspan style=\"cursor:pointer;text-decoration:underline;\" onclick=\"history.back()\"\u003eResepi Kak Mila\u003c/span\u003e\n    \u003csvg width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.4)\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"9 18 15 12 9 6\"/\u003e\u003c/svg\u003e\n    \u003cspan style=\"color:rgba(255,255,255,0.8);font-weight:600;\"\u003eKuih Talam\u003c/span\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"header-r2\"\u003e\n    \u003cdiv class=\"search-wrap\"\u003e\n      \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#aaa\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"11\" cy=\"11\" r=\"8\"/\u003e\u003cline x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/\u003e\u003c/svg\u003e\n      \u003cspan\u003eCari kedai atau produk\u003c/span\u003e\n    \u003c/div\u003e\n    \u003cbutton class=\"lang-btn\" onclick=\"i18n.toggle()\"\u003e\n      \u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"10\"/\u003e\u003cline x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"/\u003e\u003cpath d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/\u003e\u003c/svg\u003e\n      \u003cspan class=\"lang-btn-txt\"\u003eEnglish\u003c/span\u003e\n    \u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- IMAGE GALLERY --\u003e\n\u003cdiv class=\"gallery\"\u003e\n  \u003cdiv class=\"gallery-main\" id=\"galleryMain\"\u003e\n    \u003cdiv class=\"gallery-placeholder\"\u003e\n      \u003csvg width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.3)\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003crect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/\u003e\u003ccircle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/\u003e\u003cpolyline points=\"21 15 16 10 5 21\"/\u003e\u003c/svg\u003e\n      \u003cspan\u003eGambar produk seller\u003c/span\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"gallery-counter\" id=\"galleryCounter\"\u003e1 / 5\u003c/div\u003e\n    \u003cdiv class=\"gallery-nav\"\u003e\n      \u003cbutton class=\"nav-btn\" onclick=\"changeSlide(-1)\"\u003e\u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"15 18 9 12 15 6\"/\u003e\u003c/svg\u003e\u003c/button\u003e\n      \u003cbutton class=\"nav-btn\" onclick=\"changeSlide(1)\"\u003e\u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"9 18 15 12 9 6\"/\u003e\u003c/svg\u003e\u003c/button\u003e\n    \u003c/div\u003e\n    \u003cdiv class=\"gallery-dots\" id=\"galleryDots\"\u003e\n      \u003cdiv class=\"dot active\"\u003e\u003c/div\u003e\n      \u003cdiv class=\"dot\"\u003e\u003c/div\u003e\n      \u003cdiv class=\"dot\"\u003e\u003c/div\u003e\n      \u003cdiv class=\"dot\"\u003e\u003c/div\u003e\n      \u003cdiv class=\"dot\"\u003e\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003c!-- THUMBNAILS --\u003e\n  \u003cdiv class=\"thumbs\" id=\"thumbsRow\"\u003e\n    \u003cdiv class=\"thumb active\" onclick=\"goSlide(0)\"\u003e\u003csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.4)\" stroke-width=\"1.5\"\u003e\u003crect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/\u003e\u003ccircle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/\u003e\u003cpolyline points=\"21 15 16 10 5 21\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"thumb\" onclick=\"goSlide(1)\"\u003e\u003csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.4)\" stroke-width=\"1.5\"\u003e\u003crect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/\u003e\u003ccircle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/\u003e\u003cpolyline points=\"21 15 16 10 5 21\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"thumb\" onclick=\"goSlide(2)\"\u003e\u003csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.4)\" stroke-width=\"1.5\"\u003e\u003crect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/\u003e\u003ccircle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/\u003e\u003cpolyline points=\"21 15 16 10 5 21\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"thumb\" onclick=\"goSlide(3)\"\u003e\u003csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.4)\" stroke-width=\"1.5\"\u003e\u003crect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/\u003e\u003ccircle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/\u003e\u003cpolyline points=\"21 15 16 10 5 21\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"thumb\" onclick=\"goSlide(4)\"\u003e\u003csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"rgba(255,255,255,0.4)\" stroke-width=\"1.5\"\u003e\u003crect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/\u003e\u003ccircle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/\u003e\u003cpolyline points=\"21 15 16 10 5 21\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- PRODUK INFO --\u003e\n\u003cdiv class=\"produk-info-section\"\u003e\n  \u003cdiv class=\"produk-header\"\u003e\n    \u003cspan class=\"produk-name\"\u003eKuih Talam\u003c/span\u003e\n    \u003cspan class=\"produk-status-badge badge-preorder\" id=\"statusBadge\"\u003e● Pra Tempahan\u003c/span\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"produk-shop\"\u003e\n    \u003csvg width=\"11\" height=\"11\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#ADD036\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"/\u003e\u003cpolyline points=\"22 4 12 14.01 9 11.01\"/\u003e\u003c/svg\u003e\n    \u003cspan class=\"verified-mini\"\u003eResepi Kak Mila\u003c/span\u003e\n    \u003cspan style=\"color:#ddd;\"\u003e•\u003c/span\u003e\n    \u003cspan\u003eTaman Desa Baiduri\u003c/span\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"produk-price\"\u003eDari RM 5.00\u003c/div\u003e\n  \u003cdiv class=\"produk-desc-full\"\u003eKuih talam tradisional yang lembut dan lazat. Tersedia dalam pelbagai rasa — pandan, pineapple, dan original. Sesuai untuk majlis, harijadi, dan santapan harian. Tempah sehari awal untuk kuantiti melebihi 50 biji.\u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- VARIETY --\u003e\n\u003cdiv class=\"variety-section\"\u003e\n  \u003cdiv class=\"section-label\"\u003ePilih Varian\u003c/div\u003e\n  \u003cdiv class=\"variety-tags\"\u003e\n    \u003cdiv class=\"variety-tag active\" onclick=\"selectVariety(this)\"\u003ePandan\u003c/div\u003e\n    \u003cdiv class=\"variety-tag\" onclick=\"selectVariety(this)\"\u003ePineapple\u003c/div\u003e\n    \u003cdiv class=\"variety-tag\" onclick=\"selectVariety(this)\"\u003eOriginal\u003c/div\u003e\n    \u003cdiv class=\"variety-tag\" onclick=\"selectVariety(this)\"\u003eSerimuka\u003c/div\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- QUANTITY + ADD TO ORDER --\u003e\n\u003cdiv class=\"order-section\"\u003e\n\n  \u003c!-- ORDER TYPE TOGGLE --\u003e\n  \u003cdiv style=\"display:flex;gap:8px;margin-bottom:14px;\"\u003e\n    \u003cbutton class=\"order-type-btn active\" id=\"btnNormal\" onclick=\"setOrderType(\u0027normal\u0027)\"\u003e\n      \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z\"/\u003e\u003cline x1=\"3\" y1=\"6\" x2=\"21\" y2=\"6\"/\u003e\u003cpath d=\"M16 10a4 4 0 0 1-8 0\"/\u003e\u003c/svg\u003e\n      Order Biasa\n    \u003c/button\u003e\n    \u003cbutton class=\"order-type-btn\" id=\"btnPreorder\" onclick=\"setOrderType(\u0027preorder\u0027)\"\u003e\n      \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003crect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/\u003e\u003cline x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"/\u003e\u003cline x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"/\u003e\u003cline x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"/\u003e\u003c/svg\u003e\n      Pra Tempahan\n    \u003c/button\u003e\n  \u003c/div\u003e\n\n  \u003c!-- PRE-ORDER FIELDS (hidden by default) --\u003e\n  \u003cdiv id=\"preorderFields\" style=\"display:none;margin-bottom:14px;\"\u003e\n    \u003cdiv style=\"background:linear-gradient(135deg,#856404,#a07800);border-radius:12px;padding:11px 14px;margin-bottom:10px;display:flex;align-items:center;gap:10px;\"\u003e\n      \u003cdiv style=\"width:32px;height:32px;background:rgba(255,255,255,0.15);border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;\"\u003e\n        \u003csvg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003crect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/\u003e\u003cline x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"/\u003e\u003cline x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"/\u003e\u003cline x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"/\u003e\u003c/svg\u003e\n      \u003c/div\u003e\n      \u003cdiv\u003e\n        \u003cdiv style=\"font-size:12px;font-weight:700;color:#fff;\"\u003ePra Tempahan\u003c/div\u003e\n        \u003cdiv style=\"font-size:11px;color:rgba(255,255,255,0.8);\"\u003eMinimum \u003cstrong style=\"color:#FFE082;\" id=\"minQtyTxt\"\u003e10 unit\u003c/strong\u003e\u003c/div\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n\n    \u003cdiv style=\"margin-bottom:8px;\"\u003e\n      \u003cdiv style=\"font-size:12px;font-weight:600;color:var(--c-text2);margin-bottom:6px;display:flex;align-items:center;gap:5px;\"\u003e\n        \u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#856404\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003crect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/\u003e\u003cline x1=\"16\" y1=\"2\" x2=\"16\" y2=\"6\"/\u003e\u003cline x1=\"8\" y1=\"2\" x2=\"8\" y2=\"6\"/\u003e\u003cline x1=\"3\" y1=\"10\" x2=\"21\" y2=\"10\"/\u003e\u003c/svg\u003e\n        Tarikh Pickup / Delivery\n      \u003c/div\u003e\n      \u003cinput type=\"date\" id=\"pickupDate\" style=\"width:100%;border:1.5px solid #856404;border-radius:10px;padding:10px 13px;font-size:14px;color:var(--c-text);outline:none;font-family:inherit;background:#FFFDE7;\" onchange=\"validateDate(this)\"\u003e\n      \u003cdiv style=\"font-size:11px;color:var(--c-hint);margin-top:5px;display:flex;align-items:center;gap:4px;\"\u003e\n        \u003csvg width=\"11\" height=\"11\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#bbb\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"10\"/\u003e\u003cline x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"/\u003e\u003cline x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"/\u003e\u003c/svg\u003e\n        Tempah dalam masa 1–30 hari dari hari ini\n      \u003c/div\u003e\n    \u003c/div\u003e\n\n    \u003cdiv style=\"background:#FFF8E1;border:1px solid #FFE082;border-radius:10px;padding:9px 12px;display:flex;gap:8px;align-items:flex-start;\"\u003e\n      \u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#856404\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex-shrink:0;margin-top:1px;\"\u003e\u003cpath d=\"M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z\"/\u003e\u003cline x1=\"12\" y1=\"9\" x2=\"12\" y2=\"13\"/\u003e\u003cline x1=\"12\" y1=\"17\" x2=\"12.01\" y2=\"17\"/\u003e\u003c/svg\u003e\n      \u003cdiv style=\"font-size:11px;color:#856404;line-height:1.6;\"\u003eSeller mungkin akan meminta \u003cstrong\u003edeposit\u003c/strong\u003e. Amaun akan dimaklumkan melalui WhatsApp.\u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003c!-- QTY ROW --\u003e\n  \u003cdiv class=\"qty-row\"\u003e\n    \u003cspan class=\"qty-label\"\u003eKuantiti\u003c/span\u003e\n    \u003cdiv class=\"qty-control\"\u003e\n      \u003cbutton class=\"qty-btn\" onclick=\"changeQty(-1)\"\u003e−\u003c/button\u003e\n      \u003cinput class=\"qty-num\" type=\"number\" id=\"qtyInput\" value=\"1\" min=\"1\" max=\"99\" readonly\u003e\n      \u003cbutton class=\"qty-btn\" onclick=\"changeQty(1)\"\u003e+\u003c/button\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003cbutton class=\"add-order-btn\" id=\"addBtn\" onclick=\"addToOrder()\"\u003e\n    \u003csvg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z\"/\u003e\u003cline x1=\"3\" y1=\"6\" x2=\"21\" y2=\"6\"/\u003e\u003cpath d=\"M16 10a4 4 0 0 1-8 0\"/\u003e\u003c/svg\u003e\n    \u003cspan id=\"addBtnTxt\"\u003eTambah ke Senarai Order\u003c/span\u003e\n  \u003c/button\u003e\n\u003c/div\u003e\n\n\u003c!-- ORDER LIST (visible when items added) --\u003e\n\u003cdiv class=\"order-preview\" id=\"orderPreview\" style=\"display:none;\"\u003e\n  \u003cdiv class=\"section-label\" style=\"margin-bottom:10px;\"\u003eSenarai Order Anda\u003c/div\u003e\n  \u003cdiv id=\"orderItemsList\"\u003e\u003c/div\u003e\n\u003c/div\u003e\n\n\u003c/div\u003e\n\n\u003c!-- STICKY CART BAR --\u003e\n\u003cdiv class=\"cart-bar\" id=\"cartBar\"\u003e\n  \u003cdiv class=\"cart-bar-inner\"\u003e\n    \u003cdiv class=\"cart-summary\"\u003e\n      \u003cdiv class=\"cart-count\" id=\"cartCount\"\u003e0 produk dipilih\u003c/div\u003e\n      \u003cdiv class=\"cart-items-preview\" id=\"cartPreview\"\u003e—\u003c/div\u003e\n    \u003c/div\u003e\n    \u003cbutton class=\"wa-order-btn\" onclick=\"sendWhatsApp()\"\u003e\n      \u003csvg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"#fff\"\u003e\u003cpath d=\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z\"/\u003e\u003cpath d=\"M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.122 1.528 5.855L0 24l6.335-1.507C8.05 23.453 9.99 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.638-.518-5.145-1.416l-.369-.219-3.76.895.942-3.655-.24-.378A9.933 9.933 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z\"/\u003e\u003c/svg\u003e\n      Order via WhatsApp\n    \u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c/div\u003e"
const scripts: string[] = ["// ── CONFIG ──\nvar PREORDER_MIN = 10;\nvar SHOP_NAME = \u0027Kak Mila\u0027;\nvar WA_NUMBER = \u002760123456789\u0027;\nvar PRODUK_NAME = \u0027Kuih Talam\u0027;\nvar PICKUP_INSTRUCTION = \u0027\u0027;\nvar currentOrderType = \u0027normal\u0027; // \u0027normal\u0027 or \u0027preorder\u0027\n\n// ── INIT ──\ndocument.addEventListener(\u0027DOMContentLoaded\u0027, function() {\n  var today = new Date();\n  var tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);\n  var maxDate = new Date(today); maxDate.setDate(today.getDate() + 30);\n  var dateInput = document.getElementById(\u0027pickupDate\u0027);\n  if (dateInput) {\n    dateInput.min = tomorrow.toISOString().split(\u0027T\u0027)[0];\n    dateInput.max = maxDate.toISOString().split(\u0027T\u0027)[0];\n    dateInput.value = tomorrow.toISOString().split(\u0027T\u0027)[0];\n  }\n});\n\n// ── ORDER TYPE TOGGLE ──\nfunction setOrderType(type) {\n  currentOrderType = type;\n  var isPreorder = type === \u0027preorder\u0027;\n  document.getElementById(\u0027btnNormal\u0027).classList.toggle(\u0027active\u0027, !isPreorder);\n  document.getElementById(\u0027btnPreorder\u0027).classList.toggle(\u0027active\u0027, isPreorder);\n  document.getElementById(\u0027preorderFields\u0027).style.display = isPreorder ? \u0027block\u0027 : \u0027none\u0027;\n  // Reset qty\n  qty = isPreorder ? PREORDER_MIN : 1;\n  document.getElementById(\u0027qtyInput\u0027).value = qty;\n  // Update button label\n  document.getElementById(\u0027addBtnTxt\u0027).textContent = isPreorder\n    ? \u0027Tambah Pra Tempahan ke Senarai\u0027\n    : \u0027Tambah ke Senarai Order\u0027;\n}\n\n// ── GALLERY ──\nvar currentSlide = 0;\nvar totalSlides = 5;\n\nfunction changeSlide(dir) {\n  currentSlide = (currentSlide + dir + totalSlides) % totalSlides;\n  updateGallery();\n}\n\nfunction goSlide(idx) {\n  currentSlide = idx;\n  updateGallery();\n}\n\nfunction updateGallery() {\n  document.getElementById(\u0027galleryCounter\u0027).textContent = (currentSlide + 1) + \u0027 / \u0027 + totalSlides;\n  document.querySelectorAll(\u0027.dot\u0027).forEach(function(d, i) { d.classList.toggle(\u0027active\u0027, i === currentSlide); });\n  document.querySelectorAll(\u0027.thumb\u0027).forEach(function(t, i) { t.classList.toggle(\u0027active\u0027, i === currentSlide); });\n}\n\n// ── DATE VALIDATION ──\nfunction validateDate(input) {\n  var selected = new Date(input.value);\n  var today = new Date(); today.setHours(0,0,0,0);\n  var max = new Date(today); max.setDate(today.getDate() + 30);\n  if (selected \u003c today || selected \u003e max) {\n    input.style.borderColor = \u0027#e44\u0027;\n    input.value = \u0027\u0027;\n  } else {\n    input.style.borderColor = \u0027#856404\u0027;\n  }\n}\n\n// ── VARIETY ──\nfunction selectVariety(el) {\n  document.querySelectorAll(\u0027.variety-tag\u0027).forEach(function(t) { t.classList.remove(\u0027active\u0027); });\n  el.classList.add(\u0027active\u0027);\n}\n\n// ── QUANTITY ──\nvar qty = 1;\nfunction changeQty(dir) {\n  var min = currentOrderType === \u0027preorder\u0027 ? PREORDER_MIN : 1;\n  qty = Math.max(min, Math.min(99, qty + dir));\n  document.getElementById(\u0027qtyInput\u0027).value = qty;\n}\n\n// ── ORDER CART ──\nvar orderItems = [];\n\nfunction addToOrder() {\n  var isPreorder = currentOrderType === \u0027preorder\u0027;\n\n  if (isPreorder) {\n    var dateVal = document.getElementById(\u0027pickupDate\u0027).value;\n    if (!dateVal) {\n      alert(\u0027Sila pilih tarikh pickup / delivery terlebih dahulu.\u0027);\n      document.getElementById(\u0027pickupDate\u0027).focus();\n      return;\n    }\n    if (qty \u003c PREORDER_MIN) {\n      alert(\u0027Minimum order untuk pra tempahan ialah \u0027 + PREORDER_MIN + \u0027 unit.\u0027);\n      return;\n    }\n  }\n\n  var variety = document.querySelector(\u0027.variety-tag.active\u0027);\n  var varietyName = variety ? variety.textContent : \u0027\u0027;\n  var label = PRODUK_NAME + (varietyName ? \u0027 (\u0027 + varietyName + \u0027)\u0027 : \u0027\u0027);\n  var pickupDate = isPreorder ? document.getElementById(\u0027pickupDate\u0027).value : null;\n\n  var existing = orderItems.find(function(i) { return i.name === label \u0026\u0026 i.isPreorder === isPreorder; });\n  if (existing) {\n    existing.qty += qty;\n    if (pickupDate) existing.pickupDate = pickupDate;\n  } else {\n    orderItems.push({ name: label, qty: qty, pickupDate: pickupDate, isPreorder: isPreorder });\n  }\n\n  updateCartUI();\n\n  var btn = document.getElementById(\u0027addBtn\u0027);\n  btn.classList.add(\u0027added\u0027);\n  btn.innerHTML = \u0027\u003csvg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"20 6 9 17 4 12\"/\u003e\u003c/svg\u003e Ditambah!\u0027;\n  setTimeout(function() {\n    btn.classList.remove(\u0027added\u0027);\n    btn.innerHTML = \u0027\u003csvg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z\"/\u003e\u003cline x1=\"3\" y1=\"6\" x2=\"21\" y2=\"6\"/\u003e\u003cpath d=\"M16 10a4 4 0 0 1-8 0\"/\u003e\u003c/svg\u003e Tambah ke Senarai Order\u0027;\n  }, 1500);\n}\n\nfunction removeItem(idx) {\n  orderItems.splice(idx, 1);\n  updateCartUI();\n}\n\nfunction updateCartUI() {\n  var total = orderItems.reduce(function(s, i) { return s + i.qty; }, 0);\n  var cartBar = document.getElementById(\u0027cartBar\u0027);\n  var orderPreview = document.getElementById(\u0027orderPreview\u0027);\n\n  if (orderItems.length === 0) {\n    cartBar.classList.remove(\u0027visible\u0027);\n    orderPreview.style.display = \u0027none\u0027;\n    return;\n  }\n\n  cartBar.classList.add(\u0027visible\u0027);\n  orderPreview.style.display = \u0027block\u0027;\n\n  document.getElementById(\u0027cartCount\u0027).textContent = total + \u0027 unit dipilih\u0027;\n  document.getElementById(\u0027cartPreview\u0027).textContent = orderItems.map(function(i) {\n    return i.name + \u0027 x\u0027 + i.qty + (i.isPreorder ? \u0027 [Pra Tempah]\u0027 : \u0027\u0027);\n  }).join(\u0027, \u0027);\n\n  var list = document.getElementById(\u0027orderItemsList\u0027);\n  list.innerHTML = orderItems.map(function(item, idx) {\n    return \u0027\u003cdiv class=\"order-item\"\u003e\u0027 +\n      \u0027\u003cdiv\u003e\u0027 +\n        \u0027\u003cdiv class=\"order-item-name\"\u003e\u0027 + item.name + (item.isPreorder ? \u0027 \u003cspan style=\"font-size:10px;background:#FFF8E1;color:#856404;padding:2px 6px;border-radius:10px;font-weight:600;\"\u003ePra Tempah\u003c/span\u003e\u0027 : \u0027\u0027) + \u0027\u003c/div\u003e\u0027 +\n        \u0027\u003cdiv class=\"order-item-qty\"\u003ex\u0027 + item.qty + \u0027 unit\u0027 + (item.pickupDate ? \u0027 • Pickup: \u0027 + formatDate(item.pickupDate) : \u0027\u0027) + \u0027\u003c/div\u003e\u0027 +\n      \u0027\u003c/div\u003e\u0027 +\n      \u0027\u003cbutton class=\"remove-item\" onclick=\"removeItem(\u0027 + idx + \u0027)\"\u003e\u0027 +\n        \u0027\u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#999\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cline x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/\u003e\u003cline x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/\u003e\u003c/svg\u003e\u0027 +\n      \u0027\u003c/button\u003e\u0027 +\n    \u0027\u003c/div\u003e\u0027;\n  }).join(\u0027\u0027);\n}\n\nfunction formatDate(dateStr) {\n  var d = new Date(dateStr);\n  return d.toLocaleDateString(\u0027ms-MY\u0027, { day: \u0027numeric\u0027, month: \u0027long\u0027, year: \u0027numeric\u0027 });\n}\n\n// ── WHATSAPP MESSAGE — BUYER TO SELLER ──\nfunction sendWhatsApp() {\n  var hasPreorder = orderItems.some(function(i) { return i.isPreorder; });\n  var normalItems = orderItems.filter(function(i) { return !i.isPreorder; });\n  var preorderItems = orderItems.filter(function(i) { return i.isPreorder; });\n\n  // Load saved addresses\n  var homeAddr = null, officeAddr = null;\n  try {\n    homeAddr = JSON.parse(localStorage.getItem(\u0027lokalgo_home_addr\u0027) || \u0027null\u0027);\n    officeAddr = JSON.parse(localStorage.getItem(\u0027lokalgo_office_addr\u0027) || \u0027null\u0027);\n  } catch(e) {}\n\n  // Build address options for COD\n  var addrOptions = [];\n  if (homeAddr \u0026\u0026 homeAddr.line1) {\n    addrOptions.push({\n      label: \u0027🏠 Rumah\u0027,\n      full: homeAddr.line1 + \u0027, \u0027 + homeAddr.area + \u0027, \u0027 + homeAddr.postcode + \u0027 \u0027 + homeAddr.city + \u0027, \u0027 + homeAddr.state\n    });\n  }\n  if (officeAddr \u0026\u0026 officeAddr.line1) {\n    addrOptions.push({\n      label: \u0027🏢 Pejabat\u0027,\n      full: (officeAddr.company ? officeAddr.company + \u0027, \u0027 : \u0027\u0027) + officeAddr.line1 + \u0027, \u0027 + officeAddr.area + \u0027, \u0027 + officeAddr.postcode + \u0027 \u0027 + officeAddr.city\n    });\n  }\n\n  // If addresses saved, show picker\n  if (addrOptions.length \u003e 0) {\n    showAddressPicker(addrOptions, normalItems, preorderItems, hasPreorder);\n  } else {\n    // No address saved — send basic message\n    buildAndSendWA(null, \u0027COD\u0027, normalItems, preorderItems, hasPreorder);\n  }\n}\n\nfunction showAddressPicker(addrOptions, normalItems, preorderItems, hasPreorder) {\n  // Remove existing picker\n  var old = document.getElementById(\u0027addrPickerOverlay\u0027);\n  if (old) old.remove();\n\n  var html = \u0027\u003cdiv id=\"addrPickerOverlay\" style=\"position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100;display:flex;align-items:flex-end;justify-content:center;\"\u003e\u0027 +\n    \u0027\u003cdiv style=\"background:#fff;border-radius:20px 20px 0 0;padding:20px;width:100%;max-width:430px;\"\u003e\u0027 +\n    \u0027\u003cdiv style=\"font-size:15px;font-weight:700;color:#111;margin-bottom:6px;\"\u003eCara Penghantaran\u003c/div\u003e\u0027 +\n    \u0027\u003cdiv style=\"font-size:12px;color:#888;margin-bottom:16px;\"\u003ePilih cara dan alamat COD anda\u003c/div\u003e\u0027;\n\n  // Pickup option\n  html += \u0027\u003cdiv class=\"addr-pick-opt\" onclick=\"selectDelivery(\\\u0027pickup\\\u0027,null)\" style=\"display:flex;align-items:center;gap:12px;padding:12px;border:1.5px solid #eee;border-radius:12px;margin-bottom:8px;cursor:pointer;\"\u003e\u0027 +\n    \u0027\u003cdiv style=\"width:36px;height:36px;background:#EAF3DE;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;\"\u003e\u0027 +\n    \u0027\u003csvg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#4A7C10\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"10\"/\u003e\u003cpolyline points=\"12 6 12 12 16 14\"/\u003e\u003c/svg\u003e\u003c/div\u003e\u0027 +\n    \u0027\u003cdiv\u003e\u003cdiv style=\"font-size:13px;font-weight:600;color:#111;\"\u003eSelf Pickup\u003c/div\u003e\u0027 +\n    \u0027\u003cdiv style=\"font-size:11px;color:#888;\"\u003eAmbil sendiri di lokasi seller\u003c/div\u003e\u003c/div\u003e\u003c/div\u003e\u0027;\n\n  // COD address options\n  addrOptions.forEach(function(opt, idx) {\n    html += \u0027\u003cdiv class=\"addr-pick-opt\" onclick=\"selectDelivery(\\\u0027cod\\\u0027,\u0027 + idx + \u0027)\" style=\"display:flex;align-items:center;gap:12px;padding:12px;border:1.5px solid #eee;border-radius:12px;margin-bottom:8px;cursor:pointer;\"\u003e\u0027 +\n      \u0027\u003cdiv style=\"width:36px;height:36px;background:#fff0f3;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;\"\u003e\u0027 +\n      \u0027\u003csvg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#7B1533\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z\"/\u003e\u003ccircle cx=\"12\" cy=\"10\" r=\"3\"/\u003e\u003c/svg\u003e\u003c/div\u003e\u0027 +\n      \u0027\u003cdiv style=\"flex:1;min-width:0;\"\u003e\u003cdiv style=\"font-size:13px;font-weight:600;color:#111;\"\u003eCOD — \u0027 + opt.label + \u0027\u003c/div\u003e\u0027 +\n      \u0027\u003cdiv style=\"font-size:11px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\"\u003e\u0027 + opt.full + \u0027\u003c/div\u003e\u003c/div\u003e\u003c/div\u003e\u0027;\n  });\n\n  html += \u0027\u003cbutton onclick=\"document.getElementById(\\\u0027addrPickerOverlay\\\u0027).remove()\" style=\"width:100%;background:#f5f5f5;border:none;border-radius:12px;padding:13px;font-size:14px;font-weight:600;color:#555;font-family:inherit;cursor:pointer;margin-top:4px;\"\u003eBatal\u003c/button\u003e\u0027;\n  html += \u0027\u003c/div\u003e\u003c/div\u003e\u0027;\n\n  document.body.insertAdjacentHTML(\u0027beforeend\u0027, html);\n\n  // Store for selectDelivery\n  window._addrOptions = addrOptions;\n  window._waData = { normalItems: normalItems, preorderItems: preorderItems, hasPreorder: hasPreorder };\n}\n\nfunction selectDelivery(type, addrIdx) {\n  var d = window._waData;\n  var addr = (type === \u0027cod\u0027 \u0026\u0026 addrIdx !== null) ? window._addrOptions[addrIdx] : null;\n  document.getElementById(\u0027addrPickerOverlay\u0027).remove();\n  buildAndSendWA(addr, type, d.normalItems, d.preorderItems, d.hasPreorder);\n}\n\nfunction buildAndSendWA(addr, deliveryType, normalItems, preorderItems, hasPreorder) {\n  var msg = \u0027Assalamualaikum \u0027 + SHOP_NAME + \u0027 👋\\n\\n\u0027;\n\n  if (normalItems.length \u003e 0) {\n    msg += \u0027📦 *Order Biasa:*\\n\u0027;\n    normalItems.forEach(function(i) { msg += \u0027• \u0027 + i.name + \u0027 x\u0027 + i.qty + \u0027\\n\u0027; });\n    msg += \u0027\\n\u0027;\n  }\n\n  if (preorderItems.length \u003e 0) {\n    msg += \u0027📅 *Pra Tempahan:*\\n\u0027;\n    preorderItems.forEach(function(i) {\n      msg += \u0027• \u0027 + i.name + \u0027 x\u0027 + i.qty + \u0027\\n\u0027;\n      msg += \u0027  📆 Tarikh Pickup: \u0027 + formatDate(i.pickupDate) + \u0027\\n\u0027;\n    });\n    msg += \u0027\\n\u0027;\n  }\n\n  msg += \u0027Nama: [Nama saya]\\n\u0027;\n\n  if (deliveryType === \u0027pickup\u0027) {\n    msg += \u0027Cara ambil: ✅ Self Pickup\\n\u0027;\n  } else if (addr) {\n    msg += \u0027Cara ambil: ✅ COD\\n\u0027;\n    msg += \u0027Alamat: \u0027 + addr.full + \u0027\\n\u0027;\n  } else {\n    msg += \u0027Cara ambil: [ ] Pickup  [ ] COD\\n\u0027;\n    msg += \u0027Alamat COD: [Alamat anda]\\n\u0027;\n  }\n\n  if (PICKUP_INSTRUCTION) {\n    msg += \u0027\\n\\n\uD83D\uDCCD *Arahan Pickup:*\\n\u0027 + PICKUP_INSTRUCTION;\n  }\n\n  if (hasPreorder) {\n    msg += \u0027\\n⚠️ Saya faham deposit mungkin diperlukan untuk pra tempahan.\u0027;\n  }\n\n  window.open(\u0027https://wa.me/\u0027 + WA_NUMBER + \u0027?text=\u0027 + encodeURIComponent(msg), \u0027_blank\u0027);\n}"]
const externalScripts: string[] = []
const externalStylesheets: string[] = []
const uxStyles = `
.back-btn,.sokong-btn,.nav-btn,.qty-btn,.remove-item{min-width:44px;min-height:44px}
.variety-tag,.order-type-btn{min-height:44px;display:flex;align-items:center;justify-content:center}
`

export default function Page() {
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    ;(window as Window & { __showLoginModal?: () => void }).__showLoginModal = () => setShowLoginModal(true)
    let cancelled = false

    async function loadProduct() {
      const params = new URLSearchParams(window.location.search)
      const productId = params.get('product') || params.get('id')
      const sellerId = params.get('seller')

      if (!productId) {
        setText('.produk-name', 'Produk tidak ditemui')
        setText('.produk-desc-full', 'Sila buka produk dari halaman kedai.')
        return
      }

      const supabase = createClient()
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .eq('status', 'approved')
        .single()

      if (cancelled) return

      if (productError || !product) {
        setText('.produk-name', 'Produk tidak ditemui')
        setText('.produk-desc-full', 'Produk ini belum diluluskan atau tidak wujud.')
        return
      }

      const { data: seller } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', sellerId || product.seller_id)
        .single()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { data: buyerProfile } = user
        ? await supabase
          .from('buyers')
          .select('name, whatsapp_number, address_rumah, address_pejabat')
          .eq('user_id', user.id)
          .maybeSingle()
        : { data: null }

      if (cancelled) return

      const currentProduct = product as ProductRow
      const currentSeller = seller as Seller | null
      const badge = statusBadge(currentProduct)
      const displayName = productName(currentProduct)
      const unit = productUnit(currentProduct)
      const exactPrice = productPrice(currentProduct)
      const price = exactPrice
        ? `RM ${money(exactPrice)}/${unit}`
        : 'Harga ikut pesanan'

      setText('.produk-name', displayName)
      setHtml('.produk-status-badge', badge.label)
      document.querySelector('.produk-status-badge')?.classList.remove('badge-avail', 'badge-unavail', 'badge-preorder')
      document.querySelector('.produk-status-badge')?.classList.add(badge.className)
      setText('.produk-shop', currentSeller ? `${currentSeller.shop_name} • ${currentSeller.taman_name}` : 'Kedai LokalGo')
      setText('.produk-price', price)
      setText('.produk-desc-full', currentProduct.description || displayName)
      setText('#addBtnTxt', 'Tambah ke Pesanan')

      const runtime = window as ProductWindow
      runtime.SHOP_NAME = currentSeller?.shop_name || 'Seller LokalGo'
      runtime.WA_NUMBER = normalizeWhatsapp(currentSeller?.whatsapp_number || '')
      runtime.PRODUK_NAME = displayName
      runtime.PICKUP_INSTRUCTION = currentSeller?.pickup_instruction || ''
      runtime.PREORDER_MIN = currentProduct.min_qty_preorder || 10
      runtime.totalSlides = Math.max(currentProduct.images?.length || 1, 1)
      runtime.__lokalgoImages = currentProduct.images || []
      runtime.__lokalgoBuyerProfile = buyerProfile as BuyerProfile | null
      runtime.__lokalgoProductContext = {
        sellerId: currentSeller?.id || currentProduct.seller_id,
        sellerName: currentSeller?.shop_name || 'Seller LokalGo',
        sellerWhatsapp: currentSeller?.whatsapp_number || '',
        shopUrl: `${window.location.origin}/shop?seller=${currentSeller?.id || currentProduct.seller_id}`,
        productId: currentProduct.id,
        name: displayName,
        unit,
        price: exactPrice,
      }

      renderGallery(currentProduct.images || [])

      // Hide variety section — no variants column in DB; static markup has placeholder values
      const varietySection = document.querySelector<HTMLElement>('.variety-section')
      if (varietySection) varietySection.style.display = 'none'

      // Fix date input — use local timezone instead of UTC
      const dateInput = document.getElementById('pickupDate') as HTMLInputElement | null
      if (dateInput) {
        const now = new Date()
        const pad = (n: number) => String(n).padStart(2, '0')
        const localDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
        const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)
        const maxDay = new Date(now); maxDay.setDate(now.getDate() + 30)
        dateInput.min = localDate(tomorrow)
        dateInput.max = localDate(maxDay)
        dateInput.value = localDate(tomorrow)
        ;(window as Window & { validateDate?: (input: HTMLInputElement) => void }).validateDate = (input: HTMLInputElement) => {
          const val = input.value
          if (!val) return
          const sel = new Date(val + 'T00:00:00')
          const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
          const minDay = new Date(todayStart); minDay.setDate(todayStart.getDate() + 1)
          const maxDayLimit = new Date(todayStart); maxDayLimit.setDate(todayStart.getDate() + 30)
          if (sel < minDay || sel > maxDayLimit) {
            input.style.borderColor = '#e44'
            input.value = ''
          } else {
            input.style.borderColor = '#856404'
          }
        }
      }

      // ── SALE MODE GATING ────────────────────────────────────────
      const saleMode = currentProduct.is_available && currentProduct.is_preorder
        ? 'BOTH'
        : currentProduct.is_preorder ? 'PREORDER_ONLY' : 'DIRECT'

      const formatBmDate = (dateStr: string) =>
        new Date(`${dateStr}T00:00:00`).toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

      const openPreorderCalendar = () => {
        document.getElementById('preorderCalOverlay')?.remove()
        const now = new Date()
        const pad2 = (n: number) => String(n).padStart(2, '0')
        const localDay = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
        const minD = new Date(now); minD.setDate(now.getDate() + 1)
        const maxD = new Date(now); maxD.setDate(now.getDate() + 30)

        const overlay = document.createElement('div')
        overlay.id = 'preorderCalOverlay'
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:130;display:flex;align-items:flex-end;justify-content:center;'
        overlay.innerHTML = `
          <div style="background:#fff;width:100%;max-width:430px;border-radius:20px 20px 0 0;padding:20px 20px 28px;font-family:'Plus Jakarta Sans',sans-serif;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
              <div style="font-size:15px;font-weight:800;color:#111;">Pilih Tarikh Pre-Order</div>
              <button id="preorderCalClose" style="width:32px;height:32px;border:0;border-radius:10px;background:#f5f5f5;color:#555;font-size:18px;cursor:pointer;line-height:1;">×</button>
            </div>
            <input type="date" id="preorderCalDate" min="${localDay(minD)}" max="${localDay(maxD)}"
              style="width:100%;border:1.5px solid #E5E5EA;border-radius:12px;padding:13px 14px;font-size:15px;font-family:inherit;color:#111;background:#fafafa;outline:none;box-sizing:border-box;">
            <div style="font-size:11px;color:#999;margin:8px 2px 16px;">Tempahan untuk esok hingga 30 hari akan datang.</div>
            <button id="preorderCalGo" disabled
              style="width:100%;border:0;border-radius:14px;padding:15px;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;background:#E5E5E5;color:#999;">
              Teruskan ke WhatsApp
            </button>
          </div>`
        document.body.appendChild(overlay)

        const calDate = overlay.querySelector<HTMLInputElement>('#preorderCalDate')
        const goBtn = overlay.querySelector<HTMLButtonElement>('#preorderCalGo')
        overlay.querySelector('#preorderCalClose')?.addEventListener('click', () => overlay.remove())
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })
        calDate?.addEventListener('input', () => {
          const ok = Boolean(calDate.value)
          if (goBtn) {
            goBtn.disabled = !ok
            goBtn.style.background = ok ? '#7B1D2E' : '#E5E5E5'
            goBtn.style.color = ok ? '#fff' : '#999'
          }
        })
        goBtn?.addEventListener('click', () => {
          if (!calDate?.value) return
          const calPhone = normalizeWhatsapp(currentSeller?.whatsapp_number || '')
          if (!calPhone || calPhone.length < 9) {
            alert('Nombor WhatsApp penjual belum tersedia.')
            overlay.remove()
            return
          }
          const qtyVal = Math.max(1, parseInt((document.getElementById('qtyInput') as HTMLInputElement | null)?.value || '1', 10))
          const pricePart = exactPrice > 0 ? ` = RM ${money(exactPrice)} x ${qtyVal}` : ''
          const pickupLabel = formatBmDate(calDate.value)
          const now = new Date()
          const dateStr = new Intl.DateTimeFormat('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }).format(now)
          const timeStr = new Intl.DateTimeFormat('ms-MY', { hour: '2-digit', minute: '2-digit', hour12: true }).format(now)
          const addr = buyerProfile?.address_rumah?.trim() || null
          const lines: string[] = [
            'Assalamualaikum!', '',
            'Saya nak buat pre-order:',
            `${qtyVal} x ${displayName}${pricePart}`,
            `  Tarikh pickup: ${pickupLabel}`,
            '', '---', '',
            ...(exactPrice > 0 ? [`Jumlah RM ${money(exactPrice * qtyVal)}`, '', '---', ''] : []),
            ...(addr ? ['Dan tempahan ini dihantar di alamat:', addr, ''] : []),
            'Boleh saya tahu tarikh ready, cara bayaran dan anggaran delivery?',
            '', '---', '',
            'Pesanan dari: https://lokalgo.app',
            `Masa: ${timeStr}`,
            `Tarikh: ${dateStr}`,
          ]
          trackWhatsAppClick()
          overlay.remove()
          window.open(`https://wa.me/${calPhone}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank')
        })
      }

      const openPreorderInfoSheet = () => {
        document.getElementById('preorderInfoOverlay')?.remove()
        const overlay = document.createElement('div')
        overlay.id = 'preorderInfoOverlay'
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:130;display:flex;align-items:flex-end;justify-content:center;'
        overlay.innerHTML = `
          <div style="background:#fff;width:100%;max-width:430px;border-radius:20px 20px 0 0;padding:24px 20px 28px;font-family:'Plus Jakarta Sans',sans-serif;text-align:center;">
            <div style="font-size:13px;color:#555;line-height:1.7;margin-bottom:18px;">Produk ini hanya pre-order sahaja buat masa ini. Tempahan adalah untuk esok dan hari seterusnya.</div>
            <button id="preorderInfoGo" style="width:100%;border:0;border-radius:14px;padding:15px;font-size:15px;font-weight:800;font-family:inherit;cursor:pointer;background:#7B1D2E;color:#fff;display:flex;align-items:center;justify-content:center;gap:8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.3V14"/><circle cx="16" cy="16" r="6"/></svg>
              Buat Pre-Order
            </button>
            <button id="preorderInfoClose" style="width:100%;border:0;background:none;font-size:13px;color:#888;font-family:inherit;cursor:pointer;padding:12px 0 0;">Batal</button>
          </div>`
        document.body.appendChild(overlay)
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove() })
        overlay.querySelector('#preorderInfoClose')?.addEventListener('click', () => overlay.remove())
        overlay.querySelector('#preorderInfoGo')?.addEventListener('click', () => { overlay.remove(); openPreorderCalendar() })
      }

      const btnNormalEl = document.getElementById('btnNormal') as HTMLButtonElement | null
      const btnPreorderEl = document.getElementById('btnPreorder') as HTMLButtonElement | null
      const orderTypeRow = btnNormalEl?.parentElement

      if (saleMode === 'DIRECT') {
        if (btnPreorderEl) btnPreorderEl.style.display = 'none'
      } else {
        // Inject "Buat Pre-Order" button below the order-type row
        const preorderGoBtn = document.createElement('button')
        preorderGoBtn.id = 'buatPreorderBtn'
        const primary = saleMode === 'PREORDER_ONLY'
        preorderGoBtn.style.cssText = `width:100%;margin-bottom:14px;border-radius:14px;padding:14px;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;${primary ? 'border:0;background:#7B1D2E;color:#fff;' : 'border:1.5px solid #7B1D2E;background:#fff;color:#7B1D2E;'}`
        preorderGoBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h5"/><path d="M17.5 17.5 16 16.3V14"/><circle cx="16" cy="16" r="6"/></svg> Buat Pre-Order`
        preorderGoBtn.addEventListener('click', openPreorderCalendar)
        orderTypeRow?.insertAdjacentElement('afterend', preorderGoBtn)
      }

      if (saleMode === 'PREORDER_ONLY') {
        const preorderButton = document.getElementById('btnPreorder') as HTMLButtonElement | null
        preorderButton?.click()
        if (btnNormalEl) {
          // Dimmed but tappable — taps explain the pre-order-only state
          btnNormalEl.removeAttribute('onclick')
          btnNormalEl.classList.remove('active')
          btnNormalEl.style.cssText = 'background:#E5E5E5;color:#999;border-color:#E5E5E5;'
          btnNormalEl.addEventListener('click', openPreorderInfoSheet)
        }
      }

      const trackWhatsAppClick = () => {
        if (currentSeller) {
          // SECURITY DEFINER RPC — direct updates are blocked by RLS for visitors
          void supabase.rpc('increment_seller_wa_click', { p_seller_id: currentSeller.id })
        }
      }
      // Neutralize old static-script WA functions — React cart flow handles all WA messages
      ;(window as Window & { buildAndSendWA?: () => void }).buildAndSendWA = () => void 0
      ;(window as Window & { selectDelivery?: () => void }).selectDelivery = () => void 0
      ;(window as Window & { showAddressPicker?: () => void }).showAddressPicker = () => void 0

      const confirmReplaceCart = (): Promise<boolean> => new Promise((resolve) => {
        const overlay = document.createElement('div')
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:130;display:flex;align-items:flex-end;justify-content:center;'
        overlay.innerHTML = `
          <div style="background:#fff;width:100%;max-width:430px;border-radius:20px 20px 0 0;padding:24px 20px 28px;font-family:'Plus Jakarta Sans',sans-serif;">
            <div style="font-size:15px;font-weight:800;color:#111;margin-bottom:8px;">Ganti Troli?</div>
            <div style="font-size:13px;color:#555;line-height:1.6;margin-bottom:24px;">Troli anda ada item dari kedai lain. Ganti dengan item dari kedai ini?</div>
            <button id="cartConfirmYes" style="width:100%;border:0;background:#7B1533;color:#fff;border-radius:14px;padding:14px;font-size:14px;font-weight:700;font-family:inherit;cursor:pointer;margin-bottom:10px;">Ya, ganti</button>
            <button id="cartConfirmNo" style="width:100%;border:0;background:#f5f5f5;color:#555;border-radius:14px;padding:14px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;">Batal</button>
          </div>`
        document.body.appendChild(overlay)
        const cleanup = (result: boolean) => { overlay.remove(); resolve(result) }
        overlay.querySelector('#cartConfirmYes')?.addEventListener('click', () => cleanup(true))
        overlay.querySelector('#cartConfirmNo')?.addEventListener('click', () => cleanup(false))
        overlay.addEventListener('click', (e) => { if (e.target === overlay) cleanup(false) })
      })

      runtime.addToOrder = async () => {
        const { data: { user: cartUser } } = await createClient().auth.getUser()
        if (!cartUser) {
          ;(window as Window & { __showLoginModal?: () => void }).__showLoginModal?.()
          return
        }
        const ctx = runtime.__lokalgoProductContext
        if (!ctx) return
        if (!ctx.sellerWhatsapp) {
          alert('Nombor WhatsApp seller belum tersedia.')
          return
        }
        if (ctx.price <= 0) {
          alert('Harga produk belum lengkap. Seller perlu isi harga dahulu.')
          return
        }

        const isPreorder = document.getElementById('btnPreorder')?.classList.contains('active') || false
        const qtyInput = document.getElementById('qtyInput') as HTMLInputElement | null
        const qty = Math.max(1, Number(qtyInput?.value || 1))
        const pickupDate = isPreorder ? ((document.getElementById('pickupDate') as HTMLInputElement | null)?.value || null) : null

        if (isPreorder && !pickupDate) {
          alert('Sila pilih tarikh pickup / delivery terlebih dahulu.')
          return
        }

        let items = readCart()
        const hasDifferentSeller = items.some((item) => item.sellerId !== ctx.sellerId)
        if (hasDifferentSeller) {
          const replace = await confirmReplaceCart()
          if (!replace) return
          items = []
        }

        const existing = items.find((item) => item.productId === ctx.productId && item.pickupDate === pickupDate && item.isPreorder === isPreorder)
        if (existing) {
          existing.qty += qty
        } else {
          items.push({ ...ctx, qty, pickupDate, isPreorder })
        }

        writeCart(items)
        renderCartFlow(runtime, runtime.__lokalgoBuyerProfile || null, trackWhatsAppClick)

        const btn = document.getElementById('addBtn')
        if (btn) {
          btn.classList.add('added')
          btn.textContent = 'Ditambah!'
          window.setTimeout(() => {
            btn.classList.remove('added')
            btn.textContent = 'Tambah ke Pesanan'
          }, 1200)
        }
      }
      runtime.removeItem = (index) => runtime.__lokalgoCartRemove?.(index)
      runtime.updateCartUI = () => renderCartFlow(runtime, runtime.__lokalgoBuyerProfile || null, trackWhatsAppClick)
      runtime.updateCartUI()

      // ── POST-ORDER REVIEW PROMPT ──
      runtime.__showReviewPrompt = () => {
        const raw = window.localStorage.getItem('lokalgo_pending_review')
        if (!raw) return
        let pending: { sellerId: string; sellerName: string }
        try { pending = JSON.parse(raw) } catch { return }
        window.localStorage.removeItem('lokalgo_pending_review')

        let selectedRating = 0

        const overlay = document.createElement('div')
        overlay.id = 'reviewPromptOverlay'
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.65);z-index:9999;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px);'
        overlay.innerHTML = `
          <div style="background:#fff;border-radius:24px 24px 0 0;padding:28px 24px 40px;width:100%;max-width:430px;font-family:'Plus Jakarta Sans',sans-serif;">
            <div style="text-align:center;margin-bottom:20px;">
              <div style="font-size:40px;margin-bottom:8px;">🎉</div>
              <div style="font-size:17px;font-weight:800;color:#111;margin-bottom:4px;">Pesanan Berjaya Dihantar!</div>
              <div style="font-size:13px;color:#666;">Bagaimana pengalaman anda dengan</div>
              <div style="font-size:14px;font-weight:700;color:#7B1533;margin-top:2px;">${pending.sellerName}</div>
            </div>

            <div style="display:flex;justify-content:center;gap:8px;margin-bottom:20px;" id="starRow">
              ${[1,2,3,4,5].map(n => `
                <button data-star="${n}" onclick="__rateSelect(${n})" style="background:none;border:none;font-size:36px;cursor:pointer;padding:4px;line-height:1;transition:transform 0.1s;" aria-label="${n} bintang">☆</button>
              `).join('')}
            </div>

            <textarea id="reviewText" placeholder="Ceritakan pengalaman anda... (pilihan)" style="width:100%;box-sizing:border-box;border:1.5px solid #E5E5EA;border-radius:12px;padding:12px 14px;font-size:13px;font-family:inherit;color:#111;resize:none;outline:none;height:90px;background:#fafafa;margin-bottom:16px;" oninput="this.style.borderColor='#7B1533'"></textarea>

            <button id="submitReviewBtn" onclick="__submitReview()" style="width:100%;background:linear-gradient(180deg,#8f1a3a 0%,#6a1029 100%);border:none;border-radius:14px;padding:15px;font-size:15px;font-weight:700;color:#fff;font-family:inherit;cursor:pointer;margin-bottom:12px;opacity:0.45;pointer-events:none;">
              Hantar Ulasan
            </button>
            <button onclick="window.location.href='/home'" style="width:100%;background:none;border:none;font-size:13px;color:#888;font-family:inherit;cursor:pointer;padding:8px;">
              Langkau → Ke Halaman Utama
            </button>
          </div>
        `
        document.body.appendChild(overlay)

        // Star rating interaction
        ;(window as Window & { __rateSelect?: (n: number) => void }).__rateSelect = (n: number) => {
          selectedRating = n
          overlay.querySelectorAll<HTMLButtonElement>('[data-star]').forEach((btn) => {
            const s = Number(btn.dataset.star)
            btn.textContent = s <= n ? '★' : '☆'
            btn.style.color = s <= n ? '#F7C948' : '#ccc'
            btn.style.transform = s === n ? 'scale(1.2)' : 'scale(1)'
          })
          const submitBtn = overlay.querySelector<HTMLButtonElement>('#submitReviewBtn')
          if (submitBtn) { submitBtn.style.opacity = '1'; submitBtn.style.pointerEvents = 'auto' }
        }

        ;(window as Window & { __submitReview?: () => Promise<void> }).__submitReview = async () => {
          if (selectedRating === 0) return
          const content = (overlay.querySelector<HTMLTextAreaElement>('#reviewText')?.value || '').trim()
          const submitBtn = overlay.querySelector<HTMLButtonElement>('#submitReviewBtn')
          if (submitBtn) { submitBtn.textContent = 'Menghantar...'; submitBtn.style.opacity = '0.7'; submitBtn.style.pointerEvents = 'none' }

          try {
            const supabaseR = createClient()
            await supabaseR.from('testimonials').insert({
              seller_id: pending.sellerId,
              buyer_id: null,
              buyer_name: buyerProfile?.name || 'Pembeli LokalGo™',
              buyer_kawasan: null,
              rating: selectedRating,
              content: content || 'Pengalaman yang menyenangkan!',
              is_approved: false,
            })
          } catch { /* ignore — navigate anyway */ }

          window.location.href = '/home'
        }
      }

      // Show review prompt if returning from a previous WA order
      if (window.localStorage.getItem('lokalgo_pending_review')) {
        window.setTimeout(() => { runtime.__showReviewPrompt?.() }, 800)
      }
    }

    const supportButton = document.querySelector<HTMLButtonElement>('.sokong-btn')
    if (supportButton) {
      supportButton.setAttribute('aria-label', 'Sokong Pembangun')
      supportButton.addEventListener('click', () => {
        window.location.href = '/sokong'
      })
    }

    loadProduct().catch((error) => {
      console.error(error)
      setText('.produk-name', 'Produk tidak dapat dimuatkan')
    })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <>
      <HtmlPrototypePage
        styles={`${styles}${uxStyles}`}
        markup={markup}
        scripts={scripts}
        externalScripts={externalScripts}
        externalStylesheets={externalStylesheets}
      />
      <LoginPromptModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  )
}
