'use client';

import Link from 'next/link';
import { signOutAction } from '@/app/auth/actions';
import { useBrowserAuthState } from './use-browser-auth-state';

export default function HeaderAuthControl() {
  const isAuthenticated = useBrowserAuthState();

  if (isAuthenticated === null) {
    return <span className="text-slate-400">Account</span>;
  }

  if (!isAuthenticated) {
    return (
      <Link href="/auth" className="text-slate-600 hover:text-slate-900">
        Sign in
      </Link>
    );
  }

  return (
    <form action={signOutAction}>
      <button type="submit" className="cursor-pointer text-slate-600 hover:text-slate-900">
        Sign out
      </button>
    </form>
  );
}
