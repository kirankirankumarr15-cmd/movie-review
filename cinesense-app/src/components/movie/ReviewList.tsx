"use client";

import { useState } from "react";
import { Review } from "@/lib/db/types";
import { formatDisplayDate } from "@/lib/utils";
import { 
  ThumbsUp, 
  ThumbsDown, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Filter, 
  ArrowUpDown,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from "lucide-react";

interface ReviewListProps {
  initialReviews: Review[];
  tmdbId: number;
}

export default function ReviewList({ initialReviews, tmdbId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "most_helpful" | "confidence">("latest");
  const [votingState, setVotingState] = useState<Record<string, boolean>>({});

  const toggleSpoiler = (id: string) => {
    setRevealedSpoilers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleVote = async (reviewId: string, voteType: "up" | "down") => {
    if (votingState[reviewId]) return;
    setVotingState((prev) => ({ ...prev, [reviewId]: true }));

    try {
      const res = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      if (res.ok) {
        const data = await res.json();
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, helpfulness_up: data.up, helpfulness_down: data.down }
              : r
          )
        );
      }
    } catch (err) {
      console.error("Vote failed:", err);
    } finally {
      setVotingState((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  // Filter logic
  const filtered = reviews.filter((r) => {
    if (sourceFilter !== "all" && r.source.toLowerCase() !== sourceFilter.toLowerCase()) return false;
    if (sentimentFilter !== "all" && r.sentiment.toLowerCase() !== sentimentFilter.toLowerCase()) return false;
    if (languageFilter !== "all" && r.language.toLowerCase() !== languageFilter.toLowerCase()) return false;
    return true;
  });

  // Sort logic
  filtered.sort((a, b) => {
    if (sortBy === "most_helpful") {
      return (b.helpfulness_up - b.helpfulness_down) - (a.helpfulness_up - a.helpfulness_down);
    }
    if (sortBy === "confidence") {
      return b.confidence - a.confidence;
    }
    return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
  });

  const getSourceBadgeColor = (source: string) => {
    switch (source.toLowerCase()) {
      case "reddit":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      case "tmdb":
        return "bg-sky-500/20 text-sky-400 border-sky-500/30";
      case "youtube":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "the hindu":
      case "times of india":
      case "deccan herald":
      case "film companion":
      case "indian express":
      case "sacnilk":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
  };

  return (
    <section className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#101018] border border-white/10 rounded-2xl p-5">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <span>Verified Multi-Source Reviews</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
              {filtered.length} found
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated from official critic news, public Reddit communities, and TMDB.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-[#181826] border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">All Sources</option>
            <option value="tmdb">TMDB</option>
            <option value="reddit">Reddit</option>
            <option value="the hindu">The Hindu</option>
            <option value="deccan herald">Deccan Herald</option>
            <option value="times of india">Times of India</option>
            <option value="film companion">Film Companion</option>
            <option value="sacnilk">Sacnilk</option>
          </select>

          {/* Sentiment Filter */}
          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="bg-[#181826] border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">😊 Positive</option>
            <option value="neutral">😐 Neutral</option>
            <option value="negative">😞 Negative</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#181826] border border-white/15 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500 cursor-pointer"
          >
            <option value="latest">Latest First</option>
            <option value="most_helpful">Most Helpful</option>
            <option value="confidence">Highest Confidence</option>
          </select>
        </div>
      </div>

      {/* Review Cards Grid */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((rev) => {
            const isSpoilerRevealed = revealedSpoilers[rev.id];

            return (
              <div
                key={rev.id}
                className="bg-[#101018] border border-white/10 hover:border-white/20 rounded-2xl p-5 md:p-6 space-y-4 transition-all"
              >
                {/* Review Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSourceBadgeColor(
                        rev.source
                      )}`}
                    >
                      {rev.source}
                    </span>

                    <span className="text-sm font-medium text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {rev.author}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                        rev.sentiment === "positive"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : rev.sentiment === "negative"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {rev.sentiment === "positive"
                        ? "😊 Positive"
                        : rev.sentiment === "negative"
                        ? "😞 Negative"
                        : "😐 Neutral"}{" "}
                      ({rev.confidence}%)
                    </span>

                    <span className="text-xs text-slate-400 flex items-center gap-1" suppressHydrationWarning>
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDisplayDate(rev.posted_at)}
                    </span>
                  </div>
                </div>

                {/* Review Text & Spoiler Guard (B6) */}
                <div className="relative">
                  {rev.is_spoiler && !isSpoilerRevealed ? (
                    <div className="bg-red-950/20 border border-red-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>Warning: This review contains potential plot spoilers.</span>
                      </div>
                      <button
                        onClick={() => toggleSpoiler(rev.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Show Review</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-line">
                        "{rev.text}"
                      </p>
                      {rev.is_spoiler && isSpoilerRevealed && (
                        <button
                          onClick={() => toggleSpoiler(rev.id)}
                          className="mt-2 text-xs text-slate-400 hover:text-slate-300 inline-flex items-center gap-1"
                        >
                          <EyeOff className="w-3 h-3" />
                          <span>Hide spoiler again</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Aspects Tags */}
                {rev.aspects && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(rev.aspects).map(
                      ([aspect, rating]) =>
                        rating && (
                          <span
                            key={aspect}
                            className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                              rating === "positive"
                                ? "bg-emerald-950/30 text-emerald-400 border-emerald-500/20"
                                : rating === "negative"
                                ? "bg-rose-950/30 text-rose-400 border-rose-500/20"
                                : "bg-amber-950/30 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {aspect.toUpperCase()}: {rating}
                          </span>
                        )
                    )}
                  </div>
                )}

                {/* Review Footer: Helpfulness Votes & View Original Link */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px]">Helpful?</span>
                    <button
                      onClick={() => handleVote(rev.id, "up")}
                      className="flex items-center gap-1 hover:text-emerald-400 transition-colors p-1 rounded hover:bg-white/5 cursor-pointer"
                      title="Mark as helpful"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{rev.helpfulness_up || 0}</span>
                    </button>
                    <button
                      onClick={() => handleVote(rev.id, "down")}
                      className="flex items-center gap-1 hover:text-rose-400 transition-colors p-1 rounded hover:bg-white/5 cursor-pointer"
                      title="Mark as not helpful"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{rev.helpfulness_down || 0}</span>
                    </button>
                  </div>

                  {rev.url && (
                    <a
                      href={rev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 font-medium hover:underline"
                    >
                      <span>View original source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#101018] border border-white/10 rounded-2xl p-12 text-center space-y-3">
          <p className="text-slate-300 text-base font-medium">No reviews found yet.</p>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Reviews will be fetched as verified critics and audiences publish discussions.
          </p>
        </div>
      )}
    </section>
  );
}
