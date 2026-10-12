import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'CineSense | AI-Powered Movie Analysis',
  description: 'Understand what audiences really feel with AI-powered sentiment analysis for movie reviews.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-[#0a0a0f] text-slate-100 min-h-screen antialiased flex flex-col`}>
        <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </div>
              <span className="text-xl font-display font-bold text-white tracking-tight">
                Cine<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Sense</span>
              </span>
            </div>
            <nav className="flex items-center gap-6 text-sm font-medium">
              <a href="/" className="text-white hover:text-purple-400 transition-colors">Home</a>
              <a href="/upcoming" className="text-slate-400 hover:text-purple-400 transition-colors">Upcoming</a>
              <a href="/login" className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white transition-colors">Sign In</a>
            </nav>
          </div>
        </header>
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
