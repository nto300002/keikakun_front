import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware for Server-Side Authentication
 *
 * このミドルウェアは保護されたルート（(protected)配下）へのアクセスを
 * サーバーサイドでチェックし、認証されていないユーザーをブロックします。
 */

// 認証が必要なパスのプレフィックス
const PROTECTED_PATHS = [
  '/dashboard',
  '/recipients',
  '/support_plan',
  '/pdf-list',
  '/profile',
];

// 認証不要なパス（公開ページ）
const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/admin/login',
  '/auth/admin/signup',
  '/auth/admin/office_setup',
  '/auth/signup-success',
  '/auth/setup-success',
  '/auth/select-office',
  '/auth/verify-email',
  '/auth/mfa-setup',
  '/auth/mfa-verify',
];

/**
 * パスが保護されたルートかどうかを判定
 */
function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(path => pathname.startsWith(path));
}

/**
 * パスが公開ルートかどうかを判定
 */
function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path));
}

/**
 * Cookieからアクセストークンを取得
 */
function getAccessToken(request: NextRequest): string | undefined {
  return request.cookies.get('access_token')?.value;
}

/**
 * リダイレクト前のURLを保存するためのクエリパラメータを生成
 */
function createRedirectUrl(request: NextRequest, destination: string): string {
  const url = new URL(destination, request.url);

  // 現在のパスを `from` パラメータとして保存
  const currentPath = request.nextUrl.pathname + request.nextUrl.search;
  url.searchParams.set('from', currentPath);

  return url.toString();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = getAccessToken(request);

  console.log('[Middleware] Path:', pathname);
  console.log('[Middleware] Has access token:', !!accessToken);

  // 静的ファイルやAPIルートは処理をスキップ
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('/favicon.ico') ||
    pathname.includes('/images/') ||
    pathname.includes('/fonts/')
  ) {
    return NextResponse.next();
  }

  // 保護されたルートへのアクセス
  if (isProtectedPath(pathname)) {
    if (!accessToken) {
      console.log('[Middleware] Blocked: No access token for protected path');

      // 認証されていない場合はログインページにリダイレクト
      // 元のURLを保存して、ログイン後に戻れるようにする
      const loginUrl = createRedirectUrl(request, '/auth/login');
      return NextResponse.redirect(loginUrl);
    }

    console.log('[Middleware] Allowed: Access token found for protected path');
    return NextResponse.next();
  }

  // 公開ルートへのアクセス
  if (isPublicPath(pathname)) {
    // Cookie認証の制限: Next.jsミドルウェアはサーバーサイドで動作するため、
    // クロスドメインCookie（k-back-*.run.app → www.keikakun.com）を読み取れない。
    // したがって、ログインページへのアクセス制御はクライアントサイドで行う。
    // ミドルウェアでは公開ページを常に許可する。
    console.log('[Middleware] Allowed: Public path');
    return NextResponse.next();
  }

  // その他のパスは通過させる
  console.log('[Middleware] Allowed: Other path');
  return NextResponse.next();
}

// ミドルウェアを適用するパスの設定
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
