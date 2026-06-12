import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const protectedPathPrefixes = [
  '/admin',
  '/alamat',
  '/dashboard',
  '/home',
  '/inbox',
  '/notifikasi',
  '/onboarding/step2',
  '/onboarding/step3',
  '/produk',
  '/profile',
  '/saved',
  '/seller',
  '/shop',
  '/testimoni',
  '/testimonials',
]

function isProtectedPath(pathname: string) {
  return protectedPathPrefixes.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

function redirectToAuth(request: NextRequest) {
  const url = request.nextUrl.clone()
  url.pathname = '/auth'
  url.search = ''
  url.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`)
  return NextResponse.redirect(url)
}

function clearSupabaseAuthCookies(request: NextRequest, response: NextResponse) {
  request.cookies.getAll().forEach((cookie) => {
    if (!cookie.name.startsWith('sb-')) return
    request.cookies.set(cookie.name, '')
    response.cookies.set(cookie.name, '', {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0,
    })
  })
}

function isMobile(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? ''
  return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Mobile-only enforcement — skip for static assets, API, admin, and the warning page itself
  const isExcluded =
    pathname.startsWith('/desktop-only') ||
    pathname.startsWith('/adminhensemonly') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/')

  if (!isExcluded && !isMobile(request)) {
    const url = request.nextUrl.clone()
    url.pathname = '/desktop-only'
    return NextResponse.redirect(url)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('middleware: missing Supabase env vars; skipping auth refresh')
    return isProtectedPath(request.nextUrl.pathname) ? redirectToAuth(request) : response
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
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
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            response = NextResponse.next({ request: { headers: request.headers } })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]),
            )
          },
        },
      },
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (isProtectedPath(request.nextUrl.pathname) && !user) {
      return redirectToAuth(request)
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    if (!message.toLowerCase().includes('refresh token')) {
      console.error('middleware: Supabase auth refresh failed', err)
    }
    clearSupabaseAuthCookies(request, response)
    if (isProtectedPath(request.nextUrl.pathname)) {
      return redirectToAuth(request)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
