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
  'lokago_home.html': '/home',
  'lokago_shop.html': '/shop',
  'lokago_produk.html': '/produk',
  'lokago_onboarding0.html': '/onboarding/step0',
  'lokago_onboarding1.html': '/onboarding/step1',
  'lokago_onboarding2.html': '/onboarding/step2',
  'lokago_onboarding3.html': '/onboarding/step3',
  'lokago_dashboard.html': '/seller/dashboard',
  'lokago_edit_kedai.html': '/seller/edit',
  'lokago_notifikasi.html': '/notifikasi',
  'lokago_inbox.html': '/inbox',
  'lokago_testimoni.html': '/testimoni',
  'lokago_admin.html': '/admin',
  'lokago_sokong.html': '/sokong',
  'lokago_profil_buyer.html': '/profile',
  'lokago_saved.html': '/saved',
  'lokago_search.html': '/search',
  'lokago_alamat.html': '/alamat',
  'lokago_share_popup.html': '/share',
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

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement

    if (target.closest('.lang-btn')) {
      toggle()
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
