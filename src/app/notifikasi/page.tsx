'use client'

import { useEffect } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'
import type { AdminMessage } from '@/types/database'

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function notificationIcon(type: AdminMessage['type']) {
  if (type === 'warning') return 'ni-review'
  if (type === 'success') return 'ni-badge'
  if (type === 'flag') return 'ni-system'
  return 'ni-view'
}

function notificationTime(value: string) {
  return new Intl.DateTimeFormat('ms-MY', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function notificationCard(message: AdminMessage) {
  return `<div class="notif-card ${message.is_read ? '' : 'unread'}" data-id="${message.id}">
      <div class="notif-icon ${notificationIcon(message.type)}"></div>
    <div class="notif-body">
      <div class="notif-title">${escapeHtml(message.title)}</div>
      <div class="notif-desc">${escapeHtml(message.body)}</div>
      <div class="notif-time">${notificationTime(message.sent_at)}</div>
    </div>
    ${message.is_read ? '' : '<div class="unread-dot"></div>'}
  </div>`
}

const styles = ":root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-accent:#ADD036;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}\nbody{background:#0a0a0a;min-height:100vh;font-family:\u0027Plus Jakarta Sans\u0027,-apple-system,sans-serif;font-size:14px;color:var(--c-text);}\n.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}\n@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}\n@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}\n.scroll{height:812px;overflow-y:auto;}.scroll::-webkit-scrollbar{display:none;}\n\n/* HEADER */\n.header{background:var(--c-primary);padding:14px 20px 16px;}\n.header-r1{display:flex;align-items:center;gap:12px;margin-bottom:3px;}\n.back-btn{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}\n.header-title{font-size:17px;font-weight:700;color:#fff;flex:1;}\n.mark-all{font-size:12px;color:rgba(255,255,255,0.7);font-weight:500;cursor:pointer;border:none;background:none;font-family:inherit;}\n\n/* DATE GROUP */\n.date-group{padding:12px 20px 6px;}\n.date-label{font-size:11px;font-weight:700;color:var(--c-hint);text-transform:uppercase;letter-spacing:0.5px;}\n\n/* NOTIF CARD */\n.notif-card{background:#fff;margin:0 20px 8px;border-radius:12px;border:1px solid #eee;padding:12px;display:flex;gap:12px;align-items:flex-start;cursor:pointer;transition:background 0.15s;}\n.notif-card.unread{background:#fff9fb;border-color:#f0d0d8;}\n.notif-card:hover{background:#f9f9f9;}\n.notif-icon{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}\n.ni-view{background:#EAF3DE;}\n.ni-review{background:#FFF3E0;}\n.ni-badge{background:#E8F0FE;}\n.ni-system{background:#F3E8FF;}\n.notif-body{flex:1;}\n.notif-title{font-size:13px;font-weight:700;color:var(--c-text);margin-bottom:3px;}\n.notif-desc{font-size:12px;color:var(--c-text2);line-height:1.6;}\n.notif-time{font-size:10px;color:var(--c-hint);margin-top:5px;}\n.unread-dot{width:8px;height:8px;background:var(--c-primary);border-radius:50%;flex-shrink:0;margin-top:4px;}\n\n/* EMPTY STATE */\n.empty{padding:60px 24px;text-align:center;}\n.empty-icon{width:64px;height:64px;background:#f0f0f0;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;}\n.empty-title{font-size:15px;font-weight:700;color:var(--c-text);margin-bottom:6px;}\n.empty-sub{font-size:13px;color:var(--c-text3);line-height:1.6;}"
const markup = "\u003cdiv class=\"page\"\u003e\n\u003cdiv class=\"scroll\"\u003e\n\n\u003cdiv class=\"header\"\u003e\n  \u003cdiv class=\"header-r1\"\u003e\n    \u003cbutton class=\"back-btn\" onclick=\"history.back()\"\u003e\n      \u003csvg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"15 18 9 12 15 6\"/\u003e\u003c/svg\u003e\n    \u003c/button\u003e\n    \u003cspan class=\"header-title\"\u003e\u003cspan data-i18n=\"notifikasi\"\u003eNotifikasi\u003c/span\u003e\u003c/span\u003e\n    \u003cbutton class=\"mark-all\"\u003eTandai semua dibaca\u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- TODAY --\u003e\n\u003cdiv class=\"date-group\"\u003e\u003cspan class=\"date-label\"\u003eHari Ini\u003c/span\u003e\u003c/div\u003e\n\n\u003cdiv class=\"notif-card unread\"\u003e\n  \u003cdiv class=\"notif-icon ni-review\"\u003e\n    \u003csvg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#F0A500\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"notif-body\"\u003e\n    \u003cdiv class=\"notif-title\"\u003eTestimoni baru menunggu semakan\u003c/div\u003e\n    \u003cdiv class=\"notif-desc\"\u003eKak Ros dari Taman Sri Muda telah menulis ulasan untuk kedai anda. Admin sedang menyemak.\u003c/div\u003e\n    \u003cdiv class=\"notif-time\"\u003e2 jam lepas\u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"unread-dot\"\u003e\u003c/div\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"notif-card unread\"\u003e\n  \u003cdiv class=\"notif-icon ni-view\"\u003e\n    \u003csvg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#4A7C10\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"/\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"3\"/\u003e\u003c/svg\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"notif-body\"\u003e\n    \u003cdiv class=\"notif-title\"\u003e12 paparan baru hari ini\u003c/div\u003e\n    \u003cdiv class=\"notif-desc\"\u003eKedai anda telah dilihat oleh 12 pembeli baru dalam kawasan Taman Desa Baiduri.\u003c/div\u003e\n    \u003cdiv class=\"notif-time\"\u003ePagi ini\u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"unread-dot\"\u003e\u003c/div\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"notif-card unread\"\u003e\n  \u003cdiv class=\"notif-icon ni-view\"\u003e\n    \u003csvg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#4A7C10\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"/\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"3\"/\u003e\u003c/svg\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"notif-body\"\u003e\n    \u003cdiv class=\"notif-title\"\u003e5 klik WhatsApp baru\u003c/div\u003e\n    \u003cdiv class=\"notif-desc\"\u003e5 pembeli telah menekan butang WhatsApp kedai anda hari ini. Semak pesanan masuk anda.\u003c/div\u003e\n    \u003cdiv class=\"notif-time\"\u003ePagi ini\u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"unread-dot\"\u003e\u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- YESTERDAY --\u003e\n\u003cdiv class=\"date-group\"\u003e\u003cspan class=\"date-label\"\u003eSemalam\u003c/span\u003e\u003c/div\u003e\n\n\u003cdiv class=\"notif-card\"\u003e\n  \u003cdiv class=\"notif-icon ni-badge\"\u003e\n    \u003csvg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#185FA5\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"notif-body\"\u003e\n    \u003cdiv class=\"notif-title\"\u003eTahniah! Testimoni anda diluluskan\u003c/div\u003e\n    \u003cdiv class=\"notif-desc\"\u003eUlasan dari Abang Faris telah diluluskan oleh admin dan kini dipaparkan di kedai anda.\u003c/div\u003e\n    \u003cdiv class=\"notif-time\"\u003eSemalam, 3:42 ptg\u003c/div\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003cdiv class=\"notif-card\"\u003e\n  \u003cdiv class=\"notif-icon ni-badge\"\u003e\n    \u003csvg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#185FA5\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"/\u003e\u003cpolyline points=\"22 4 12 14.01 9 11.01\"/\u003e\u003c/svg\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"notif-body\"\u003e\n    \u003cdiv class=\"notif-title\"\u003eSkor populariti anda naik!\u003c/div\u003e\n    \u003cdiv class=\"notif-desc\"\u003eSkor populariti kedai anda meningkat kepada 87%. Teruskan aktif untuk capai Verified Seller.\u003c/div\u003e\n    \u003cdiv class=\"notif-time\"\u003eSemalam, 12:00 tgh\u003c/div\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- EARLIER --\u003e\n\u003cdiv class=\"date-group\"\u003e\u003cspan class=\"date-label\"\u003eLebih Awal\u003c/span\u003e\u003c/div\u003e\n\n\u003cdiv class=\"notif-card\"\u003e\n  \u003cdiv class=\"notif-icon ni-system\"\u003e\n    \u003csvg width=\"20\" height=\"20\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#6B21A8\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"10\"/\u003e\u003cline x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"/\u003e\u003cline x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"/\u003e\u003c/svg\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"notif-body\"\u003e\n    \u003cdiv class=\"notif-title\"\u003eKedai anda telah diaktifkan\u003c/div\u003e\n    \u003cdiv class=\"notif-desc\"\u003eSelamat datang ke LokalGo Shop! Kedai Resepi Kak Mila kini aktif dan boleh dilihat oleh pembeli.\u003c/div\u003e\n    \u003cdiv class=\"notif-time\"\u003e3 hari lepas\u003c/div\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c/div\u003e\n\u003c/div\u003e"
const scripts: string[] = []
const externalScripts: string[] = []
const externalStylesheets: string[] = ["https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800\u0026display=swap"]

export default function Page() {
  useEffect(() => {
    let messages: AdminMessage[] = []

    async function markRead(id?: string) {
      await fetch('/api/admin-messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { id } : { all: true }),
      })
    }

    function render() {
      const scroll = document.querySelector<HTMLElement>('.scroll')
      const header = document.querySelector<HTMLElement>('.header')
      if (!scroll || !header) return

      scroll.innerHTML = `${header.outerHTML}
        ${messages.length ? '<div class="date-group"><span class="date-label">Mesej Admin</span></div>' : ''}
        ${messages.length ? messages.map(notificationCard).join('') : '<div class="empty"><div class="empty-icon"></div><div class="empty-title">Tiada notifikasi</div><div class="empty-sub">Mesej admin akan dipaparkan di sini.</div></div>'}`

      scroll.querySelectorAll<HTMLElement>('.notif-card').forEach((card) => {
        card.addEventListener('click', async () => {
          const id = card.dataset.id
          if (!id) return
          card.classList.remove('unread')
          card.querySelector('.unread-dot')?.remove()
          await markRead(id)
        })
      })

      scroll.querySelector<HTMLButtonElement>('.mark-all')?.addEventListener('click', async () => {
        messages = messages.map((message) => ({ ...message, is_read: true }))
        await markRead()
        render()
      })
    }

    async function loadMessages() {
      const response = await fetch('/api/admin-messages', { cache: 'no-store' })
      const payload = (await response.json()) as { messages?: AdminMessage[]; error?: string }

      if (response.status === 401) {
        window.location.href = '/auth'
        return
      }

      if (!response.ok) {
        throw new Error(payload.error || 'Tidak dapat memuat notifikasi.')
      }

      messages = payload.messages ?? []
      render()
    }

    loadMessages().catch((error) => {
      console.error(error)
    })
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
