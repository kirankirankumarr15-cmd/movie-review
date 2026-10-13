"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Loader2, Star, Film, Filter, Compass } from "lucide-react";
import { MovieSearchResult } from "@/lib/api-clients/tmdb";

const LANGUAGES = [
  { id: "all", label: "All Regions" },
  { id: "kn", label: "ಕನ್ನಡ (Sandalwood)" },
  { id: "te", label: "Telugu (Tollywood)" },
  { id: "ta", label: "Tamil (Kollywood)" },
  { id: "ml", label: "Malayalam (Mollywood)" },
  { id: "en", label: "Hollywood" },
];

const CATEGORIES = [
  { id: "trending", label: "Trending Now" },
  { id: "top_rated", label: "Top Rated" },
  { id: "upcoming", label: "Upcoming" },
  { id: "now_playing", label: "Now Playing" },
];

export default function ExplorePage() {
  const [category, setCategory] = useState("trending");
  const [language, setLanguage] = useState("all");
  const [movies, setMovies] = useState<MovieSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategoryMovies() {
      setLoading(true);
      try {
        const url = `/api/movies/discovery?category=${category}&lang=${language}`;
        const res = await fetch(url);
        const data = await res.json();
        setMovies(data.results || []);
      } catch (err) {
        console.error("Explore fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryMovies();
  }, [category, language]);

  return (
    <div className="min-h-screen bg-[#08080d] text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold">
            <Compass className="w-4 h-4" />
            <span>Discover & Explore</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
            Cinematic Catalog
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Browse across regional and international cinema with live ratings and verified sentiment insights.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="bg-[#101018] border border-white/10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  category === cat.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-[#181826] text-slate-300 hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Language Hub Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#181826] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
            <span>Loading movies...</span>
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((m) => (
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
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{m.release_date ? m.release_date.slice(0, 4) : "—"}</span>
                    <span className="uppercase text-[9px] font-mono px-1 rounded bg-white/5">
                      {m.original_language}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-[#101018] border border-white/10 rounded-2xl p-12 text-center text-slate-400">
            No movies found for this filter combination.
          </div>
        )}
      </div>
    </div>
  );
}
