'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'

type OnboardingWindow = Window & {
  __submitSellerOnboarding?: () => void
}

const styles = ":root{--c-primary:#7B1533;--c-primary-dark:#6A1029;--c-primary-lt:#8f1a3a;--c-accent:#ADD036;--c-bg:#F5F5F5;--c-surface:#FFFFFF;--c-border:#E5E5EA;--c-text:#111111;--c-text2:#555555;--c-text3:#888888;--c-hint:#BBBBBB;}\n*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}\nbody{background:#0a0a0a;min-height:100vh;font-family:\u0027Plus Jakarta Sans\u0027,-apple-system,sans-serif;font-size:14px;color:var(--c-text);}\n.page{width:100%;max-width:430px;margin:0 auto;min-height:100vh;background:var(--c-bg);overflow:hidden;}\n@media(min-width:500px){body{padding:40px 20px;display:flex;justify-content:center;align-items:flex-start;}.page{min-height:auto;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}\n@media(min-width:1024px){body{align-items:center;padding:40px;min-height:100vh;}}\n.scroll{height:812px;overflow-y:auto;padding-bottom:32px;}.scroll::-webkit-scrollbar{display:none;}\n\n/* HEADER */\n.header{background:var(--c-primary);padding:14px 20px 12px;}\n.header-r1{display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;}\n.header-sub{font-size:11px;color:rgba(255,255,255,0.55);margin-bottom:10px;}\n.header-r2{display:flex;gap:8px;align-items:center;}\n.sokong-btn{background:rgba(255,255,255,0.15);border:none;border-radius:20px;padding:6px 12px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:5px;cursor:pointer;white-space:nowrap;}\n.search-wrap{flex:1;background:rgba(255,255,255,0.92);border-radius:10px;padding:9px 12px;display:flex;align-items:center;gap:8px;}\n.search-wrap span{font-size:13px;color:#aaa;}\n.lang-btn{background:rgba(255,255,255,0.15);border:none;border-radius:8px;padding:8px 10px;color:#fff;font-size:11px;font-weight:600;font-family:inherit;display:flex;align-items:center;gap:4px;cursor:pointer;white-space:nowrap;}\n\n/* PAGE TITLE */\n.page-title-wrap{padding:24px 20px 20px;text-align:center;}\n.page-title{font-size:22px;font-weight:800;color:var(--c-text);letter-spacing:-0.3px;}\n\n/* SECTION */\n.form-section{padding:0 20px;display:flex;flex-direction:column;gap:20px;}\n.field-label{font-size:14px;font-weight:700;color:var(--c-primary);text-align:center;margin-bottom:12px;}\n\n/* UPLOAD BOX */\n.upload-box{width:100%;background:#fff;border:2px dashed var(--c-border);border-radius:14px;padding:32px 20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;cursor:pointer;transition:border 0.2s;}\n.upload-box:hover{border-color:var(--c-primary);}\n.upload-icon{width:48px;height:48px;background:#f5f5f5;border-radius:12px;display:flex;align-items:center;justify-content:center;}\n.upload-text{font-size:14px;font-weight:600;color:var(--c-text2);}\n.upload-hint{font-size:11px;color:var(--c-hint);}\n\n/* DESCRIPTION */\n.desc-input{width:100%;border:1.5px solid var(--c-border);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--c-text);outline:none;background:#fff;font-family:inherit;resize:none;height:90px;line-height:1.6;transition:border 0.2s;}\n.desc-input:focus{border-color:var(--c-primary);}\n.desc-input::placeholder{color:var(--c-hint);}\n\n/* CATEGORY GRID */\n.cat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}\n.cat-item{display:flex;align-items:center;gap:10px;background:#fff;border:1.5px solid var(--c-border);border-radius:10px;padding:12px;cursor:pointer;transition:all 0.15s;}\n.cat-item.selected{border-color:var(--c-primary);background:#fff5f7;}\n.cat-checkbox{width:20px;height:20px;border-radius:5px;border:1.5px solid var(--c-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.15s;}\n.cat-item.selected .cat-checkbox{background:var(--c-primary);border-color:var(--c-primary);}\n.cat-name{font-size:13px;font-weight:600;color:var(--c-text);}\n.cat-item.selected .cat-name{color:var(--c-primary);}\n.cat-full{grid-column:1/-1;}\n\n/* AGREE */\n.agree-wrap{background:#fff;border:1.5px solid var(--c-border);border-radius:12px;padding:14px;display:flex;gap:12px;align-items:flex-start;cursor:pointer;}\n.agree-wrap.checked{border-color:var(--c-primary);background:#fff5f7;}\n.agree-box{width:22px;height:22px;border-radius:6px;border:1.5px solid var(--c-border);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px;transition:all 0.15s;}\n.agree-wrap.checked .agree-box{background:var(--c-primary);border-color:var(--c-primary);}\n.agree-text{font-size:12px;color:var(--c-text2);line-height:1.6;}\n.agree-text a{color:var(--c-primary);font-weight:600;text-decoration:none;}\n\n/* SUBMIT */\n.submit-wrap{padding:20px 20px 0;}\n.submit-btn{width:100%;background:linear-gradient(180deg,var(--c-primary-lt) 0%,var(--c-primary-dark) 100%);border:none;border-radius:14px;padding:16px 20px;display:flex;align-items:center;justify-content:center;gap:10px;color:#fff;font-size:16px;font-weight:700;font-family:inherit;cursor:pointer;position:relative;overflow:hidden;box-shadow:0 1px 0 rgba(255,255,255,0.16) inset,0 -1px 0 rgba(0,0,0,0.2) inset,0 6px 24px rgba(123,21,51,0.45);transition:transform 0.12s;}\n.submit-btn::after{content:\u0027\u0027;position:absolute;top:0;left:0;right:0;height:50%;background:linear-gradient(180deg,rgba(255,255,255,0.12) 0%,transparent 100%);border-radius:14px 14px 0 0;pointer-events:none;}\n.submit-btn:active{transform:scale(0.985);}\n.submit-note{font-size:11px;color:var(--c-hint);text-align:center;margin-top:10px;line-height:1.6;padding:0 8px;}\n.back-btn{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.15);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}"
const markup = "\u003cdiv class=\"page\"\u003e\n\u003cdiv class=\"scroll\"\u003e\n\n\u003c!-- HEADER --\u003e\n\u003cdiv class=\"header\"\u003e\n  \u003cdiv class=\"header-r1\"\u003e\n    \u003cbutton class=\"back-btn\" onclick=\"history.back()\" title=\"Kembali\"\u003e\u003csvg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"15 18 9 12 15 6\"/\u003e\u003c/svg\u003e\u003c/button\u003e\n    \u003csvg viewBox=\"0 0 1080 365\" xmlns=\"http://www.w3.org/2000/svg\" style=\"height:40px;width:auto;\"\u003e\n      \u003cstyle\u003e.s0{fill:#FFF}.s1{fill:#ADD036}\u003c/style\u003e\n      \u003cpath class=\"s0\" d=\"M133,61v175c0,13-11,24-24,24h-4c-13,0-24-11-24-24V61c0-13,11-24,24-24h4C122,37,133,48,133,61z\"/\u003e\n      \u003cpath class=\"s0\" d=\"M180,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11s31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11S193,258,180,251z M249,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C234,218,242,214,249,207z\"/\u003e\n      \u003cpath class=\"s0\" d=\"M411,248l-43-59v49c0,12-9,21-21,21h-7c-13,0-23-10-23-23V56c0-11,9-19,19-19h15c10,0,17,8,17,17v106l43-57c5-7,13-11,22-11h32c7,0,11,8,6,14l-58,70l54,65c6,7,1,19-9,19h-25C425,259,416,255,411,248z\"/\u003e\n      \u003cpath class=\"s0\" d=\"M470,130c7-13,15-23,27-30c11-7,24-11,38-11c12,0,22,2,31,7s16,11,21,19v-8c0-9,7-16,16-16h20c8,0,15,7,15,15v139c0,7-6,13-13,13h-21c-10,0-17-8-17-17v-6c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-37-11c-11-7-20-17-27-30c-7-13-10-28-10-46C460,158,464,143,470,130z M575,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C586,163,582,153,575,145z\"/\u003e\n      \u003cpath class=\"s1\" d=\"M747,96c9,5,16,11,21,19v-7c0-9,7-17,17-17h19c9,0,16,7,16,16v152c0,15-3,29-9,42c-6,13-15,23-28,30c-13,7-28,11-47,11c-25,0-45-6-60-18c-11-8-18-19-23-31c-3-8,3-17,12-17h21c8,0,14,4,19,10c2,2,4,4,7,6c6,4,13,6,22,6c11,0,19-3,25-9c6-6,10-16,10-29v-24c-5,8-12,14-21,19c-9,5-19,7-31,7c-14,0-26-4-38-11c-11-7-20-17-27-30c-7-13-10-28-10-46c0-17,3-32,10-45c7-13,15-23,27-30c11-7,24-11,38-11C728,89,738,91,747,96z M757,145c-7-7-16-11-26-11c-10,0-19,4-26,11c-7,7-11,17-11,30c0,13,4,23,11,31c7,8,16,11,26,11c10,0,19-4,26-11c7-7,11-18,11-30C768,163,764,153,757,145z\"/\u003e\n      \u003cpath class=\"s1\" d=\"M866,251c-13-7-23-17-31-30c-8-13-11-28-11-46c0-17,4-32,11-46s18-23,31-30c13-7,28-11,45-11c16,0,31,4,45,11c13,7,24,17,31,30s11,28,11,46c0,17-4,32-12,46c-8,13-18,23-32,30c-13,7-28,11-45,11C894,262,879,258,866,251z M935,207c7-7,10-18,10-31s-3-24-10-31c-7-7-15-11-25-11c-10,0-18,4-25,11c-7,7-10,18-10,31c0,13,3,24,10,31c7,7,15,11,25,11C920,218,928,214,935,207z\"/\u003e\n    \u003c/svg\u003e\n    \u003cbutton class=\"sokong-btn\"\u003e\n      \u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpath d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/\u003e\u003c/svg\u003e\n      Sokong Pembangun Anda\n    \u003c/button\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"header-sub\"\u003e\u003cspan data-i18n=\"tagline\"\u003ePlatform perniagaan lokal setempat\u003c/span\u003e\u003c/div\u003e\n  \u003cdiv class=\"header-r2\"\u003e\n    \u003cdiv class=\"search-wrap\"\u003e\n      \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#aaa\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"11\" cy=\"11\" r=\"8\"/\u003e\u003cline x1=\"21\" y1=\"21\" x2=\"16.65\" y2=\"16.65\"/\u003e\u003c/svg\u003e\n      \u003cspan\u003eCari kedai atau produk\u003c/span\u003e\n    \u003c/div\u003e\n    \u003cbutton class=\"lang-btn\" onclick=\"i18n.toggle()\"\u003e\n      \u003csvg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"10\"/\u003e\u003cline x1=\"2\" y1=\"12\" x2=\"22\" y2=\"12\"/\u003e\u003cpath d=\"M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/\u003e\u003c/svg\u003e\n      \u003cspan class=\"lang-btn-txt\"\u003eEnglish\u003c/span\u003e\n    \u003c/button\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- PAGE TITLE --\u003e\n\u003cdiv class=\"page-title-wrap\"\u003e\n  \u003cdiv class=\"page-title\"\u003eKedai digital anda hampir siap\u003c/div\u003e\n\u003c/div\u003e\n\n\u003c!-- FORM --\u003e\n\u003cdiv class=\"form-section\"\u003e\n\n  \u003c!-- Upload Gambar --\u003e\n  \u003cdiv\u003e\n    \u003cdiv class=\"field-label\"\u003eGambar Profil Kedai\u003c/div\u003e\n    \u003cdiv class=\"upload-box\" onclick=\"document.getElementById(\u0027imgInput\u0027).click()\"\u003e\n      \u003cdiv class=\"upload-icon\"\u003e\n        \u003csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#aaa\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003crect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/\u003e\u003ccircle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/\u003e\u003cpolyline points=\"21 15 16 10 5 21\"/\u003e\u003c/svg\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"upload-text\"\u003eMuat naik Logo atau Gambar Kedai\u003c/div\u003e\n      \u003cdiv class=\"upload-hint\"\u003eJPG atau PNG • Maksimum 2MB\u003c/div\u003e\n      \u003cinput type=\"file\" id=\"imgInput\" accept=\"image/*\" style=\"display:none;\" onchange=\"previewImg(this)\"\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003c!-- Penerangan --\u003e\n  \u003cdiv\u003e\n    \u003cdiv class=\"field-label\"\u003ePenerangan Kedai\u003c/div\u003e\n    \u003ctextarea class=\"desc-input\" placeholder=\"Ceritakan apa yang anda jual dikedai anda disini!\"\u003e\u003c/textarea\u003e\n  \u003c/div\u003e\n\n  \u003c!-- Kategori --\u003e\n  \u003cdiv\u003e\n    \u003cdiv class=\"field-label\"\u003eKategori Produk\u003c/div\u003e\n    \u003cdiv class=\"cat-grid\"\u003e\n      \u003cdiv class=\"cat-item\" onclick=\"toggleCat(this)\"\u003e\n        \u003cdiv class=\"cat-checkbox\"\u003e\u003c/div\u003e\n        \u003cspan class=\"cat-name\"\u003eKuih \u0026 Kek\u003c/span\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"cat-item\" onclick=\"toggleCat(this)\"\u003e\n        \u003cdiv class=\"cat-checkbox\"\u003e\u003c/div\u003e\n        \u003cspan class=\"cat-name\"\u003eLauk \u0026 Masakan\u003c/span\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"cat-item\" onclick=\"toggleCat(this)\"\u003e\n        \u003cdiv class=\"cat-checkbox\"\u003e\u003c/div\u003e\n        \u003cspan class=\"cat-name\"\u003eMinuman\u003c/span\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"cat-item\" onclick=\"toggleCat(this)\"\u003e\n        \u003cdiv class=\"cat-checkbox\"\u003e\u003c/div\u003e\n        \u003cspan class=\"cat-name\"\u003eFresh \u0026 Semula Jadi\u003c/span\u003e\n      \u003c/div\u003e\n      \u003cdiv class=\"cat-item cat-full\" onclick=\"toggleCat(this)\"\u003e\n        \u003cdiv class=\"cat-checkbox\"\u003e\u003c/div\u003e\n        \u003cspan class=\"cat-name\"\u003eFrozen \u0026 Simpanan\u003c/span\u003e\n      \u003c/div\u003e\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n  \u003c!-- Agree --\u003e\n  \u003cdiv class=\"agree-wrap\" id=\"agreeWrap\" onclick=\"toggleAgree()\"\u003e\n    \u003cdiv class=\"agree-box\" id=\"agreeBox\"\u003e\u003c/div\u003e\n    \u003cdiv class=\"agree-text\"\u003e\n      Saya bersetuju dengan \u003ca href=\"/tnc\" target=\"_blank\" rel=\"noopener noreferrer\" onclick=\"event.stopPropagation()\"\u003eTerma \u0026 Syarat Penjual\u003c/a\u003e dan \u003ca href=\"/privacy\" target=\"_blank\" rel=\"noopener noreferrer\" onclick=\"event.stopPropagation()\"\u003eDasar Privasi\u003c/a\u003e. Saya faham bahawa kedai saya akan disemak oleh admin sebelum diaktifkan.\n    \u003c/div\u003e\n  \u003c/div\u003e\n\n\u003c/div\u003e\n\n\u003c!-- SUBMIT --\u003e\n\u003cdiv class=\"submit-wrap\"\u003e\n  \u003cbutton class=\"submit-btn\" onclick=\"window.__submitSellerOnboarding()\"\u003e\n    \u003csvg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cline x1=\"22\" y1=\"2\" x2=\"11\" y2=\"13\"/\u003e\u003cpolygon points=\"22 2 15 22 11 13 2 9 22 2\"/\u003e\u003c/svg\u003e\n    Hantar permohonan\n  \u003c/button\u003e\n  \u003cdiv class=\"submit-note\"\u003eAdmin akan menghubungi anda dalam masa 24 jam melalui WhatsApp untuk sesi video call 5 minit.\u003c/div\u003e\n\u003c/div\u003e\n\n\u003c/div\u003e\n\u003c/div\u003e"
const scripts: string[] = ["function toggleCat(el) {\n  var selected = document.querySelectorAll(\u0027.cat-item.selected\u0027).length;\n  if (el.classList.contains(\u0027selected\u0027)) {\n    el.classList.remove(\u0027selected\u0027);\n    el.querySelector(\u0027.cat-checkbox\u0027).innerHTML = \u0027\u0027;\n  } else {\n    if (selected \u003e= 5) { alert(\u0027Maksimum 5 kategori sahaja.\u0027); return; }\n    el.classList.add(\u0027selected\u0027);\n    el.querySelector(\u0027.cat-checkbox\u0027).innerHTML = \u0027\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"20 6 9 17 4 12\"/\u003e\u003c/svg\u003e\u0027;\n  }\n}\n\nfunction toggleAgree() {\n  var wrap = document.getElementById(\u0027agreeWrap\u0027);\n  var box = document.getElementById(\u0027agreeBox\u0027);\n  wrap.classList.toggle(\u0027checked\u0027);\n  box.innerHTML = wrap.classList.contains(\u0027checked\u0027)\n    ? \u0027\u003csvg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fff\" stroke-width=\"3\" stroke-linecap=\"round\" stroke-linejoin=\"round\"\u003e\u003cpolyline points=\"20 6 9 17 4 12\"/\u003e\u003c/svg\u003e\u0027\n    : \u0027\u0027;\n}\n\nfunction previewImg(input) {\n  if (input.files \u0026\u0026 input.files[0]) {\n    var reader = new FileReader();\n    reader.onload = function(e) {\n      var box = input.closest(\u0027.upload-box\u0027);\n      box.innerHTML = \u0027\u003cimg src=\"\u0027 + e.target.result + \u0027\" style=\"width:100%;height:120px;object-fit:cover;border-radius:10px;\"\u003e\u0027 +\n        \u0027\u003cdiv style=\"font-size:12px;color:#555;margin-top:8px;\"\u003eTekan untuk tukar gambar\u003c/div\u003e\u0027;\n    };\n    reader.readAsDataURL(input.files[0]);\n  }\n}"]
const externalScripts: string[] = []
const externalStylesheets: string[] = []

