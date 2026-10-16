"use client";

import { useState } from "react";
import { UserReview } from "@/lib/db/types";
import { Star, MessageSquare, ThumbsUp, Send, User, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDisplayDate } from "@/lib/utils";

interface CommunityReviewSectionProps {
  tmdbId: number;
  movieTitle: string;
}

export default function CommunityReviewSection({ tmdbId, movieTitle }: CommunityReviewSectionProps) {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [rating, setRating] = useState<number>(8);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (text.trim().length < 15) {
      setErrorMessage("Review must be at least 15 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      let currentUserName = "Community Reviewer";
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("cinesense_user") : null;
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.name) currentUserName = parsed.name;
        }
      } catch (e) {}

      const res = await fetch("/api/community/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId,
          rating,
          title,
          text: text.trim(),
          userName: currentUserName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit review.");
      }

      setReviews((prev) => [data.review, ...prev]);
      setText("");
      setTitle("");
      setSuccessMessage("Your community review has been submitted with live sentiment analysis!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-[#101018] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-400" />
            <span>CineSense Community Reviews</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Share your authentic score and perspective on {movieTitle}.
          </p>
        </div>
      </div>

      {/* Review Submission Form */}
      <form onSubmit={handleSubmit} className="bg-[#181826] border border-white/10 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white">Write Your Review</h3>

        {/* Rating Picker */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-300 font-medium mr-2">Your Rating:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                rating >= star
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                  : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              {star}
            </button>
          ))}
          <span className="text-xs text-amber-400 font-bold ml-2">{rating}/10</span>
        </div>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Review headline (optional)"
          className="w-full bg-[#101018] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
        />

        {/* Text Input */}
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Write your honest opinion about the story, acting, music, or visuals (min. 15 characters)..."
            className="w-full bg-[#101018] border border-white/10 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500 leading-relaxed"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
            <span>Minimum 15 characters</span>
            <span className={text.length >= 15 ? "text-emerald-400" : "text-slate-500"}>
              {text.length} / 15
            </span>
          </div>
        </div>

        {errorMessage && (
          <div className="text-xs text-rose-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{successMessage}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || text.trim().length < 15}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-xs transition-colors cursor-pointer shadow-lg shadow-purple-600/30"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSubmitting ? "Submitting..." : "Post Review"}</span>
        </button>
      </form>

      {/* Community Reviews List */}
      {reviews.length > 0 && (
        <div className="space-y-3 pt-2">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold text-white">{rev.user_name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                    Community
                  </span>
                </div>
                <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{rev.rating}/10</span>
                </div>
              </div>
              {rev.title && <h4 className="text-xs font-bold text-white">{rev.title}</h4>}
              <p className="text-xs text-slate-300 leading-relaxed">"{rev.text}"</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="capitalize text-emerald-400 font-medium">Sentiment: {rev.sentiment}</span>
                <span suppressHydrationWarning>{formatDisplayDate(rev.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
