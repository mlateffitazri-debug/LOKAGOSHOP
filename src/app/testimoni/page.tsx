'use client'

import { useEffect } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'
import { createClient } from '@/lib/supabase/client'
import type { Seller } from '@/types/database'

type TestimoniWindow = Window & {
  currentRating?: number
}

function setText(selector: string, text: string | number) {
  const element = document.querySelector<HTMLElement>(selector)
  if (element) element.textContent = String(text)
}

const styles = ":root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}\nbody{background:#0a0a0a;min-height:100vh;font-family:\u0027Plus Jakarta Sans\u0027,-apple-system,sans-serif;font-size:14px;color:var(--c-text);}\n.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}\n@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}\n@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}\n.scroll{height:812px;overflow-y:auto;padding-bottom:32px;}.scroll::-webkit-scrollbar{display:none;}\n\n/* HEADER */\n.header{background:var(--c-primary);padding:14px 20px 12px;}\n.header-r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;}\n.header-sub{font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:10px;}\n.header-r2{display:flex;gap:8px;align-items:center;}\n.sokong-btn{background:rgba(255,255,255,0.15);border:none;border-radius:20px;padding:6px 12px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;}\n.search-wrap{flex:1;background:rgba(255,255,255,0.92);border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:8px;}\n.search-wrap span{font-size:13px;color:#aaa;}\n.lang-btn{background:rgba(255,255,255,0.15);border:none;border-radius:8px;padding:8px 10px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;}\n\n/* SHOP INFO CARD */\n.shop-card{background:#fff;padding:20px 20px 16px;text-align:center;border-bottom:1px solid #eee;}\n.shop-name{font-size:20px;font-weight:800;color:var(--c-text);letter-spacing:-0.3px;margin-bottom:5px;}\n.verified-row{display:flex;align-items:center;justify-content:center;gap:5px;margin-bottom:10px;}\n.verified-txt{font-size:13px;font-weight:700;color:var(--c-accent);}\n.shop-desc{font-size:12px;color:var(--c-text2);line-height:1.6;max-width:300px;margin:0 auto;}\n\n/* STAR RATING CARD */\n.rating-card{background:var(--c-primary);margin:12px 24px 0;border-radius:14px;padding:18px 20px;text-align:center;}\n.rating-label{font-size:14px;font-weight:600;color:#fff;margin-bottom:14px;}\n.stars-row{display:flex;justify-content:center;gap:8px;margin-bottom:10px;}\n.star{cursor:pointer;transition:transform 0.1s;}\n.star:hover{transform:scale(1.15);}\n.star svg{display:block;}\n.rating-desc{font-size:13px;font-weight:700;color:#F0C040;min-height:18px;}\n\n/* FORM CARD */\n.form-card{background:var(--c-primary);margin:10px 24px 0;border-radius:14px;padding:18px 20px;}\n.field-wrap{margin-bottom:12px;}\n.field-wrap:last-child{margin-bottom:0;}\n.field-lbl{font-size:13px;font-weight:600;color:#fff;text-align:center;margin-bottom:8px;}\n.field-input{width:100%;border:none;border-radius:10px;padding:11px 14px;font-size:14px;color:var(--c-text);outline:none;background:#fff;font-family:inherit;}\n.field-input::placeholder{color:var(--c-hint);}\ntextarea.field-input{resize:none;height:90px;line-height:1.6;}\n\n/* PRIVACY NOTE */\n.privacy-note{margin:12px 24px 0;display:flex;align-items:flex-start;gap:10px;}\n.privacy-icon{width:28px;height:28px;background:#EAF3DE;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}\n.privacy-text{font-size:12px;color:var(--c-text2);line-height:1.6;}\n\n/* SUBMIT */\n.submit-wrap{padding:16px 24px 0;}\n.submit-btn{width:100%;background:linear-gradient(180deg,var(--c-primary-lt) 0%,var(--c-primary-dark) 100%);border:none;border-radius:14px;padding:16px 20px;display:flex;align-items:center;justify-content:center;gap:10px;color:#fff;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 1px 0 rgba(255,255,255,0.16) inset,0 -1px 0 rgba(0,0,0,0.2) inset,0 6px 24px rgba(123,21,51,0.45);transition:transform 0.12s;}\n.submit-btn::after{content:\u0027\u0027;position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.12) 0%,transparent 100%);border-radius:14px 14px 0 0;pointer-events:none;}\n.submit-btn:active{transform:scale(0.985);}\n.back-btn{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}"
const markup = "\u003cdiv class=\"page\"\u003e\n\u003cdiv class=\"scroll\"\u003e\n\n\u003c!-- HEADER --\u003e\n\u003cdiv class=\"header\"\u003e\n  \u003cdiv class=\"header-r1\"\u003e\n    \u003cbutton class=\"back-btn\" onclick=\"history.back()\" title=\"Kembali\"\u003e\u003csvg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"15 18 9 12 15 6\"/\u003e\u003c/svg\u003e\u003c/button\u003e\n    \u003csvg viewBox=\"0 0 1080 365\" xmlns=\"http://www.w3.org/2000/svg\" style=\"height:40px;width:auto;\"\u003e\n      \u003cstyle\u003e.s0{fill:#FFF}.s1{fill:#ADD036}\u003c/style\u003e\n      \u003cpath class=\"s0\" d=\"M133,61v175c0,13-11,24-24,24h-4c-13,0-24-11-24-24V61c0-13,11-24,24-24h4C122,37,133,48,133,61z\"/\u003e\n      \u003cpath class=\"s0\" d=\"M180,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11s31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11S193,258,180,251z M249,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C234,218,242,214,249,207z\"/\u003e\n      \u003cpath class=\"s0\" d=\"M411,248l-43-59v49c0,12-9,21-21,21h-7c-13,0-23-10-23-23V56c0-11,9-19,19-19h15c10,0,17,8,17,17v106l43-57c5-7,13-11,22-11h32c7,0,11,8,6,14l-58,70l54,65c6,7,1,19-9,19h-25C425,259,416,255,411,248z\"/\u003e\n      \u003cpath class=\"s0\" d=\"M470,130c7-13,15-23,27-30c11-7,24-11,38-11c12,0,22,2,31,7s16,11,21,19v-8c0-9,7-16,16-16h20c8,0,15,7,15,15v139c0,7-6,13-13,13h-21c-10,0-17-8-17-17v-6c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-37-11c-11-7-20-17-27-30c-7-13-10-28-10-46C460,158,464,143,470,130z M575,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C586,163,582,153,575,145z\"/\u003e\n      \u003cpath class=\"s1\" d=\"M747,96c9,5,16,11,21,19v-7c0-9,7-17,17-17h19c9,0,16,7,16,16v152c0,15-3,29-9,42c-6,13-15,23-28,30c-13,7-28,11-47,11c-25,0-45-6-60-18c-11-8-18-19-23-31c-3-8,3-17,12-17h21c8,0,14,4,19,10c2,2,4,4,7,6c6,4,13,6,22,6c11,0,19-3,25-9c6-6,10-16,10-29v-24c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-38-11c-11-7-20-17-27-30c-7-13-10-28-10-46c0-17,3-32,10-45c7-13,15-23,27-30c11-7,24-11,38-11C728,89,738,91,747,96z M757,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C768,163,764,153,757,145z\"/\u003e\n      \u003cpath class=\"s1\" d=\"M866,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11c16,0,31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11C894,262,879,258,866,251z M935,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C920,218,928,214,935,207z\"/\u003e\n    \u003c/svg\u003e\n    \u003cbutton class=\"sokong-btn\"\u003e\n      \u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\n      Sokong Pembangun Anda\n    \u003c/button\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"header-sub\"\u003e\u003cspan data-i18n=\"tagline\"\u003ePlatform perniagaan lokal setempat\u003c/span\u003e\u003c/div\u003e\n  \u003cdiv class=\"header-r2\"\u003e\n    \u003cdiv class=\"search-wrap\"\u003e\n      \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#aaa\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"11\" cy=\"11\" r=\"8\"/\u003e\u003cline x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/\u003e\u003c/svg\u003e\n      \u003cspan\u003eCari kedai atau produk\u003c/span\u003e\n    \u003c/div\u003e\n    \u003cbutton class=\"lang-btn\" onclick=\"i18n.toggle()\"\u003e\n      \u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"10\"/\u003e\u003cline x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"/\u003e\u003cpath d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/\u003e\u003c/svg\u003e\n      \u003cspan class=\"lang-btn-txt\"\u003eEnglish\u003c/span\u003e\n    \u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- SHOP INFO --\u003e\n\u003cdiv class=\"shop-card\"\u003e\n  \u003cdiv class=\"shop-name\"\u003eResepi Kak Mila\u003c/div\u003e\n  \u003cdiv class=\"verified-row\"\u003e\n    \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#ADD036\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M22 11.08V12a10 10 0 1 1-5.93-9.14\"/\u003e\u003cpolyline points=\"22 4 12 14.01 9 11.01\"/\u003e\u003c/svg\u003e\n    \u003cspan class=\"verified-txt\"\u003e\u003cspan data-i18n=\"verified_shop\"\u003eVerified Shop\u003c/span\u003e\u003c/span\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"shop-desc\"\u003eKuih-kuih tradisional \u0026 kek untuk harijadi. Tempah sehari awal untuk tempahan secara pukal untuk majlis harijadi. Self pickup didepan rumah atau penghantaran COD dikawasan sekitar secara percuma.\u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- STAR RATING --\u003e\n\u003cdiv class=\"rating-card\"\u003e\n  \u003cdiv class=\"rating-label\"\u003eBagaimana pengalaman anda\u003c/div\u003e\n  \u003cdiv class=\"stars-row\" id=\"starsRow\"\u003e\n    \u003cdiv class=\"star\" onclick=\"setRating(1)\"\u003e\u003csvg width=\"40\" height=\"40\" viewBox=\"0 0 24 24\" fill=\"#F0C040\" stroke=\"none\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"star\" onclick=\"setRating(2)\"\u003e\u003csvg width=\"40\" height=\"40\" viewBox=\"0 0 24 24\" fill=\"#F0C040\" stroke=\"none\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"star\" onclick=\"setRating(3)\"\u003e\u003csvg width=\"40\" height=\"40\" viewBox=\"0 0 24 24\" fill=\"#F0C040\" stroke=\"none\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"star\" onclick=\"setRating(4)\"\u003e\u003csvg width=\"40\" height=\"40\" viewBox=\"0 0 24 24\" fill=\"#F0C040\" stroke=\"none\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n    \u003cdiv class=\"star\" onclick=\"setRating(5)\"\u003e\u003csvg width=\"40\" height=\"40\" viewBox=\"0 0 24 24\" fill=\"rgba(255,255,255,0.25)\" stroke=\"none\"\u003e\u003cpath d=\"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z\"/\u003e\u003c/svg\u003e\u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"rating-desc\" id=\"ratingDesc\"\u003eSangat baik!\u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- FORM --\u003e\n\u003cdiv class=\"form-card\"\u003e\n  \u003cdiv class=\"field-wrap\"\u003e\n    \u003cdiv class=\"field-lbl\"\u003eNama anda\u003c/div\u003e\n    \u003cinput class=\"field-input\" type=\"text\" placeholder=\"Nama pertama sahaja\"\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"field-wrap\"\u003e\n    \u003cdiv class=\"field-lbl\"\u003eKawasan\u003c/div\u003e\n    \u003cinput class=\"field-input\" type=\"text\" placeholder=\"cth: Taman Sri Muda\"\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"field-wrap\"\u003e\n    \u003cdiv class=\"field-lbl\"\u003eUlasan Anda\u003c/div\u003e\n    \u003ctextarea class=\"field-input\" placeholder=\"Ceritakan pengalaman anda...\"\u003e\u003c/textarea\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- PRIVACY NOTE --\u003e\n\u003cdiv class=\"privacy-note\"\u003e\n  \u003cdiv class=\"privacy-icon\"\u003e\n    \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#4A7C10\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/\u003e\u003c/svg\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"privacy-text\"\u003ePrivasi anda terjaga. Hanya nama pertama dan kawasan yang dipaparkan. Nombor telefon dan email anda tidak dikongsi kepada sesiapa.\u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- SUBMIT --\u003e\n\u003cdiv class=\"submit-wrap\"\u003e\n  \u003cbutton class=\"submit-btn\"\u003e\n    \u003csvg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cline x1=\"22\" y1=\"2\" x2=\"11\" y2=\"13\"/\u003e\u003cpolygon points=\"22 2 15 22 11 13 2 9 22 2\"/\u003e\u003c/svg\u003e\n    Hantar testimoni\n  \u003c/button\u003e\n\u003c/div\u003e\n\n\u003c/div\u003e\n\u003c/div\u003e"
const scripts: string[] = ["var currentRating = 4;\nvar labels = [\u0027\u0027,\u0027Kurang baik\u0027,\u0027Boleh tahan\u0027,\u0027Bagus\u0027,\u0027Sangat baik!\u0027,\u0027Terbaik! ⭐\u0027];\n\nfunction setRating(n) {\n  currentRating = n;\n  var stars = document.querySelectorAll(\u0027.star svg\u0027);\n  stars.forEach(function(s, i) {\n    s.setAttribute(\u0027fill\u0027, i \u003c n ? \u0027#F0C040\u0027 : \u0027rgba(255,255,255,0.25)\u0027);\n  });\n  document.getElementById(\u0027ratingDesc\u0027).textContent = labels[n];\n}"]
const externalScripts: string[] = []
const externalStylesheets: string[] = ["https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800\u0026display=swap"]
const uxStyles = `
.back-btn,.sokong-btn,.star{min-width:44px;min-height:44px}
.form-message{margin:12px 24px 0;border-radius:12px;padding:11px 13px;font-size:13px;font-weight:700;line-height:1.4}
.form-message.error{background:#fff0f3;color:#7B1533;border:1px solid #f3c4d2}
.form-message.success{background:#edf8df;color:#3d7520;border:1px solid #cfe9b6}
.field-input.invalid{box-shadow:0 0 0 2px #f3c4d2}
.submit-btn:disabled{opacity:.7;cursor:not-allowed}
`

