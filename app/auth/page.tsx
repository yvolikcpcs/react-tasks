import { redirect } from 'next/navigation';
import SignInForm from './sign-in-form';
import { createSupabaseServerClient } from '@/lib/supabase-server';

type AuthPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  const params = await searchParams;
  const error = params.error;

  return (
    <div className="mx-auto max-w-md space-y-4">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {decodeURIComponent(error)}
        </p>
      )}
      <SignInForm />
    </div>
  );
}
