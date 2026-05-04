import { createClient } from '@supabase/supabase-js';

function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured'
    );
  }

  return { url, anonKey };
}

export function createSupabasePublicClient() {
  const { url, anonKey } = getSupabasePublicConfig();

  return createClient(url, anonKey);
}
