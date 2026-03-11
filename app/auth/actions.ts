'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getRequestIdentifier } from '@/app/actions-lib/auth';
import { signInRatelimit } from '@/app/actions-lib/rate-limit';
import { headers } from 'next/headers';

export async function signInAction(email: string) {
  const identifier = await getRequestIdentifier();
  
  const { success, reset } = await signInRatelimit.limit(identifier);
  
  if (!success) {
    const waitTime = Math.ceil((reset - Date.now()) / 1000);
    throw new Error(`Too many requests. Please wait ${waitTime} seconds.`);
  }

  const supabase = await createSupabaseServerClient();
  const origin = (await headers()).get('origin');

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/');
}
