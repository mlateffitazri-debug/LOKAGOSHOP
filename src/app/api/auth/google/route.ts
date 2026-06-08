import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type GoogleOAuthBody = {
  next?: string
}

function getRedirectOrigin(request: Request) {
  const requestOrigin = new URL(request.url).origin
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, '')
  const configuredIsLocalhost = configuredUrl?.includes('localhost') || configuredUrl?.includes('127.0.0.1')

  return configuredUrl && !configuredIsLocalhost ? configuredUrl : requestOrigin
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as GoogleOAuthBody
    const origin = getRedirectOrigin(request)
    const next = body.next?.startsWith('/') ? body.next : '/home'
    const callback = new URL(`${origin}/auth/callback`)
    callback.searchParams.set('next', next)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callback.toString(),
        queryParams: {
          flow_type: 'pkce',
        },
      },
    })

    if (error || !data.url) {
      return NextResponse.json({ error: error?.message || 'Unable to create Google OAuth URL' }, { status: 500 })
    }

    return NextResponse.json({ url: data.url, redirectTo: callback.toString() })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to start Google OAuth' },
      { status: 500 },
    )
  }
}
