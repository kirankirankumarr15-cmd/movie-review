import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Wrench,
  ExternalLink,
  Play,
  Film,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

interface DiagnosticMovie {
  movie_id: number;
  title: string;
  language: string;
  year: number | null;
  stored_video_ids: string[];
  status: 'OK' | 'NO_VIDEO_FOUND' | 'NOT_EMBEDDABLE' | 'VIDEO_REMOVED/PRIVATE' | 'WRONG_LANGUAGE_FILTERED' | 'QUOTA_EXCEEDED' | 'API_ERROR' | 'MISMATCHED_MOVIE';
  exact_reason: string;
  validated_video_id?: string | null;
}

interface DiagnosticReport {
  total_movies: number;
  playable_count: number;
  failing_count: number;
  counts_by_reason: Record<string, number>;
  movies: DiagnosticMovie[];
  checked_at: string;
}

export default function TrailerDiagnostics() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Manual override modal state
  const [overrideMovie, setOverrideMovie] = useState<DiagnosticMovie | null>(null);
  const [overrideInput, setOverrideInput] = useState('');
  const [submittingOverride, setSubmittingOverride] = useState(false);

  const fetchDiagnostics = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/trailer-diagnostics');
      if (!res.ok) throw new Error('Failed to load diagnostics report');
      const data: DiagnosticReport = await res.json();
      setReport(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Error fetching trailer diagnostics: ' + (err.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const handleAutoRepair = async () => {
    setRepairing(true);
    toast.info('Starting auto-repair scan across all movies...');
    try {
      const res = await fetch('http://localhost:5000/api/admin/trailer-diagnostics/re-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fillMissing: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Auto-repair complete! Ingested trailers for ${data.auto_filled_count} movies.`);
      setReport(data.report);
    } catch (err: any) {
      toast.error('Auto-repair failed: ' + err.message);
    } finally {
      setRepairing(false);
    }
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideMovie || !overrideInput.trim()) return;

    setSubmittingOverride(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/trailer-diagnostics/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: overrideMovie.movie_id,
          youtube_url_or_id: overrideInput.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(`Manual override saved for ${overrideMovie.title}!`);
      setOverrideMovie(null);
      setOverrideInput('');
      fetchDiagnostics();
    } catch (err: any) {
      toast.error('Override error: ' + err.message);
    } finally {
      setSubmittingOverride(false);
    }
  };

  const filteredMovies = (report?.movies || []).filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      String(m.movie_id).includes(search) ||
      m.language.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'FAILING') return m.status !== 'OK';
    return m.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OK':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'NO_VIDEO_FOUND':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'WRONG_LANGUAGE_FILTERED':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'NOT_EMBEDDABLE':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'VIDEO_REMOVED/PRIVATE':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'QUOTA_EXCEEDED':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      default:
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div className={cn('min-h-screen pt-20 pb-24 px-4 sm:px-6 lg:px-8', isDark ? 'bg-[#0a0a0f] text-white' : 'bg-slate-50 text-slate-900')}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold mb-2 border border-purple-500/20">
              <ShieldCheck size={14} />
              <span>Admin System Tools</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">
              Trailer Diagnostics & Embed Health
            </h1>
            <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
              Live status, embeddability verification, fallback resolution, and manual overrides for every movie in the database.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDiagnostics}
              disabled={loading}
              className={cn(
                'px-4 py-2.5 rounded-xl border font-semibold text-sm flex items-center gap-2 transition shadow-sm',
                isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-800'
              )}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Report</span>
            </button>

            <button
              onClick={handleAutoRepair}
              disabled={repairing}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm flex items-center gap-2 transition shadow-md shadow-purple-600/25"
            >
              <Wrench size={16} className={repairing ? 'animate-spin' : ''} />
              <span>Auto-Repair All Missing</span>
            </button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        {report && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
            <div className={cn('p-4 rounded-xl border', isDark ? 'bg-[#161622] border-white/10' : 'bg-white border-slate-200 shadow-sm')}>
              <div className="text-xs font-medium text-slate-400">Total Tracked</div>
              <div className="text-2xl font-black mt-1">{report.total_movies}</div>
            </div>

            <div className={cn('p-4 rounded-xl border', isDark ? 'bg-[#161622] border-white/10' : 'bg-white border-slate-200 shadow-sm')}>
              <div className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Playable (OK)</span>
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-1">
                {report.playable_count}
                <span className="text-xs font-medium text-slate-400 ml-1.5">
                  ({((report.playable_count / report.total_movies) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            <div className={cn('p-4 rounded-xl border', isDark ? 'bg-[#161622] border-white/10' : 'bg-white border-slate-200 shadow-sm')}>
              <div className="text-xs font-medium text-amber-400">No Video Found</div>
              <div className="text-2xl font-black text-amber-400 mt-1">
                {report.counts_by_reason.NO_VIDEO_FOUND || 0}
              </div>
            </div>

            <div className={cn('p-4 rounded-xl border', isDark ? 'bg-[#161622] border-white/10' : 'bg-white border-slate-200 shadow-sm')}>
              <div className="text-xs font-medium text-purple-400">Lang Filtered</div>
              <div className="text-2xl font-black text-purple-400 mt-1">
                {report.counts_by_reason.WRONG_LANGUAGE_FILTERED || 0}
              </div>
            </div>

            <div className={cn('p-4 rounded-xl border', isDark ? 'bg-[#161622] border-white/10' : 'bg-white border-slate-200 shadow-sm')}>
              <div className="text-xs font-medium text-blue-400">Not Embeddable</div>
              <div className="text-2xl font-black text-blue-400 mt-1">
                {report.counts_by_reason.NOT_EMBEDDABLE || 0}
              </div>
            </div>

            <div className={cn('p-4 rounded-xl border', isDark ? 'bg-[#161622] border-white/10' : 'bg-white border-slate-200 shadow-sm')}>
              <div className="text-xs font-medium text-red-400">Removed / Private</div>
              <div className="text-2xl font-black text-red-400 mt-1">
                {report.counts_by_reason['VIDEO_REMOVED/PRIVATE'] || 0}
              </div>
            </div>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            {['ALL', 'FAILING', 'OK', 'NO_VIDEO_FOUND', 'WRONG_LANGUAGE_FILTERED', 'NOT_EMBEDDABLE', 'VIDEO_REMOVED/PRIVATE'].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition border',
                  statusFilter === f
                    ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                    : isDark
                      ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                )}
              >
                {f.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="relative min-w-[280px]">
            <Search size={16} className={cn('absolute left-3.5 top-3', isDark ? 'text-slate-400' : 'text-slate-400')} />
            <input
              type="text"
              placeholder="Filter by title, ID, or language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                'w-full pl-10 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 transition',
                isDark ? 'bg-[#161622] border-white/10 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
              )}
            />
          </div>
        </div>

        {/* Diagnostics Table */}
        <div className={cn('rounded-2xl border overflow-hidden shadow-xl', isDark ? 'bg-[#161622] border-white/10' : 'bg-white border-slate-200')}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className={cn('border-b text-xs font-bold uppercase tracking-wider', isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600')}>
                  <th className="p-4">TMDB ID</th>
                  <th className="p-4">Movie Title</th>
                  <th className="p-4">Lang</th>
                  <th className="p-4">Year</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Stored Videos</th>
                  <th className="p-4">Diagnostic Details</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-purple-400" />
                      Scanning database and checking YouTube embeddability...
                    </td>
                  </tr>
                ) : filteredMovies.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No movies matched the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredMovies.map((m) => (
                    <tr key={m.movie_id} className={cn('hover:bg-purple-500/5 transition', isDark ? '' : 'hover:bg-purple-50/50')}>
                      <td className="p-4 font-mono text-xs text-purple-400 font-bold">{m.movie_id}</td>
                      <td className="p-4 font-semibold max-w-[200px] truncate">{m.title}</td>
                      <td className="p-4">
                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                          {m.language}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">{m.year || 'TBA'}</td>
                      <td className="p-4">
                        <span className={cn('px-2.5 py-1 rounded-full text-[11px] font-bold border inline-block', getStatusBadge(m.status))}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4">
                        {m.stored_video_ids && m.stored_video_ids.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {m.stored_video_ids.map((vid) => (
                              <a
                                key={vid}
                                href={`https://www.youtube.com/watch?v=${vid}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-mono text-[11px] text-purple-400 hover:text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 border border-purple-500/20"
                                title="Open on YouTube"
                              >
                                <span>{vid}</span>
                                <ExternalLink size={10} />
                              </a>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">None cached</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-400 max-w-[280px] truncate" title={m.exact_reason}>
                        {m.exact_reason}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setOverrideMovie(m);
                            setOverrideInput(m.stored_video_ids[0] || '');
                          }}
                          className={cn(
                            'px-2.5 py-1 rounded-lg text-xs font-semibold border transition',
                            isDark ? 'bg-white/10 border-white/15 hover:bg-white/20 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-800'
                          )}
                          title="Override YouTube Video ID"
                        >
                          Manual Override
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manual Override Modal */}
        {overrideMovie && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={cn('w-full max-w-md rounded-2xl border p-6 shadow-2xl', isDark ? 'bg-[#161622] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900')}>
              <h3 className="text-lg font-bold">Manual Trailer Override</h3>
              <p className={cn('text-xs mt-1 mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Set an official YouTube trailer URL or 11-char ID for <strong>{overrideMovie.title}</strong> (TMDB ID: {overrideMovie.movie_id}). Marked with priority: manual.
              </p>

              <form onSubmit={handleSaveOverride} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-400">YouTube URL or ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. https://www.youtube.com/watch?v=J_tzXAD193E or J_tzXAD193E"
                    value={overrideInput}
                    onChange={(e) => setOverrideInput(e.target.value)}
                    className={cn(
                      'w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-purple-500',
                      isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOverrideMovie(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingOverride}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
                  >
                    {submittingOverride ? 'Saving...' : 'Save Override'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
