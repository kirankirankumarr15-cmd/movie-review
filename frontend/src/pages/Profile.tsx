import { motion } from 'framer-motion';
import { User as UserIcon, LogOut, LayoutDashboard, History as HistoryIcon, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { Link, useNavigate } from 'react-router-dom';
import { cn, formatDate } from '../lib/utils';
import { useEffect, useState } from 'react';
import { statsApi } from '../services/api';
import type { Stats } from '../types';
import LoadingState from '../components/LoadingState';

export default function Profile() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    statsApi.get()
      .then(setStats)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-2xl border p-8 sm:p-10',
            isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200 shadow-sm'
          )}
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left mb-10">
            <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-4xl text-white font-bold shadow-lg flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className={cn('font-display text-3xl font-bold mb-1', isDark ? 'text-white' : 'text-slate-900')}>
                {user.name}
              </h1>
              <p className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {user.email}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <UserIcon size={12} /> Member since {formatDate(user.created_at)}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <h2 className={cn('font-semibold mb-4', isDark ? 'text-slate-200' : 'text-slate-800')}>
            Your Activity
          </h2>
          
          {isLoading ? (
            <div className="py-8"><LoadingState message="Loading stats..." /></div>
          ) : stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Total', val: stats.total, color: 'text-purple-400' },
                { label: 'Positive', val: stats.positive, color: 'text-green-400' },
                { label: 'Neutral', val: stats.neutral, color: 'text-amber-400' },
                { label: 'Negative', val: stats.negative, color: 'text-red-400' },
              ].map(s => (
                <div key={s.label} className={cn('p-4 rounded-xl border text-center', isDark ? 'bg-[#16161f] border-[#2a2a3d]' : 'bg-slate-50 border-slate-200')}>
                  <div className={cn('text-2xl font-bold mb-1', s.color)}>{s.val}</div>
                  <div className={cn('text-xs uppercase tracking-wider', isDark ? 'text-slate-500' : 'text-slate-500')}>{s.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 mb-10">Could not load statistics.</p>
          )}

          {/* Actions */}
          <h2 className={cn('font-semibold mb-4', isDark ? 'text-slate-200' : 'text-slate-800')}>
            Quick Links
          </h2>
          <div className="flex flex-col gap-3">
            <Link to="/dashboard" className={cn(
              'flex items-center gap-3 p-4 rounded-xl border transition-colors',
              isDark ? 'bg-[#16161f] border-[#2a2a3d] hover:border-purple-500/50' : 'bg-slate-50 border-slate-200 hover:border-purple-500/50'
            )}>
              <LayoutDashboard className="text-purple-400" size={20} />
              <div>
                <div className={cn('font-medium', isDark ? 'text-slate-200' : 'text-slate-800')}>Dashboard</div>
                <div className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-500')}>View detailed analytics and charts</div>
              </div>
            </Link>
            
            <Link to="/history" className={cn(
              'flex items-center gap-3 p-4 rounded-xl border transition-colors',
              isDark ? 'bg-[#16161f] border-[#2a2a3d] hover:border-purple-500/50' : 'bg-slate-50 border-slate-200 hover:border-purple-500/50'
            )}>
              <HistoryIcon className="text-purple-400" size={20} />
              <div>
                <div className={cn('font-medium', isDark ? 'text-slate-200' : 'text-slate-800')}>Review History</div>
                <div className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-500')}>Browse and manage your past analyses</div>
              </div>
            </Link>

            <button onClick={handleLogout} className={cn(
              'flex items-center gap-3 p-4 rounded-xl border transition-colors text-left',
              isDark ? 'bg-[#16161f] border-[#2a2a3d] hover:border-red-500/50' : 'bg-slate-50 border-slate-200 hover:border-red-500/50'
            )}>
              <LogOut className="text-red-400" size={20} />
              <div>
                <div className="font-medium text-red-400">Log Out</div>
                <div className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-500')}>End your current session</div>
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
