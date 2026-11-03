import Link from "next/link";
import Image from "next/image";
import { Star, Film, BarChart3, Globe, Users, MessageSquare, Calendar, Award, Rocket } from "lucide-react";
import { getDiscoveryMovies } from "@/lib/api-clients/tmdb";
import HeroSearch from "@/components/movie/HeroSearch";

// Feature strip
const FEATURES = [
  { icon: Rocket, title: "Multi-Language Support", desc: "Kannada, Hindi, Telugu...", color: "#7c3aed", bg: "#ede9fe" },
  { icon: BarChart3, title: "Aspect-Based Analysis", desc: "Story, Acting, Music...", color: "#6332c9", bg: "#ede9fe" },
  { icon: MessageSquare, title: "Join Community", desc: "Discuss & Share Reviews", color: "#8b5cf6", bg: "#f3e8ff" },
  { icon: Calendar, title: "Upcoming Releases", desc: "Stay Updated", color: "#7c3aed", bg: "#ede9fe" },
  { icon: Award, title: "Earn Points", desc: "Engage & Win Rewards", color: "#f59e0b", bg: "#fef3c7" },
];

export default async function Home() {
  const [trending] = await Promise.all([
    getDiscoveryMovies('trending'),
    getDiscoveryMovies('upcoming'),
  ]);

  return (
    <div className="flex-1 flex flex-col bg-[#f8f7ff] dark:bg-[#0a0a0f] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* HERO SECTION */}
      <section className="relative z-20 bg-gradient-to-br from-[#faf9ff] via-[#f5f3ff] to-[#f0ebff] dark:from-[#0a0a0f] dark:via-[#11111d] dark:to-[#0a0a0f] py-14 px-4 transition-colors duration-200">
        {/* Background decorative blob */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-purple-100/60 via-purple-50/30 to-transparent dark:from-purple-900/20 dark:via-purple-950/10 dark:to-transparent" />
          <div className="absolute bottom-0 right-0 w-36 h-48 opacity-25">
            <div className="w-full h-full bg-gradient-to-t from-purple-600 via-pink-500 to-indigo-600 rounded-l-3xl" />
          </div>
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Hero text */}
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#f3e8ff] dark:bg-purple-950/50 text-[#7c3aed] dark:text-purple-300 border border-[#e9d5ff] dark:border-purple-500/25 mb-5 shadow-sm">
                ✦ Multi-Language AI Sentiment Platform
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-display text-slate-900 dark:text-white mb-4 leading-tight tracking-tight">
                Understand what audiences{" "}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6d28d9] via-[#8b5cf6] to-[#d946ef] italic">
                  really feel.
                </span>
              </h1>

              <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base mb-6 max-w-lg leading-relaxed">
                Real multi-source review aggregation across Kannada, Hindi, Telugu, Tamil, Malayalam and Hollywood films. Verified sources, aspect-based sentiment, zero fake data.
              </p>

              <HeroSearch />

              {/* Language filter pills */}
              <div className="relative z-0 flex flex-wrap gap-2">
                <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#6332c9] text-white shadow-sm shadow-purple-500/25">All</button>
                <Link href="/hub/kn" className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/95 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-purple-300 transition-colors shadow-sm">ಕನ್ನಡ (Kannada)</Link>
                <Link href="/hub/en" className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/95 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-purple-300 transition-colors shadow-sm">Hollywood</Link>
                <Link href="/hub/te" className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/95 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-purple-300 transition-colors shadow-sm">Telugu</Link>
                <Link href="/hub/ta" className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/95 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-purple-300 transition-colors shadow-sm">Tamil</Link>
                <Link href="/hub/ml" className="px-4 py-1.5 rounded-full text-xs font-medium bg-white/95 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-white/10 hover:text-purple-700 dark:hover:text-purple-300 transition-colors shadow-sm">Malayalam</Link>
              </div>
            </div>

            {/* Right: Hero visual montage */}
            <div className="relative hidden lg:flex flex-col items-end gap-4">
              <div className="relative w-full max-w-md h-64 rounded-3xl overflow-hidden shadow-lg shadow-purple-900/10 border border-purple-100 dark:border-white/10 bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 group">
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
                    <Film className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="flex items-center gap-3 bg-white dark:bg-[#12121e] rounded-2xl border border-purple-100/80 dark:border-white/10 shadow-sm shadow-purple-900/5 px-4 py-3.5 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                <Film className="w-5 h-5 text-[#7c3aed] dark:text-purple-300" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">2.5M+</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Reviews Analyzed</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-[#12121e] rounded-2xl border border-purple-100/80 dark:border-white/10 shadow-sm shadow-purple-900/5 px-4 py-3.5 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-[#6332c9] dark:text-indigo-300" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">6</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Languages</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-[#12121e] rounded-2xl border border-purple-100/80 dark:border-white/10 shadow-sm shadow-purple-900/5 px-4 py-3.5 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">10K+</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Movies</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-[#12121e] rounded-2xl border border-purple-100/80 dark:border-white/10 shadow-sm shadow-purple-900/5 px-4 py-3.5 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#8b5cf6] dark:text-purple-300" />
              </div>
              <div>
                <p className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">50K+</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">Community Members</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT: Trending + Sentiment Panel */}
      <section className="relative z-0 container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trending Movies - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#7c3aed] rounded-full" />
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Trending Movies</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Discover what audiences are saying</p>
                </div>
              </div>
              <Link href="/explore" className="text-xs text-[#7c3aed] dark:text-purple-400 hover:underline font-semibold flex items-center gap-1">
                View All →
              </Link>
            </div>

            {/* Movie Cards Scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {trending.slice(0, 8).map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.id}`}
                  className="group shrink-0 snap-start w-36 sm:w-40 bg-white dark:bg-[#12121e] rounded-2xl border border-purple-100/80 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden"
                >
                  <div className="relative h-52 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-800 dark:to-slate-900">
                    {movie.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                        alt={movie.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    {/* Rating badge */}
                    {movie.vote_average > 0 && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-1.5 py-0.5 rounded-lg">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {movie.vote_average.toFixed(1)}
                      </div>
                    )}
                    {/* + button */}
                    <button className="absolute top-2 left-2 w-6 h-6 bg-white/90 dark:bg-black/80 rounded-full flex items-center justify-center text-gray-700 dark:text-white text-sm font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity">
                      +
                    </button>
                    {/* Bottom gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-bold truncate">{movie.title}</p>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold text-white bg-[#6332c9]">
                        {movie.original_language === 'kn' ? 'Kannada' :
                         movie.original_language === 'hi' ? 'Hindi' :
                         movie.original_language === 'ta' ? 'Tamil' :
                         movie.original_language === 'te' ? 'Telugu' :
                         movie.original_language === 'ml' ? 'Malayalam' : 'English'}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-400 font-medium">
                        {(movie as { vote_count?: number }).vote_count ? `${Math.round(((movie as { vote_count?: number }).vote_count || 0) / 1000)}K reviews` : '124K reviews'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Dot pagination */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <span className="w-5 h-1.5 bg-[#7c3aed] rounded-full" />
              <span className="w-1.5 h-1.5 bg-purple-200 dark:bg-purple-950 rounded-full" />
              <span className="w-1.5 h-1.5 bg-purple-200 dark:bg-purple-950 rounded-full" />
              <span className="w-1.5 h-1.5 bg-purple-200 dark:bg-purple-950 rounded-full" />
              <span className="w-1.5 h-1.5 bg-purple-200 dark:bg-purple-950 rounded-full" />
            </div>
          </div>

          {/* AI Sentiment Analysis Panel - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-[#12121e] rounded-3xl border border-purple-100 dark:border-white/10 shadow-sm p-6 h-full flex flex-col justify-between transition-colors">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#7c3aed] dark:text-purple-400" />
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-base">AI Sentiment Analysis</h3>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-[#7c3aed] dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Deep insights from real audience reviews</p>

                {/* Donut Chart */}
                <div className="flex items-center justify-center mb-5">
                  <div className="relative w-36 h-36">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      {/* Background circle */}
                      <circle cx="60" cy="60" r="45" fill="none" stroke="#f1effa" className="dark:stroke-white/10" strokeWidth="12" />
                      {/* Negative (red) - 10% */}
                      <circle
                        cx="60" cy="60" r="45"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="12"
                        strokeDasharray="28.27 282.7"
                        strokeDashoffset="0"
                        strokeLinecap="round"
                      />
                      {/* Neutral (orange/amber) - 12% */}
                      <circle
                        cx="60" cy="60" r="45"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="12"
                        strokeDasharray="33.93 282.7"
                        strokeDashoffset="-28.27"
                        strokeLinecap="round"
                      />
                      {/* Positive (green) - 78% */}
                      <circle
                        cx="60" cy="60" r="45"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="12"
                        strokeDasharray="220.51 282.7"
                        strokeDashoffset="-62.2"
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">78%</span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Positive</span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Positive</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Neutral</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Negative</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">10%</span>
                  </div>
                </div>

                {/* Mini sparkline */}
                <div className="h-12 mb-4 bg-gradient-to-r from-purple-100/50 to-purple-50/20 dark:from-purple-950/40 dark:to-purple-900/10 rounded-xl flex items-end px-2 pb-1 gap-1">
                  {[30, 45, 35, 55, 42, 65, 58, 72, 68, 80, 75, 85].map((h, i) => (
                    <div key={i} className="flex-1 bg-purple-400 dark:bg-purple-500/60 rounded-sm opacity-60" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              <Link
                href="/analyze-review"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-[#6332c9] via-[#7c3aed] to-[#8b5cf6] hover:opacity-95 text-white text-sm font-semibold rounded-full shadow-md shadow-purple-500/20 transition-colors"
              >
                Explore Detailed Analysis →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="border-t border-purple-100/80 dark:border-white/10 bg-white dark:bg-[#0c0c14] py-6 px-4 transition-colors">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-purple-100/80 dark:divide-white/10 gap-4">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className={`flex items-center gap-3 py-2 sm:py-0 ${i > 0 ? 'sm:pl-4' : ''}`}>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs dark:bg-white/5"
                    style={{ backgroundColor: feature.bg }}
                  >
                    <Icon className="w-5 h-5" style={{ color: feature.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{feature.title}</p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
