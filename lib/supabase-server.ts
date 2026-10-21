import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import {
  getSupabaseUrl,
  getSupabasePublishableKey,
  getSupabaseServiceRoleKey,
} from './supabase-config';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl() || 'https://placeholder.supabase.co',
    getSupabasePublishableKey() || 'placeholder-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  );
}

export async function getAuthenticatedSupabaseClient() {
  const cookieStore = await cookies();
  const token = cookieStore.get('sb-owner-token')?.value;
  const url = getSupabaseUrl() || 'https://placeholder.supabase.co';
  const serviceKey = getSupabaseServiceRoleKey();
  const pubKey = getSupabasePublishableKey() || 'placeholder-key';

  if (serviceKey && !serviceKey.includes('placeholder')) {
    return createSupabaseClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  }

  return createSupabaseClient(url, pubKey, {
    auth: { persistSession: false },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
}

