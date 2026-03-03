import { headers } from 'next/headers';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export type AppRole = 'student' | 'creator' | 'admin';

const TASK_CREATOR_ROLES = new Set<AppRole>(['creator', 'admin']);

function parseRole(rawRole: unknown): AppRole {
  return rawRole === 'creator' || rawRole === 'admin' ? rawRole : 'student';
}

function isRoleAllowedToCreateTasks(role: AppRole): boolean {
  return TASK_CREATOR_ROLES.has(role);
}

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

  const role = parseRole(roleRow?.role);
  if (!isRoleAllowedToCreateTasks(role)) {
    throw new Error('Only creators and admins can perform this action.');
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

export async function isCurrentUserAllowedToCreateTasks(): Promise<boolean> {
  const role = await getCurrentUserRole();
  if (!role) {
    return false;
  }
  return isRoleAllowedToCreateTasks(role);
}
