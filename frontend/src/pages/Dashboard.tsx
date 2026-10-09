import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Film, Smile, Meh, Frown, Activity } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar,
} from 'recharts';
import type { Stats } from '../types';
import { statsApi } from '../services/api';
import { formatScore, formatDate } from '../lib/utils';
import StatCard from '../components/StatCard';
import SentimentBadge from '../components/SentimentBadge';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const PIE_COLORS = ['#22c55e', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    statsApi.get()
      .then(setStats)
      .catch(err => {
        toast.error(err?.message || 'Failed to load dashboard data.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const chartTextColor = isDark ? '#64748b' : '#94a3b8';
  const chartGridColor = isDark ? '#1e1e2e' : '#f1f5f9';
  const tooltipStyle = isDark
    ? { backgroundColor: '#1a1a25', border: '1px solid #2a2a3d', borderRadius: 8, color: '#e2e8f0' }
    : { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 };

  if (isLoading) return <div className="pt-16"><LoadingState message="Loading dashboard…" /></div>;

  if (!stats) return null;

  const pieData = [
    { name: 'Positive', value: stats.positive },
    { name: 'Neutral',  value: stats.neutral },
    { name: 'Negative', value: stats.negative },
  ].filter(d => d.value > 0);

  const isEmpty = stats.total === 0;

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={20} className="text-purple-400" aria-hidden />
            <h1 className={cn('font-display text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              Analytics Dashboard
            </h1>
          </div>
          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
            All statistics are calculated from your saved review history.
          </p>
        </motion.div>

        {isEmpty ? (
          <EmptyState
            icon={BarChart3}
            title="No data yet"
            description="Analyze some movie reviews to start seeing your dashboard. Log in and analyze reviews to save them."
            action={<a href="/analyzer" className="btn-primary">Analyze a Review</a>}
          />
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard title="Total Reviews" value={stats.total} icon={<Film size={18} />} accent="#7c3aed" />
              <StatCard title="Positive" value={stats.positive} icon={<Smile size={18} />} accent="#22c55e" subtitle="reviews" />
              <StatCard title="Neutral" value={stats.neutral} icon={<Meh size={18} />} accent="#f59e0b" subtitle="reviews" />
              <StatCard title="Negative" value={stats.negative} icon={<Frown size={18} />} accent="#ef4444" subtitle="reviews" />
            </div>

            {/* Summary row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <StatCard
                title="Average Compound Score"
                value={formatScore(stats.average_compound)}
                icon={<Activity size={18} />}
                accent={stats.average_compound >= 0.05 ? '#22c55e' : stats.average_compound <= -0.05 ? '#ef4444' : '#f59e0b'}
                subtitle="VADER compound average"
              />
              <StatCard
                title="Most Common Sentiment"
                value={stats.most_common_sentiment !== 'N/A' ? stats.most_common_sentiment.toUpperCase() : 'N/A'}
                icon={<TrendingUp size={18} />}
                accent="#7c3aed"
                subtitle="across all your reviews"
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Donut chart */}
              <div className={cn('rounded-xl border p-5', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}>
                <h2 className={cn('font-semibold mb-4', isDark ? 'text-slate-200' : 'text-slate-800')}>
                  Sentiment Distribution
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90}
                      paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Bar chart */}
              <div className={cn('rounded-xl border p-5', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}>
                <h2 className={cn('font-semibold mb-4', isDark ? 'text-slate-200' : 'text-slate-800')}>
                  Sentiment Breakdown
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={[{
                    name: 'Reviews',
                    Positive: stats.positive,
                    Neutral: stats.neutral,
                    Negative: stats.negative,
                  }]} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="name" tick={{ fill: chartTextColor, fontSize: 12 }} />
                    <YAxis tick={{ fill: chartTextColor, fontSize: 12 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="Positive" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Neutral"  fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Negative" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Line chart - Trend */}
            {stats.trend_data.length > 1 && (
              <div className={cn('rounded-xl border p-5 mb-8', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}>
                <h2 className={cn('font-semibold mb-4', isDark ? 'text-slate-200' : 'text-slate-800')}>
                  Sentiment Trends <span className={cn('text-sm font-normal', isDark ? 'text-slate-500' : 'text-slate-400')}>(last 30 reviews by date)</span>
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats.trend_data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                    <XAxis dataKey="date" tick={{ fill: chartTextColor, fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                    <YAxis tick={{ fill: chartTextColor, fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line type="monotone" dataKey="positive" stroke="#22c55e" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="neutral"  stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Recent reviews */}
            {stats.recent_reviews.length > 0 && (
              <div className={cn('rounded-xl border p-5', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}>
                <h2 className={cn('font-semibold mb-4', isDark ? 'text-slate-200' : 'text-slate-800')}>
                  Recent Reviews
                </h2>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-sm" aria-label="Recent reviews">
                    <thead>
                      <tr className={cn('border-b text-left', isDark ? 'border-[#2a2a3d]' : 'border-slate-200')}>
                        {['Movie', 'Review', 'Sentiment', 'Score', 'Date'].map(h => (
                          <th key={h} scope="col" className={cn('pb-3 pr-4 font-medium text-xs uppercase tracking-wide', isDark ? 'text-slate-500' : 'text-slate-400')}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: isDark ? '#1e1e2e' : '#f1f5f9' }}>
                      {stats.recent_reviews.map(r => (
                        <tr key={r.id} className={cn('transition-colors', isDark ? 'hover:bg-white/2' : 'hover:bg-slate-50')}>
                          <td className={cn('py-3 pr-4 font-medium max-w-[120px] truncate', isDark ? 'text-slate-300' : 'text-slate-700')}>
                            {r.movie_name || '—'}
                          </td>
                          <td className={cn('py-3 pr-4 max-w-[200px] truncate', isDark ? 'text-slate-400' : 'text-slate-500')}>
                            {r.review_text}
                          </td>
                          <td className="py-3 pr-4">
                            <SentimentBadge sentiment={r.sentiment} size="sm" showEmoji={false} />
                          </td>
                          <td className="py-3 pr-4 font-mono text-xs" style={{
                            color: r.sentiment === 'positive' ? '#4ade80' : r.sentiment === 'negative' ? '#f87171' : '#fbbf24'
                          }}>
                            {formatScore(r.compound_score)}
                          </td>
                          <td className={cn('py-3 text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                            {formatDate(r.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
