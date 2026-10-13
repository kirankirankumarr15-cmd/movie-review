import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDiscoveryMovies } from '@/lib/api-clients/tmdb';
import { Star, Film, Sparkles, TrendingUp } from 'lucide-react';

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
    <div className="min-h-screen bg-[#08080d] text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Industry Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 p-8 md:p-12 bg-gradient-to-br from-[#12121c] to-[#0c0c14]">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15">
              {hub.industry}
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white tracking-tight">
              Welcome to{" "}
              <span className={`text-transparent bg-clip-text bg-gradient-to-r ${hub.gradient}`}>
                {hub.name}
              </span>
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed">
              {hub.description}
            </p>
          </div>
        </div>

        {/* Trending in Hub */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Trending in {hub.name}
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

        {/* All-Time Top Rated in Hub */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              All-Time Top Rated in {hub.name}
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {topRated.slice(0, 12).map((m) => (
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
      </div>
    </div>
  );
}
