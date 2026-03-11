import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export type AppRole = 'student' | 'creator' | 'admin';

function parseRole(rawRole: unknown): AppRole {
  return rawRole === 'creator' || rawRole === 'admin' ? rawRole : 'student';
}

export async function getRequestIdentifier() {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const ua = headerList.get('user-agent') || 'unknown';
  return `${ip}-${ua}`;
}

export async function requireAuthenticatedUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('Please sign in to perform this action.');
  }

  return { supabase, user };
}

export async function getCurrentUserRole(): Promise<AppRole | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: roleRow, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !roleRow) {
    return null;
  }

  return parseRole(roleRow.role);
}
