'use client'

import { useEffect } from 'react'
import { HtmlPrototypePage } from '@/components/shared/HtmlPrototypePage'

const styles = "*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-font-smoothing:antialiased;}\nbody{background:#0a0a0a;min-height:100vh;font-family:\u0027Plus Jakarta Sans\u0027,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;padding:20px;}\n.page{width:100%;max-width:430px;min-height:100vh;background:#7B1533;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 32px;}\n@media(min-width:500px){body{padding:40px 20px;}.page{min-height:auto;height:812px;border-radius:36px;border:8px solid #1a1a1a;box-shadow:0 32px 80px rgba(0,0,0,0.7);}}\n@media(min-width:1024px){body{padding:40px;}}\n.logo-wrap{margin-bottom:48px;}\n.msg{font-size:20px;font-weight:700;color:#fff;text-align:center;line-height:1.6;margin-bottom:64px;}\n.home-btn{background:transparent;border:2px solid rgba(255,255,255,0.5);border-radius:30px;padding:13px 40px;color:#fff;font-size:15px;font-weight:600;font-family:inherit;cursor:pointer;transition:all 0.2s;letter-spacing:0.2px;}\n.home-btn:hover{background:rgba(255,255,255,0.1);border-color:rgba(255,255,255,0.8);}\n.home-btn:active{transform:scale(0.97);}"
const markup = "\u003cdiv class=\"page\"\u003e\n  \u003cdiv class=\"logo-wrap\"\u003e\n    \u003cimg src=\"/icons/Logo-LOKALGO.png\" alt=\"LokalGo\" style=\"height:40px;width:auto;display:block;\"\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"msg\"\u003ePermohonan kedai digital anda sudah diterima. Kami akan maklumkan melalui WhatsApp dan email :)\u003c/div\u003e\n  \u003cbutton class=\"home-btn\" onclick=\"window.location.href=\u0027/home\u0027\"\u003eKe Halaman Utama\u003c/button\u003e\n\u003c/div\u003e"
const scripts: string[] = []
const externalScripts: string[] = []
const externalStylesheets: string[] = []

export default function Page() {
  useEffect(() => {
    const success = new URLSearchParams(window.location.search).get('success') === '1'
      || localStorage.getItem('lokalgo_seller_onboarding_success') === 'true'
    const saved = localStorage.getItem('lokalgo_seller_onboarding')
    const data = saved ? JSON.parse(saved) as { shop_name?: string } : {}
    const message = document.querySelector<HTMLElement>('.msg')

    if (message && success) {
      message.textContent = `Permohonan ${data.shop_name || 'kedai digital anda'} sudah diterima. Kami akan maklumkan melalui WhatsApp dan email selepas semakan admin.`
    }

    localStorage.removeItem('lokalgo_after_login')
    localStorage.removeItem('lokalgo_seller_onboarding_success')
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
