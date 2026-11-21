import { NextResponse } from 'next/server';
import {
  isSupabaseConfigured,
  getSupabaseUrl,
  getSupabasePublishableKey,
} from '@/lib/supabase-config';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if real Supabase credentials are configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        {
          success: false,
          code: 'SUPABASE_NOT_CONFIGURED',
          error:
            'Supabase is not configured yet. The current NEXT_PUBLIC_SUPABASE_URL in .env.local is pointing to a placeholder (https://your-project.supabase.co). Please update .env.local with your real Supabase Project URL and publishable key from supabase.com.',
        },
        { status: 503 }
      );
    }

    // Authenticate with real Supabase Auth
    const supabaseUrl = getSupabaseUrl();
    const supabaseKey = getSupabasePublishableKey();

    // Call Supabase auth endpoint
    const authRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        email: trimmedEmail,
        password,
      }),
    });

    const authData = await authRes.json();

    if (!authRes.ok || authData.error || !authData.access_token) {
      const errorMessage =
        authData.error_description ||
        authData.msg ||
        authData.error ||
        'Invalid owner login credentials.';
      return NextResponse.json({ success: false, error: errorMessage }, { status: 401 });
    }

    // Verify if this user is the designated owner or an authorized owner in Supabase
    // Optional: can check if user email matches authorized owner or has admin role in app_metadata
    const userEmail = authData.user?.email || trimmedEmail;
    const designatedOwner = process.env.OWNER_EMAIL || '';

    if (designatedOwner && designatedOwner !== userEmail) {
      // If a specific owner email was restricted in environment
      return NextResponse.json(
        {
          success: false,
          error: `Access denied. ${userEmail} is not the registered owner account for Ayyappa Enterprises.`,
        },
        { status: 403 }
      );
    }

    // Return success and set secure HttpOnly / session cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: authData.user?.id,
        email: userEmail,
      },
      message: 'Authentication successful.',
    });

    // Set authentication token cookie for middleware authorization
    response.cookies.set('sb-owner-token', authData.access_token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Also set client-accessible user indicator cookie
    response.cookies.set('sb-owner-email', userEmail, {
      path: '/',
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    if (error.message?.includes('fetch failed') || error.code === 'ENOTFOUND') {
      return NextResponse.json(
        {
          success: false,
          code: 'NETWORK_ERROR',
          error:
            'Failed to connect to Supabase. Please verify that your Supabase Project URL in .env.local is correct and active.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

