import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully.' });

  // Clear owner auth cookies
  response.cookies.set('sb-owner-token', '', {
    path: '/',
    maxAge: 0,
  });
  response.cookies.set('sb-owner-email', '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}

