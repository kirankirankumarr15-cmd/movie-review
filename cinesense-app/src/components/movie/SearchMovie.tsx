"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, Film } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MovieSearchResult } from "@/lib/api-clients/tmdb";
import { motion, AnimatePresence } from "framer-motion";

// Language filter mappings mapping exactly to TMDB original_language
const LANGUAGES = [
  { id: "all", label: "All" },
  { id: "en", label: "Hollywood" },
  { id: "hi", label: "Hindi" },
  { id: "kn", label: "Kannada" },
];

export default function SearchMovie() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [results, setResults] = useState<MovieSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch results when debounced query or language changes
  useEffect(() => {
    async function fetchResults() {
      if (!debouncedQuery.trim()) {
        setResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);

      try {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(debouncedQuery)}&lang=${language}`);
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

  return (
    <div className="w-full max-w-3xl mx-auto relative z-20">
      <div className="flex flex-col gap-6">
        
        {/* Language Tabs */}
        <div className="flex justify-center">
          <Tabs defaultValue="all" value={language} onValueChange={setLanguage} className="w-auto">
            <TabsList className="bg-[#1a1a25] border border-white/10 rounded-full h-12 p-1">
              {LANGUAGES.map((lang) => (
                <TabsTrigger 
                  key={lang.id} 
                  value={lang.id}
                  className="rounded-full px-6 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-slate-400"
                >
                  {lang.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
               if (query.trim()) setShowDropdown(true);
            }}
            onBlur={() => {
              // Delay hiding dropdown so we can click results
              setTimeout(() => setShowDropdown(false), 200);
            }}
            type="text"
            placeholder="Search for a movie (e.g. Inception, KGF, Dangal)..."
            className="w-full bg-[#161622] border-white/10 focus:border-purple-500 focus:ring-purple-500 rounded-2xl h-16 pl-12 pr-4 text-lg text-white shadow-xl placeholder:text-slate-500"
          />
        </div>

        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {showDropdown && (query.trim().length > 0) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-[140px] left-0 right-0 bg-[#161622] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
            >
              {isSearching && results.length === 0 && (
                <div className="p-4 text-center text-slate-400 py-8">
                  Searching across databases...
                </div>
              )}
              
              {!isSearching && results.length === 0 && (
                <div className="p-4 text-center text-slate-400 py-8">
                  No movies found. Try another title.
                </div>
              )}

              {results.map((movie) => (
                <div 
                  key={movie.id}
                  onClick={() => router.push(`/movie/${movie.id}`)}
                  className="p-4 border-b border-white/5 flex gap-4 hover:bg-[#1a1a25] cursor-pointer transition-colors"
                >
                  <div className="w-12 h-16 bg-[#0a0a0f] rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {movie.poster_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film size={20} className="text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-white font-medium text-lg">{movie.title}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                      <span>{movie.release_date?.substring(0, 4) || 'Unknown Year'}</span>
                      <span>•</span>
                      <span className="uppercase text-xs font-semibold bg-white/10 px-2 py-0.5 rounded text-slate-300">
                        {movie.original_language}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        ⭐ {movie.vote_average?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
