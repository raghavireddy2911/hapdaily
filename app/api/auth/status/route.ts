import { NextResponse } from 'next/server';
import {
  getSupabaseConfigStatus,
  isSupabaseConfigured,
  getSupabaseUrl,
  getSupabasePublishableKey,
} from '@/lib/supabase-config';

export async function GET() {
  const status = getSupabaseConfigStatus();

  let connectivity = 'untested';
  let projectReachable = false;
  let authEndpointReachable = false;
  let errorDetail = null;

  if (status.configured) {
    try {
      // Test basic HTTPS connectivity to Supabase project
      const url = getSupabaseUrl();
      const publishableKey = getSupabasePublishableKey();
      const res = await fetch(`${url}/auth/v1/health`, {
        headers: {
          apikey: publishableKey,
        },
      });

      projectReachable = res.ok || res.status < 500;
      authEndpointReachable = res.status !== 404;
      connectivity = projectReachable ? 'healthy' : `returned HTTP ${res.status}`;
    } catch (err: any) {
      connectivity = 'connection_failed';
      errorDetail = err.message;
    }
  }

  return NextResponse.json({
    ...status,
    connectivity,
    projectReachable,
    authEndpointReachable,
    errorDetail,
  });
}

