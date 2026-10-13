import Link from "next/link";
import Image from "next/image";
import SearchMovie from "@/components/movie/SearchMovie";
import { getDiscoveryMovies } from "@/lib/api-clients/tmdb";
import { Star, Film, Sparkles, TrendingUp, Compass, Smile, Flame, ShieldAlert, Heart, Brain } from "lucide-react";

export default async function Home() {
  const [trending, upcoming] = await Promise.all([
    getDiscoveryMovies('trending'),
    getDiscoveryMovies('upcoming'),
  ]);

  const hubs = [
    { id: "kn", name: "Sandalwood", lang: "Kannada", bg: "from-amber-600 to-red-700" },
    { id: "hi", name: "Bollywood", lang: "Hindi", bg: "from-orange-600 to-pink-700" },
    { id: "te", name: "Tollywood", lang: "Telugu", bg: "from-yellow-600 to-amber-700" },
    { id: "ta", name: "Kollywood", lang: "Tamil", bg: "from-rose-600 to-purple-700" },
    { id: "ml", name: "Mollywood", lang: "Malayalam", bg: "from-emerald-600 to-teal-700" },
    { id: "en", name: "Hollywood", lang: "English", bg: "from-blue-600 to-indigo-700" },
  ];

  const moods = [
    { title: "Adrenaline & Action", icon: Flame, color: "text-orange-400 bg-orange-500/10 border-orange-500/20", genre: 28 },
    { title: "Mind-Bending Sci-Fi", icon: Brain, color: "text-purple-400 bg-purple-500/10 border-purple-500/20", genre: 878 },
    { title: "Feel-Good Comedy", icon: Smile, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", genre: 35 },
    { title: "Spine-Chilling Horror", icon: ShieldAlert, color: "text-rose-400 bg-rose-500/10 border-rose-500/20", genre: 27 },
    { title: "Heartfelt Romance", icon: Heart, color: "text-pink-400 bg-pink-500/10 border-pink-500/20", genre: 10749 },
  ];

  return (
    <div className="flex-1 flex flex-col space-y-16 pb-24">
      {/* 1. HERO SEARCH SECTION */}
      <section className="relative z-30 py-20 px-4 min-h-[540px] flex flex-col items-center justify-center text-center border-b border-white/10">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[130px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-900/20 blur-[130px]" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 mb-6">
            Multi-Language AI Sentiment Platform
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-bold text-white mb-6 leading-tight tracking-tight">
            Understand what audiences <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
              really feel.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 mb-10 max-w-2xl leading-relaxed">
            Real multi-source review aggregation across Kannada, Hindi, Telugu, Tamil, Malayalam and Hollywood films. Verified sources, aspect-based sentiment, zero fake data.
          </p>

          <SearchMovie />
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl space-y-16">
        {/* 2. REGIONAL CINEMA HUBS (D7) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-400" />
              Regional & Global Cinema Hubs
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {hubs.map((hub) => (
              <Link
                key={hub.id}
                href={`/hub/${hub.id}`}
                className={`group block p-4 rounded-2xl bg-gradient-to-br ${hub.bg} border border-white/10 shadow-lg hover:scale-105 transition-all text-center`}
              >
                <h3 className="text-base font-display font-bold text-white group-hover:underline">
                  {hub.name}
                </h3>
                <p className="text-xs text-white/80 font-medium">{hub.lang}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. MOOD-BASED PICKER (D4) */}
        <section className="bg-[#101018] border border-white/10 rounded-2xl p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400" />
                Mood-Based Discovery
              </h2>
              <p className="text-xs text-slate-400 mt-1">What kind of cinematic experience are you craving today?</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
            {moods.map((m, i) => {
              const Icon = m.icon;
              return (
                <Link
                  key={i}
                  href={`/explore?genre=${m.genre}`}
                  className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2.5 transition-all hover:-translate-y-1 cursor-pointer ${m.color}`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-semibold">{m.title}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 4. TRENDING NOW (D2) */}
        {trending.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Trending Movies This Week
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {trending.slice(0, 12).map((m) => (
                <Link
                  key={m.id}
                  href={`/movie/${m.id}`}
                  className="group block bg-[#11111a] border border-white/10 hover:border-purple-500/50 rounded-xl overflow-hidden transition-all hover:-translate-y-1"
                >
                  <div className="relative aspect-[2/3] bg-[#161622]">
                    {m.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${m.poster_path}`}
                        alt={m.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Film className="w-10 h-10" />
                      </div>
                    )}
                    {m.vote_average > 0 && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{m.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-xs font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {m.release_date ? m.release_date.slice(0, 4) : '—'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 5. UPCOMING IN THEATRES (D2) */}
        {upcoming.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Highly Anticipated Releases
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {upcoming.slice(0, 12).map((m) => (
                <Link
                  key={m.id}
                  href={`/movie/${m.id}`}
                  className="group block bg-[#11111a] border border-white/10 hover:border-purple-500/50 rounded-xl overflow-hidden transition-all hover:-translate-y-1"
                >
                  <div className="relative aspect-[2/3] bg-[#161622]">
                    {m.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${m.poster_path}`}
                        alt={m.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Film className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-xs font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {m.release_date || 'Coming Soon'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
