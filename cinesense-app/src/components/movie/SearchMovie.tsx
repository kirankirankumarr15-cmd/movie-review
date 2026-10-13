"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Film, Star, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MovieSearchResult } from "@/lib/api-clients/tmdb";
import { motion, AnimatePresence } from "framer-motion";

// Language filter mappings (Prioritizing Kannada, Hindi removed)
const LANGUAGES = [
  { id: "all", label: "All" },
  { id: "kn", label: "ಕನ್ನಡ (Kannada)" },
  { id: "en", label: "Hollywood" },
  { id: "te", label: "Telugu" },
  { id: "ta", label: "Tamil" },
  { id: "ml", label: "Malayalam" },
];

const languageLabels: Record<string, string> = {
  kn: "Kannada (ಕನ್ನಡ)",
  te: "Telugu",
  ta: "Tamil",
  ml: "Malayalam",
  en: "English",
};

export default function SearchMovie() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 350);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch results when debounced query or language changes
  useEffect(() => {
    async function fetchResults() {
      if (!debouncedQuery.trim() && language === "all") {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);

      try {
        const queryParam = debouncedQuery.trim() ? `q=${encodeURIComponent(debouncedQuery)}&` : "";
        const res = await fetch(`/api/movies/search?${queryParam}lang=${language}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }

    fetchResults();
  }, [debouncedQuery, language]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectMovie = (movieId: number) => {
    setShowDropdown(false);
    setQuery("");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
    router.push(`/movie/${movieId}`, { scroll: true });
  };

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto relative z-50 text-left">
      <div className="flex flex-col gap-5">
        {/* Language Filter Pills */}
        <div className="flex justify-center">
          <Tabs defaultValue="all" value={language} onValueChange={setLanguage} className="w-auto">
            <TabsList className="bg-[#12121d] border border-white/10 rounded-full h-11 p-1 flex flex-wrap">
              {LANGUAGES.map((lang) => (
                <TabsTrigger
                  key={lang.id}
                  value={lang.id}
                  className="rounded-full px-4 sm:px-5 text-xs font-semibold data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-300 transition-all cursor-pointer"
                >
                  {lang.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Search Input Box with Dropdown Anchored Directly Below It */}
        <div className="relative w-full">
          <div className="relative group flex items-center">
            <div className="absolute left-4 flex items-center pointer-events-none text-purple-400">
              {isSearching ? <Loader2 className="animate-spin" size={22} /> : <Search size={22} />}
            </div>

            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                if (query.trim().length > 0 || (language !== "all" && results.length > 0)) {
                  setShowDropdown(true);
                }
              }}
              type="text"
              placeholder="Search movies (e.g. KGF, Toxic, Stree 2, Oppenheimer)..."
              className="w-full bg-[#12121d] border-2 border-white/15 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 rounded-2xl h-16 pl-13 pr-12 text-base sm:text-lg text-white shadow-2xl placeholder:text-slate-500 font-medium transition-all"
            />

            {query.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  if (language === "all") {
                    setResults([]);
                    setShowDropdown(false);
                  }
                }}
                className="absolute right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown Menu */}
          <AnimatePresence>
            {showDropdown && (query.trim().length > 0 || (language !== "all" && results.length > 0)) && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.99 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full mt-2 left-0 right-0 bg-[#12121e] border-2 border-purple-500/30 rounded-2xl shadow-2xl shadow-black/95 z-[9999] max-h-[460px] overflow-y-auto divide-y divide-white/10 backdrop-blur-2xl text-left"
              >
                {/* Header Banner if filtered by Language */}
                {language !== "all" && (
                  <div className="p-3 bg-purple-950/40 border-b border-purple-500/20 flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-200">
                      Showing {languageLabels[language] || language.toUpperCase()} Movies
                    </span>
                    <button
                      type="button"
                      onClick={() => router.push(`/hub/${language}`)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 underline underline-offset-4 cursor-pointer"
                    >
                      Visit {language === "kn" ? "Sandalwood" : languageLabels[language]} Hub →
                    </button>
                  </div>
                )}
                {/* Searching State */}
                {isSearching && results.length === 0 && (
                  <div className="p-8 text-center text-slate-300 flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-purple-400" size={28} />
                    <p className="text-sm font-medium">Searching databases for &ldquo;{query}&rdquo;...</p>
                  </div>
                )}

                {/* Empty State */}
                {!isSearching && results.length === 0 && (
                  <div className="p-8 text-center text-slate-400 space-y-1">
                    <p className="text-base font-semibold text-white">No movies found</p>
                    <p className="text-xs text-slate-400">
                      No matching titles for &ldquo;{query}&rdquo;. Try another title or switch the language filter.
                    </p>
                  </div>
                )}

                {/* Search Results List */}
                {results.map((movie) => {
                  const releaseYear = movie.release_date ? movie.release_date.slice(0, 4) : "Upcoming";
                  const langName = languageLabels[movie.original_language] || movie.original_language.toUpperCase();

                  return (
                    <div
                      key={movie.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectMovie(movie.id);
                      }}
                      className="group/item p-3.5 sm:p-4 flex items-center gap-4 hover:bg-purple-600/15 cursor-pointer transition-colors text-left"
                    >
                      {/* Poster Thumbnail */}
                      <div className="w-12 h-18 sm:w-14 sm:h-20 bg-[#08080d] rounded-lg overflow-hidden shrink-0 border border-white/15 relative shadow-md">
                        {movie.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <Film size={22} />
                          </div>
                        )}
                      </div>

                      {/* Movie Information (Explicitly Left-Aligned) */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <h4 className="text-white font-bold text-base sm:text-lg truncate group-hover/item:text-purple-300 transition-colors">
                            {movie.title}
                          </h4>
                          {movie.original_title && movie.original_title !== movie.title && (
                            <span className="text-xs text-slate-400 truncate hidden md:inline">
                              ({movie.original_title})
                            </span>
                          )}
                        </div>

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                          <span className="text-slate-300 font-medium">
                            {releaseYear}
                          </span>

                          <span className="text-slate-500">•</span>

                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold uppercase tracking-wider text-[11px] border border-purple-500/30">
                            {langName}
                          </span>

                          <span className="text-slate-500">•</span>

                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                            {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                          </span>
                        </div>

                        {/* Short Overview snippet if present */}
                        {movie.overview && (
                          <p className="text-[12px] text-slate-400 line-clamp-1 mt-1 max-w-xl">
                            {movie.overview}
                          </p>
                        )}
                      </div>

                      {/* Arrow action indicator */}
                      <div className="text-slate-500 group-hover/item:text-purple-400 group-hover/item:translate-x-1 transition-all shrink-0 hidden sm:block">
                        <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
