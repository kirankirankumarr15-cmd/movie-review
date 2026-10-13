"use client";

import { SentimentSummary } from "@/lib/db/types";
import { Smile, Meh, Frown, Sparkles, MessageSquare, Layers, Clock, ShieldCheck } from "lucide-react";
import { formatDisplayDate } from "@/lib/utils";

interface SentimentSummaryCardProps {
  summary: SentimentSummary;
}

export default function SentimentSummaryCard({ summary }: SentimentSummaryCardProps) {
  if (summary.total_reviews === 0) {
    return (
      <section className="bg-[#101018] border border-white/10 rounded-2xl p-6 text-center">
        <h2 className="text-xl font-display font-bold text-white mb-2">Audience & Critic Sentiment</h2>
        <p className="text-slate-400 text-sm">No reviews found yet. Be the first to add your review!</p>
      </section>
    );
  }

  const aspectLabels: Record<string, string> = {
    story: "Story & Script",
    acting: "Performances",
    music: "Music & BGM",
    direction: "Direction",
    visuals: "Visuals & VFX",
    action: "Action & Stunts",
  };

  return (
    <section className="bg-[#101018] border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
      {/* Top Banner & Sample Size */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-2xl font-display font-bold text-white">Sentiment Intelligence Summary</h2>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Based on <strong>{summary.total_reviews} verified reviews</strong> across{" "}
              <strong>{summary.sources_count} sources</strong> (TMDB, Reddit, Critic News)
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
          <Clock className="w-3.5 h-3.5 text-purple-400" />
          <span suppressHydrationWarning>Updated {formatDisplayDate(summary.last_updated)}</span>
        </div>
      </div>

      {/* Primary Percentages Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Positive */}
        <div className="bg-emerald-950/25 border border-emerald-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-1">
              <Smile className="w-4 h-4" />
              <span>Positive</span>
            </div>
            <p className="text-3xl font-display font-bold text-white">{summary.positive_pct}%</p>
            <p className="text-xs text-emerald-400/80">{summary.positive_count} reviews</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl">
            😊
          </div>
        </div>

        {/* Neutral */}
        <div className="bg-amber-950/25 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
              <Meh className="w-4 h-4" />
              <span>Neutral / Mixed</span>
            </div>
            <p className="text-3xl font-display font-bold text-white">{summary.neutral_pct}%</p>
            <p className="text-xs text-amber-400/80">{summary.neutral_count} reviews</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xl">
            😐
          </div>
        </div>

        {/* Negative */}
        <div className="bg-rose-950/25 border border-rose-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold mb-1">
              <Frown className="w-4 h-4" />
              <span>Negative</span>
            </div>
            <p className="text-3xl font-display font-bold text-white">{summary.negative_pct}%</p>
            <p className="text-xs text-rose-400/80">{summary.negative_count} reviews</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-xl">
            😞
          </div>
        </div>
      </div>

      {/* Combined Distribution Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex border border-white/10">
          <div
            style={{ width: `${summary.positive_pct}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
            title={`Positive: ${summary.positive_pct}%`}
          />
          <div
            style={{ width: `${summary.neutral_pct}%` }}
            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
            title={`Neutral: ${summary.neutral_pct}%`}
          />
          <div
            style={{ width: `${summary.negative_pct}%` }}
            className="h-full bg-gradient-to-r from-rose-500 to-red-400 transition-all duration-500"
            title={`Negative: ${summary.negative_pct}%`}
          />
        </div>
      </div>

      {/* Aspect-Based Breakdown (B4) */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span>Aspect Breakdown</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(summary.aspects_summary).map(([aspectKey, counts]) => {
            const aspectTotal = counts.positive + counts.neutral + counts.negative;
            const aspectNet = counts.positive - counts.negative;
            const statusColor =
              aspectTotal === 0
                ? "text-slate-500 border-white/5"
                : aspectNet > 0
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-950/20"
                : aspectNet < 0
                ? "text-rose-400 border-rose-500/30 bg-rose-950/20"
                : "text-amber-400 border-amber-500/30 bg-amber-950/20";

            return (
              <div
                key={aspectKey}
                className={`p-3 rounded-xl border flex flex-col justify-between ${statusColor}`}
              >
                <span className="text-xs font-semibold">{aspectLabels[aspectKey] || aspectKey}</span>
                <span className="text-[11px] font-mono mt-2">
                  {aspectTotal > 0
                    ? `${counts.positive} 👍 | ${counts.negative} 👎`
                    : "Awaiting data"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Sentiment Themes (B5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {summary.top_positive_themes.length > 0 && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Top Positive Themes
            </span>
            <div className="flex flex-wrap gap-1.5">
              {summary.top_positive_themes.map((theme, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                >
                  #{theme}
                </span>
              ))}
            </div>
          </div>
        )}

        {summary.top_negative_themes.length > 0 && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Areas of Discussion / Critique
            </span>
            <div className="flex flex-wrap gap-1.5">
              {summary.top_negative_themes.map((theme, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20"
                >
                  #{theme}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
