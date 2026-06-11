'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        // When a new SW takes control, reload the page so user gets latest version
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload()
        })

        // Check for updates every 60 seconds (catches long-running sessions)
        const interval = setInterval(() => reg.update(), 60_000)
        return () => clearInterval(interval)
      })
      .catch(() => {
        // SW registration failed silently — app still works normally
      })
  }, [])

  return null
}
