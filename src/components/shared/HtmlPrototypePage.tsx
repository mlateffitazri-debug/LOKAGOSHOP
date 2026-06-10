'use client'

import { useEffect, useMemo, type MouseEvent } from 'react'
import { translations, useLang, type Lang } from '@/lib/i18n'

type HtmlPrototypePageProps = {
  styles: string
  markup: string
  scripts?: string[]
  externalScripts?: string[]
  externalStylesheets?: string[]
}

declare global {
  interface Window {
    __prototypeScriptCount?: number
    i18n?: {
      toggle: () => void
      apply: () => void
      init: () => void
    }
  }
}

const routeMap: Record<string, string> = {
  'lokalgo_home.html': '/home',
  'lokalgo_shop.html': '/shop',
  'lokalgo_produk.html': '/produk',
  'lokalgo_onboarding0.html': '/onboarding/step0',
  'lokalgo_onboarding1.html': '/onboarding/step1',
  'lokalgo_onboarding2.html': '/onboarding/step2',
  'lokalgo_onboarding3.html': '/onboarding/step3',
  'lokalgo_dashboard.html': '/seller/dashboard',
  'lokalgo_edit_kedai.html': '/seller/edit',
  'lokalgo_notifikasi.html': '/notifikasi',
  'lokalgo_inbox.html': '/inbox',
  'lokalgo_testimoni.html': '/testimoni',
  'lokalgo_admin.html': '/admin',
  'lokalgo_sokong.html': '/sokong',
  'lokalgo_profil_buyer.html': '/profile',
  'lokalgo_saved.html': '/saved',
  'lokalgo_search.html': '/search',
  'lokalgo_alamat.html': '/alamat',
  'lokalgo_share_popup.html': '/share',
}

function copy(key: string, lang: Lang) {
  return translations[key]?.[lang] ?? key
}

function applyTranslations(lang: Lang) {
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n')
    if (!key) return

    const value = copy(key, lang)
    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
      element.placeholder = value
      return
    }

    element.textContent = value
  })

  document.querySelectorAll<HTMLElement>('[data-i18n-html]').forEach((element) => {
    const key = element.getAttribute('data-i18n-html')
    if (!key) return
    element.innerHTML = copy(key, lang)
  })

  document.querySelectorAll<HTMLElement>('.lang-btn-txt').forEach((element) => {
    element.textContent = lang === 'ms' ? 'English' : 'B.Melayu'
  })

  document.documentElement.lang = lang === 'ms' ? 'ms' : 'en'
}

function normalizeMarkup(markup: string) {
  return Object.entries(routeMap).reduce(
    (current, [from, to]) => current.replaceAll(from, to),
    markup,
  )
}

function normalizeScript(script: string) {
  let normalized = Object.entries(routeMap).reduce(
    (current, [from, to]) => current.replaceAll(from, to),
    script,
  )

  normalized = normalized.replace(
    /document\.addEventListener\('DOMContentLoaded',\s*function\(\)\s*\{([\s\S]*?)\}\);?/g,
    'setTimeout(function() {$1}, 0);',
  )

  normalized = normalized.replace(
    /^function\s+([A-Za-z_$][\w$]*)\s*\(/gm,
    'window.$1 = function $1(',
  )

  return normalized
}

function loadScript(src: string) {
  const existing = document.querySelector<HTMLScriptElement>(`script[data-prototype-src="${src}"]`)
  if (existing) {
    return existing.dataset.loaded === 'true'
      ? Promise.resolve()
      : new Promise<void>((resolve, reject) => {
          existing.addEventListener('load', () => resolve(), { once: true })
          existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
        })
  }

  return new Promise<void>((resolve, reject) => {
    const element = document.createElement('script')
    element.src = src
    element.async = false
    element.dataset.prototypeSrc = src
    element.addEventListener('load', () => {
      element.dataset.loaded = 'true'
      resolve()
    })
    element.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)))
    document.body.appendChild(element)
  })
}

export function HtmlPrototypePage({
  styles,
  markup,
  scripts = [],
  externalScripts = [],
  externalStylesheets = [],
}: HtmlPrototypePageProps) {
  const { lang, toggle } = useLang()
  const normalizedMarkup = useMemo(() => normalizeMarkup(markup), [markup])

  useEffect(() => {
    externalStylesheets.forEach((href) => {
      if (document.querySelector(`link[data-prototype-href="${href}"]`)) return

      const element = document.createElement('link')
      element.rel = 'stylesheet'
      element.href = href
      element.dataset.prototypeHref = href
      document.head.appendChild(element)
    })
  }, [externalStylesheets])

  useEffect(() => {
    window.i18n = {
      toggle,
      apply: () => applyTranslations(lang),
      init: () => applyTranslations(lang),
    }

    applyTranslations(lang)
  }, [lang, toggle, normalizedMarkup])

  useEffect(() => {
    let cancelled = false

    async function runScripts() {
      for (const src of externalScripts) {
        await loadScript(src)
      }

      if (cancelled) return

      window.__prototypeScriptCount = scripts.length
      scripts.forEach((script) => {
        window.eval(normalizeScript(script))
      })
    }

    runScripts().catch((error) => {
      console.error(error)
    })

    return () => {
      cancelled = true
    }
  }, [externalScripts, scripts])

  useEffect(() => {
    function handleCatTabClick(e: Event) {
      const target = e.target as HTMLElement
      const tab = target.closest<HTMLElement>('.cat-tab, .pill')
      if (!tab) return
      const group = tab.closest('.cat-filter, .filter-row')
      group?.querySelectorAll<HTMLElement>('.cat-tab, .pill').forEach((item) => item.classList.remove('active'))
      tab.classList.add('active')
      const cat = tab.textContent?.trim() ?? ''
      document.querySelectorAll<HTMLElement>('.produk-card').forEach((card) => {
        if (!cat || cat === 'Semua') {
          card.style.display = ''
        } else {
          card.style.display = card.getAttribute('data-category') === cat ? '' : 'none'
        }
      })
    }
    document.addEventListener('click', handleCatTabClick)
    return () => document.removeEventListener('click', handleCatTabClick)
  }, [])

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement

    if (target.closest('.lang-btn')) {
      toggle()
      return
    }

    if (target.closest('.sokong-btn')) {
      window.location.href = '/sokong'
      return
    }

    if (target.closest('.submit-btn') && document.querySelector('.form-card')) {
      window.setTimeout(() => {
        const existing = document.querySelector<HTMLElement>('.form-message')
        if (existing && existing.style.display !== 'none' && existing.textContent?.trim()) return

        const formCard = document.querySelector<HTMLElement>('.form-card')
        if (!formCard) return

        const fields = document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('.field-input')
        const content = fields[2]?.value.trim()
        const message = existing || document.createElement('div')
        message.className = 'form-message error'
        message.textContent = content
          ? 'Seller tidak ditemui. Sila buka borang testimoni dari halaman kedai.'
          : 'Sila tulis ulasan anda dahulu.'
        message.setAttribute(
          'style',
          'display:block;margin:12px 24px 0;border-radius:12px;padding:11px 13px;font-size:13px;font-weight:700;line-height:1.4;background:#fff0f3;color:#7B1533;border:1px solid #f3c4d2;',
        )

        if (!existing) formCard.insertAdjacentElement('afterend', message)
      }, 50)
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: normalizedMarkup }}
      />
    </>
  )
}
