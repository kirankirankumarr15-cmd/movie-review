import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDiscoveryMovies } from '@/lib/api-clients/tmdb';
import { Star, Film, Sparkles, TrendingUp } from 'lucide-react';
import HeroSearch from '@/components/movie/HeroSearch';

interface PageProps {
  params: Promise<{ lang: string }>;
}

const HUB_INFO: Record<string, { name: string; industry: string; gradient: string; description: string }> = {
  kn: {
    name: 'Sandalwood',
    industry: 'Kannada Cinema',
    gradient: 'from-amber-500 to-red-600',
    description: 'Explore verified reviews, trailer breakdowns, and audience sentiment for the finest Kannada films from Sandalwood.',
  },
  hi: {
    name: 'Bollywood',
    industry: 'Hindi Cinema',
    gradient: 'from-orange-500 to-pink-600',
    description: 'Track blockbuster releases, sleeper hits, and pan-India Hindi cinema with real sentiment analysis.',
  },
  te: {
    name: 'Tollywood',
    industry: 'Telugu Cinema',
    gradient: 'from-yellow-500 to-amber-600',
    description: 'High-octane action, mass entertainers, and critically acclaimed Telugu cinema reviews.',
  },
  ta: {
    name: 'Kollywood',
    industry: 'Tamil Cinema',
    gradient: 'from-rose-500 to-purple-600',
    description: 'Celebrated auteur filmmaking and big-ticket spectacles from Tamil Nadu.',
  },
  ml: {
    name: 'Mollywood',
    industry: 'Malayalam Cinema',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Content-driven, realistic, and pathbreaking stories from Kerala cinema.',
  },
  en: {
    name: 'Hollywood',
    industry: 'English & Global Cinema',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Global blockbusters, franchise universes, and Oscar contenders reviewed and scored.',
  },
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const hub = HUB_INFO[lang];
  if (!hub) return { title: 'Language Hub | CineSense' };
  return {
    title: `${hub.name} (${hub.industry}) — Movies & Sentiment | CineSense`,
    description: hub.description,
  };
}

export default async function HubPage({ params }: PageProps) {
  const { lang } = await params;
  const hub = HUB_INFO[lang];
  if (!hub) notFound();

  // Fetch trending and top-rated for this industry
  const [trending, topRated] = await Promise.all([
    getDiscoveryMovies('trending', lang),
    getDiscoveryMovies('top_rated', lang),
  ]);

  return (
    <div className="min-h-screen bg-[#f8f7ff] dark:bg-[#08080d] text-slate-900 dark:text-slate-100 py-12 transition-colors duration-200">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Industry Hero Banner */}
        <div className="relative z-20 rounded-3xl border border-purple-100/80 dark:border-white/10 p-8 md:p-12 bg-gradient-to-br from-purple-100/70 via-white to-pink-50/50 dark:from-[#12121c] dark:to-[#0c0c14] shadow-sm">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#6332c9] text-white dark:bg-white/10 dark:text-white border border-transparent dark:border-white/15 shadow-sm">
              {hub.industry}
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome to{" "}
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${hub.gradient}`}>
                {hub.name}
              </span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
              {hub.description}
            </p>
            <HeroSearch language={lang} className="mb-0 max-w-xl pt-2" />
          </div>
        </div>

        {/* Trending in Hub */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Trending in {hub.name}</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.slice(0, 12).map((m) => (
              <Link
                key={m.id}
                href={`/movie/${m.id}`}
                className="group block bg-white dark:bg-[#11111a] border border-purple-100/80 dark:border-white/10 hover:border-purple-500/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="relative aspect-[2/3] bg-slate-100 dark:bg-[#161622]">
                  {m.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${m.poster_path}`}
                      alt={m.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
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
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {m.release_date ? m.release_date.slice(0, 4) : '—'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* All-Time Top Rated in Hub */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              <span>All-Time Top Rated in {hub.name}</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topRated.slice(0, 12).map((m) => (
              <Link
                key={m.id}
                href={`/movie/${m.id}`}
                className="group block bg-white dark:bg-[#11111a] border border-purple-100/80 dark:border-white/10 hover:border-purple-500/50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="relative aspect-[2/3] bg-slate-100 dark:bg-[#161622]">
                  {m.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${m.poster_path}`}
                      alt={m.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
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
                  <h3 className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {m.release_date ? m.release_date.slice(0, 4) : '—'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
