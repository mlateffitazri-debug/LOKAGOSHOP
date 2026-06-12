// LokalGo Service Worker
// Strategy: network-first, auto-update on new deploy

const CACHE_NAME = 'lokalgo-v2'
const OFFLINE_URL = '/offline.html'

// Pages to pre-cache for offline. Cached one-by-one (not addAll) so a
// single failure doesn't cancel the whole precache.
const PRECACHE = [OFFLINE_URL, '/auth', '/home', '/search']

// Skip waiting — activate new SW immediately without waiting for tabs to close
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(PRECACHE.map((url) => cache.add(url)))
    )
  )
  self.skipWaiting()
})

// Claim all open tabs immediately on activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Network-first: always try network, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET, non-same-origin, Chrome extensions, Supabase API calls
  const requestUrl = new URL(request.url)
  if (
    request.method !== 'GET' ||
    requestUrl.origin !== self.location.origin ||
    request.url.startsWith('chrome-extension') ||
    request.url.includes('supabase.co') ||
    request.url.includes('/api/')
  ) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful HTML responses
        if (response.ok && request.destination === 'document') {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() =>
        caches.match(request).then((cached) => {
          if (cached) return cached
          // Only navigations fall back to the offline page; assets just fail
          if (request.destination === 'document') return caches.match(OFFLINE_URL)
          return Response.error()
        })
      )
  )
})
