// Centralized environment variable resolution for Supabase credentials
// Supports both NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

export function getSupabasePublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ''
  );
}

export function getSupabaseServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

// Utility to check if real Supabase credentials have been configured
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();

  if (!url || !key) return false;
  if (
    url.includes('placeholder') ||
    url.includes('your-project') ||
    url.includes('example.com')
  ) {
    return false;
  }
  if (
    key.includes('placeholder') ||
    key.includes('your-anon-key') ||
    key.includes('your-publishable-key')
  ) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
}

export function getSupabaseConfigStatus(): {
  configured: boolean;
  url: string;
  hasPublishableKey: boolean;
  hasServiceRoleKey: boolean;
  missingItems: string[];
} {
  const url = getSupabaseUrl();
  const publishableKey = getSupabasePublishableKey();
  const serviceKey = getSupabaseServiceRoleKey();

  const configured = isSupabaseConfigured();
  const missingItems: string[] = [];

  if (!url || url.includes('your-project') || url.includes('placeholder')) {
    missingItems.push('NEXT_PUBLIC_SUPABASE_URL (e.g., https://xyzcompany.supabase.co)');
  }
  if (
    !publishableKey ||
    publishableKey.includes('your-anon-key') ||
    publishableKey.includes('placeholder')
  ) {
    missingItems.push(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)'
    );
  }
  if (!serviceKey || serviceKey.includes('service-role')) {
    missingItems.push('SUPABASE_SERVICE_ROLE_KEY (optional for admin backend bypass)');
  }

  return {
    configured,
    url: configured ? url : 'Not configured (currently set to placeholder or empty)',
    hasPublishableKey:
      !!publishableKey &&
      !publishableKey.includes('placeholder') &&
      !publishableKey.includes('your-anon-key'),
    hasServiceRoleKey:
      !!serviceKey &&
      !serviceKey.includes('service-role') &&
      !serviceKey.includes('placeholder'),
    missingItems,
  };
}