export default function Page() {
  useEffect(() => {
    let currentSeller: Seller | null = null
    const supabase = createClient()
    const params = new URLSearchParams(window.location.search)
    const sellerId = params.get('seller') || params.get('seller_id') || params.get('shop') || params.get('id')
    const submitButton = document.querySelector<HTMLButtonElement>('.submit-btn')
    const formCard = document.querySelector<HTMLElement>('.form-card')
    const message = document.createElement('div')
    message.className = 'form-message'
    message.style.display = 'none'
    formCard?.insertAdjacentElement('afterend', message)

    function showMessage(text: string, type: 'error' | 'success' = 'error') {
      message.textContent = text
      message.className = `form-message ${type}`
      message.style.display = 'block'
    }

    document.querySelector<HTMLButtonElement>('.sokong-btn')?.addEventListener('click', () => {
      window.location.href = '/sokong'
    })

    async function loadSeller() {
      if (!sellerId) return

      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('id', sellerId)
        .single()

      if (error) {
        console.error(error)
        return
      }

      currentSeller = data as Seller
      setText('.shop-name', currentSeller.shop_name)
      setText('.shop-desc', `${currentSeller.taman_name}, ${currentSeller.postcode}${currentSeller.kawasan ? ` ${currentSeller.kawasan}` : ''}`)
      setText('.verified-txt', currentSeller.badge === 'verified_seller' ? 'Verified Shop' : 'Seller LokalGo')
    }

    async function submitTestimonial() {
      if (!currentSeller?.id) {
        showMessage('Seller tidak ditemui. Sila buka borang testimoni dari halaman kedai.')
        return
      }

      const fields = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.field-input')
      const buyerName = fields[0]?.value.trim()
      const buyerKawasan = fields[1]?.value.trim()
      const content = fields[2]?.value.trim()
      const rating = (window as TestimoniWindow).currentRating || 4

      if (!content) {
        fields[2]?.classList.add('invalid')
        showMessage('Sila tulis ulasan anda dahulu.')
        return
      }

      fields[2]?.classList.remove('invalid')
      submitButton?.setAttribute('disabled', 'true')
      if (submitButton) submitButton.textContent = 'Menghantar...'

      const response = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seller_id: currentSeller.id,
          buyer_name: buyerName || 'Pembeli LokalGo',
          buyer_kawasan: buyerKawasan || null,
          rating,
          content,
        }),
      })
      const payload = (await response.json()) as { error?: string }

      submitButton?.removeAttribute('disabled')
      if (submitButton) submitButton.textContent = 'Hantar testimoni'

      if (!response.ok) {
        showMessage(payload.error || 'Testimoni tidak dapat dihantar.')
        return
      }

      showMessage('Terima kasih. Testimoni anda akan dipaparkan selepas diluluskan admin.', 'success')
      window.location.href = `/shop?seller=${currentSeller.id}`
    }

    submitButton?.addEventListener('click', submitTestimonial)
    loadSeller().catch(console.error)

    return () => {
      submitButton?.removeEventListener('click', submitTestimonial)
      message.remove()
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
