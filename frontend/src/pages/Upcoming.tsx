import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Flame,
  Clock,
  Bell,
  Bookmark,
  Filter,
  Play,
  AlertTriangle,
  LayoutGrid,
  List,
  CalendarDays,
  ShieldCheck,
  RefreshCw,
  X,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface UpcomingMovieItem {
  id: number;
  tmdb_id: number;
  title: string;
  original_title: string;
  original_language: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genres_list: string[];
  release_date: string | null;
  release_status: string;
  date_confirmed: boolean;
  release_type: string;
  ott_partner: string | null;
  popularity: number;
  has_trailer: boolean;
  has_teaser: boolean;
  director: string | null;
  cast: string | null;
  banner: string | null;
  countdown: {
    days: number | null;
    label: string;
    isToday: boolean;
    isTomorrow: boolean;
    isTba: boolean;
  };
  group: 'This Week' | 'This Month' | 'Later' | 'Date TBA';
  anticipation: {
    score: number | null;
    sample_size: number;
    is_enough_data: boolean;
    last_updated: string;
    components?: any;
  } | null;
  date_history: {
    is_changed: boolean;
    old_date?: string;
    new_date?: string;
    reason?: string;
    source_url?: string;
  };
  videos_count: number;
}

const LANGUAGES = [
  { id: 'all', label: 'All Languages' },
  { id: 'kn', label: 'Kannada (KN)' },
  { id: 'hi', label: 'Hindi (HI)' },
  { id: 'te', label: 'Telugu (TE)' },
  { id: 'ta', label: 'Tamil (TA)' },
  { id: 'ml', label: 'Malayalam (ML)' },
  { id: 'en', label: 'English (EN)' },
];

const GENRES = [
  'All',
  'Action',
  'Crime',
  'Drama',
  'Thriller',
  'Comedy',
  'Science Fiction',
  'Fantasy',
  'Horror',
];

