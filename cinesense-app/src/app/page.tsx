import Link from "next/link";
import Image from "next/image";
import { Search, Star, Film, BarChart3, BarChart2, MessageSquare, Calendar, Award, Rocket } from "lucide-react";
import { getDiscoveryMovies } from "@/lib/api-clients/tmdb";

// Stats data
const STATS = [
  { value: "2.5M+", label: "Reviews Analyzed", icon: "📊" },
  { value: "6", label: "Languages", icon: "🌐" },
  { value: "10K+", label: "Movies", icon: "⭐" },
  { value: "50K+", label: "Community Members", icon: "👥" },
];

// Feature strip
const FEATURES = [
  { icon: Rocket, title: "Multi-Language Support", desc: "Kannada, Hindi, Telugu..." },
  { icon: BarChart2, title: "Aspect-Based Analysis", desc: "Story, Acting, Music..." },
  { icon: MessageSquare, title: "Join Community", desc: "Discuss & Share Reviews" },
  { icon: Calendar, title: "Upcoming Releases", desc: "Stay Updated" },
  { icon: Award, title: "Earn Points", desc: "Engage & Win Rewards" },
];

export default async function Home() {
  const [trending] = await Promise.all([
    getDiscoveryMovies('trending'),
    getDiscoveryMovies('upcoming'),
  ]);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-purple-50/30 to-white py-12 px-4">
        {/* Background decorative blob */}
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-purple-100/60 via-purple-50/30 to-transparent pointer-events-none" />
        {/* Film strip decoration */}
        <div className="absolute bottom-0 right-0 w-32 h-48 opacity-30 pointer-events-none">
          <div className="w-full h-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-l-xl" />
        </div>

        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: Hero text */}
            <div className="relative z-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 mb-5">
                ✦ Multi-Language AI Sentiment Platform
              </span>

              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Understand what audiences{" "}
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 italic underline decoration-orange-400 decoration-2">
                  really feel.
                </span>
              </h1>

              <p className="text-gray-500 text-base mb-6 max-w-lg leading-relaxed">
                Real multi-source review aggregation across Kannada, Hindi, Telugu, Tamil, Malayalam and Hollywood films. Verified sources, aspect-based sentiment, zero fake data.
              </p>

              {/* Search Bar */}
              <div className="flex items-center gap-2 mb-5 max-w-lg">
                <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-3 shadow-sm">
                  <Search className="w-4 h-4 text-gray-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search movies (e.g., KGF, Toxic, Salaar...)"
                    className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                    readOnly
                  />
                </div>
                <Link
                  href="/explore"
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-full transition-colors whitespace-nowrap flex items-center gap-1"
                >
                  Search →
                </Link>
              </div>

              {/* Language filter pills */}
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-600 text-white">All</button>
                <Link href="/hub/kn" className="px-4 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors">ಕನ್ನಡ (Kannada)</Link>
                <Link href="/hub/en" className="px-4 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors">Hollywood</Link>
                <Link href="/hub/te" className="px-4 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors">Telugu</Link>
                <Link href="/hub/ta" className="px-4 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors">Tamil</Link>
                <Link href="/hub/ml" className="px-4 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors">Malayalam</Link>
              </div>
            </div>

            {/* Right: Hero visual placeholder */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-200/60 via-pink-100/40 to-amber-100/30">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-purple-300">
                    <Film className="w-16 h-16 mx-auto mb-2" />
                    <p className="text-sm font-medium text-purple-400">Featured Movies</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-lg font-bold text-gray-900 leading-tight">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT: Trending + Sentiment Panel */}
      <section className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trending Movies - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-1 h-7 bg-purple-600 rounded-full" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Trending Movies</h2>
                  <p className="text-xs text-gray-500">Discover what audiences are saying</p>
                </div>
              </div>
              <Link href="/explore" className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center gap-1">
                View All →
              </Link>
            </div>

            {/* Movie Cards Scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {trending.slice(0, 8).map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movie/${movie.id}`}
                  className="group shrink-0 snap-start w-36 sm:w-40 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all overflow-hidden"
                >
                  <div className="relative h-52 bg-gradient-to-br from-gray-200 to-gray-300">
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
                    <button className="absolute top-2 left-2 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center text-gray-700 text-sm font-bold shadow opacity-0 group-hover:opacity-100 transition-opacity">
                      +
                    </button>
                    {/* Bottom gradient */}
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-bold truncate">{movie.title}</p>
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        movie.original_language === 'kn' ? 'bg-orange-100 text-orange-700' :
                        movie.original_language === 'hi' ? 'bg-blue-100 text-blue-700' :
                        movie.original_language === 'ta' ? 'bg-red-100 text-red-700' :
                        movie.original_language === 'te' ? 'bg-teal-100 text-teal-700' :
                        movie.original_language === 'ml' ? 'bg-green-100 text-green-700' :
                        'bg-indigo-100 text-indigo-700'
                      }`}>
                        {movie.original_language === 'kn' ? 'Kannada' :
                         movie.original_language === 'hi' ? 'Hindi' :
                         movie.original_language === 'ta' ? 'Tamil' :
                         movie.original_language === 'te' ? 'Telugu' :
                         movie.original_language === 'ml' ? 'Malayalam' : 'English'}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {movie.vote_count ? `${(movie.vote_count / 1000).toFixed(0)}K` : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Dot pagination */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-4 bg-purple-600' : 'w-1.5 bg-gray-300'}`} />
              ))}
            </div>
          </div>

          {/* AI Sentiment Analysis Panel - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-gray-900 text-base">AI Sentiment Analysis</h3>
              </div>
              <p className="text-xs text-gray-500 mb-5">Deep insights from real audience reviews</p>

              {/* Donut Chart */}
              <div className="flex items-center justify-center mb-5">
                <div className="relative w-36 h-36">
                  <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle cx="60" cy="60" r="45" fill="none" stroke="#f3f4f6" strokeWidth="12" />
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
                    {/* Neutral (orange) - 12% */}
                    <circle
                      cx="60" cy="60" r="45"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="12"
                      strokeDasharray="33.93 282.7"
                      strokeDashoffset="-28.27"
                      strokeLinecap="round"
                    />
                    {/* Positive (green) - 78% */}
                    <circle
                      cx="60" cy="60" r="45"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="12"
                      strokeDasharray="220.51 282.7"
                      strokeDashoffset="-62.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Center text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">78%</span>
                    <span className="text-xs text-gray-500">Positive</span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">Positive</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">78%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <span className="text-sm text-gray-600">Neutral</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">12%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-600">Negative</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">10%</span>
                </div>
              </div>

              {/* Mini sparkline */}
              <div className="h-12 mb-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl flex items-end px-2 pb-1 gap-1">
                {[30, 45, 35, 55, 42, 65, 58, 72, 68, 80, 75, 85].map((h, i) => (
                  <div key={i} className="flex-1 bg-purple-400 rounded-sm opacity-60" style={{ height: `${h}%` }} />
                ))}
              </div>

              <Link
                href="/analyze-review"
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Explore Detailed Analysis →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES STRIP */}
      <section className="border-t border-gray-100 bg-gray-50 py-6 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{feature.title}</p>
                    <p className="text-[11px] text-gray-500">{feature.desc}</p>
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
