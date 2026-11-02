import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to white/light mode' : 'Switch to dark mode'}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-full border shadow-sm transition-all duration-200 active:scale-95 cursor-pointer',
        isDark
          ? 'border-white/10 bg-white/5 text-slate-200 hover:text-purple-300 hover:bg-white/10'
          : 'border-slate-200 bg-white text-slate-700 hover:text-purple-700 hover:bg-purple-50'
      )}
    >
      {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-[#6332c9]" />}
    </button>
  );
}
