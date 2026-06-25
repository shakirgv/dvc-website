import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const locales = ['az', 'en', 'ru']
const defaultLocale = 'az'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/auth/callback')
  ) {
    return response
  }

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  let localeToUse = defaultLocale
  if (pathnameHasLocale) {
    localeToUse = pathname.split('/')[1]
  }

  const isDashboard = pathname.includes('/dashboard')

  // Auth protection
  if (isDashboard && !user) {
    return NextResponse.redirect(new URL(`/${localeToUse}/login`, request.url))
  }
  
  // Disable going to login/register if already logged in
  if ((pathname.includes('/login') || pathname.includes('/register')) && user) {
     return NextResponse.redirect(new URL(`/${localeToUse}/dashboard`, request.url))
  }

  if (pathnameHasLocale) return response

  request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  const redirectResponse = NextResponse.redirect(request.nextUrl)
  
  // Preserve cookies
  response.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
  })
  return redirectResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
