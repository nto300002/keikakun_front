import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 簡素化されたMiddleware（DALパターン対応）
 *
 * - Cookie存在チェックのみ実施（軽量なリダイレクト判定）
 * - 実際の認証検証はDAL (lib/dal.ts) で実施
 * - CVE-2025-29927対策
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token');

  // 保護ルート
  const isProtectedPath = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/recipients') ||
                          pathname.startsWith('/support_plan') ||
                          pathname.startsWith('/pdf-list') ||
                          pathname.startsWith('/admin') ||
                          pathname.startsWith('/profile');

  // 公開ルート
  const isPublicPath = pathname.startsWith('/auth/login') ||
                       pathname.startsWith('/auth/signup') ||
                       pathname.startsWith('/auth/admin/login') || // 後に office_ownerに変更(admin -> office_owner)
                       pathname.startsWith('/auth/admin/signup') ||
                       pathname === '/';

  // 保護ルートでCookieがない場合のみリダイレクト
  if (isProtectedPath && !accessToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
