import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import AppProviders from '@/components/providers/AppProviders';

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
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function isExtensionError(e) {
                  var src = (e && (e.filename || (e.error && e.error.stack))) || '';
                  var msg = (e && (e.message || (e.error && e.error.message))) || '';
                  return (
                    src.indexOf('chrome-extension://') !== -1 ||
                    src.indexOf('moz-extension://') !== -1 ||
                    msg.indexOf('Minified React error #299') !== -1 ||
                    msg.indexOf('embed_script.js') !== -1
                  );
                }
                window.addEventListener('error', function(event) {
                  if (isExtensionError(event)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    return true;
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(event) {
                  if (isExtensionError(event.reason)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                    return true;
                  }
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-sans bg-white text-gray-900 min-h-screen antialiased flex flex-col`}>
        <AppProviders>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
          <footer className="border-t border-gray-100 bg-gray-50 py-10 text-xs text-gray-500">
            <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Sandalwood Platform</span>
                <span>— Authentic Multi-Source Reviews & Sentiment Intelligence</span>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/hub/kn" className="text-amber-600 hover:text-amber-700 font-medium">ಕನ್ನಡ (Sandalwood)</Link>
                <Link href="/hub/te" className="hover:text-gray-700">Telugu</Link>
                <Link href="/hub/en" className="hover:text-gray-700">Hollywood</Link>
                <span>• Powered by TMDB, Reddit & Official Publications</span>
              </div>
            </div>
          </footer>
        </AppProviders>
      </body>
    </html>
  );
}

