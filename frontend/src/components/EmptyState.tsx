import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className={cn(
        'w-16 h-16 rounded-2xl flex items-center justify-center mb-5',
        isDark ? 'bg-[#1a1a25] border border-[#2a2a3d]' : 'bg-slate-100 border border-slate-200'
      )}>
        <Icon size={28} className={isDark ? 'text-slate-600' : 'text-slate-400'} aria-hidden />
      </div>
      <h3 className={cn('font-display font-semibold text-lg mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>
        {title}
      </h3>
      <p className={cn('text-sm max-w-sm leading-relaxed mb-5', isDark ? 'text-slate-500' : 'text-slate-400')}>
        {description}
      </p>
      {action}
    </motion.div>
  );
}
