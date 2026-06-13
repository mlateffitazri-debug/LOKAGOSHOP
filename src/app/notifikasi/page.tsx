'use client'

import { useEffect } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'
import { createClient } from '@/lib/supabase/client'
import type { AdminMessage } from '@/types/database'

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function notifTime(value: string) {
  return new Intl.DateTimeFormat('ms-MY', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

type NotifItem = {
  id: string
  type: 'admin' | 'product_approved' | 'seller_verified'
  title: string
  body: string
  is_read: boolean
  sent_at: string
}

function notifCard(item: NotifItem) {
  const iconMap: Record<NotifItem['type'], string> = {
    admin: `<div class="notif-icon" style="background:#FFF3E0;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F0A500" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div>`,
    product_approved: `<div class="notif-icon" style="background:#EDF7ED;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>`,
    seller_verified: `<div class="notif-icon" style="background:#E8F0FE;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#185FA5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>`,
  }
  return `<div class="notif-card${item.is_read ? '' : ' unread'}" data-id="${escapeHtml(item.id)}" data-type="${item.type}">
    ${iconMap[item.type]}
    <div class="notif-body">
      <div class="notif-title">${escapeHtml(item.title)}</div>
      <div class="notif-desc">${escapeHtml(item.body)}</div>
      <div class="notif-time">${notifTime(item.sent_at)}</div>
    </div>
    ${item.is_read ? '' : '<div class="unread-dot"></div>'}
  </div>`
}

const styles = `:root{--c-primary:#7B1533;--c-accent:#ADD036;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}
html,body{overflow:hidden;height:100%;}
body{background:#0a0a0a;font-family:'Plus Jakarta Sans',-apple-system,sans-serif;font-size:14px;color:var(--c-text);}
.page{position:relative;width:100%;max-width:430px;margin:0 auto;height:100dvh;background:var(--c-bg);overflow:hidden;display:flex;flex-direction:column;}
@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{height:calc(100dvh - 80px);border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}
@media(min-width:1024px){body{align-items:center;padding:40px;}}
.scroll{flex:1;min-height:0;overflow-y:auto;overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch;padding-bottom:env(safe-area-inset-bottom);}.scroll::-webkit-scrollbar{display:none;}
.header{flex-shrink:0;background:var(--c-primary);padding:calc(env(safe-area-inset-top) + 14px) 20px 14px;}
.header-r1{display:flex;align-items:center;gap:12px;}
.back-btn{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}
.header-title{font-size:17px;font-weight:700;color:#fff;flex:1;}
.mark-all{font-size:12px;color:rgba(255,255,255,0.7);font-weight:500;cursor:pointer;border:none;background:none;font-family:inherit;padding:4px;}
.date-group{padding:12px 20px 4px;}
.date-label{font-size:11px;font-weight:700;color:var(--c-hint);text-transform:uppercase;letter-spacing:0.5px;}
.notif-card{background:#fff;margin:0 16px 8px;border-radius:12px;border:1px solid #eee;padding:12px;display:flex;gap:12px;align-items:flex-start;cursor:pointer;transition:background 0.15s;}
.notif-card.unread{background:#fff9fb;border-color:#f0d0d8;}
.notif-icon{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
.notif-body{flex:1;min-width:0;}
.notif-title{font-size:13px;font-weight:700;color:var(--c-text);margin-bottom:3px;}
.notif-desc{font-size:12px;color:var(--c-text2);line-height:1.6;}
.notif-time{font-size:10px;color:var(--c-hint);margin-top:5px;}
.unread-dot{width:8px;height:8px;background:var(--c-primary);border-radius:50%;flex-shrink:0;margin-top:4px;}
.empty{padding:60px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:12px;}
.empty-icon{width:64px;height:64px;background:#f0f0f0;border-radius:50%;display:flex;align-items:center;justify-content:center;}
.empty-title{font-size:15px;font-weight:700;color:var(--c-text);}
.empty-sub{font-size:13px;color:var(--c-text3);line-height:1.6;}
.loading{padding:40px 24px;text-align:center;color:var(--c-text3);font-size:13px;}`

const markup = `<div class="page">
<div class="header">
  <div class="header-r1">
    <button class="back-btn" onclick="history.back()">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
    </button>
    <span class="header-title">Notifikasi</span>
    <button class="mark-all" id="markAllBtn">Tandai semua dibaca</button>
  </div>
</div>
<div class="scroll" id="notifScroll">
  <div class="loading">Memuatkan notifikasi…</div>
</div>
</div>`

const externalStylesheets = ["https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"]

export default function Page() {
  useEffect(() => {
    const supabase = createClient()
    let allItems: NotifItem[] = []

    async function markAdminRead(id?: string) {
      await fetch('/api/admin-messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { id } : { all: true }),
      })
    }

    function render() {
      const scroll = document.getElementById('notifScroll')
      if (!scroll) return

      if (allItems.length === 0) {
        scroll.innerHTML = `<div class="empty">
          <div class="empty-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
          <div class="empty-title">Tiada notifikasi</div>
          <div class="empty-sub">Notifikasi dari admin dan kemas kini produk akan dipaparkan di sini.</div>
        </div>`
        return
      }

      const unread = allItems.filter((i) => !i.is_read)
      const markAllBtn = document.getElementById('markAllBtn')
      if (markAllBtn) markAllBtn.style.display = unread.length > 0 ? '' : 'none'

      scroll.innerHTML = `
        <div class="date-group"><span class="date-label">Semua Notifikasi</span></div>
        ${allItems.map(notifCard).join('')}
        <div style="height:16px;"></div>`

      scroll.querySelectorAll<HTMLElement>('.notif-card').forEach((card) => {
        card.addEventListener('click', async () => {
          const id = card.dataset.id
          const type = card.dataset.type as NotifItem['type']
          if (!id) return
          card.classList.remove('unread')
          card.querySelector('.unread-dot')?.remove()
          const item = allItems.find((i) => i.id === id)
          if (item) item.is_read = true
          if (type === 'admin') await markAdminRead(id)
          // product_approved / seller_verified: mark seen in localStorage via seenKey (set by dashboard)
        })
      })
    }

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }

      const { data: sellerRow } = await supabase
        .from('sellers')
        .select('id, status, approved_at, shop_name')
        .eq('user_id', user.id)
        .maybeSingle()

      const seenKey = sellerRow ? `lk_seen_${sellerRow.id}` : null
      let seen: { products: string[]; active: boolean } = { products: [], active: false }
      if (seenKey) {
        try { seen = JSON.parse(localStorage.getItem(seenKey) || '{}') } catch { /* ignore */ }
        seen.products = seen.products ?? []
      }

      const items: NotifItem[] = []

      // Admin messages
      const msgRes = await fetch('/api/admin-messages', { cache: 'no-store' })
      if (msgRes.status === 401) { window.location.href = '/auth'; return }
      const msgPayload = await msgRes.json() as { messages?: AdminMessage[] }
      for (const m of msgPayload.messages ?? []) {
        items.push({ id: m.id, type: 'admin', title: m.title, body: m.body, is_read: m.is_read, sent_at: m.sent_at })
      }

      // Product approval notifications
      if (sellerRow) {
        const { data: products } = await supabase
          .from('products')
          .select('id, name, category, status, created_at')
          .eq('seller_id', sellerRow.id)
          .eq('status', 'approved')
          .order('created_at', { ascending: false })

        for (const p of products ?? []) {
          const displayName = (p as { name?: string | null }).name || p.category || 'Produk'
          const isSeen = seen.products.includes(p.id)
          items.push({
            id: `prod_${p.id}`,
            type: 'product_approved',
            title: `Produk diluluskan: ${displayName}`,
            body: 'Produk anda telah diluluskan oleh admin dan kini boleh diaktifkan untuk jualan.',
            is_read: isSeen,
            sent_at: (p as { created_at: string }).created_at,
          })
        }

        // Seller verified notification
        if (sellerRow.status === 'active' && sellerRow.approved_at) {
          items.push({
            id: `active_${sellerRow.id}`,
            type: 'seller_verified',
            title: `Tahniah! Kedai "${sellerRow.shop_name}" telah diluluskan`,
            body: 'Kedai anda kini aktif dan boleh dilihat oleh pembeli di LokalGo.',
            is_read: seen.active,
            sent_at: (sellerRow as { approved_at: string }).approved_at,
          })
        }
      }

      // Sort by date desc
      items.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime())
      allItems = items

      // Mark all seen in localStorage after loading
      if (seenKey && sellerRow) {
        const approvedIds = items
          .filter((i) => i.type === 'product_approved')
          .map((i) => i.id.replace('prod_', ''))
        localStorage.setItem(seenKey, JSON.stringify({
          products: approvedIds,
          active: sellerRow.status === 'active',
        }))
      }

      render()

      document.getElementById('markAllBtn')?.addEventListener('click', async () => {
        allItems = allItems.map((i) => ({ ...i, is_read: true }))
        await markAdminRead()
        render()
      })
    }

    load().catch(console.error)
  }, [])

  return (
    <HtmlPrototypePage
      styles={styles}
      markup={markup}
      scripts={[]}
      externalScripts={[]}
      externalStylesheets={externalStylesheets}
    />
  )
}
