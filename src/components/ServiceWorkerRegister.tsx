'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // True only when a SW already controls this page (i.e. not the first install)
    let wasControlled = !!navigator.serviceWorker.controller
    let refreshing = false

    function onControllerChange() {
      // First install claiming the page — no reload needed, content is fresh
      if (!wasControlled) {
        wasControlled = true
        return
      }
      // New version took over — reload once so user gets the latest build
      if (refreshing) return
      refreshing = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    let interval: ReturnType<typeof setInterval> | undefined

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // Check for updates every 60 seconds (catches long-running sessions)
        interval = setInterval(() => reg.update(), 60_000)
      })
      .catch(() => {
        // SW registration failed silently — app still works normally
      })

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      if (interval) clearInterval(interval)
    }
  }, [])

  return null
}
