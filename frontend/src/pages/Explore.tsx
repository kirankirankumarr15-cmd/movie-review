import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Calendar, Filter, Film, Tv, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CATALOG, LANGUAGES, GENRES, type CatalogItem } from '../data/catalog';

export default function Explore() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedType, setSelectedType] = useState<'All' | 'movie' | 'series'>('All');
  const [selectedLang, setSelectedLang] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [likedMovies, setLikedMovies] = useState<number[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cinesense_likes');
    if (saved) {
      try { setLikedMovies(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Close suggestion dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Live autocomplete suggestions – search across ALL catalog items
  const suggestions = search.trim().length > 0
    ? CATALOG.filter(m => m.title.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : [];

  const toggleLike = (id: number, title: string) => {
    setLikedMovies(prev => {
      const isLiked = prev.includes(id);
      const next = isLiked ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('cinesense_likes', JSON.stringify(next));
      if (!isLiked) toast.success(`Liked ${title}!`);
      return next;
    });
  };

  const filteredItems = CATALOG.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'All' || item.type === selectedType;
    const matchesLang = selectedLang === 'All' || item.language === selectedLang;
    const matchesGenre = selectedGenre === 'All' || item.genre === selectedGenre;
    return matchesSearch && matchesType && matchesLang && matchesGenre;
  });

  const handleSuggestionClick = (item: CatalogItem) => {
    setSearch(item.title);
    setShowSuggestions(false);
    setSelectedLang('All');
    setSelectedGenre('All');
    setSelectedType('All');
  };

  const movieCount = CATALOG.filter(c => c.type === 'movie').length;
  const seriesCount = CATALOG.filter(c => c.type === 'series').length;

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">

        {/* ── Sidebar Filters ── */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className={cn('rounded-xl border p-5', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}>
            <h2 className={cn('font-semibold text-lg flex items-center gap-2 mb-4', isDark ? 'text-white' : 'text-slate-900')}>
              <Filter size={18} className="text-purple-400" /> Filters
            </h2>
            <div className="space-y-5">
              
              {/* Content Type Filter */}
              <div>
                <label className={cn('text-xs font-medium mb-1.5 block', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  Content Type
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg border bg-slate-100/50 dark:bg-[#16161f] border-slate-200 dark:border-[#2a2a3d]">
                  <button
                    type="button"
                    onClick={() => setSelectedType('All')}
                    className={cn(
                      'py-1.5 text-xs font-medium rounded-md transition-all text-center',
                      selectedType === 'All'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('movie')}
                    className={cn(
                      'py-1.5 text-xs font-medium rounded-md transition-all text-center',
                      selectedType === 'movie'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    Movies
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedType('series')}
                    className={cn(
                      'py-1.5 text-xs font-medium rounded-md transition-all text-center',
                      selectedType === 'series'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    )}
                  >
                    Series
                  </button>
                </div>
              </div>

              {/* Language */}
              <div>
                <label className={cn('text-xs font-medium mb-1.5 block', isDark ? 'text-slate-400' : 'text-slate-500')}>Language</label>
                <select
                  value={selectedLang}
                  onChange={e => setSelectedLang(e.target.value)}
                  className={cn('w-full rounded-lg border text-sm py-2 px-3 outline-none cursor-pointer',
                    isDark ? 'bg-[#16161f] border-[#2a2a3d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800')}
                >
                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>

              {/* Genre */}
              <div>
                <label className={cn('text-xs font-medium mb-1.5 block', isDark ? 'text-slate-400' : 'text-slate-500')}>Genre</label>
                <select
                  value={selectedGenre}
                  onChange={e => setSelectedGenre(e.target.value)}
                  className={cn('w-full rounded-lg border text-sm py-2 px-3 outline-none cursor-pointer',
                    isDark ? 'bg-[#16161f] border-[#2a2a3d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800')}
                >
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              {/* Reset */}
              {(selectedLang !== 'All' || selectedGenre !== 'All' || selectedType !== 'All' || search) && (
                <button
                  onClick={() => { setSelectedLang('All'); setSelectedGenre('All'); setSelectedType('All'); setSearch(''); }}
                  className="w-full text-xs font-medium text-purple-400 hover:text-purple-300 py-1.5 border border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <section className="flex-1 min-w-0">
          
          {/* Top bar: title + search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div>
              <h1 className={cn('font-display text-2xl font-bold whitespace-nowrap', isDark ? 'text-white' : 'text-slate-900')}>
                {selectedType === 'movie' 
                  ? 'Popular Movies' 
                  : selectedType === 'series' 
                  ? 'Popular Web Series & Shows' 
                  : 'Popular Movies & Series'}
              </h1>
              <p className={cn('text-xs mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Explore curated cinema and binge-worthy series across 19+ languages
              </p>
            </div>

            {/* ── Search with autocomplete ── */}
            <div ref={searchRef} className="relative flex-1 sm:max-w-md sm:ml-auto">
              <Search size={15} className={cn('absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none', isDark ? 'text-slate-500' : 'text-slate-400')} />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search movies & series across all languages..."
                className={cn(
                  'w-full rounded-xl border text-sm py-2.5 pl-9 pr-9 transition-colors outline-none ring-0 focus:ring-2 focus:ring-purple-500/30',
                  isDark
                    ? 'bg-[#1a1a25] border-[#2a2a3d] text-white placeholder:text-slate-600 focus:border-purple-500/50'
                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-500/50'
                )}
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setShowSuggestions(false); }}
                  className={cn('absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity', isDark ? 'text-slate-500' : 'text-slate-400')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'absolute z-50 w-full mt-2 rounded-xl border shadow-2xl overflow-hidden',
                      isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
                    )}
                  >
                    {suggestions.map(item => (
                      <li key={`${item.type}-${item.id}`}>
                        <button
                          onMouseDown={() => handleSuggestionClick(item)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                            isDark ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-800'
                          )}
                        >
                          <img
                            src={item.poster}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-8 h-12 object-cover rounded flex-shrink-0 bg-slate-800"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate flex items-center gap-2">
                              <span>{item.title}</span>
                              <span className={cn(
                                'text-[9px] uppercase px-1.5 py-0.2 rounded font-bold tracking-wider',
                                item.type === 'series'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              )}>
                                {item.type === 'series' ? 'Series' : 'Movie'}
                              </span>
                            </div>
                            <div className="flex gap-2 mt-0.5">
                              <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold', isDark ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-50 text-purple-600')}>
                                {item.language}
                              </span>
                              <span className={cn('text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400')}>
                                {item.genre} · {new Date(item.release).getFullYear()}
                              </span>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Filter Tabs & Results count */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-[#2a2a3d]/60">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedType('All')}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5',
                  selectedType === 'All'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                    : isDark ? 'bg-[#1a1a25] text-slate-300 hover:bg-[#252538]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                All <span className="opacity-70 text-[10px]">({CATALOG.length})</span>
              </button>
              <button
                onClick={() => setSelectedType('movie')}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5',
                  selectedType === 'movie'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                    : isDark ? 'bg-[#1a1a25] text-slate-300 hover:bg-[#252538]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                <Film size={12} /> Movies <span className="opacity-70 text-[10px]">({movieCount})</span>
              </button>
              <button
                onClick={() => setSelectedType('series')}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5',
                  selectedType === 'series'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/25'
                    : isDark ? 'bg-[#1a1a25] text-slate-300 hover:bg-[#252538]' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                )}
              >
                <Tv size={12} /> Web Series <span className="opacity-70 text-[10px]">({seriesCount})</span>
              </button>
            </div>

            <span className={cn('text-xs font-medium px-3 py-1 rounded-full border whitespace-nowrap', isDark ? 'bg-[#1a1a25] border-[#2a2a3d] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500')}>
              {filteredItems.length} results
            </span>
          </div>

          {/* Catalog grid */}
          {filteredItems.length === 0 ? (
            <div className={cn('rounded-xl border p-12 text-center border-dashed', isDark ? 'border-[#2a2a3d] bg-[#1a1a25]/50' : 'border-slate-200 bg-slate-50/50')}>
              <Film size={48} className={cn('mx-auto mb-4 opacity-30', isDark ? 'text-slate-500' : 'text-slate-400')} />
              <h3 className={cn('text-lg font-medium mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>No titles found</h3>
              <p className={isDark ? 'text-slate-500' : 'text-slate-500'}>Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {filteredItems.map(item => {
                  const isLiked = likedMovies.includes(item.id);
                  const isSeries = item.type === 'series';

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.2 }}
                      key={`${item.type}-${item.id}`}
                      className={cn(
                        'group rounded-xl border overflow-hidden flex flex-col relative hover:shadow-xl transition-shadow',
                        isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200 shadow-sm'
                      )}
                    >
                      {/* Like button */}
                      <button
                        onClick={() => toggleLike(item.id, item.title)}
                        className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                        aria-label={isLiked ? 'Unlike' : 'Like'}
                      >
                        <Heart size={15} className={isLiked ? 'fill-red-500 text-red-500' : 'text-white'} />
                      </button>

                      {/* Type Badge */}
                      <div className="absolute top-2 left-2 z-20">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md flex items-center gap-1 shadow-sm',
                          isSeries
                            ? 'bg-indigo-600/80 text-white border border-indigo-400/30'
                            : 'bg-emerald-600/80 text-white border border-emerald-400/30'
                        )}>
                          {isSeries ? <Tv size={10} /> : <Film size={10} />}
                          {isSeries ? 'Series' : 'Movie'}
                        </span>
                      </div>

                      {/* Poster */}
                      <div 
                        onClick={() => navigate(`/movie/${item.tmdbId || item.id}?type=${item.type}`)}
                        className="aspect-[2/3] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-[#181829] to-[#251b3d] relative cursor-pointer"
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                          <div className="w-12 h-12 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-2">
                            {isSeries ? <Tv className="text-purple-400" size={24} /> : <Film className="text-purple-400" size={24} />}
                          </div>
                          <span className="font-display font-bold text-sm text-white line-clamp-2">{item.title}</span>
                          <span className="text-[11px] text-purple-300/80 mt-1">{new Date(item.release).getFullYear()} • {item.genre}</span>
                        </div>
                        {item.poster && (
                          <img
                            src={item.poster}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 relative z-10"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3 flex flex-col flex-1">
                        <h3 
                          onClick={() => navigate(`/movie/${item.tmdbId || item.id}?type=${item.type}`)}
                          className={cn('font-bold text-sm leading-tight mb-1 line-clamp-1 cursor-pointer hover:text-purple-400 transition-colors', isDark ? 'text-white' : 'text-slate-900')} 
                          title={item.title}
                        >
                          {item.title}
                        </h3>
                        <p className={cn('text-[11px] flex items-center gap-1 mb-3', isDark ? 'text-slate-500' : 'text-slate-400')}>
                          <Calendar size={11} /> {new Date(item.release).getFullYear()}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-3 mt-auto">
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700')}>
                            {item.language}
                          </span>
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600')}>
                            {item.genre}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate('/analyzer', { state: { defaultMovie: item.title } })}
                          className="w-full btn-primary py-1.5 text-xs font-semibold"
                        >
                          Write a Review
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
