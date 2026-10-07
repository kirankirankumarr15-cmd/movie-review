import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  accent?: string;
  subtitle?: string;
}

export default function StatCard({ title, value, icon, accent = '#7c3aed', subtitle }: StatCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border p-5 transition-all duration-200',
        isDark
          ? 'bg-[#1a1a25] border-[#2a2a3d]'
          : 'bg-white border-slate-200'
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={cn('text-sm font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
          {title}
        </span>
        {icon && (
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${accent}18` }}>
            <span style={{ color: accent }}>{icon}</span>
          </div>
        )}
      </div>
      <div className="text-3xl font-display font-bold" style={{ color: accent }}>
        {value}
      </div>
      {subtitle && (
        <div className={cn('text-xs mt-1', isDark ? 'text-slate-600' : 'text-slate-400')}>{subtitle}</div>
      )}
    </motion.div>
  );
}
