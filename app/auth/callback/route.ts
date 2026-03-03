import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') || '/';
  const upstreamError = requestUrl.searchParams.get('error_description');
  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    );
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    );
  }

  if (upstreamError) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(upstreamError)}`, requestUrl.origin)
    );
  }

  return NextResponse.redirect(new URL('/auth?error=Invalid%20or%20expired%20link', requestUrl.origin));
}
