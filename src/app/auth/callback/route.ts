import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
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
    }
  }

  return NextResponse.redirect(`${origin}/home`)
}
