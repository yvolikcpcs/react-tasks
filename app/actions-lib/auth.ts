import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function getRequestIdentifier() {
  const headerList = await headers();
  const ip = headerList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const ua = headerList.get('user-agent') || 'unknown';
  return `${ip}-${ua}`;
}

export async function requireTaskCreatorRole() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('You must be signed in to perform this action.');
  }

  const { data: roleRow, error: roleError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (roleError) {
    throw new Error(`Failed to verify user role: ${roleError.message}`);
  }

  if (!roleRow || (roleRow.role !== 'creator' && roleRow.role !== 'admin')) {
    throw new Error('Only creators and admins can perform this action.');
  }

  return { supabase, user };
}
