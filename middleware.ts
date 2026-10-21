import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('sb-owner-token')?.value;

    // If no token exists, immediately redirect to login
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If Supabase is configured with a real project, verify the JWT with Supabase Auth
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      '';
    const isRealSupabase =
      supabaseUrl &&
      !supabaseUrl.includes('placeholder') &&
      !supabaseUrl.includes('your-project') &&
      supabaseKey &&
      !supabaseKey.includes('your-anon-key') &&
      !supabaseKey.includes('your-publishable-key');

    if (isRealSupabase) {
      try {
        const verifyRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: supabaseKey,
          },
        });

        if (!verifyRes.ok) {
          // Token is invalid or expired
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('error', 'session_expired');
          const response = NextResponse.redirect(loginUrl);
          response.cookies.delete('sb-owner-token');
          response.cookies.delete('sb-owner-email');
          return response;
        }

        const userData = await verifyRes.json();
        const designatedOwner = process.env.OWNER_EMAIL;

        if (designatedOwner && userData.email !== designatedOwner) {
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('error', 'unauthorized_user');
          const response = NextResponse.redirect(loginUrl);
          response.cookies.delete('sb-owner-token');
          return response;
        }
      } catch (err) {
        // Network or verification error - let it continue or redirect if strictly enforcing
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
