import { createClient } from '@supabase/supabase-js';
import {
  getSupabaseUrl,
  getSupabasePublishableKey,
  getSupabaseServiceRoleKey,
} from './supabase-config';

const supabaseUrl = getSupabaseUrl() || 'https://placeholder.supabase.co';
const serviceRoleKey = getSupabaseServiceRoleKey();
const fallbackKey = getSupabasePublishableKey() || 'placeholder-key';

// Admin client bypasses RLS when serviceRoleKey is configured
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey || fallbackKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
