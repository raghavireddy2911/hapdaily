import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl, getSupabasePublishableKey } from './supabase-config';

const supabaseUrl = getSupabaseUrl() || 'https://placeholder.supabase.co';
const supabaseKey = getSupabasePublishableKey() || 'placeholder-key';

// Client for browser / public operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
