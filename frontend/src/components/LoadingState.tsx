import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex flex-col items-center justify-center py-20" aria-live="polite" aria-busy="true">
      <motion.div
        className="w-10 h-10 rounded-full border-2 border-purple-500/20 border-t-purple-500 mb-4"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
        aria-hidden
      />
      <p className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>{message}</p>
    </div>
  );
}
