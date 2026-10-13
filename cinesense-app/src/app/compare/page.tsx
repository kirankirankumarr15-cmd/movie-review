"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, ArrowRightLeft, Star, Film, Clock, Calendar, CheckCircle2 } from "lucide-react";
import { MovieSearchResult, MovieDetailsResponse } from "@/lib/api-clients/tmdb";

export default function ComparePage() {
  const [queryA, setQueryA] = useState("Toxic");
  const [queryB, setQueryB] = useState("Oppenheimer");
  const [movieA, setMovieA] = useState<MovieDetailsResponse | null>(null);
  const [movieB, setMovieB] = useState<MovieDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const performComparison = async () => {
    setLoading(true);
    try {
      // Search A
      const resA = await fetch(`/api/movies/search?q=${encodeURIComponent(queryA)}`);
      const dataA = await resA.json();
      const firstA = dataA.results?.[0];

      // Search B
      const resB = await fetch(`/api/movies/search?q=${encodeURIComponent(queryB)}`);
      const dataB = await resB.json();
      const firstB = dataB.results?.[0];

      if (firstA) {
        const detailsA = await fetch(`/api/movies/${firstA.id}`).then((r) => r.json());
        setMovieA(detailsA);
      }
      if (firstB) {
        const detailsB = await fetch(`/api/movies/${firstB.id}`).then((r) => r.json());
        setMovieB(detailsB);
      }
    } catch (err) {
      console.error("Comparison error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080d] text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl space-y-10">
        <div className="text-center space-y-3">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Head-to-Head Analysis
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
            Movie Showdown: Compare A vs B
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Compare critical reception, audience scores, runtime, and directors side-by-side.
          </p>
        </div>

        {/* Inputs Bar */}
        <div className="bg-[#101018] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <label className="text-xs font-medium text-slate-400 mb-1 block">Movie A</label>
            <input
              type="text"
              value={queryA}
              onChange={(e) => setQueryA(e.target.value)}
              placeholder="e.g. Toxic"
              className="w-full bg-[#181826] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="p-2 text-purple-400 shrink-0">
            <ArrowRightLeft className="w-6 h-6" />
          </div>

          <div className="flex-1 w-full">
            <label className="text-xs font-medium text-slate-400 mb-1 block">Movie B</label>
            <input
              type="text"
              value={queryB}
              onChange={(e) => setQueryB(e.target.value)}
              placeholder="e.g. Oppenheimer"
              className="w-full bg-[#181826] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="w-full md:w-auto md:self-end">
            <button
              onClick={performComparison}
              disabled={loading}
              className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Compare</span>
            </button>
          </div>
        </div>

        {/* Comparison Result Cards */}
        {movieA && movieB && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Card A */}
            <div className="bg-[#101018] border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-28 shrink-0 aspect-[2/3] rounded-xl overflow-hidden relative bg-[#181826]">
                  {movieA.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${movieA.poster_path}`}
                      alt={movieA.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Film className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold uppercase">
                    {movieA.original_language}
                  </span>
                  <h3 className="text-xl font-display font-bold text-white">{movieA.title}</h3>
                  <p className="text-xs text-slate-400">Dir. {movieA.director || "Unknown"}</p>
                  <p className="text-xs text-slate-400">{movieA.release_date?.slice(0, 4)}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/10 text-sm">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Rating</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {movieA.vote_average ? movieA.vote_average.toFixed(1) : "N/A"}/10
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Age Rating</span>
                  <span className="font-medium text-white">{movieA.age_rating || "UA"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Runtime</span>
                  <span className="font-medium text-white">
                    {movieA.runtime ? `${Math.floor(movieA.runtime / 60)}h ${movieA.runtime % 60}m` : "TBA"}
                  </span>
                </div>
              </div>

              <Link
                href={`/movie/${movieA.id}`}
                className="block text-center w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-purple-400 transition-colors"
              >
                View Full Analysis & Reviews →
              </Link>
            </div>

            {/* Card B */}
            <div className="bg-[#101018] border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex gap-4 items-start">
                <div className="w-28 shrink-0 aspect-[2/3] rounded-xl overflow-hidden relative bg-[#181826]">
                  {movieB.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w300${movieB.poster_path}`}
                      alt={movieB.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Film className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-semibold uppercase">
                    {movieB.original_language}
                  </span>
                  <h3 className="text-xl font-display font-bold text-white">{movieB.title}</h3>
                  <p className="text-xs text-slate-400">Dir. {movieB.director || "Unknown"}</p>
                  <p className="text-xs text-slate-400">{movieB.release_date?.slice(0, 4)}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-white/10 text-sm">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Rating</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {movieB.vote_average ? movieB.vote_average.toFixed(1) : "N/A"}/10
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Age Rating</span>
                  <span className="font-medium text-white">{movieB.age_rating || "UA"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Runtime</span>
                  <span className="font-medium text-white">
                    {movieB.runtime ? `${Math.floor(movieB.runtime / 60)}h ${movieB.runtime % 60}m` : "TBA"}
                  </span>
                </div>
              </div>

              <Link
                href={`/movie/${movieB.id}`}
                className="block text-center w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-pink-400 transition-colors"
              >
                View Full Analysis & Reviews →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
