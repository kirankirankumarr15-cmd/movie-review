import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Star, Globe, Film, Users, ChevronLeft, ChevronRight,
  BarChart2, TrendingUp, Calendar, Award, Plus, ArrowRight, Rocket
} from 'lucide-react';
import { CATALOG } from '../data/catalog';
import { cn } from '../lib/utils';

// ── Language filter tabs ──────────────────────────────────────────────────────
const LANGUAGES = ['All', 'Kannada', 'Hollywood', 'Telugu', 'Tamil', 'Malayalam'];

// ── Trending movies matching Sandalwood reference ─────────────────────────────
const TRENDING = [
  {
    id: 16,
    title: 'KGF Chapter 2',
    language: 'Kannada',
    rating: 9.2,
    reviews: '124K',
    poster: 'https://image.tmdb.org/t/p/w500/khNVygolU0TxLIDWff5tQlAhZ23.jpg',
  },
  {
    id: 9,
    title: 'Jawan',
    language: 'Hindi',
    rating: 8.7,
    reviews: '98K',
    poster: 'https://image.tmdb.org/t/p/w500/jYW3iTslWf7sYk0uKz2y3BwP6g.jpg',
  },
  {
    id: 27,
    title: 'Leo',
    language: 'Tamil',
    rating: 8.4,
    reviews: '87K',
    poster: 'https://image.tmdb.org/t/p/w500/ptXSS4tqJg928nFjT71dCqWJkE.jpg',
  },
  {
    id: 23,
    title: 'Salaar',
    language: 'Telugu',
    rating: 8.3,
    reviews: '76K',
    poster: 'https://image.tmdb.org/t/p/w500/m9OPwUeI5b2vQ38jE815yvB6xKk.jpg',
  },
  {
    id: 32,
    title: 'Manjummel Boys',
    language: 'Malayalam',
    rating: 8.9,
    reviews: '64K',
    poster: 'https://image.tmdb.org/t/p/w500/1N1oBq33tM9q2MbgE9B1M6qXw5.jpg',
  },
  {
    id: 17,
    title: 'Kantara',
    language: 'Kannada',
    rating: 8.3,
    reviews: '76K',
    poster: 'https://image.tmdb.org/t/p/w500/jIsKmkxMzdCZ0Ux1GVSnu8m6Na6.jpg',
  },
  {
    id: 3,
    title: 'The Dark Knight',
    language: 'Hollywood',
    rating: 9.4,
    reviews: '200K',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  },
];

// Lookup fallback poster by catalog id
const getPoster = (id: number) =>
  CATALOG.find((c) => c.id === id)?.poster ?? 'https://image.tmdb.org/t/p/w500/khNVygolU0TxLIDWff5tQlAhZ23.jpg';

// ── Stat box ─────────────────────────────────────────────────────────────────
function StatBox({
  icon: Icon,
  value,
  label,
  color,
  bg,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-white/95 dark:bg-white/5 backdrop-blur-md rounded-2xl px-4 py-3.5 border border-purple-100/80 dark:border-white/10 shadow-sm shadow-purple-900/5 hover:border-purple-200 transition-all">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
        style={{ backgroundColor: bg }}
      >
        <Icon size={19} style={{ color }} />
      </div>
      <div>
        <div className="font-extrabold text-slate-900 dark:text-white text-base leading-none tracking-tight">
          {value}
        </div>
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">{label}</div>
      </div>
    </div>
  );
}

