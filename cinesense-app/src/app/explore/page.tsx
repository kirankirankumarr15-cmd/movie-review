"use client";

import { FormEvent, Suspense, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Loader2, Star, Film, Filter, Compass, X } from "lucide-react";
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
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f7ff] dark:bg-[#08080d] flex items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const langFromUrl = searchParams.get("lang") || "all";
  const [searchInput, setSearchInput] = useState(queryFromUrl);
  const [category, setCategory] = useState("trending");
  const [language, setLanguage] = useState(langFromUrl);
  const [movies, setMovies] = useState<MovieSearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchInput(queryFromUrl);
  }, [queryFromUrl]);

  useEffect(() => {
    setLanguage(langFromUrl);
  }, [langFromUrl]);

  useEffect(() => {
    async function loadMovies() {
      setLoading(true);
      try {
        const url = queryFromUrl.trim()
          ? `/api/movies/search?q=${encodeURIComponent(queryFromUrl.trim())}&lang=${language}`
          : `/api/movies/discovery?category=${category}&lang=${language}`;
        const res = await fetch(url);
        const data = await res.json();
        setMovies(data.results || []);
      } catch (err) {
        console.error("Explore fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, [category, language, queryFromUrl]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = searchInput.trim();
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  };

  return (
    <div className="min-h-screen bg-[#f8f7ff] dark:bg-[#08080d] text-slate-900 dark:text-slate-100 py-12 transition-colors duration-200">
      <div className="container mx-auto px-4 max-w-6xl space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-sm font-semibold">
            <Compass className="w-4 h-4" />
            <span>Discover & Explore</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
            Cinematic Catalog
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl">
            Browse across regional and international cinema with live ratings and verified sentiment insights.
          </p>
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-lg pt-2">
            <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#12121e] border border-slate-200/90 dark:border-white/10 rounded-full px-4 py-2.5 shadow-sm">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder=""
                className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    router.push("/explore");
                  }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#6332c9] via-[#7c3aed] to-[#b5179e] text-white text-sm font-semibold rounded-full shadow-md shadow-purple-500/25"
            >
              Search
            </button>
          </form>
          {queryFromUrl && (
            <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
              Showing results for “{queryFromUrl}”
            </p>
          )}
        </div>

        {/* Filter Controls */}
        <div className="bg-white dark:bg-[#101018] border border-purple-100/80 dark:border-white/10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-sm transition-colors">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  category === cat.id
                    ? "bg-[#6332c9] text-white shadow-md shadow-purple-600/30"
                    : "bg-slate-100 dark:bg-[#181826] text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-white/10"
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
              className="bg-slate-50 dark:bg-[#181826] border border-slate-200 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 cursor-pointer shadow-sm"
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
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 dark:text-purple-500 mb-3" />
            <span>Loading movies...</span>
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((m) => (
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
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>{m.release_date ? m.release_date.slice(0, 4) : "—"}</span>
                    <span className="uppercase text-[9px] font-mono px-1 rounded bg-purple-50 dark:bg-white/5 text-purple-700 dark:text-purple-300">
                      {m.original_language}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-[#101018] border border-purple-100/80 dark:border-white/10 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-sm">
            No movies found for this filter combination.
          </div>
        )}
      </div>
    </div>
  );
}
