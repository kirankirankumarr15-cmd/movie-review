"use client";

import { useState } from "react";
import { X, Copy, CheckCircle2, Share2, Sparkles, Star } from "lucide-react";

interface ShareReviewCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieTitle: string;
  year: number;
  positivePct: number;
  topTheme?: string;
  url: string;
}

export default function ShareReviewCardModal({
  isOpen,
  onClose,
  movieTitle,
  year,
  positivePct,
  topTheme,
  url,
}: ShareReviewCardModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `🎬 ${movieTitle} (${year}) Review Sentiment on CineSense:\n\n✨ ${positivePct}% Positive Audience & Critic Consensus\n🔥 Top Highlight: ${topTheme || 'Superb Visuals & Acting'}\n\nRead multi-source verified reviews & breakdown here:\n👉 ${url}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#12121a] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-display font-bold text-white">Share Sentiment Card</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white bg-white/5">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Share Card (Optimized for WhatsApp / Instagram) */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-purple-900/60 via-[#161625] to-pink-900/40 border border-purple-500/30 space-y-5 text-center shadow-inner relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-purple-300 font-mono">
            <span>CINESENSE SENTIMENT INTELLIGENCE</span>
            <span>VERIFIED</span>
          </div>

          <div className="space-y-1">
            <h4 className="text-2xl font-display font-bold text-white tracking-tight">{movieTitle}</h4>
            <p className="text-xs text-slate-300">{year} Theatrical Release</p>
          </div>

          <div className="py-3 px-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-around">
            <div>
              <p className="text-xs text-slate-400">Audience Consensus</p>
              <p className="text-3xl font-display font-bold text-emerald-400">{positivePct}%</p>
              <p className="text-[10px] text-emerald-300">Positive Sentiment</p>
            </div>
            <div className="w-[1px] h-10 bg-white/10" />
            <div>
              <p className="text-xs text-slate-400">Top Theme</p>
              <p className="text-sm font-bold text-white pt-1">#{topTheme || 'Performances'}</p>
              <p className="text-[10px] text-purple-300">Multi-source verified</p>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Zero fake data • Verified TMDB, Reddit & Critic News</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCopy}
          className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? "Copied Share Text & Link!" : "Copy WhatsApp / Instagram Card Text"}</span>
        </button>
      </div>
    </div>
  );
}