// ── Movie card ────────────────────────────────────────────────────────────────
function MovieCard({
  item,
}: {
  item: (typeof TRENDING)[number];
}) {
  const posterUrl = item.poster || getPoster(item.id);

  return (
    <Link
      to={`/movie/${item.id}`}
      className="flex-shrink-0 w-[160px] group relative rounded-2xl overflow-hidden cursor-pointer shadow-md shadow-purple-900/10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* poster */}
      <div className="relative w-full h-[225px] bg-slate-900 overflow-hidden">
        <img
          src={posterUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />
        {/* cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

        {/* rating badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/10">
          <Star size={11} className="text-amber-400 fill-amber-400" />
          <span className="text-white text-xs font-bold">{item.rating}</span>
        </div>

        {/* plus button */}
        <button
          onClick={(e) => e.preventDefault()}
          aria-label="Add to watchlist"
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-purple-600 hover:text-white transition-colors"
        >
          <Plus size={12} className="text-white" />
        </button>

        {/* title + language pill at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white text-xs font-bold leading-snug truncate mb-1.5 drop-shadow-sm">
            {item.title}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full text-white bg-[#6332c9] shadow-sm">
              {item.language}
            </span>
            <span className="text-white/80 text-[10px] font-medium">{item.reviews} reviews</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Donut chart ───────────────────────────────────────────────────────────────
function DonutChart({
  positive = 78,
  neutral = 12,
  negative = 10,
}: {
  positive?: number;
  neutral?: number;
  negative?: number;
}) {
  const r = 40;
  const cx = 56;
  const cy = 56;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { value: positive, color: '#10b981', label: 'Positive' },
    { value: neutral, color: '#f59e0b', label: 'Neutral' },
    { value: negative, color: '#ef4444', label: 'Negative' },
  ];

  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = (seg.value / 100) * circumference;
    const dashOffset = circumference - offset;
    offset += (seg.value / 100) * circumference;
    return { ...seg, dash, dashOffset };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* Circle graphic */}
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg viewBox="0 0 112 112" className="w-full h-full -rotate-90">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1effa" strokeWidth="12" />
          {arcs.map((arc, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth={12}
              strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
              strokeDashoffset={arc.dashOffset}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">
            {positive}%
          </span>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">Positive</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2.5 w-full sm:w-auto flex-1">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: seg.color }}
              />
              <span className="text-slate-600 dark:text-slate-400 font-medium">{seg.label}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-slate-100">{seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeLanguage, setActiveLanguage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const filteredTrending =
    activeLanguage === 'All'
      ? TRENDING
      : TRENDING.filter((m) => m.language.toLowerCase() === activeLanguage.toLowerCase());

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -340 : 340, behavior: 'smooth' });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <main className="min-h-screen bg-[#f8f7ff] dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-100 transition-colors">

      {/* ── HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="relative pt-24 pb-12 px-4 sm:px-8 overflow-hidden">
        {/* Soft pastel lavender decorative wash */}
        <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-l from-purple-100/50 via-purple-50/20 to-transparent pointer-events-none" />
        <div className="absolute top-12 right-12 w-64 h-64 opacity-20 pointer-events-none bg-gradient-to-tr from-purple-600 via-pink-500 to-indigo-500 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

          {/* LEFT: Headline + Search + Pills */}
          <div className="lg:col-span-7 z-10">
            {/* Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-[#f3e8ff] dark:bg-purple-500/10 border border-[#e9d5ff] dark:border-purple-500/20 rounded-full px-4 py-1.5 mb-5 shadow-sm"
            >
              <span className="text-[#7c3aed] text-xs">✦</span>
              <span className="text-[#7c3aed] dark:text-purple-300 text-xs font-semibold">
                Multi-Language AI Sentiment Platform
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-display font-black leading-[1.15] text-slate-900 dark:text-white mb-4 tracking-tight"
            >
              Understand what
              <br />
              audiences{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#d946ef] italic">
                really feel.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-lg mb-7 leading-relaxed font-normal"
            >
              Real multi-source review aggregation across Kannada, Hindi, Telugu, Tamil, Malayalam
              and Hollywood films. Verified sources, aspect-based sentiment, zero fake data.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              onSubmit={handleSearch}
              className="flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-200/90 dark:border-white/10 rounded-full pl-5 pr-2 py-2 shadow-sm shadow-purple-500/5 mb-6 max-w-xl"
            >
              <Search size={17} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies (e.g. KGF, Toxic, Salaar...)"
                className="flex-1 bg-transparent outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-gradient-to-r from-[#6332c9] via-[#7c3aed] to-[#b5179e] hover:opacity-95 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-md shadow-purple-500/25 transition-all flex-shrink-0"
              >
                Search <ArrowRight size={14} />
              </button>
            </motion.form>

            {/* Language filter pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLanguage(lang)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm',
                    activeLanguage === lang
                      ? 'bg-[#6332c9] text-white shadow-purple-500/25'
                      : 'bg-white/95 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-purple-300 hover:bg-purple-50/70 hover:text-purple-700'
                  )}
                >
                  {lang === 'Kannada' ? 'ಕನ್ನಡ (Kannada)' : lang}
                </button>
              ))}
            </motion.div>
          </div>

          {/* RIGHT: Hero Visual + Floating Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-5 flex flex-col items-center lg:items-end gap-4"
          >
            {/* Visual character backdrop / montage */}
            <div className="relative w-full max-w-md h-56 rounded-3xl overflow-hidden shadow-lg shadow-purple-900/10 border border-purple-100 dark:border-white/10 bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 group">
              <img
                src="https://image.tmdb.org/t/p/w780/khNVygolU0TxLIDWff5tQlAhZ23.jpg"
                alt="Featured Cinema"
                className="w-full h-full object-cover object-top opacity-85 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-900/60 backdrop-blur-md px-2 py-0.5 rounded-full">
                    Sandalwood & Pan-India Cinema
                  </span>
                  <p className="text-white font-bold text-sm mt-1">Multi-Source Audience Intelligence</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <Film size={16} />
                </div>
              </div>
            </div>

            {/* 4 Floating Stat Boxes */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              <StatBox icon={Film} value="2.5M+" label="Reviews Analyzed" color="#7c3aed" bg="#ede9fe" />
              <StatBox icon={Globe} value="6" label="Languages" color="#6366f1" bg="#e0e7ff" />
              <StatBox icon={Star} value="10K+" label="Movies" color="#f59e0b" bg="#fef3c7" />
              <StatBox icon={Users} value="50K+" label="Community Members" color="#8b5cf6" bg="#f3e8ff" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TRENDING MOVIES + AI SENTIMENT ANALYSIS ───────────────────────── */}
      <section className="px-4 sm:px-8 pb-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">

          {/* LEFT: Trending carousel */}
          <div className="bg-white/90 dark:bg-surface/80 backdrop-blur-md rounded-3xl p-6 border border-purple-100/80 dark:border-border shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-[#7c3aed] rounded-full inline-block" />
                  Trending Movies
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-3.5">
                  Discover what audiences are saying
                </p>
              </div>
              <Link
                to="/explore"
                className="flex items-center gap-1 text-[#7c3aed] dark:text-purple-400 text-xs font-semibold hover:underline"
              >
                View All <ArrowRight size={13} />
              </Link>
            </div>

            <div className="relative">
              {/* Left Arrow */}
              <button
                onClick={() => scroll('left')}
                aria-label="Scroll left"
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-surface shadow-md flex items-center justify-center border border-slate-200 dark:border-border hover:bg-purple-50 text-slate-700 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>

              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scroll-smooth"
                style={{ scrollSnapType: 'x mandatory' }}
              >
                {filteredTrending.map((item) => (
                  <div key={item.id} style={{ scrollSnapAlign: 'start' }}>
                    <MovieCard item={item} />
                  </div>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => scroll('right')}
                aria-label="Scroll right"
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white dark:bg-surface shadow-md flex items-center justify-center border border-slate-200 dark:border-border hover:bg-purple-50 text-slate-700 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Pagination capsule indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-4">
              <span className="w-6 h-1.5 bg-[#7c3aed] rounded-full" />
              <span className="w-1.5 h-1.5 bg-purple-200 dark:bg-purple-900/40 rounded-full" />
              <span className="w-1.5 h-1.5 bg-purple-200 dark:bg-purple-900/40 rounded-full" />
              <span className="w-1.5 h-1.5 bg-purple-200 dark:bg-purple-900/40 rounded-full" />
              <span className="w-1.5 h-1.5 bg-purple-200 dark:bg-purple-900/40 rounded-full" />
            </div>
          </div>

          {/* RIGHT: AI Sentiment Analysis Card */}
          <div className="bg-white dark:bg-surface border border-purple-100/90 dark:border-border rounded-3xl p-6 shadow-md shadow-purple-900/5 relative overflow-hidden flex flex-col justify-between">
            {/* Top header */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <BarChart2 size={18} className="text-[#7c3aed]" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    AI Sentiment Analysis
                  </h3>
                </div>
                <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                  <BarChart2 size={14} className="text-[#7c3aed]" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                Deep insights from real audience reviews
              </p>

              {/* Donut Chart */}
              <DonutChart positive={78} neutral={12} negative={10} />
            </div>

            {/* Subtle decorative purple wave */}
            <div className="my-4 pt-2">
              <div className="h-10 w-full bg-gradient-to-t from-purple-100/60 via-purple-50/20 to-transparent rounded-xl flex items-end px-2 pb-1 gap-1">
                {[30, 45, 38, 52, 48, 68, 62, 75, 70, 82, 78, 88].map((h, i) => (
                  <div key={i} className="flex-1 bg-purple-400/50 rounded-sm" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            {/* Action button */}
            <Link
              to="/analyzer"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#6332c9] via-[#7c3aed] to-[#8b5cf6] hover:opacity-95 text-white text-sm font-semibold py-2.5 px-5 rounded-full shadow-md shadow-purple-500/20 transition-all"
            >
              Explore Detailed Analysis <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BOTTOM FEATURE BANNER STRIP ──────────────────────────────────── */}
      <section className="px-4 sm:px-8 pb-12 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-surface border border-purple-100/90 dark:border-border rounded-2xl shadow-sm p-4 px-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-purple-100/80 dark:divide-white/10 gap-3">
          {[
            {
              icon: Rocket,
              title: 'Multi-Language Support',
              sub: 'Kannada, Hindi, Telugu...',
              color: '#7c3aed',
              bg: '#ede9fe',
            },
            {
              icon: BarChart2,
              title: 'Aspect-Based Analysis',
              sub: 'Story, Acting, Music...',
              color: '#6332c9',
              bg: '#ede9fe',
            },
            {
              icon: Users,
              title: 'Join Community',
              sub: 'Discuss & Share Reviews',
              color: '#8b5cf6',
              bg: '#f3e8ff',
            },
            {
              icon: Calendar,
              title: 'Upcoming Releases',
              sub: 'Stay Updated',
              color: '#7c3aed',
              bg: '#ede9fe',
            },
            {
              icon: Award,
              title: 'Earn Points',
              sub: 'Engage & Win Rewards',
              color: '#f59e0b',
              bg: '#fef3c7',
            },
          ].map(({ icon: Icon, title, sub, color, bg }, i) => (
            <div key={title} className={cn('flex items-center gap-3 py-2 sm:py-0', i > 0 ? 'sm:pl-4' : '')}>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xs"
                style={{ backgroundColor: bg }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">
                  {title}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="px-4 sm:px-8 py-10 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white mb-2">
            How It Works
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            Three simple steps from real audience reviews to deep AI insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              step: '01',
              icon: Search,
              title: 'Search a Movie',
              desc: 'Enter any movie title across Kannada, Hindi, Tamil, Telugu, Malayalam, or Hollywood.',
              color: '#7c3aed',
            },
            {
              step: '02',
              icon: TrendingUp,
              title: 'AI Analyzes Reviews',
              desc: 'Our NLP engine processes thousands of real reviews using multi-lingual sentiment models.',
              color: '#6332c9',
            },
            {
              step: '03',
              icon: BarChart2,
              title: 'Get Deep Insights',
              desc: 'View sentiment breakdown, aspect ratings, audience score, and authentic community feedback.',
              color: '#10b981',
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/95 dark:bg-surface/80 border border-purple-100 dark:border-border rounded-2xl p-6 backdrop-blur shadow-sm hover:shadow-md transition-all"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 shadow-xs"
                style={{ background: `${item.color}15` }}
              >
                <item.icon size={22} style={{ color: item.color }} />
              </div>
              <div
                className="text-xs font-mono font-bold mb-2 tracking-wider"
                style={{ color: item.color }}
              >
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-1.5">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ────────────────────────────────────────── */}
      <section className="px-4 sm:px-8 pb-16">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-[#6332c9] via-[#7c3aed] to-[#8b5cf6] rounded-3xl p-10 text-white shadow-xl shadow-purple-900/15 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_#fff_0%,_transparent_60%)]" />
          <div className="relative z-10">
            <div className="text-4xl mb-4">🎬</div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold mb-3">
              Ready to analyze your first review?
            </h2>
            <p className="text-purple-100 text-sm mb-7 max-w-md mx-auto">
              Paste any movie review and get instant sentiment analysis powered by real audience intelligence.
            </p>
            <Link
              to="/analyzer"
              className="inline-flex items-center gap-2 bg-white text-[#6332c9] font-bold px-7 py-3 rounded-full hover:bg-purple-50 transition-all shadow-md"
            >
              Start Analyzing <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
