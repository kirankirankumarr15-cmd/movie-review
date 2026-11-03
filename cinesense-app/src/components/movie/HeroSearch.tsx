"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, Loader2, Search, Star } from "lucide-react";
import { MovieSearchResult } from "@/lib/api-clients/tmdb";

export default function HeroSearch({
  language = "all",
  className = "mb-5 max-w-lg",
}: {
  language?: string;
  className?: string;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    async function fetchResults() {
      if (!debouncedQuery) {
        setResults([]);
        setShowDropdown(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);

      try {
        const langParam = language && language !== "all" ? `&lang=${encodeURIComponent(language)}` : "";
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(debouncedQuery)}${langParam}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Hero search error:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }

    fetchResults();
  }, [debouncedQuery, language]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToMovie = (movieId: number) => {
    setShowDropdown(false);
    router.push(`/movie/${movieId}`);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) {
      router.push("/explore");
      return;
    }
    if (results.length === 1 && !isSearching) {
      goToMovie(results[0].id);
      return;
    }
    const langQuery = language && language !== "all" ? `&lang=${encodeURIComponent(language)}` : "";
    router.push(`/explore?q=${encodeURIComponent(q)}${langQuery}`);
  };

  return (
    <div ref={containerRef} className={`relative z-50 ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#12121e] border border-slate-200/90 dark:border-white/10 rounded-full px-4 py-3 shadow-sm shadow-purple-500/5">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-slate-400 shrink-0 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim()) setShowDropdown(true);
            }}
            placeholder=""
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none"
            autoComplete="off"
            aria-label="Search movies"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-[#6332c9] via-[#7c3aed] to-[#b5179e] hover:opacity-95 text-white text-sm font-semibold rounded-full shadow-md shadow-purple-500/25 transition-all whitespace-nowrap flex items-center gap-1.5"
        >
          Search →
        </button>
      </form>

      {showDropdown && query.trim().length > 0 && (
        <div
          className="absolute top-full mt-2 left-0 right-0 z-[80] pointer-events-auto bg-white dark:bg-[#12121e] border border-purple-100 dark:border-white/10 rounded-2xl shadow-xl shadow-purple-900/10 max-h-[380px] overflow-y-auto divide-y divide-purple-50 dark:divide-white/10"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {isSearching && results.length === 0 && (
            <div className="p-5 text-center text-sm text-slate-500 dark:text-slate-400">
              Searching for “{query}”...
            </div>
          )}

          {!isSearching && results.length === 0 && (
            <div className="p-5 text-center text-sm text-slate-500 dark:text-slate-400">
              No movies found for “{query}”.
            </div>
          )}

          {results.slice(0, 8).map((movie) => {
            const year = movie.release_date ? movie.release_date.slice(0, 4) : "Upcoming";
            return (
              <Link
                key={movie.id}
                href={`/movie/${movie.id}`}
                onClick={() => setShowDropdown(false)}
                className="w-full text-left p-3 flex items-center gap-3 hover:bg-purple-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="w-10 h-14 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  {movie.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Film size={16} />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {movie.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2">
                    <span>{year}</span>
                    <span className="uppercase">{movie.original_language}</span>
                    {movie.vote_average > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {movie.vote_average.toFixed(1)}
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
