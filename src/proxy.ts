import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['az', 'en', 'ru']
const defaultLocale = 'az'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip public files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return
  }

  // Check if the pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  let localeToUse = defaultLocale
  if (pathnameHasLocale) {
    localeToUse = pathname.split('/')[1]
  }

  // Route Protection for /dashboard
  const isDashboard = pathname.includes('/dashboard')
  const hasAuth = request.cookies.has('auth-token')

  if (isDashboard && !hasAuth) {
    return NextResponse.redirect(new URL(`/${localeToUse}/login`, request.url))
  }

  if (pathnameHasLocale) return

  // Redirect if there is no locale
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
