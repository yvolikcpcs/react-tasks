import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "React Mentor AI",
  description: "Simple React practice platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-slate-900`}>
        {/* Simple Navigation */}
        <header className="border-b bg-white sticky top-0 z-10">
          <nav className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold hover:text-blue-600 transition-colors">
              Mentor.AI
            </Link>
            <div className="flex gap-4 text-sm font-medium">
              <Link href="/" className="text-slate-600 hover:text-slate-900">Home</Link>
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
            © {new Date().getFullYear()} React Mentor AI.
          </p>
        </footer>
      </body>
    </html>
  );
}
