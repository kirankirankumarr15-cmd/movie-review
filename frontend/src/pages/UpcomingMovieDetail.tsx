import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Flame,
  Clock,
  Bell,
  Bookmark,
  Share2,
  ExternalLink,
  AlertTriangle,
  Play,
  TrendingUp,
  MessageSquare,
  Newspaper,
  Tv,
  ThumbsUp,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import HeroPlayer from '../components/HeroPlayer';

export default function UpcomingMovieDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [heroPlayerOpen, setHeroPlayerOpen] = useState(false);
  const playButtonRef = useRef<HTMLButtonElement>(null);

  // Voting state
  const [userVote, setUserVote] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);

  // Reminder state
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderEmail, setReminderEmail] = useState('');
  const [sendingReminder, setSendingReminder] = useState(false);

  // Share card modal state
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Watchlist
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/upcoming/${id}`);
      if (!res.ok) throw new Error('Movie not found');
      const data = await res.json();
      
      // Client-side fallback to TMDB API if videos array is empty
      if (!data.videos || data.videos.length === 0) {
        try {
          const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMDIyYTkwNTAwZTA2ODMwYjFlMzg2MDY2YTgwOGIxMyIsIm5iZiI6MTc5MTQ1MTc0NC42NzIsInN1YiI6IjZhYzc2MjYwMGY5MTNjYWU1YzAzZWE5YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.0jRg9sQctBUCKSYpazZ7r9p4jTveORB5QZd3VShKt1o";
          const tvidRes = await fetch(`https://api.tmdb.org/3/movie/${data.tmdb_id}/videos`, {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: 'application/json' },
          });
          if (tvidRes.ok) {
            const tvidData = await tvidRes.json();
            const ytvids = (tvidData.results || [])
              .filter((v: any) => v.site === 'YouTube')
              .map((v: any, idx: number) => ({
                youtube_id: v.key,
                type: (v.type?.toLowerCase() === 'teaser' ? 'teaser' : 'trailer'),
                title: v.name,
                language: v.iso_639_1 || 'en',
                is_official: v.official ?? true,
                sort_order: idx,
              }));
            if (ytvids.length > 0) {
              data.videos = ytvids;
            }
          }
        } catch {}
      }

      setMovie(data);

      // Check watchlist in localStorage
      const savedWatchlist = JSON.parse(localStorage.getItem('cinesense_watchlist') || '[]');
      setIsWatchlisted(savedWatchlist.includes(data.tmdb_id));
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load upcoming movie details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const toggleWatchlist = () => {
    if (!movie) return;
    const tmdbId = movie.tmdb_id;
    let saved: number[] = JSON.parse(localStorage.getItem('cinesense_watchlist') || '[]');
    if (saved.includes(tmdbId)) {
      saved = saved.filter((i) => i !== tmdbId);
      setIsWatchlisted(false);
      toast.info(`Removed ${movie.title} from watchlist`);
    } else {
      saved.push(tmdbId);
      setIsWatchlisted(true);
      toast.success(`Saved ${movie.title} to watchlist`);
    }
    localStorage.setItem('cinesense_watchlist', JSON.stringify(saved));
  };

  const handleVote = async (voteType: 'hyped' | 'maybe' | 'not_interested') => {
    if (!movie || isVoting) return;
    setIsVoting(true);
    try {
      const res = await fetch('http://localhost:5000/api/upcoming/excitement-votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: movie.tmdb_id,
          vote: voteType,
          session_id: 'browser_user',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setUserVote(voteType);
        setMovie((prev: any) => ({
          ...prev,
          votes_summary: data.summary,
        }));
        toast.success(`Vote recorded: ${voteType === 'hyped' ? '🔥 Hyped' : voteType === 'maybe' ? '😐 Maybe' : '👎 Not interested'}`);
      }
    } catch {
      toast.error('Failed to submit vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleSetReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movie || !reminderEmail.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    setSendingReminder(true);
    try {
      const res = await fetch('http://localhost:5000/api/upcoming/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdb_id: movie.tmdb_id,
          email: reminderEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(data.message);
      setReminderModalOpen(false);
      setReminderEmail('');
      setMovie((prev: any) => ({ ...prev, reminders_count: (prev.reminders_count || 0) + 1 }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to set reminder');
    } finally {
      setSendingReminder(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success('Share link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin mb-4" />
        <span className="text-slate-400 text-sm">Loading upcoming cinematic profile…</span>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold">Upcoming Movie Not Found</h2>
        <p className="text-slate-400 mt-2">The requested release could not be located.</p>
        <button
          onClick={() => navigate('/upcoming')}
          className="mt-6 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition"
        >
          Return to Upcoming List
        </button>
      </div>
    );
  }

  const hasVideos = movie.videos && movie.videos.length > 0;
  const anticipation = movie.anticipation;
  const isEnoughData = anticipation?.is_enough_data;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-24 font-sans selection:bg-purple-500 selection:text-white">
      {/* ══ Hero Backdrop / Inline Video Player Slot ══ */}
      <section className="relative w-full overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          {heroPlayerOpen && hasVideos ? (
            <motion.div
              key="player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full"
            >
              <HeroPlayer
                videos={movie.videos}
                movieTitle={movie.title}
                backdropUrl={movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : undefined}
                posterUrl={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined}
                onClose={() => {
                  setHeroPlayerOpen(false);
                  setTimeout(() => playButtonRef.current?.focus(), 80);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="relative w-full h-[45vh] md:h-[65vh] bg-slate-900"
            >
              {movie.backdrop_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover opacity-70"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-950" />
              )}

              {/* Gradient Shading */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />

              {/* Top Navigation & Share Bar */}
              <div className="absolute top-6 left-4 right-4 z-30 flex justify-between items-center max-w-7xl mx-auto">
                <button
                  onClick={() => navigate('/upcoming')}
                  className="p-2.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition border border-white/10"
                  aria-label="Back to Upcoming"
                >
                  <ArrowLeft size={18} />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShareModalOpen(true)}
                    className="p-2.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80 transition border border-white/10"
                    aria-label="Share movie card"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Centered Play Button (Direct on screen player) */}
              {hasVideos && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <button
                    ref={playButtonRef}
                    onClick={() => setHeroPlayerOpen(true)}
                    aria-label={`Play ${movie.title} teaser`}
                    className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md flex items-center justify-center pointer-events-auto cursor-pointer transition transform hover:scale-110 active:scale-95 shadow-2xl border border-white/20 group focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                  >
                    <Play className="text-white ml-1 group-hover:scale-110 transition-transform" fill="white" size={32} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ══ Main Content Container ══ */}
      <main className={`relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${heroPlayerOpen ? 'mt-6' : '-mt-24 md:-mt-32'}`}>
        
        {/* Header Info Block: Poster + Title + CTAs */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-end mb-10">
          {/* Poster */}
          <div className="w-40 md:w-56 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-slate-900 relative aspect-[2/3]">
            {movie.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                <span className="text-2xl font-bold text-white/30">{movie.original_language.toUpperCase()}</span>
                <span className="text-[11px] text-slate-500 mt-1">Official Poster Pending</span>
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div className="flex-1 min-w-0">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="px-3 py-1 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold uppercase tracking-wider">
                {movie.original_language} Cinema
              </span>

              <span className="px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-medium border border-white/10">
                {movie.release_type === 'ott' ? 'OTT Direct' : 'Theatrical Release'}
              </span>

              {movie.certification && (
                <span className="px-2.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  {movie.certification}
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {movie.title}
            </h1>

            {movie.original_title && movie.original_title !== movie.title && (
              <div className="text-sm text-slate-400 italic mt-0.5">
                Original Title: {movie.original_title}
              </div>
            )}

            {/* Live Countdown & Date Bar */}
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-sm ${
                  movie.countdown.isTba
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : movie.countdown.isToday
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                    : 'bg-purple-500/20 text-purple-200 border border-purple-500/40'
                }`}
              >
                <Clock size={16} />
                <span>{movie.countdown.label}</span>
              </div>

              {movie.release_date ? (
                <span className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                  <Calendar size={14} className="text-purple-400" />
                  Target Release: {movie.release_date} (IST)
                </span>
              ) : (
                <span className="text-xs text-amber-400/90 font-medium">
                  Official date unconfirmed (In Production)
                </span>
              )}
            </div>

            {/* Postponed / Date Changed Alert */}
            {movie.date_history && movie.date_history.length > 0 && (
              <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 max-w-2xl">
                <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong className="text-amber-300 font-semibold block mb-0.5">
                    Official Date Change
                  </strong>
                  Was previously scheduled for <span className="line-through text-slate-400">{movie.date_history[0].old_date}</span>. Postponed to <span className="font-bold text-white">{movie.date_history[0].new_date}</span>.
                  {movie.date_history[0].reason && <span className="block text-slate-300 mt-1">Reason: {movie.date_history[0].reason}</span>}
                  {movie.date_history[0].source_url && (
                    <a
                      href={movie.date_history[0].source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-400 underline hover:text-amber-300 mt-1"
                    >
                      <span>Read verification source</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <button
                onClick={toggleWatchlist}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition border ${
                  isWatchlisted
                    ? 'bg-purple-600 border-purple-500 text-white'
                    : 'bg-white/10 border-white/15 hover:bg-white/15 text-white'
                }`}
              >
                <Bookmark size={15} className={isWatchlisted ? 'fill-white' : ''} />
                <span>{isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              <button
                onClick={() => setReminderModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 border border-purple-500/30 text-purple-200 hover:text-white text-xs font-semibold transition flex items-center gap-2"
              >
                <Bell size={15} />
                <span>Set Release Reminder ({movie.reminders_count || 0})</span>
              </button>
            </div>
          </div>
        </div>

        {/* ══ Anticipation Pulse & Analysis Section ══ */}
        <section className="mt-12 p-6 md:p-8 rounded-3xl bg-gradient-to-br from-white/[0.04] via-purple-950/10 to-transparent border border-white/10 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">
                <Flame size={14} className="fill-orange-500" />
                Real Signal Intelligence
              </div>
              <h2 className="text-2xl font-extrabold text-white">
                Anticipation Score Analysis
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                Computed transparently from real trailer view momentum, fan comment sentiment, site community excitement votes, and news buzz.
              </p>
            </div>

            {/* Score Overview Badge */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-slate-400">Score Status</div>
                <div className="text-xs text-slate-300 font-medium">
                  {isEnoughData ? `Sample Size: ${anticipation.sample_size} signals` : 'Needs more data points'}
                </div>
                <div className="text-[11px] text-slate-500">
                  Last updated: {anticipation?.last_updated ? new Date(anticipation.last_updated).toLocaleDateString() : 'Today'}
                </div>
              </div>

              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-orange-500 p-0.5 shadow-xl shadow-orange-950/30">
                <div className="w-full h-full rounded-[14px] bg-[#12121a] flex flex-col items-center justify-center text-center">
                  {isEnoughData ? (
                    <>
                      <span className="text-2xl font-black text-white">{anticipation.score}</span>
                      <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">/ 100</span>
                    </>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold px-1 leading-tight text-center">
                      Not enough data
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Formula Transparency Breakdown */}
          {anticipation?.components && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Component 1: Trailer Views */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400 font-semibold">1. Trailer Momentum</span>
                  <span className="text-xs font-bold text-purple-400">35% Weight</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {anticipation.components.trailer_growth.views
                    ? `${(anticipation.components.trailer_growth.views / 1000000).toFixed(1)}M Views`
                    : 'No video yet'}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Score Contribution: <strong className="text-white">{anticipation.components.trailer_growth.score} pts</strong>
                </div>
              </div>

              {/* Component 2: Sentiment */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400 font-semibold">2. Comment Sentiment</span>
                  <span className="text-xs font-bold text-emerald-400">25% Weight</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {anticipation.components.sentiment.positive_pct}% Positive
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Score Contribution: <strong className="text-white">{anticipation.components.sentiment.score} pts</strong>
                </div>
              </div>

              {/* Component 3: Community Votes */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400 font-semibold">3. Community Pulse</span>
                  <span className="text-xs font-bold text-orange-400">25% Weight</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {anticipation.components.community.hyped_pct}% Hyped
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Votes: {anticipation.components.community.votes_count} • Reminders: {anticipation.components.community.reminders_count}
                </div>
              </div>

              {/* Component 4: News Buzz */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400 font-semibold">4. News & Announcements</span>
                  <span className="text-xs font-bold text-blue-400">15% Weight</span>
                </div>
                <div className="text-xl font-bold text-white">
                  {anticipation.components.news_buzz.news_articles_count} Articles
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Announcements: {anticipation.components.news_buzz.official_announcements_count}
                </div>
              </div>
            </div>
          )}

          {/* Interactive Community Poll */}
          <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/20 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={15} className="text-purple-400" />
                  <span>How excited are you for {movie.title}?</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cast your vote to shape the real community anticipation index.
                </p>
              </div>

              {/* Voting buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote('hyped')}
                  disabled={isVoting}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                    userVote === 'hyped'
                      ? 'bg-orange-600 border-orange-500 text-white shadow-lg'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <span>🔥 Hyped</span>
                  <span className="text-[11px] opacity-80">({movie.votes_summary?.hyped || 0})</span>
                </button>

                <button
                  onClick={() => handleVote('maybe')}
                  disabled={isVoting}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                    userVote === 'maybe'
                      ? 'bg-yellow-600 border-yellow-500 text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <span>😐 Maybe</span>
                  <span className="text-[11px] opacity-80">({movie.votes_summary?.maybe || 0})</span>
                </button>

                <button
                  onClick={() => handleVote('not_interested')}
                  disabled={isVoting}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                    userVote === 'not_interested'
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-white/5 border-white/10 hover:bg-white/10 text-slate-200'
                  }`}
                >
                  <span>👎 Pass</span>
                  <span className="text-[11px] opacity-80">({movie.votes_summary?.not_interested || 0})</span>
                </button>
              </div>
            </div>
          </div>

          {/* Views Over Time & Sentiment Split Grids */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart: YouTube Views Snapshot Progression */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                <TrendingUp size={15} className="text-purple-400" />
                <span>Trailer Views Growth Timeline</span>
              </h4>
              <p className="text-xs text-slate-400 mb-4">Daily verified view snapshots from YouTube</p>

              {movie.snapshots && movie.snapshots.length > 0 ? (
                <div className="space-y-3">
                  {movie.snapshots.map((s: any, idx: number) => {
                    const max = movie.snapshots[movie.snapshots.length - 1].views || 1;
                    const pct = Math.round((s.views / max) * 100);
                    return (
                      <div key={s.id || idx}>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                          <span>{new Date(s.captured_at).toLocaleDateString()}</span>
                          <span className="font-bold text-white">
                            {s.views.toLocaleString()} views
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-600 to-orange-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  No snapshot history available for this title yet.
                </div>
              )}
            </div>

            {/* Sentiment Split */}
            <div className="p-5 rounded-2xl bg-black/40 border border-white/10">
              <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
                <MessageSquare size={15} className="text-emerald-400" />
                <span>Audience Comment Sentiment</span>
              </h4>
              <p className="text-xs text-slate-400 mb-4">NLP classification on YouTube & Reddit comments</p>

              {anticipation?.sentiment_split ? (
                <div className="space-y-4">
                  {/* Visual Bar */}
                  <div className="w-full h-4 rounded-xl overflow-hidden flex bg-white/10 shadow-inner">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${anticipation.sentiment_split.positive}%` }}
                      title={`Positive: ${anticipation.sentiment_split.positive}%`}
                    />
                    <div
                      className="bg-slate-400 h-full"
                      style={{ width: `${anticipation.sentiment_split.neutral}%` }}
                      title={`Neutral: ${anticipation.sentiment_split.neutral}%`}
                    />
                    <div
                      className="bg-red-500 h-full"
                      style={{ width: `${anticipation.sentiment_split.negative}%` }}
                      title={`Negative: ${anticipation.sentiment_split.negative}%`}
                    />
                  </div>

                  <div className="grid grid-cols-3 text-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-xs text-emerald-300 font-semibold">Positive</div>
                      <div className="text-lg font-bold text-white">{anticipation.sentiment_split.positive}%</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-xs text-slate-400 font-semibold">Neutral</div>
                      <div className="text-lg font-bold text-white">{anticipation.sentiment_split.neutral}%</div>
                    </div>
                    <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
                      <div className="text-xs text-red-300 font-semibold">Negative</div>
                      <div className="text-lg font-bold text-white">{anticipation.sentiment_split.negative}%</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">
                  Sentiment data being indexed.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ══ Official Announcements Timeline ══ */}
        <section className="mt-12">
          <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <Calendar className="text-purple-400" size={20} />
            <span>Official Announcements Timeline</span>
          </h3>

          {movie.announcements && movie.announcements.length > 0 ? (
            <div className="relative border-l-2 border-purple-500/30 ml-4 space-y-6">
              {movie.announcements.map((ann: any) => (
                <div key={ann.id} className="relative pl-6">
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-purple-500 border-4 border-black" />
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-purple-400">{ann.date}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 uppercase font-semibold">
                        {ann.type.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{ann.title}</h4>
                    {ann.details && <p className="text-xs text-slate-400 mt-1">{ann.details}</p>}
                    {ann.url && (
                      <a
                        href={ann.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 underline mt-2"
                      >
                        <span>View Source Document</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">No official announcements logged yet.</p>
          )}
        </section>

        {/* ══ Where to Watch / OTT Partner ══ */}
        <section className="mt-12 p-6 rounded-3xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <Tv className="text-purple-400" size={22} />
            <h3 className="text-lg font-bold text-white">Where to Watch & Distribution</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Transparent release format & confirmed digital distribution partners.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-xs text-slate-400">Theatrical Window</span>
              <div className="text-base font-bold text-white mt-0.5">
                {movie.release_date ? `Releases in Theatres on ${movie.release_date}` : 'Theatrical Date TBA'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-xs text-slate-400">OTT Digital Streaming</span>
              <div className="text-base font-bold text-white mt-0.5">
                {movie.ott_status?.is_announced ? (
                  <span className="text-emerald-400">{movie.ott_status.partner}</span>
                ) : (
                  <span className="text-slate-400 font-medium">OTT Partner: Not announced yet</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══ Top Fan Comments (Real Signals) ══ */}
        {movie.fan_comments && movie.fan_comments.length > 0 && (
          <section className="mt-12">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <MessageSquare className="text-purple-400" size={20} />
              <span>Real Fan Discussion & Feedback</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Indexed directly from official YouTube trailer & Reddit discussion threads.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {movie.fan_comments.map((comment: any) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between"
                >
                  <p className="text-sm text-slate-200 leading-relaxed italic">
                    "{comment.comment_text}"
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-white">@{comment.author}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-slate-300">
                        <ThumbsUp size={12} /> {comment.likes}
                      </span>
                      {comment.source_url && (
                        <a
                          href={comment.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 flex items-center gap-1 underline"
                        >
                          <span>{comment.source}</span>
                          <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ Related Verified News ══ */}
        {movie.news && movie.news.length > 0 && (
          <section className="mt-12">
            <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
              <Newspaper className="text-purple-400" size={20} />
              <span>Verified Industry News & Coverage</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {movie.news.map((item: any) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/40 transition group block"
                >
                  <div className="flex justify-between items-center text-xs text-purple-400 mb-1 font-semibold">
                    <span>{item.source_domain}</span>
                    <span className="text-slate-500">{item.published_date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition">
                    {item.title}
                  </h4>
                  {item.snippet && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.snippet}</p>}
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ══ Reminder Email Modal ══ */}
      <AnimatePresence>
        {reminderModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl bg-[#12121a] border border-white/15 p-6 md:p-8 shadow-2xl relative"
            >
              <button
                onClick={() => setReminderModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                ✕
              </button>

              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
                <Bell size={24} />
              </div>

              <h3 className="text-xl font-bold text-white">Release Day Reminder</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Receive an email 1 day prior to the theatrical launch of <strong className="text-white">{movie.title}</strong> and when digital streaming drops.
              </p>

              <form onSubmit={handleSetReminder} className="mt-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={reminderEmail}
                    onChange={(e) => setReminderEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingReminder}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm transition"
                >
                  {sendingReminder ? 'Registering…' : 'Confirm Reminder'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══ Share Card Modal ══ */}
      <AnimatePresence>
        {shareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-[#12121a] border border-white/15 p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShareModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                ✕
              </button>

              <h3 className="text-lg font-bold text-white mb-4">Share Movie Card</h3>

              {/* Aesthetic Card Preview */}
              <div className="rounded-2xl bg-gradient-to-br from-purple-900/40 via-black to-slate-900 border border-white/15 p-4 text-center mb-5">
                <div className="w-24 h-36 mx-auto rounded-xl overflow-hidden shadow-lg mb-3 bg-slate-800">
                  {movie.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h4 className="font-bold text-white text-base truncate">{movie.title}</h4>
                <div className="text-xs text-purple-300 font-semibold mt-1">
                  {movie.countdown.label} • {movie.release_date || 'Date TBA'}
                </div>
                {isEnoughData && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs mt-2 border border-orange-500/30">
                    <Flame size={12} className="fill-orange-400" />
                    <span>{anticipation.score}% Anticipation</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Share Link'}</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
