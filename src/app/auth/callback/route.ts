import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (searchParams.get('error')) {
    const errorDescription = searchParams.get('error_description') || searchParams.get('error') || 'OAuth login failed'
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(errorDescription)}`)
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: 'pkce',
        },
        cookieOptions: {
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        },
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set(name, '', { ...options, maxAge: 0 } as Parameters<typeof cookieStore.set>[2])
          },
        },
      },
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error.message)}`)
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.email) {
      if (next === '/admin') {
        return NextResponse.redirect(`${origin}/admin`)
      }

      const adminClient = createAdminClient()
      const { data: seller } = await adminClient
        .from('sellers')
        .select('id')
        .eq('email', user.email)
        .maybeSingle()

      if (seller) {
        return NextResponse.redirect(`${origin}/dashboard`)
      }

      const name =
        typeof user.user_metadata?.full_name === 'string'
          ? user.user_metadata.full_name
          : typeof user.user_metadata?.name === 'string'
            ? user.user_metadata.name
            : user.email.split('@')[0]

      await supabase.from('buyers').upsert(
        {
          user_id: user.id,
          name,
          email: user.email,
        },
        { onConflict: 'user_id' },
      )
    }

    return NextResponse.redirect(`${origin}/home`)
  }

  return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent('Missing OAuth code')}`)
}