export default function Page() {
  useEffect(() => {
    let authCancelled = false
    const supabase = createClient()

    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (authCancelled) return
      if (!user) { window.location.href = '/auth?next=/onboarding/step2'; return }
      const { data: seller } = await supabase
        .from('sellers').select('id').eq('user_id', user.id).maybeSingle()
      if (authCancelled) return
      if (seller) { window.location.href = '/seller/dashboard' }
    }

    checkAuth().catch(console.error)

    ;(window as OnboardingWindow).__submitSellerOnboarding = async () => {
      const submitButton = document.querySelector<HTMLButtonElement>('.submit-btn')
      const saved = localStorage.getItem('lokalgo_seller_onboarding')
      const baseData = saved ? JSON.parse(saved) as Record<string, string> : {}
      const description = document.querySelector<HTMLTextAreaElement>('.desc-input')?.value.trim() || ''
      const categories = Array.from(document.querySelectorAll<HTMLElement>('.cat-item.selected .cat-name'))
        .map((item) => item.textContent?.trim())
        .filter(Boolean)
      const accepted = document.getElementById('agreeWrap')?.classList.contains('checked')

      if (!accepted) {
        alert('Sila setuju dengan Terma & Syarat Penjual dahulu.')
        return
      }

      if (!baseData.shop_name || !baseData.taman_name || !baseData.whatsapp_number) {
        alert('Maklumat kedai belum lengkap. Sila kembali ke langkah sebelumnya.')
        window.location.href = '/onboarding/step1'
        return
      }

      submitButton?.setAttribute('disabled', 'true')
      if (submitButton) submitButton.textContent = 'Menghantar...'

      // Get the current session access token to send as Authorization header.
      // This avoids relying on server-side cookie reading (which can be unreliable
      // with PKCE flow in Route Handlers) and ensures the API can always verify auth.
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      if (!accessToken) {
        localStorage.setItem('lokalgo_after_login', '/onboarding/step2')
        window.location.href = '/auth?next=/onboarding/step2'
        return
      }

      const response = await fetch('/api/seller/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          shop_name: baseData.shop_name,
          whatsapp_number: baseData.whatsapp_number,
          taman_name: baseData.taman_name,
          postcode: baseData.postcode || '00000',
          kawasan: baseData.kawasan || baseData.taman_name,
        }),
      })
      const result = await response.json() as { error?: string; sellerId?: string }

      if (response.status === 401) {
        localStorage.setItem('lokalgo_after_login', '/onboarding/step2')
        window.location.href = '/auth?next=/onboarding/step2'
        return
      }

      if (!response.ok) {
        console.error(result.error)
        alert(`Permohonan tidak dapat dihantar: ${result.error || 'Sila cuba semula.'}`)
        submitButton?.removeAttribute('disabled')
        if (submitButton) submitButton.textContent = 'Hantar permohonan'
        return
      }

      localStorage.setItem('lokalgo_seller_onboarding_extra', JSON.stringify({ description, categories, seller_id: result.sellerId }))
      localStorage.setItem('lokalgo_seller_onboarding_success', 'true')
      window.location.href = `/onboarding/step3?seller=${encodeURIComponent(result.sellerId || '')}&success=1`
    }

    return () => {
      authCancelled = true
      delete (window as OnboardingWindow).__submitSellerOnboarding
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
