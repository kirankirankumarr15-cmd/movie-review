import { useState, useEffect } from "react";
import { Search, Loader2, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../lib/utils";

const LANGUAGES = [
  { id: "all", label: "All" },
  { id: "en", label: "Hollywood" },
  { id: "hi", label: "Hindi" },
  { id: "kn", label: "Kannada" },
];

export default function SearchMovie() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  // Fetch results
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
        const TMDB_TOKEN = import.meta.env.VITE_TMDB_API_KEY || import.meta.env.VITE_TMDB_TOKEN || "";
        
        const res = await fetch(`https://api.tmdb.org/3/search/movie?query=${encodeURIComponent(debouncedQuery)}&include_adult=false&page=1`, {
          headers: {
            Authorization: `Bearer ${TMDB_TOKEN}`,
            accept: "application/json"
          }
        });
        
        if (!res.ok) throw new Error("TMDB fetch failed");
        
        const data = await res.json();
        let fetchedResults = data.results || [];
        
        if (language && language !== 'all') {
          fetchedResults = fetchedResults.filter((m: any) => m.original_language === language);
        }
        
        setResults(fetchedResults);
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
          <div className={cn(
            "rounded-full h-12 p-1 flex items-center transition-all",
            isDark
              ? "bg-[#1a1a25] border border-white/10 shadow-lg"
              : "bg-white/95 border border-slate-200/90 shadow-md backdrop-blur-sm"
          )}>
            {LANGUAGES.map((lang) => (
              <button 
                key={lang.id} 
                onClick={() => setLanguage(lang.id)}
                className={cn(
                  "rounded-full px-6 h-full text-sm font-semibold transition-all",
                  language === lang.id 
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/25" 
                    : isDark
                      ? "text-slate-400 hover:text-white"
                      : "text-slate-600 hover:text-purple-700 hover:bg-purple-50/50"
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <div className={cn(
            "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors",
            isDark ? "text-slate-400" : "text-slate-500 group-focus-within:text-purple-600"
          )}>
            {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
               if (query.trim()) setShowDropdown(true);
            }}
            onBlur={() => {
              setTimeout(() => setShowDropdown(false), 200);
            }}
            type="text"
            placeholder="Search for a movie (e.g. Inception, KGF, Dangal)..."
            className={cn(
              "w-full rounded-2xl h-16 pl-12 pr-4 text-lg shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-purple-500",
              isDark
                ? "bg-[#161622] border border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500"
                : "bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:border-purple-600 shadow-slate-200/50"
            )}
          />
        </div>

        {/* Autocomplete Dropdown */}
        <AnimatePresence>
          {showDropdown && (query.trim().length > 0) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "absolute top-[140px] left-0 right-0 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto",
                isDark
                  ? "bg-[#161622] border border-white/10"
                  : "bg-white border border-slate-200 shadow-2xl"
              )}
            >
              {isSearching && results.length === 0 && (
                <div className={cn("p-4 text-center py-8", isDark ? "text-slate-400" : "text-slate-500")}>
                  Searching across databases...
                </div>
              )}
              
              {!isSearching && results.length === 0 && (
                <div className={cn("p-4 text-center py-8", isDark ? "text-slate-400" : "text-slate-500")}>
                  No movies found. Try another title.
                </div>
              )}

              {results.map((movie) => (
                <div 
                  key={movie.id}
                  onClick={() => navigate(`/movie/${movie.id}`)}
                  className={cn(
                    "p-4 border-b flex gap-4 cursor-pointer transition-colors",
                    isDark
                      ? "border-white/5 hover:bg-[#1a1a25]"
                      : "border-slate-100 hover:bg-purple-50/70"
                  )}
                >
                  <div className={cn(
                    "w-12 h-16 rounded overflow-hidden flex-shrink-0 flex items-center justify-center",
                    isDark ? "bg-[#0a0a0f]" : "bg-slate-100"
                  )}>
                    {movie.poster_path ? (
                      <img 
                        src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} 
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Film size={20} className={isDark ? "text-slate-600" : "text-slate-400"} />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center text-left">
                    <h4 className={cn("font-semibold text-lg", isDark ? "text-white" : "text-slate-900")}>
                      {movie.title}
                    </h4>
                    <div className={cn("flex items-center gap-2 mt-1 text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
                      <span>{movie.release_date?.substring(0, 4) || 'Unknown Year'}</span>
                      <span>•</span>
                      <span className={cn(
                        "uppercase text-[10px] font-bold px-2 py-0.5 rounded",
                        isDark ? "bg-white/10 text-slate-300" : "bg-purple-100 text-purple-700"
                      )}>
                        {movie.original_language}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-amber-500">
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
