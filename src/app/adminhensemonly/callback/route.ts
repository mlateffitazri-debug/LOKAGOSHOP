import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdminEmail } from '@/lib/admin/access'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  const loginUrl = `${origin}/adminhensemonly/login`

  if (searchParams.get('error')) {
    const msg = searchParams.get('error_description') || searchParams.get('error') || 'OAuth error'
    return NextResponse.redirect(`${loginUrl}?error=${encodeURIComponent(msg)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${loginUrl}?error=${encodeURIComponent('Missing OAuth code')}`)
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { flowType: 'pkce' },
      cookieOptions: {
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: Parameters<typeof cookieStore.set>[2]) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: Parameters<typeof cookieStore.set>[2]) {
          cookieStore.set(name, '', { ...options, maxAge: 0 } as Parameters<typeof cookieStore.set>[2])
        },
      },
    },
  )

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(`${loginUrl}?error=${encodeURIComponent(error.message)}`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email || !isAdminEmail(user.email)) {
    await supabase.auth.signOut()
    return NextResponse.redirect(`${loginUrl}?error=${encodeURIComponent('Akaun ini tidak mempunyai akses admin')}`)
  }

  return NextResponse.redirect(`${origin}/adminhensemonly`)
}
