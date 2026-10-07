import { Link } from 'react-router-dom';
import { Film } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

export default function Footer() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const sections = [
    {
      title: 'Product',
      links: [
        { label: 'Analyzer', to: '/analyzer' },
        { label: 'Dashboard', to: '/dashboard' },
        { label: 'History', to: '/history' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'About', to: '/about' },
        { label: 'How It Works', to: '/about#how-it-works' },
        { label: 'FAQ', to: '/about#faq' },
      ],
    },
    {
      title: 'Technology',
      links: [
        { label: 'Python', to: '/about' },
        { label: 'NLTK', to: '/about' },
        { label: 'React', to: '/about' },
        { label: 'Flask', to: '/about' },
      ],
    },
  ];

  return (
    <footer className={cn(
      'border-t mt-auto',
      isDark ? 'bg-[#0a0a0f] border-[#1e1e2e]' : 'bg-white border-slate-200'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                <Film size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg">
                <span className={isDark ? 'text-white' : 'text-slate-900'}>Cine</span>
                <span className="text-purple-400">Sense</span>
              </span>
            </Link>
            <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-500' : 'text-slate-500')}>
              Understand what audiences really feel.
            </p>
          </div>

          {/* Links */}
          {sections.map(section => (
            <div key={section.title}>
              <h3 className={cn('font-semibold text-sm mb-3', isDark ? 'text-slate-300' : 'text-slate-800')}>
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className={cn(
                        'text-sm transition-colors',
                        isDark
                          ? 'text-slate-500 hover:text-slate-300'
                          : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={cn(
          'mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs',
          isDark ? 'border-[#1e1e2e] text-slate-600' : 'border-slate-200 text-slate-400'
        )}>
          <p>© 2026 CineSense. All rights reserved.</p>
          <p>
            Sentiment powered by{' '}
            <span className="text-purple-400 font-medium">NLTK VADER</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
