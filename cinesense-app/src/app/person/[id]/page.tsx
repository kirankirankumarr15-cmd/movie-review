import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPersonDetails } from '@/lib/api-clients/tmdb';
import { User, Calendar, MapPin, Film, Star } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const person = await getPersonDetails(id);
    return {
      title: `${person.name} — Filmography & Biography | CineSense`,
      description: person.biography
        ? person.biography.slice(0, 160)
        : `Explore movies, credits, and profile of ${person.name} on CineSense.`,
    };
  } catch {
    return {
      title: 'Person Details | CineSense',
    };
  }
}

export default async function PersonPage({ params }: PageProps) {
  const { id } = await params;

  let person;
  try {
    person = await getPersonDetails(id);
  } catch (error) {
    console.error('Failed to load person details:', error);
    notFound();
  }

  const profileUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
    : null;

  // Filter and sort movie credits
  const castCredits = (person.movie_credits?.cast || [])
    .filter((c) => c.title)
    .sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));

  const crewCredits = (person.movie_credits?.crew || [])
    .filter((c) => c.title)
    .sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));

  return (
    <div className="min-h-screen bg-[#08080d] text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl space-y-12">
        {/* Person Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start bg-[#11111a] border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="w-44 sm:w-56 shrink-0 aspect-[2/3] rounded-2xl overflow-hidden relative bg-[#181826] border border-white/10 shadow-xl">
            {profileUrl ? (
              <Image
                src={profileUrl}
                alt={person.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-600">
                <User className="w-16 h-16" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {person.known_for_department || 'Film Industry'}
            </span>
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
              {person.name}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300">
              {person.birthday && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span>Born: {person.birthday}</span>
                </div>
              )}
              {person.place_of_birth && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-pink-400" />
                  <span>{person.place_of_birth}</span>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Biography</h2>
              <p className="text-slate-300 text-sm leading-relaxed max-h-60 overflow-y-auto pr-2">
                {person.biography || `${person.name} is an acclaimed talent in cinema.`}
              </p>
            </div>
          </div>
        </div>

        {/* Filmography Section */}
        {castCredits.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-400" />
              Acting Credits ({castCredits.length})
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {castCredits.slice(0, 18).map((credit) => (
                <Link
                  key={`${credit.id}-${credit.character}`}
                  href={`/movie/${credit.id}`}
                  className="group block bg-[#11111a] border border-white/10 hover:border-purple-500/50 rounded-xl overflow-hidden transition-all hover:-translate-y-1"
                >
                  <div className="relative aspect-[2/3] bg-[#181826]">
                    {credit.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${credit.poster_path}`}
                        alt={credit.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Film className="w-10 h-10" />
                      </div>
                    )}
                    {credit.vote_average > 0 && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{credit.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="text-xs font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                      {credit.title}
                    </h3>
                    {credit.character && (
                      <p className="text-[11px] text-slate-400 truncate">as {credit.character}</p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      {credit.release_date ? credit.release_date.slice(0, 4) : '—'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Crew / Directorial Credits */}
        {crewCredits.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-indigo-400" />
              Directing & Crew Credits ({crewCredits.length})
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {crewCredits.slice(0, 12).map((credit, i) => (
                <Link
                  key={`${credit.id}-${credit.job}-${i}`}
                  href={`/movie/${credit.id}`}
                  className="group block bg-[#11111a] border border-white/10 hover:border-purple-500/50 rounded-xl overflow-hidden transition-all hover:-translate-y-1"
                >
                  <div className="relative aspect-[2/3] bg-[#181826]">
                    {credit.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${credit.poster_path}`}
                        alt={credit.title}
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
                      {credit.title}
                    </h3>
                    <p className="text-[11px] text-purple-400 font-medium truncate">{credit.job}</p>
                    <p className="text-[10px] text-slate-400">
                      {credit.release_date ? credit.release_date.slice(0, 4) : '—'}
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
