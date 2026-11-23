import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { isStaticAssetPath } from '@/lib/security/routing';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never intercept static files, internal Next.js assets, or API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    isStaticAssetPath(pathname)
  ) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
