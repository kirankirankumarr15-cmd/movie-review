import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Play, Eye, Bookmark, Clock, Share2, Check, Loader2, Sparkles, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { analyzeApi } from "../services/api";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import HeroPlayer, { type HeroVideo } from "../components/HeroPlayer";

const TMDB_TOKEN = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMDIyYTkwNTAwZTA2ODMwYjFlMzg2MDY2YTgwOGIxMyIsIm5iZiI6MTc5MTQ1MTc0NC42NzIsInN1YiI6IjZhYzc2MjYwMGY5MTNjYWU1YzAzZWE5YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.0jRg9sQctBUCKSYpazZ7r9p4jTveORB5QZd3VShKt1o";

type RatingCategory = "Skip" | "Timepass" | "Go for it" | "Perfection";

interface ReviewItem {
  id: string | number;
  user: string;
  username: string;
  avatar?: string;
  avatarBg?: string;
  category: RatingCategory;
  sentiment?: string;
  score?: number;
  text: string;
  time: string;
  likes: number;
  isLiked?: boolean;
  verified?: boolean;
  isExpanded?: boolean;
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "r1",
    user: "comicverse",
    username: "@comicverse",
    avatar: "https://i.pravatar.cc/150?img=11",
    category: "Go for it",
    sentiment: "Positive",
    score: 84,
    text: "Keeps the soul intact from previous parts while adding some new flavors.. moves really fast and doesn't waste any time. Exceptional cinematography and tightly paced storytelling throughout.",
    time: "6 days ago",
    likes: 1520,
    verified: true,
  },
  {
    id: "r2",
    user: "chirag_aggarwal9",
    username: "@chirag_aggarwal9",
    avatarBg: "bg-slate-600",
    category: "Perfection",
    sentiment: "Positive",
    score: 96,
    text: "The man, the myth and the Legend VIJAY SALGAONKAR!!!! Nailed it bruhh... A masterclass in tension, brilliant narrative arcs, and phenomenal background score.",
    time: "1 week ago",
    likes: 458,
    verified: false,
  },
  {
    id: "r3",
    user: "BunnyManSenpie",
    username: "@BunnyManSenpie",
    avatar: "https://i.pravatar.cc/150?img=33",
    category: "Go for it",
    sentiment: "Positive",
    score: 78,
    text: "Vijay Salgaonkar is the lovechild of Saul Goodman and Batman. Absolutely enthralling cat-and-mouse dynamic with breathtaking twists in the climax.",
    time: "1 week ago",
    likes: 398,
    verified: false,
  },
];

