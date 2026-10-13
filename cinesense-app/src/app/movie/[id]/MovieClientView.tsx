"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Play, 
  Star, 
  Calendar, 
  Clock, 
  Film, 
  Tv, 
  User, 
  Bookmark, 
  Heart, 
  Share2, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Image as ImageIcon
} from "lucide-react";
import TrailerModal from "@/components/movie/TrailerModal";
import ShareReviewCardModal from "@/components/movie/ShareReviewCardModal";
import { HeroPlayer } from "@/components/movie/HeroPlayer";
import { MovieDetailsResponse } from "@/lib/api-clients/tmdb";
import { MovieVideo, LegalFullMovie } from "@/lib/db/types";

interface MovieClientViewProps {
  movie: MovieDetailsResponse;
  movieVideos?: MovieVideo[];
  legalFullMovie?: LegalFullMovie | null;
  sentimentSummarySlot?: React.ReactNode;
  reviewsSlot?: React.ReactNode;
  communityReviewsSlot?: React.ReactNode;
  chatbotSlot?: React.ReactNode;
  pollsSlot?: React.ReactNode;
}

export default function MovieClientView({
  movie,
  movieVideos = [],
  legalFullMovie = null,
  sentimentSummarySlot,
  reviewsSlot,
  communityReviewsSlot,
  chatbotSlot,
  pollsSlot,
}: MovieClientViewProps) {
  const [isFullMovieOpen, setIsFullMovieOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const fullMovieButtonRef = useRef<HTMLButtonElement>(null);

  // Guarantee that navigating to any movie page always starts at the top (Hero banner)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [movie.id]);

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
    : null;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop";

  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : "Upcoming";
  const watchProvidersIN = movie["watch/providers"]?.results?.IN;
  const watchProvidersUS = movie["watch/providers"]?.results?.US;
  const activeProviders = watchProvidersIN || watchProvidersUS;

  const languageMap: Record<string, string> = {
    kn: "Kannada (Sandalwood)",
    hi: "Hindi (Bollywood)",
    te: "Telugu (Tollywood)",
    ta: "Tamil (Kollywood)",
    ml: "Malayalam (Mollywood)",
    en: "English (Hollywood)",
  };

  const formattedLanguage = languageMap[movie.original_language] || movie.original_language.toUpperCase();

  const handleShare = () => {
    setIsShareOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#08080d] text-slate-100 pb-20">
      {/* 1. NETFLIX/MOCTALE-STYLE IN-HERO DIRECT VIDEO PLAYER */}
      <div className="container mx-auto px-4 pt-6">
        <HeroPlayer
          movie={{
            id: String(movie.id),
            tmdb_id: movie.id,
            title: movie.title,
            original_title: movie.original_title,
            overview: movie.overview,
            release_date: movie.release_date,
            year: releaseYear !== 'Upcoming' ? parseInt(releaseYear, 10) : 2026,
            director: movie.director,
            language: movie.original_language,
            age_rating: movie.age_rating,
            runtime_minutes: movie.runtime ?? undefined,
            poster_path: movie.poster_path,
            backdrop_path: movie.backdrop_path,
            trailer_youtube_id: movie.trailer_youtube_id
          }}
          videos={movieVideos}
        />

        {/* Quick User Actions Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsWatchlisted(!isWatchlisted)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                isWatchlisted
                  ? "bg-purple-600 border-purple-500 text-white"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{isWatchlisted ? "In Watchlist" : "Add to Watchlist"}</span>
            </button>

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                isFavorite
                  ? "bg-pink-600 border-pink-500 text-white"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-slate-200"
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Favorite</span>
            </button>

            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer text-sm font-medium"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              {movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'N/A'} TMDB
            </span>
            <span>•</span>
            <span>{releaseYear}</span>
            {movie.runtime && (
              <>
                <span>•</span>
                <span>{movie.runtime}m</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. BODY CONTENT CONTAINER */}
      <div className="container mx-auto px-4 py-8 space-y-10">
        {/* FEATURE A8: LEGAL FULL-MOVIE PLAYBACK */}
        {legalFullMovie && legalFullMovie.verification_status === 'verified_approved' ? (
          <section className="bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-emerald-950/50 border border-emerald-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ✓ Official Free Full Movie
                  </span>
                  <span className="text-xs text-zinc-400">
                    Rights Holder: <strong className="text-zinc-200">{legalFullMovie.channel_name}</strong>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Watch Full Movie (Free, YouTube)
                </h3>
                <p className="text-xs text-zinc-400">
                  Verified official stream • {legalFullMovie.video_duration_minutes}m • No subscription required
                </p>
              </div>

              <button
                ref={fullMovieButtonRef}
                id="watch-full-movie-btn"
                onClick={() => setIsFullMovieOpen(true)}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Watch Full Movie (Free, YouTube)</span>
              </button>
            </div>
          </section>
        ) : null}

        {/* WHERE TO WATCH (A3 / A8 Fallback) */}
        <section className="bg-[#101018] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
              <Tv className="w-5 h-5 text-indigo-400" />
              Where to Watch
            </h2>
            <span className="text-xs text-slate-400">Official Streaming Platforms & Theatres</span>
          </div>

          {activeProviders?.flatrate && activeProviders.flatrate.length > 0 ? (
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm text-slate-300 font-medium">Streaming On:</span>
              {activeProviders.flatrate.map((provider) => (
                <div
                  key={provider.provider_id}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                    alt={provider.provider_name}
                    width={24}
                    height={24}
                    className="rounded-md"
                  />
                  <span>{provider.provider_name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 text-slate-300 text-sm py-2">
              <Film className="w-4 h-4 text-purple-400" />
              <span>
                Currently showing exclusively in <strong>Theatres</strong> or awaiting official OTT premiere announcement.
              </span>
            </div>
          )}
        </section>

        {/* SENTIMENT SUMMARY & ANALYTICS SLOT (Phase 2 & 5) */}
        {sentimentSummarySlot}

        {/* MULTI-SOURCE REVIEWS SLOT (Phase 2) */}
        {reviewsSlot}

        {/* COMMUNITY REVIEWS SLOT (Phase 4) */}
        {communityReviewsSlot}

        {/* FACTUAL AI CHATBOT SLOT (Phase 6) */}
        {chatbotSlot}

        {/* CAST & CREW SECTION (A2) */}
        {movie.credits?.cast && movie.credits.cast.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-purple-400" />
                Featured Cast & Crew
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movie.credits.cast.slice(0, 6).map((member) => (
                <Link
                  key={member.id}
                  href={`/person/${member.id}`}
                  className="group block bg-[#101018] border border-white/10 hover:border-purple-500/50 rounded-xl overflow-hidden transition-all hover:-translate-y-1"
                >
                  <div className="relative aspect-[3/4] bg-[#161622]">
                    {member.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${member.profile_path}`}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white truncate group-hover:text-purple-400 transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{member.character}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* COMMUNITY POLLS SLOT (Phase 7) */}
        {pollsSlot}

        {/* PHOTO GALLERY (A6) */}
        {movie.images?.backdrops && movie.images.backdrops.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-pink-400" />
              Photo Gallery
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {movie.images.backdrops.slice(0, 6).map((img, i) => (
                <div
                  key={i}
                  className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group"
                >
                  <Image
                    src={`https://image.tmdb.org/t/p/w780${img.file_path}`}
                    alt={`${movie.title} still ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SIMILAR MOVIES (A5) */}
        {movie.similar?.results && movie.similar.results.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              More Like This
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {movie.similar.results.slice(0, 6).map((sim) => (
                <Link
                  key={sim.id}
                  href={`/movie/${sim.id}`}
                  className="group block bg-[#101018] border border-white/10 hover:border-purple-500/50 rounded-xl overflow-hidden transition-all hover:-translate-y-1"
                >
                  <div className="relative aspect-[2/3] bg-[#161622]">
                    {sim.poster_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${sim.poster_path}`}
                        alt={sim.title}
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
                      {sim.title}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {sim.release_date ? sim.release_date.slice(0, 4) : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 3. LEGAL FULL-MOVIE IN-SITE PLAYER MODAL (A8) */}
      {legalFullMovie && (
        <TrailerModal
          isOpen={isFullMovieOpen}
          onClose={() => setIsFullMovieOpen(false)}
          youtubeId={legalFullMovie.youtube_id}
          movieTitle={`${movie.title} — Official Stream (${legalFullMovie.channel_name})`}
          triggerButtonRef={fullMovieButtonRef}
        />
      )}

      {/* 4. SHARE REVIEW CARD MODAL (F3) */}
      <ShareReviewCardModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        movieTitle={movie.title}
        year={movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : 2026}
        positivePct={70}
        topTheme="Superb Visuals & Performances"
        url={typeof window !== "undefined" ? window.location.href : `https://cinesense.app/movie/${movie.id}`}
      />
    </div>
  );
}
