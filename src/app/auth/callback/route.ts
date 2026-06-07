import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/home'

  if (searchParams.get('error')) {
    const errorDescription = searchParams.get('error_description') || searchParams.get('error') || 'OAuth login failed'
    return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(errorDescription)}`)
  }

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent(error.message)}`)
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.email) {
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

    return NextResponse.redirect(`${origin}${next.startsWith('/') ? next : '/home'}`)
  }

  return NextResponse.redirect(`${origin}/auth?error=${encodeURIComponent('Missing OAuth code')}`)
}
