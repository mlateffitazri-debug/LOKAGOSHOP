'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'

function createAuthClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { flowType: 'pkce' },
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
        secure: typeof window !== 'undefined' && window.location.protocol === 'https:',
      },
    },
  )
}

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get('error')
    if (err) setError(decodeURIComponent(err))

    const supabase = createAuthClient()
    supabase.auth.signOut().finally(() => setLoading(false))
  }, [])

  async function handleGoogleLogin() {
    if (loading) return
    setLoading(true)
    setError(null)

    const supabase = createAuthClient()
    const callback = new URL('/auth/callback', window.location.origin)
    callback.searchParams.set('next', '/adminhensemonly')

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callback.toString() },
    })

    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Admin icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/icon-512-admin.png"
          alt="LokalGo Admin"
          style={{ width: 88, height: 88, borderRadius: 22, marginBottom: 20, border: '1.5px solid rgba(172,208,54,0.25)' }}
        />

        {/* Title */}
        <div style={{ fontSize: 22, fontWeight: 800, color: '#f0f0f0', letterSpacing: '-0.3px', marginBottom: 4 }}>
          LokalGo Admin
        </div>
        <div style={{ fontSize: 13, color: 'rgba(240,240,240,0.35)', marginBottom: 40, letterSpacing: '0.4px', textTransform: 'uppercase', fontWeight: 600 }}>
          Panel Pentadbiran
        </div>

        {/* Error */}
        {error && (
          <div style={{
            width: '100%', background: 'rgba(240,96,96,0.1)', border: '1px solid rgba(240,96,96,0.25)',
            borderRadius: 10, padding: '12px 14px', marginBottom: 18,
            fontSize: 13, color: '#f06060', lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {/* Google button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: '100%', background: loading ? 'rgba(172,208,54,0.5)' : '#acd036',
            border: 'none', borderRadius: 14, padding: '15px 20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 12, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'opacity 0.15s',
          }}
          onMouseDown={e => { if (!loading) e.currentTarget.style.opacity = '0.85' }}
          onMouseUp={e => { e.currentTarget.style.opacity = '1' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          {!loading && (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#000"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#000"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#000"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#000"/>
            </svg>
          )}
          <span style={{ fontSize: 15, fontWeight: 700, color: '#000' }}>
            {loading ? 'Sila tunggu...' : 'Log Masuk dengan Google'}
          </span>
        </button>

        {/* Hint */}
        <div style={{ marginTop: 20, fontSize: 12, color: 'rgba(240,240,240,0.2)', textAlign: 'center', lineHeight: 1.7 }}>
          Hanya akaun admin yang dibenarkan masuk.
        </div>

      </div>
    </div>
  )
}