export default function MovieDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const typeParam = searchParams.get("type");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movie, setMovie] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Hero player state
  const [heroVideos, setHeroVideos] = useState<HeroVideo[]>([]);
  const [heroPlayerOpen, setHeroPlayerOpen] = useState(false);
  const playButtonRef = useRef<HTMLButtonElement>(null);

  // User Actions
  const [isWatched, setIsWatched] = useState(false);
  const [isSavedCollection, setIsSavedCollection] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);

  // Review Form
  const [selectedCategory, setSelectedCategory] = useState<RatingCategory>("Timepass");
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reviews Feed
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>(INITIAL_REVIEWS);
  const [sortBy, setSortBy] = useState<"likes" | "newest">("likes");
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [followingOnly, setFollowingOnly] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const headers = { Authorization: `Bearer ${TMDB_TOKEN}`, accept: "application/json" };
        
        const isRequestedTv = typeParam === "series" || typeParam === "tv";
        let movieData: any = null;
        let creditsData: any = null;

        if (isRequestedTv) {
          const tvRes = await fetch(`https://api.tmdb.org/3/tv/${id}?append_to_response=content_ratings`, { headers });
          if (tvRes.ok) {
            movieData = await tvRes.json();
            movieData.title = movieData.name;
            movieData.release_date = movieData.first_air_date;
            movieData.runtime = movieData.episode_run_time?.[0] || 45;
            movieData.isTv = true;
            const creditsRes = await fetch(`https://api.tmdb.org/3/tv/${id}/credits`, { headers });
            if (creditsRes.ok) creditsData = await creditsRes.json();
          }
        } else {
          const movieRes = await fetch(`https://api.tmdb.org/3/movie/${id}?append_to_response=release_dates`, { headers });
          if (movieRes.ok) {
            movieData = await movieRes.json();
            const creditsRes = await fetch(`https://api.tmdb.org/3/movie/${id}/credits`, { headers });
            if (creditsRes.ok) creditsData = await creditsRes.json();
          } else {
            const tvRes = await fetch(`https://api.tmdb.org/3/tv/${id}?append_to_response=content_ratings`, { headers });
            if (tvRes.ok) {
              movieData = await tvRes.json();
              movieData.title = movieData.name;
              movieData.release_date = movieData.first_air_date;
              movieData.runtime = movieData.episode_run_time?.[0] || 45;
              movieData.isTv = true;
              const creditsRes = await fetch(`https://api.tmdb.org/3/tv/${id}/credits`, { headers });
              if (creditsRes.ok) creditsData = await creditsRes.json();
            }
          }
        }

        // 1. Load structured video list from our DB (/api/movies/videos/:tmdbId)
        let structuredVideos: HeroVideo[] = [];
        try {
          const vidsRes = await fetch(`http://localhost:5000/api/movies/videos/${id}`);
          if (vidsRes.ok) {
            const vidsJson = await vidsRes.json();
            if (Array.isArray(vidsJson.videos) && vidsJson.videos.length > 0) {
              structuredVideos = vidsJson.videos;
            }
          }
        } catch { /* backend may still be booting */ }

        // 2. Check legacy DB trailer field as fallback single-video
        if (structuredVideos.length === 0) {
          try {
            const dbRes = await fetch(`http://localhost:5000/api/movies/trailer/${id}`);
            if (dbRes.ok) {
              const dbJson = await dbRes.json();
              if (dbJson.found && dbJson.trailer_youtube_id) {
                structuredVideos = [{ youtube_id: dbJson.trailer_youtube_id, type: 'trailer', title: '', is_official: true }];
              }
            }
          } catch { /* ignore */ }
        }

        // 3. Specific seed fallback for Toxic (2026, KN, dir. Geetu Mohandas)
        if (structuredVideos.length === 0 && (id === "1213243" || movieData?.title?.toLowerCase().includes("toxic"))) {
          structuredVideos = [
            { youtube_id: 'EfluEyQ5QIA', type: 'teaser', title: 'Toxic — Official Teaser', language: 'KN', is_official: true },
            { youtube_id: 'EfluEyQ5QIA', type: 'trailer', title: 'Toxic — Official Trailer', language: 'KN', is_official: true },
          ];
        }

        // 4. Fallback to TMDB videos API — map to HeroVideo format
        if (structuredVideos.length === 0) {
          try {
            const tmdbVidsRes = await fetch(
              `https://api.tmdb.org/3/${isRequestedTv ? "tv" : "movie"}/${id}/videos`,
              { headers }
            );
            if (tmdbVidsRes.ok) {
              const tmdbVidsData = await tmdbVidsRes.json();
              const results: any[] = tmdbVidsData.results || [];
              structuredVideos = results
                .filter((v) => v.site === "YouTube")
                .map((v) => ({
                  youtube_id: v.key,
                  type: (v.type?.toLowerCase() || 'trailer') as HeroVideo['type'],
                  title: v.name || '',
                  language: v.iso_639_1 || '',
                  is_official: v.official ?? true,
                }));
              // Prefer teaser first, then trailer — sort by type order
              const order: Record<string, number> = { teaser: 0, trailer: 1, clip: 2, song: 3 };
              structuredVideos.sort((a, b) => (order[a.type] ?? 99) - (order[b.type] ?? 99));
            }
          } catch (err) {
            console.warn("Failed to fetch TMDB videos:", err);
          }
        }

        setHeroVideos(structuredVideos);
        setMovie(movieData);
        setCredits(creditsData);
      } catch (err) {
        console.error("Failed to fetch cinematic details:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id, typeParam]);

  // Dynamic Moctale Meter Calculations
  const meterStats = useMemo(() => {
    const totalUserVotes = reviewsList.length;
    const perfectionCount = reviewsList.filter((r) => r.category === "Perfection").length;
    const goForItCount = reviewsList.filter((r) => r.category === "Go for it").length;
    const timepassCount = reviewsList.filter((r) => r.category === "Timepass").length;
    const skipCount = reviewsList.filter((r) => r.category === "Skip").length;

    // Blend base stats with user votes
    const voteAvg = movie?.vote_average || 7.0;

    let basePerfection = Math.round(Math.max(5, (voteAvg - 5) * 8));
    let baseGoForIt = Math.round(Math.max(15, 75 - basePerfection));
    let baseTimepass = Math.round(Math.max(2, 18 - (voteAvg * 1.5)));
    let baseSkip = Math.max(0, 100 - basePerfection - baseGoForIt - baseTimepass);

    if (totalUserVotes > 0) {
      const pPct = (perfectionCount / totalUserVotes) * 100;
      const gPct = (goForItCount / totalUserVotes) * 100;
      const tPct = (timepassCount / totalUserVotes) * 100;
      const sPct = (skipCount / totalUserVotes) * 100;

      const userWeight = Math.min(0.5, totalUserVotes * 0.1);
      basePerfection = Math.round(basePerfection * (1 - userWeight) + pPct * userWeight);
      baseGoForIt = Math.round(baseGoForIt * (1 - userWeight) + gPct * userWeight);
      baseTimepass = Math.round(baseTimepass * (1 - userWeight) + tPct * userWeight);
      baseSkip = Math.round(baseSkip * (1 - userWeight) + sPct * userWeight);
    }

    return {
      perfection: basePerfection,
      goForIt: baseGoForIt,
      timepass: baseTimepass,
      skip: baseSkip,
      dominant: baseGoForIt >= basePerfection ? { label: "Go for it", pct: baseGoForIt, color: "#00d89e" } : { label: "Perfection", pct: basePerfection, color: "#b052ff" },
    };
  }, [reviewsList, movie]);

  // Vibe Chart Breakdown from Genres
  interface VibeItem {
    name: string;
    pct: number;
    color: string;
  }

  const vibeBreakdown: VibeItem[] = useMemo(() => {
    if (!movie?.genres || movie.genres.length === 0) {
      return [
        { name: "Story & Drama", pct: 40, color: "#0047b3" },
        { name: "Cinematography", pct: 30, color: "#5c00b3" },
        { name: "Pacing & Score", pct: 20, color: "#00d89e" },
        { name: "Entertainment", pct: 10, color: "#ffcc00" },
      ];
    }
    const colors = ["#0047b3", "#5c00b3", "#00d89e", "#ffcc00", "#ff5252"];
    const weights = [45, 30, 15, 10];
    return movie.genres.slice(0, 4).map((g: any, idx: number) => ({
      name: g.name,
      pct: weights[idx] || 10,
      color: colors[idx % colors.length],
    }));
  }, [movie]);

  const sortedReviews = useMemo(() => {
    let list = [...reviewsList];
    if (sortBy === "likes") {
      list.sort((a, b) => b.likes - a.likes);
    }
    return list;
  }, [reviewsList, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin mb-4" />
        <span className="text-slate-400 text-sm">Loading cinematic details...</span>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center text-white">
        <h2 className="text-2xl font-bold mb-2">Movie Not Found</h2>
        <p className="text-slate-400 mb-6">We couldn't retrieve information for this movie.</p>
        <button onClick={() => navigate(-1)} className="btn-primary px-6 py-2">
          Go Back
        </button>
      </div>
    );
  }

  // Extract Metadata
  const director = credits?.crew?.find((c: any) => c.job === "Director")?.name || "Unknown";
  const country = movie.production_countries?.[0]?.iso_3166_1 || "Unknown";
  const language = movie.original_language?.toUpperCase() || "Unknown";
  
  // Find Age Rating (US or IN)
  const releaseDates = movie.release_dates?.results || [];
  const usRelease = releaseDates.find((r: any) => r.iso_3166_1 === "US");
  const inRelease = releaseDates.find((r: any) => r.iso_3166_1 === "IN");
  const ageRating = inRelease?.release_dates[0]?.certification || usRelease?.release_dates[0]?.certification || "NR";

  // Handlers
  const handleToggleWatched = () => {
    const next = !isWatched;
    setIsWatched(next);
    toast.success(next ? "Marked as Watched! 🍿" : "Removed from Watched");
  };

  const handleToggleCollection = () => {
    const next = !isSavedCollection;
    setIsSavedCollection(next);
    toast.success(next ? "Added to your Collections 📁" : "Removed from Collections");
  };

  const handleToggleWatchLater = () => {
    const next = !isWatchLater;
    setIsWatchLater(next);
    toast.success(next ? "Added to Watch Later ⏰" : "Removed from Watch Later");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${movie.title} - CineSense Review`,
          text: `Check out sentiment analysis and reviews for ${movie.title} on CineSense!`,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard! 📋");
    }
  };

  const handleLikeReview = (reviewId: string | number) => {
    setReviewsList((prev) =>
      prev.map((r) => {
        if (r.id === reviewId) {
          const isLiked = !r.isLiked;
          return {
            ...r,
            isLiked,
            likes: isLiked ? r.likes + 1 : r.likes - 1,
          };
        }
        return r;
      })
    );
  };

  const handlePostReview = async () => {
    if (!reviewText.trim()) {
      toast.error("Please enter a review before posting.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Analyze with CineSense NLP service
      const analysis = await analyzeApi.analyze(reviewText, movie.title);

      const sentimentCategory =
        analysis.userAnalysis?.sentiment === "Positive"
          ? (selectedCategory === "Skip" ? "Timepass" : selectedCategory)
          : analysis.userAnalysis?.sentiment === "Negative"
          ? "Skip"
          : selectedCategory;

      const newReview: ReviewItem = {
        id: `usr_${Date.now()}`,
        user: user?.name || "You",
        username: user ? `@${user.name.toLowerCase().replace(/\s+/g, "")}` : "@you",
        avatarBg: "bg-purple-600",
        category: sentimentCategory as RatingCategory,
        sentiment: analysis.userAnalysis?.sentiment || "Positive",
        score: Math.round(analysis.userAnalysis?.score || 85),
        text: reviewText.trim(),
        time: "Just now",
        likes: 0,
        isLiked: false,
        verified: !!user,
      };

      setReviewsList([newReview, ...reviewsList]);
      setReviewText("");
      toast.success(`Review analyzed & posted! Sentiment: ${analysis.userAnalysis?.sentiment || "Positive"} (${analysis.userAnalysis?.score || 85}/100)`);
    } catch (err: any) {
      // Fallback post even if backend isn't reachable
      const fallbackReview: ReviewItem = {
        id: `usr_${Date.now()}`,
        user: user?.name || "You",
        username: user ? `@${user.name.toLowerCase().replace(/\s+/g, "")}` : "@you",
        avatarBg: "bg-purple-600",
        category: selectedCategory,
        sentiment: selectedCategory === "Perfection" || selectedCategory === "Go for it" ? "Positive" : selectedCategory === "Skip" ? "Negative" : "Neutral",
        score: selectedCategory === "Perfection" ? 95 : selectedCategory === "Go for it" ? 80 : selectedCategory === "Timepass" ? 50 : 25,
        text: reviewText.trim(),
        time: "Just now",
        likes: 0,
        isLiked: false,
        verified: !!user,
      };
      setReviewsList([fallbackReview, ...reviewsList]);
      setReviewText("");
      toast.success("Review posted successfully!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-[#0a0a0f] text-white pb-20 font-sans"
    >
      
      {/* ══ Hero Backdrop / Inline Video Player Area ══ */}
      <div className="relative w-full overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          {heroPlayerOpen && heroVideos.length > 0 ? (
            <motion.div
              key="hero-player"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full"
            >
              <HeroPlayer
                videos={heroVideos}
                movieTitle={movie?.title}
                backdropUrl={movie?.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : undefined}
                posterUrl={movie?.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : undefined}
                onClose={() => {
                  setHeroPlayerOpen(false);
                  setTimeout(() => playButtonRef.current?.focus(), 80);
                }}
                enableBgAutoplay={false}
              />
            </motion.div>
          ) : (
            /* Default state: backdrop image */
            <motion.div
              key="hero-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="relative w-full h-[40vh] md:h-[60vh]"
            >
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
              {movie.backdrop_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover opacity-70"
                />
              ) : (
                <div className="w-full h-full bg-slate-900" />
              )}

              {/* Play Button Overlay — or Trailer not available yet badge */}
              {heroVideos.length > 0 ? (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <button
                    ref={playButtonRef}
                    type="button"
                    id="hero-play-btn"
                    onClick={() => setHeroPlayerOpen(true)}
                    aria-label={`Play ${movie.title} trailer`}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md flex items-center justify-center pointer-events-auto cursor-pointer transition transform hover:scale-110 active:scale-95 shadow-2xl border border-white/20 group focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                  >
                    <Play className="text-white ml-1 group-hover:scale-110 transition-transform" fill="white" size={28} />
                  </button>
                </div>
              ) : (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <div className="px-4 py-2.5 rounded-2xl bg-black/65 backdrop-blur-md border border-white/15 text-xs text-slate-300 font-semibold flex items-center gap-2 shadow-xl">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>Trailer not available yet</span>
                  </div>
                </div>
              )}

              {/* Top bar back button & Share */}
              <div className="absolute top-6 left-4 right-4 z-30 flex justify-between items-center max-w-5xl mx-auto">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2.5 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition border border-white/10"
                  aria-label="Go back"
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 transition border border-white/10"
                  aria-label="Share movie"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content Area */}
      <div className={`relative z-30 max-w-5xl mx-auto px-4 ${heroPlayerOpen ? 'mt-4' : '-mt-24 md:-mt-32'}`}>
        
        {/* Header Section */}
        <div className="flex gap-4 md:gap-8 items-end mb-8">
          <div className="w-32 md:w-48 flex-shrink-0 rounded-xl overflow-hidden shadow-2xl border border-white/10 relative bg-slate-900">
            {movie.poster_path ? (
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-auto object-cover"
              />
            ) : (
              <div className="w-full aspect-[2/3] flex items-center justify-center text-slate-500 font-bold">
                No Poster
              </div>
            )}
          </div>
          
          <div className="flex-1 pb-2">
            <div className="text-slate-300 text-xs md:text-sm mb-1 font-medium flex items-center gap-2">
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                movie.isTv 
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" 
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              )}>
                {movie.isTv ? "TV Series" : "Movie"}
              </span>
              <span>•</span>
              <span>{movie.release_date?.substring(0, 4) || "Unknown Year"}</span>
              {movie.isTv && movie.number_of_seasons ? (
                <>
                  <span>•</span>
                  <span>{movie.number_of_seasons} Season{movie.number_of_seasons > 1 ? "s" : ""}</span>
                </>
              ) : movie.runtime ? (
                <>
                  <span>•</span>
                  <span>{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
                </>
              ) : null}
            </div>
            <h1 className="text-2xl md:text-5xl font-bold font-display mb-4 leading-tight">{movie.title}</h1>
            
            {/* Metadata Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-sm">
              <div>
                <div className="text-slate-400 text-xs mb-0.5">Directed By</div>
                <div className="font-semibold truncate">{director}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-0.5">Country</div>
                <div className="font-semibold">{country}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-0.5">Language</div>
                <div className="font-semibold">{language}</div>
              </div>
              <div>
                <div className="text-slate-400 text-xs mb-0.5">Age Rating</div>
                <div className="font-semibold">{ageRating}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-10">
          <button 
            onClick={handleToggleWatched}
            className={cn(
              "w-full font-semibold py-3.5 rounded-full flex items-center justify-center gap-2 transition shadow-lg",
              isWatched 
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20" 
                : "bg-[#9f54ff] hover:bg-[#8b44e6] text-white shadow-purple-500/20"
            )}
          >
            {isWatched ? <Check size={18} /> : <Eye size={18} />}
            {isWatched ? "Watched" : "Mark as Watched"}
          </button>

          <div className="flex gap-3">
            <button 
              onClick={handleToggleCollection}
              className={cn(
                "flex-1 border font-medium py-3 rounded-full flex items-center justify-center gap-2 transition text-sm",
                isSavedCollection 
                  ? "bg-purple-950/60 border-purple-500 text-purple-300" 
                  : "bg-[#1a1a25] hover:bg-[#252535] border-white/5 text-slate-200"
              )}
            >
              <Bookmark size={16} className={isSavedCollection ? "fill-purple-400 text-purple-400" : ""} /> 
              {isSavedCollection ? "Saved to Collections" : "Collections"}
            </button>
            <button 
              onClick={handleToggleWatchLater}
              className={cn(
                "flex-1 border font-medium py-3 rounded-full flex items-center justify-center gap-2 transition text-sm",
                isWatchLater 
                  ? "bg-amber-950/60 border-amber-500 text-amber-300" 
                  : "bg-[#1a1a25] hover:bg-[#252535] border-white/5 text-slate-200"
              )}
            >
              <Clock size={16} className={isWatchLater ? "text-amber-400" : ""} /> 
              {isWatchLater ? "In Watch Later" : "Watch Later"}
            </button>
          </div>
        </div>

        {/* Overview */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-3 font-display">Overview</h2>
          <p className="text-slate-400 leading-relaxed text-sm md:text-base">
            {movie.overview || "No overview available for this title."}
          </p>
        </div>

        {/* Vibe Chart (Donut) */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-6 font-display">Vibe Chart</h2>
          <div className="bg-[#101018] rounded-3xl p-6 border border-white/5 flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-48 h-48 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Background Track */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#2a2a35" strokeWidth="12" />
                
                {/* Segments based on breakdown */}
                {vibeBreakdown.map((item, idx) => {
                  const circumference = 251.2;
                  const strokeLength = (item.pct / 100) * circumference;
                  let prevSum = 0;
                  for (let i = 0; i < idx; i++) prevSum += (vibeBreakdown[i].pct / 100) * circumference;

                  return (
                    <circle 
                      key={item.name}
                      cx="50" 
                      cy="50" 
                      r="40" 
                      fill="none" 
                      stroke={item.color} 
                      strokeWidth="12" 
                      strokeDasharray={`${strokeLength} ${circumference}`} 
                      strokeDashoffset={-prevSum} 
                    />
                  );
                })}
              </svg>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-medium text-slate-300 truncate max-w-[90px]">{vibeBreakdown[0]?.name || "Core"}</span>
                <span className="text-2xl font-bold">{vibeBreakdown[0]?.pct || 40}%</span>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-3 text-sm font-medium text-slate-300 w-full">
              {vibeBreakdown.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name} ({item.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cast */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold font-display">Cast</h2>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {credits?.cast?.slice(0, 10).map((person: any) => (
              <div key={person.id} className="w-24 md:w-28 flex-shrink-0 flex flex-col items-center text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-[#1a1a25] mb-2 border border-white/10 shadow-lg">
                  {person.profile_path ? (
                    <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-2xl font-bold">{person.name[0]}</div>
                  )}
                </div>
                <div className="font-semibold text-sm truncate w-full">{person.name}</div>
                <div className="text-xs text-slate-500 truncate w-full">{person.character}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Crew */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-4 font-display">Crew</h2>
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {credits?.crew?.filter((c:any) => c.job === "Director" || c.job === "Producer" || c.job === "Original Music Composer").slice(0, 5).map((person: any) => (
              <div key={`${person.id}-${person.job}`} className="w-24 md:w-28 flex-shrink-0 flex flex-col items-center text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-[#1a1a25] mb-2 border border-white/10 shadow-lg">
                  {person.profile_path ? (
                    <img src={`https://image.tmdb.org/t/p/w185${person.profile_path}`} alt={person.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-2xl font-bold">{person.name[0]}</div>
                  )}
                </div>
                <div className="font-semibold text-sm truncate w-full">{person.name}</div>
                <div className="text-xs text-slate-500 truncate w-full">{person.job}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Production House */}
        {movie.production_companies && movie.production_companies.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4 font-display">Production House</h2>
            <div className="flex flex-wrap gap-3">
              {movie.production_companies.map((company: any) => (
                <div key={company.id} className="bg-[#101018] border border-white/10 px-5 py-3 rounded-xl text-sm font-medium">
                  {company.name}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Moctale Meter (Gauge) */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-display">Moctale Meter</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                Live NLP
              </span>
            </div>
            <button onClick={handleShare} className="text-slate-400 hover:text-white transition">
              <Share2 size={18} />
            </button>
          </div>
          
          <div className="bg-[#101018] rounded-3xl p-6 border border-white/5 flex flex-col items-center">
            {/* Semi-circle Gauge */}
            <div className="relative w-64 h-32 overflow-hidden mb-6">
              <svg viewBox="0 0 200 100" className="w-full h-full absolute bottom-0">
                {/* Track */}
                <path d="M 10 90 A 80 80 0 0 1 190 90" fill="none" stroke="#2a2a35" strokeWidth="16" strokeLinecap="round" />
                
                {/* Green Segment (Go for it) */}
                <path d="M 10 90 A 80 80 0 0 1 130 15" fill="none" stroke="#00d89e" strokeWidth="16" strokeLinecap="round" />
                
                {/* Purple Segment (Perfection) */}
                <path d="M 134 14 A 80 80 0 0 1 190 90" fill="none" stroke="#b052ff" strokeWidth="16" strokeLinecap="round" />
                
                {/* Indicator Line */}
                <path d="M 10 100 L 15 90 L 20 100 Z" fill="#ffcc00" />
              </svg>
              <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center">
                <div className="text-3xl font-bold" style={{ color: meterStats.dominant.color }}>
                  {meterStats.dominant.pct}%
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  {meterStats.dominant.label} • {((movie.vote_count || 100) * 12) + reviewsList.length} Votes
                </div>
              </div>
            </div>

            {/* Legend Grid */}
            <div className="w-full grid grid-cols-2 gap-y-4 gap-x-4 px-4 text-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#b052ff]" /> 
                  <span className="font-medium text-slate-300">Perfection</span>
                </div>
                <span className="font-bold">{meterStats.perfection}%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00d89e]" /> 
                  <span className="font-medium text-slate-300">Go for it</span>
                </div>
                <span className="font-bold">{meterStats.goForIt}%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffcc00]" /> 
                  <span className="font-medium text-slate-300">Timepass</span>
                </div>
                <span className="font-bold">{meterStats.timepass}%</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5252]" /> 
                  <span className="font-medium text-slate-300">Skip</span>
                </div>
                <span className="font-bold">{meterStats.skip}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Write a Review Section */}
        <div className="mb-10">
          <div className="bg-[#101018] rounded-3xl p-5 border border-white/5">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold shadow-md">
                {user ? user.name.slice(0, 2).toUpperCase() : "ME"}
              </div>
              <div>
                <div className="font-medium">{user ? `@${user.name.toLowerCase().replace(/\s+/g, '')}` : "@guest_reviewer"}</div>
                <div className="text-[11px] text-slate-500">
                  {user ? "Logged in • Saves to your personal history" : "Guest • Analysis powered by CineSense NLP"}
                </div>
              </div>
            </div>
            
            {/* Category Selector Tabs */}
            <div className="bg-[#1a1a25] rounded-full flex justify-between p-1 mb-5 border border-white/5">
              {(["Skip", "Timepass", "Go for it", "Perfection"] as RatingCategory[]).map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "flex-1 py-2 text-sm rounded-full transition-all font-medium",
                      isActive
                        ? cat === "Perfection"
                          ? "bg-[#b052ff] text-white font-bold shadow-lg"
                          : cat === "Go for it"
                          ? "bg-[#00d89e] text-black font-bold shadow-lg"
                          : cat === "Timepass"
                          ? "bg-[#ffcc00] text-black font-bold shadow-lg"
                          : "bg-[#ff5252] text-white font-bold shadow-lg"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <textarea 
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={`Share what you thought about ${movie.title}...`}
              maxLength={1000}
              className="w-full bg-transparent border-b border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 resize-none min-h-[70px] text-sm pb-2"
            />
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-slate-500">{reviewText.length}/1000</span>
              <button 
                onClick={handlePostReview}
                disabled={isSubmitting || !reviewText.trim()}
                className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-purple-600" />
                    <span>Post & Analyze</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* User Reviews Feed */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold font-display">User Reviews ({reviewsList.length})</h2>
          </div>
          
          {/* Filters */}
          <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            <button 
              onClick={() => setSortBy(sortBy === "likes" ? "newest" : "likes")}
              className="bg-[#1a1a25] border border-white/5 px-4 py-2 rounded-xl text-sm whitespace-nowrap flex items-center gap-2 hover:border-purple-500/30 transition"
            >
              <span className="text-slate-400">↓↑</span> 
              <span>{sortBy === "likes" ? "Most Liked" : "Newest"}</span>
            </button>
            <label className="bg-[#1a1a25] border border-white/5 px-4 py-2 rounded-xl text-sm whitespace-nowrap flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={showSpoilers}
                onChange={(e) => setShowSpoilers(e.target.checked)}
                className="rounded border-purple-500 text-purple-600 focus:ring-0"
              />
              Show Spoilers
            </label>
            <label className="bg-[#1a1a25] border border-white/5 px-4 py-2 rounded-xl text-sm whitespace-nowrap flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={followingOnly}
                onChange={(e) => setFollowingOnly(e.target.checked)}
                className="rounded border-purple-500 text-purple-600 focus:ring-0"
              />
              Following Only
            </label>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            <AnimatePresence>
              {sortedReviews.map((item) => {
                const badgeColor =
                  item.category === "Perfection"
                    ? "bg-[#b052ff] text-white"
                    : item.category === "Go for it"
                    ? "bg-[#00d89e] text-black"
                    : item.category === "Timepass"
                    ? "bg-[#ffcc00] text-black"
                    : "bg-[#ff5252] text-white";

                return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border-b border-white/10 pb-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-3 items-center">
                        {item.avatar ? (
                          <img src={item.avatar} alt={item.user} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold", item.avatarBg || "bg-slate-600")}>
                            {item.user.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold">{item.user}</span>
                            {item.verified && (
                              <svg className="w-3.5 h-3.5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z"/>
                              </svg>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">{item.time}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {item.score !== undefined && (
                          <span className="text-xs font-semibold text-slate-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                            {item.score}% Sentiment
                          </span>
                        )}
                        <div className={cn("text-xs font-bold px-3 py-1.5 rounded-full shadow-sm", badgeColor)}>
                          {item.category}
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      {item.text}
                    </p>

                    <div className="flex justify-between items-center text-slate-400">
                      <div className="flex gap-6">
                        <button 
                          onClick={() => handleLikeReview(item.id)}
                          className={cn(
                            "flex items-center gap-2 transition",
                            item.isLiked ? "text-rose-500 font-semibold" : "hover:text-white"
                          )}
                        >
                          <Heart size={18} className={item.isLiked ? "fill-rose-500 text-rose-500" : ""} />
                          <span className="text-sm">{item.likes}</span>
                        </button>
                      </div>
                      <button onClick={handleShare} className="hover:text-white transition" aria-label="Share review">
                        <Share2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </motion.div>
  );
}
