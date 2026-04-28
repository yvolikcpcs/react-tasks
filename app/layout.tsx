import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { signOutAction } from '@/app/auth/actions';
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "Code Mentor AI",
  description: "Practice programming tasks with AI feedback.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-white text-slate-900">
        {/* Simple Navigation */}
        <header className="border-b bg-white sticky top-0 z-10">
          <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold hover:text-blue-600 transition-colors">
              Mentor.AI
            </Link>
            <div className="flex gap-4 text-sm font-medium">
              <Link href="/" className="text-slate-600 hover:text-slate-900">Home</Link>
              {user ? (
                <form action={signOutAction}>
                  <button type="submit" className="cursor-pointer text-slate-600 hover:text-slate-900">
                    Sign out
                  </button>
                </form>
              ) : (
                <Link href="/auth" className="text-slate-600 hover:text-slate-900">Sign in</Link>
              )}
              <Link href="https://github.com/yvolikcpcs/react-tasks" className="text-slate-600 hover:text-slate-900">GitHub</Link>
            </div>
          </nav>
        </header>

        {/* Main Content Area - Only one children render! */}
        <main className="max-w-4xl mx-auto px-6 py-10">
          {children}
        </main>

        <footer className="border-t py-10 mt-auto">
          <p className="text-center text-slate-400 text-xs">
            © {new Date().getFullYear()} Code Mentor AI.
          </p>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
