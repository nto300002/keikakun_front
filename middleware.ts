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

  // 静的ファイル（画像、フォント等）を除外
  const isStaticFile = /\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/i.test(pathname);

  if (isStaticFile) {
    return NextResponse.next();
  }

  // 保護ルート
  const isProtectedPath = pathname.startsWith('/dashboard') ||
                          pathname.startsWith('/recipients') ||
                          pathname.startsWith('/support_plan') ||
                          pathname.startsWith('/pdf-list') ||
                          pathname.startsWith('/admin') ||
                          pathname.startsWith('/profile');

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
