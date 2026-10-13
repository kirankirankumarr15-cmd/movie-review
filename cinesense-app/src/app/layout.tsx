import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

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
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
        <footer className="border-t border-white/10 bg-[#08080d] py-10 text-xs text-slate-500">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-300">CineSense Platform</span>
              <span>— Authentic Multi-Source Reviews & Sentiment Intelligence</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/hub/kn" className="text-amber-400 hover:text-amber-300 font-medium">ಕನ್ನಡ (Sandalwood)</Link>
              <Link href="/hub/te" className="hover:text-slate-300">Telugu</Link>
              <Link href="/hub/en" className="hover:text-slate-300">Hollywood</Link>
              <span>• Powered by TMDB, Reddit & Official Publications</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