export default function Upcoming() {
  const navigate = useNavigate();

  // State
  const [movies, setMovies] = useState<UpcomingMovieItem[]>([]);
  const [groups, setGroups] = useState<Record<string, UpcomingMovieItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'grouped' | 'grid' | 'calendar'>('grouped');

  // Filters & sorting
  const [selectedLang, setSelectedLang] = useState('all');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedReleaseType, setSelectedReleaseType] = useState('all');
  const [onlyTrailer, setOnlyTrailer] = useState(false);
  const [onlyTeaser, setOnlyTeaser] = useState(false);
  const [sortBy, setSortBy] = useState('soonest');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [reminderModalMovie, setReminderModalMovie] = useState<UpcomingMovieItem | null>(null);
  const [reminderEmail, setReminderEmail] = useState('');
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [syncingTMDB, setSyncingTMDB] = useState(false);

  // Admin form state
  const [adminTmdbId, setAdminTmdbId] = useState('');
  const [adminNewDate, setAdminNewDate] = useState('');
  const [adminReason, setAdminReason] = useState('');
  const [adminSourceUrl, setAdminSourceUrl] = useState('');

  // Watchlist in localStorage
  const [watchlist, setWatchlist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('cinesense_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleWatchlist = (tmdbId: number, title: string) => {
    setWatchlist((prev) => {
      let updated: number[];
      if (prev.includes(tmdbId)) {
        updated = prev.filter((id) => id !== tmdbId);
        toast.info(`Removed ${title} from watchlist`);
      } else {
        updated = [...prev, tmdbId];
        toast.success(`Added ${title} to watchlist`);
      }
      localStorage.setItem('cinesense_watchlist', JSON.stringify(updated));
      return updated;
    });
  };

  // Fetch upcoming movies from backend
  const fetchUpcoming = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        view: 'grouped',
        language: selectedLang,
        genre: selectedGenre === 'All' ? 'all' : selectedGenre,
        month: selectedMonth,
        release_type: selectedReleaseType,
        has_trailer: onlyTrailer ? 'true' : 'false',
        has_teaser: onlyTeaser ? 'true' : 'false',
        sort: sortBy,
      });

      const res = await fetch(`http://localhost:5000/api/upcoming?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch upcoming movies');
      const data = await res.json();

      if (data.groups) {
        setGroups(data.groups);
        const allList = [
          ...(data.groups['This Week'] || []),
          ...(data.groups['This Month'] || []),
          ...(data.groups['Later'] || []),
          ...(data.groups['Date TBA'] || []),
        ];
        setMovies(allList);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Could not load upcoming movies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcoming();
  }, [selectedLang, selectedGenre, selectedMonth, selectedReleaseType, onlyTrailer, onlyTeaser, sortBy]);

  // Client-side search filtering
  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return movies;
    const q = searchQuery.toLowerCase();
    return movies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.original_title?.toLowerCase().includes(q) ||
        m.director?.toLowerCase().includes(q) ||
        m.cast?.toLowerCase().includes(q)
    );
  }, [movies, searchQuery]);

  // Submit Reminder
  const handleSaveReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderModalMovie || !reminderEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/upcoming/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: reminderModalMovie.tmdb_id,
          email: reminderEmail,
          reminder_type: 'theatrical_release',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save reminder');
      toast.success(`Reminder confirmed! We will notify ${reminderEmail} 1 day prior.`);
      setReminderModalMovie(null);
      setReminderEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Error setting reminder');
    }
  };

  // Admin Override Date
  const handleAdminOverrideDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminTmdbId || !adminNewDate) {
      toast.error('TMDB ID and New Date are required');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/upcoming/admin/override-date', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: parseInt(adminTmdbId, 10),
          new_date: adminNewDate,
          reason: adminReason,
          source_url: adminSourceUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      fetchUpcoming();
      setAdminTmdbId('');
      setAdminNewDate('');
      setAdminReason('');
      setAdminSourceUrl('');
    } catch (err: any) {
      toast.error(err.message || 'Admin override failed');
    }
  };

  // Admin Trigger Sync
  const handleAdminSync = async () => {
    setSyncingTMDB(true);
    try {
      const res = await fetch('http://localhost:5000/api/upcoming/admin/sync', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`Sync finished! Synced ${data.syncedCount} upcoming movies from TMDB.`);
      fetchUpcoming();
    } catch (err: any) {
      toast.error(err.message || 'TMDB sync failed');
    } finally {
      setSyncingTMDB(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-20 pb-24 font-sans selection:bg-purple-500 selection:text-white">
      {/* ══ Header Banner ══ */}
      <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-b from-purple-950/20 via-black to-[#0a0a0f]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles size={14} className="text-purple-400" />
                Live Indian & Global Releases
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-300 bg-clip-text text-transparent">
                Upcoming Movies & Anticipation Pulse
              </h1>
              <p className="mt-2 text-sm md:text-base text-slate-400 max-w-2xl leading-relaxed">
                Real-time release tracking, verified teaser momentum, multilingual sentiment analysis, and countdowns. Strictly real data.
              </p>
            </div>

            {/* KPI Badges & Admin Trigger */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-xs text-slate-400">Total Tracked</div>
                <div className="text-lg font-bold text-white">{movies.length} Films</div>
              </div>

              <div className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-md">
                <div className="text-xs text-purple-300">Timezone</div>
                <div className="text-lg font-bold text-purple-200">IST (UTC+05:30)</div>
              </div>

              <button
                onClick={() => setAdminModalOpen(true)}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
                title="Admin Overrides & Sync"
              >
                <ShieldCheck size={16} className="text-purple-400" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search upcoming film by title, director, or star..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-11 rounded-2xl bg-white/5 border border-white/15 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 backdrop-blur-md transition-all shadow-lg"
              />
              <Filter className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══ Controls Bar: Filters, Sorting & View Toggle ══ */}
      <section className="sticky top-16 z-40 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/10 py-3 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Languages Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLang(lang.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  selectedLang === lang.id
                    ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-900/40'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Controls: Genre, Sort & Views */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Genre Select */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              {GENRES.map((g) => (
                <option key={g} value={g} className="bg-[#12121a] text-white">
                  {g === 'All' ? 'All Genres' : g}
                </option>
              ))}
            </select>

            {/* Month Select */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="all" className="bg-[#12121a]">All Months</option>
              <option value="2026-10" className="bg-[#12121a]">October 2026</option>
              <option value="2026-11" className="bg-[#12121a]">November 2026</option>
              <option value="2026-12" className="bg-[#12121a]">December 2026</option>
              <option value="tba" className="bg-[#12121a]">Date TBA</option>
            </select>

            {/* Release Type Select */}
            <select
              value={selectedReleaseType}
              onChange={(e) => setSelectedReleaseType(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="all" className="bg-[#12121a]">All Formats</option>
              <option value="theatrical" className="bg-[#12121a]">Theatrical</option>
              <option value="ott" className="bg-[#12121a]">OTT Direct</option>
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="soonest" className="bg-[#12121a]">Soonest Release</option>
              <option value="most_anticipated" className="bg-[#12121a]">Most Anticipated</option>
              <option value="most_watched" className="bg-[#12121a]">Most Watched Trailer</option>
              <option value="recently_added" className="bg-[#12121a]">Recently Added</option>
            </select>

            {/* Video Toggles */}
            <button
              onClick={() => setOnlyTrailer(!onlyTrailer)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                onlyTrailer ? 'bg-purple-600/30 border-purple-500 text-purple-300' : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <Play size={12} />
              <span>Trailer</span>
            </button>

            <button
              onClick={() => setOnlyTeaser(!onlyTeaser)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1 ${
                onlyTeaser ? 'bg-purple-600/30 border-purple-500 text-purple-300' : 'bg-white/5 border-white/10 text-slate-400'
              }`}
            >
              <Play size={12} />
              <span>Teaser</span>
            </button>

            {/* View Switchers */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 ml-1">
              <button
                onClick={() => setActiveView('grouped')}
                className={`p-1.5 rounded-lg transition ${activeView === 'grouped' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Grouped by Timeline"
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setActiveView('grid')}
                className={`p-1.5 rounded-lg transition ${activeView === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className={`p-1.5 rounded-lg transition ${activeView === 'calendar' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}
                title="Calendar View"
              >
                <CalendarDays size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Main Content Area ══ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
            <span className="text-slate-400 text-sm">Loading upcoming cinematic releases…</span>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 max-w-xl mx-auto p-8">
            <Calendar size={40} className="text-slate-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No upcoming releases match your criteria</h3>
            <p className="text-sm text-slate-400 mt-1">Try resetting filters or searching another title.</p>
            <button
              onClick={() => {
                setSelectedLang('all');
                setSelectedGenre('All');
                setSearchQuery('');
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition"
            >
              Reset Filters
            </button>
          </div>
        ) : activeView === 'calendar' ? (
          /* ── Calendar View ── */
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="text-purple-400" size={20} />
                <span>Monthly Release Calendar</span>
              </h2>
              <span className="text-xs text-slate-400">Strictly confirmed & planned dates in IST</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMovies
                .filter((m) => Boolean(m.release_date))
                .map((m) => (
                  <div
                    key={m.id}
                    onClick={() => navigate(`/upcoming/${m.tmdb_id}`)}
                    className="p-4 rounded-2xl bg-black/40 border border-white/10 hover:border-purple-500/50 transition cursor-pointer flex gap-4 items-center group"
                  >
                    <div className="w-14 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800 relative">
                      {m.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w200${m.poster_path}`}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                          {m.original_language.toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-purple-400 mb-0.5">
                        {m.release_date} • {m.countdown.label}
                      </div>
                      <h4 className="font-semibold text-white text-sm truncate group-hover:text-purple-300 transition">
                        {m.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">
                        {m.genres_list.join(', ') || 'Feature Film'}
                      </p>

                      {m.anticipation?.is_enough_data && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 text-[11px] font-semibold border border-purple-500/20">
                          <Flame size={12} className="text-orange-400" />
                          <span>{m.anticipation.score}% Anticipation</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : activeView === 'grid' ? (
          /* ── Flat Grid View ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMovies.map((m) => (
              <MovieCard
                key={m.id}
                movie={m}
                isWatchlisted={watchlist.includes(m.tmdb_id)}
                onToggleWatchlist={() => toggleWatchlist(m.tmdb_id, m.title)}
                onOpenReminder={() => setReminderModalMovie(m)}
                onClick={() => navigate(`/upcoming/${m.tmdb_id}`)}
              />
            ))}
          </div>
        ) : (
          /* ── Grouped Timeline View (This Week / This Month / Later / Date TBA) ── */
          <div className="space-y-12">
            {(['This Week', 'This Month', 'Later', 'Date TBA'] as const).map((groupName) => {
              const list = groups[groupName] || [];
              if (list.length === 0) return null;

              return (
                <section key={groupName} className="relative">
                  <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          groupName === 'This Week'
                            ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50'
                            : groupName === 'This Month'
                            ? 'bg-purple-500 shadow-lg shadow-purple-500/50'
                            : groupName === 'Later'
                            ? 'bg-blue-500'
                            : 'bg-amber-500'
                        }`}
                      />
                      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                        {groupName}
                      </h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
                        {list.length}
                      </span>
                    </div>

                    <span className="text-xs text-slate-400 hidden sm:block">
                      {groupName === 'Date TBA'
                        ? 'Announced & in production, date pending'
                        : 'Scheduled theatrical/OTT releases'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {list.map((m) => (
                      <MovieCard
                        key={m.id}
                        movie={m}
                        isWatchlisted={watchlist.includes(m.tmdb_id)}
                        onToggleWatchlist={() => toggleWatchlist(m.tmdb_id, m.title)}
                        onOpenReminder={() => setReminderModalMovie(m)}
                        onClick={() => navigate(`/upcoming/${m.tmdb_id}`)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* ══ "Remind Me" Email Modal ══ */}
      <AnimatePresence>
        {reminderModalMovie && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-[#12121a] border border-white/15 p-6 md:p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setReminderModalMovie(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Bell size={24} />
              </div>

              <h3 className="text-xl font-bold text-white">
                Set Release Reminder
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Get notified 1 day before <span className="text-white font-medium">{reminderModalMovie.title}</span> releases in theatres, plus immediate alert when the OTT partner is confirmed.
              </p>

              <form onSubmit={handleSaveReminder} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs text-purple-300">
                  Release Target: {reminderModalMovie.release_date || 'Date TBA'} ({reminderModalMovie.countdown.label})
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition shadow-lg shadow-purple-900/40"
                >
                  Confirm Release Reminder
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ Admin Modal ══ */}
      <AnimatePresence>
        {adminModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-3xl bg-[#12121a] border border-white/15 p-6 md:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setAdminModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck size={26} className="text-purple-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">Admin Controls & Overrides</h3>
                  <p className="text-xs text-slate-400">Manage release dates, sync from TMDB, and logs</p>
                </div>
              </div>

              {/* Action 1: On-Demand TMDB Sync */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-6 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-white">12-Hour Sync Refresh</div>
                  <div className="text-xs text-slate-400">Pulls latest Indian releases from TMDB discover</div>
                </div>
                <button
                  onClick={handleAdminSync}
                  disabled={syncingTMDB}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <RefreshCw size={14} className={syncingTMDB ? 'animate-spin' : ''} />
                  <span>{syncingTMDB ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>

              {/* Action 2: Override Date Form */}
              <form onSubmit={handleAdminOverrideDate} className="space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Override or Confirm Release Date
                </h4>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">TMDB Movie ID</label>
                  <input
                    type="number"
                    placeholder="e.g. 1213243"
                    value={adminTmdbId}
                    onChange={(e) => setAdminTmdbId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">New Release Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={adminNewDate}
                    onChange={(e) => setAdminNewDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Reason for Postponement / Change</label>
                  <input
                    type="text"
                    placeholder="e.g. Postponed for VFX completion"
                    value={adminReason}
                    onChange={(e) => setAdminReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1">Source URL Attribution</label>
                  <input
                    type="url"
                    placeholder="https://variety.com/..."
                    value={adminSourceUrl}
                    onChange={(e) => setAdminSourceUrl(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition"
                >
                  Save Date Change & Update History
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Individual Movie Card Component ──────────────────────── */
function MovieCard({
  movie,
  isWatchlisted,
  onToggleWatchlist,
  onOpenReminder,
  onClick,
}: {
  movie: UpcomingMovieItem;
  isWatchlisted: boolean;
  onToggleWatchlist: () => void;
  onOpenReminder: () => void;
  onClick: () => void;
}) {
  return (
    <div className="group rounded-2xl bg-white/[0.04] border border-white/10 hover:border-purple-500/50 hover:bg-white/[0.07] transition-all duration-300 flex flex-col overflow-hidden shadow-xl hover:shadow-purple-950/20">
      {/* Poster Header */}
      <div
        onClick={onClick}
        className="relative w-full aspect-[2/3] bg-slate-900 cursor-pointer overflow-hidden"
      >
        {movie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-slate-900 via-purple-950/30 to-slate-900">
            <span className="text-3xl font-extrabold text-white/20">
              {movie.original_language.toUpperCase()}
            </span>
            <span className="text-xs text-slate-400 mt-2 font-medium">
              Official Poster Pending
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges: Language & Release Type */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-[11px] font-bold text-white uppercase border border-white/15 shadow">
            {movie.original_language}
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-purple-900/70 backdrop-blur-md text-[11px] font-semibold text-purple-200 border border-purple-500/30">
            {movie.release_type === 'ott' ? 'OTT Direct' : 'Theatrical'}
          </span>
        </div>

        {/* Date Changed Badge */}
        {movie.date_history?.is_changed && (
          <div
            className="absolute bottom-3 left-3 right-3 z-10"
            title={`Was originally: ${movie.date_history.old_date}. Postponed: ${movie.date_history.reason || 'Production update'}`}
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/90 text-black text-[11px] font-bold shadow-lg">
              <AlertTriangle size={12} />
              <span>Date changed: Was {movie.date_history.old_date}</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Live Countdown & Anticipation Score */}
          <div className="flex items-center justify-between gap-2 mb-2">
            {/* Countdown Badge */}
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                movie.countdown.isTba
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : movie.countdown.isToday
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}
            >
              <Clock size={12} />
              <span>{movie.countdown.label}</span>
            </div>

            {/* Anticipation Pill */}
            {movie.anticipation?.is_enough_data ? (
              <div
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-400"
                title={`Anticipation Score: ${movie.anticipation.score}% based on ${movie.anticipation.sample_size} signals`}
              >
                <Flame size={14} className="fill-orange-500 text-orange-500" />
                <span>{movie.anticipation.score}%</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-500 font-medium">
                Not enough data yet
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            onClick={onClick}
            className="font-bold text-white text-base leading-snug line-clamp-1 hover:text-purple-300 transition cursor-pointer"
          >
            {movie.title}
          </h3>

          {/* Meta details: Director & Genres */}
          <div className="text-xs text-slate-400 mt-1 line-clamp-1">
            {movie.director ? `Dir. ${movie.director}` : movie.genres_list.slice(0, 2).join(', ') || 'Upcoming Film'}
          </div>

          {movie.release_date && (
            <div className="text-[11px] text-slate-500 mt-0.5">
              Release: {movie.release_date}
            </div>
          )}
        </div>

        {/* Action Buttons: Watchlist & Remind Me */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
          <button
            onClick={onToggleWatchlist}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${
              isWatchlisted
                ? 'bg-purple-600 border-purple-500 text-white'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Bookmark size={13} className={isWatchlisted ? 'fill-white' : ''} />
            <span>{isWatchlisted ? 'Saved' : 'Watchlist'}</span>
          </button>

          <button
            onClick={onOpenReminder}
            className="py-1.5 px-3 rounded-xl bg-purple-600/20 hover:bg-purple-600 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
            title="Set release reminder"
          >
            <Bell size={13} />
            <span className="hidden sm:inline">Remind</span>
          </button>
        </div>
      </div>
    </div>
  );
}
