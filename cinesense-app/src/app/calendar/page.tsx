"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Bell, 
  Check, 
  Film, 
  Loader2, 
  Star, 
  Flame, 
  ArrowRight, 
  Bookmark, 
  Filter, 
  Clock, 
  Sparkles,
  Compass
} from "lucide-react";
import { MovieSearchResult } from "@/lib/api-clients/tmdb";

const REGIONS = [
  { id: "all", label: "All Regions" },
  { id: "kn", label: "ಕನ್ನಡ (Sandalwood)" },
  { id: "hi", label: "Hindi (Bollywood)" },
  { id: "te", label: "Telugu (Tollywood)" },
  { id: "ta", label: "Tamil (Kollywood)" },
  { id: "en", label: "Hollywood (English)" },
];

export default function CalendarPage() {
  const [upcoming, setUpcoming] = useState<MovieSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [sortBy, setSortBy] = useState<"date" | "anticipation">("date");
  const [reminders, setReminders] = useState<Record<number, boolean>>({});
  const [watchlists, setWatchlists] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadUpcoming() {
      setLoading(true);
      try {
        const url = `/api/movies/discovery?category=upcoming&lang=${selectedLanguage}`;
        const res = await fetch(url);
        const data = await res.json();
        setUpcoming(data.results || []);
      } catch (err) {
        console.error("Calendar fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUpcoming();
  }, [selectedLanguage]);

  // Load saved reminders from localStorage
  useEffect(() => {
    try {
      const savedReminders = localStorage.getItem("cinesense_reminders");
      if (savedReminders) setReminders(JSON.parse(savedReminders));

      const savedWatchlist = localStorage.getItem("cinesense_watchlist_ids");
      if (savedWatchlist) setWatchlists(JSON.parse(savedWatchlist));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleReminder = (id: number) => {
    setReminders((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("cinesense_reminders", JSON.stringify(next));
      return next;
    });
  };

  const toggleWatchlist = (id: number) => {
    setWatchlists((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem("cinesense_watchlist_ids", JSON.stringify(next));
      return next;
    });
  };

  // Human-friendly upcoming date & countdown calculator
  const formatUpcomingDate = (dateStr?: string) => {
    if (!dateStr) return { formatted: "Date TBA", countdown: "TBA", badgeColor: "text-slate-400 bg-white/5" };

    const releaseDate = new Date(dateStr);
    const today = new Date();
    // Normalize to midnight
    releaseDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = releaseDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const options: Intl.DateTimeFormatOptions = { 
      weekday: "short", 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    };
    const formatted = releaseDate.toLocaleDateString("en-US", options);

    if (diffDays <= 0) {
      return { 
        formatted, 
        countdown: "In Theaters Now 🎬", 
        badgeColor: "text-emerald-300 bg-emerald-500/15 border-emerald-500/30" 
      };
    } else if (diffDays === 1) {
      return { 
        formatted, 
        countdown: "Releasing Tomorrow! ⚡", 
        badgeColor: "text-amber-300 bg-amber-500/15 border-amber-500/30" 
      };
    } else if (diffDays <= 7) {
      return { 
        formatted, 
        countdown: `In ${diffDays} Days • This Week 🔥`, 
        badgeColor: "text-orange-300 bg-orange-500/15 border-orange-500/30" 
      };
    } else if (diffDays <= 30) {
      return { 
        formatted, 
        countdown: `In ${diffDays} Days • Next Month ⏳`, 
        badgeColor: "text-purple-300 bg-purple-500/15 border-purple-500/30" 
      };
    } else {
      const months = Math.round(diffDays / 30);
      return { 
        formatted, 
        countdown: `In ~${months} Months • ${releaseDate.getFullYear()} 🗓️`, 
        badgeColor: "text-blue-300 bg-blue-500/15 border-blue-500/30" 
      };
    }
  };

  // Sort movies chronologically or by anticipation
  const sortedMovies = useMemo(() => {
    return [...upcoming].sort((a, b) => {
      if (sortBy === "date") {
        if (!a.release_date) return 1;
        if (!b.release_date) return -1;
        return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
      } else {
        return (b.vote_average || 0) - (a.vote_average || 0);
      }
    });
  }, [upcoming, sortBy]);

  return (
    <div className="min-h-screen bg-[#08080d] text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl space-y-10">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
            <CalendarIcon className="w-4 h-4" />
            <span>Theatrical & OTT Release Schedule</span>
          </div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                Release Calendar & Reminders
              </h1>
              <p className="text-slate-400 text-sm mt-2 max-w-xl">
                Track upcoming theatrical releases, countdown to opening day, and view full synopses and trailers.
              </p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-[#141422] border border-white/10 text-xs text-slate-300 shrink-0">
              <span className="font-bold text-white">{sortedMovies.length}</span> upcoming films tracked
            </div>
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="bg-[#101018] border border-white/10 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          {/* Region Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedLanguage(r.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedLanguage === r.id
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "bg-[#181826] text-slate-300 hover:bg-white/10"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#181826] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="date">Earliest Release Date</option>
              <option value="anticipation">Most Anticipated (Anticipation Score)</option>
            </select>
          </div>
        </div>

        {/* Movies List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
            <span>Loading upcoming releases...</span>
          </div>
        ) : sortedMovies.length > 0 ? (
          <div className="space-y-6">
            {sortedMovies.map((m) => {
              const dateInfo = formatUpcomingDate(m.release_date);
              const hasReminder = reminders[m.id];
              const isInWatchlist = watchlists[m.id];
              const score = (m.vote_average && m.vote_average > 0 ? m.vote_average : 8.5).toFixed(1);

              return (
                <div
                  key={m.id}
                  className="bg-[#101018] border border-white/10 hover:border-purple-500/40 rounded-2xl p-5 md:p-6 transition-all shadow-xl shadow-black/40 group"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-5">
                    {/* Poster */}
                    <div className="w-24 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden relative bg-[#181826] shrink-0 border border-white/10 shadow-md">
                      {m.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w300${m.poster_path}`}
                          alt={m.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Film className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* Movie Information & Details */}
                    <div className="flex-1 space-y-3 w-full">
                      {/* Top Badges: Countdown + Date + Language */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Countdown Pill */}
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${dateInfo.badgeColor}`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{dateInfo.countdown}</span>
                        </span>

                        {/* Calendar Release Date */}
                        <span className="text-xs font-semibold text-white/90 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                          <CalendarIcon className="w-3 h-3 text-indigo-400" />
                          <span>{dateInfo.formatted}</span>
                        </span>

                        {/* Language */}
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {m.original_language}
                        </span>

                        {/* Anticipation Rating */}
                        <span className="text-xs text-amber-400 font-bold flex items-center gap-1 ml-auto">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          <span>{score} / 10 Anticipation</span>
                        </span>
                      </div>

                      {/* Movie Title */}
                      <div>
                        <Link
                          href={`/movie/${m.id}`}
                          className="text-xl sm:text-2xl font-display font-bold text-white hover:text-purple-400 transition-colors inline-block"
                        >
                          {m.title}
                        </Link>
                        {m.original_title && m.original_title !== m.title && (
                          <p className="text-xs text-slate-400 mt-0.5 font-medium">
                            Original: {m.original_title}
                          </p>
                        )}
                      </div>

                      {/* Movie Plot / Overview */}
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {m.overview || "Upcoming theatrical release with full anticipation tracking and multi-lingual sentiment monitoring on CineSense."}
                      </p>

                      {/* Action Buttons Under Movie Details */}
                      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                        <Link
                          href={`/movie/${m.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/30 cursor-pointer"
                        >
                          <span>View Movie Details & Trailer</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>

                        <div className="flex items-center gap-2">
                          {/* Watchlist Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleWatchlist(m.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                              isInWatchlist
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                            }`}
                          >
                            <Bookmark className={`w-3.5 h-3.5 ${isInWatchlist ? "fill-amber-400 text-amber-400" : ""}`} />
                            <span>{isInWatchlist ? "In Watchlist" : "Save"}</span>
                          </button>

                          {/* Reminder / Notify Button */}
                          <button
                            type="button"
                            onClick={() => toggleReminder(m.id)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              hasReminder
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                            }`}
                          >
                            {hasReminder ? <Check className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                            <span>{hasReminder ? "Reminder Set" : "Notify Me"}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#101018] border border-white/10 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <Compass className="w-8 h-8 mx-auto text-purple-400" />
            <p className="text-base font-semibold text-white">No upcoming releases found for this region.</p>
            <p className="text-xs text-slate-500">
              Try switching to "All Regions" or checking back as new distribution dates are scheduled.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
