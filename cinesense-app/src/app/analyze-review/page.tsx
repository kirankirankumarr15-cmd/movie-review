"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Smile, 
  Meh, 
  Frown, 
  Layers, 
  AlertTriangle, 
  Star, 
  Globe, 
  CheckCircle2, 
  Copy,
  RefreshCw
} from "lucide-react";
import { SentimentAnalysisResult } from "@/lib/sentiment";

const SAMPLE_REVIEWS = [
  {
    label: "Kannada / Sandalwood Mass",
    text: "Yash entry scene sakkath aagide, goosebumps guaranteed! Geetu Mohandas direction paired with intense BGM makes it an adbhuta cinematic spectacle.",
  },
  {
    label: "Critical Bollywood Review",
    text: "While the visual effects and cinematography are top notch, the storyline was predictable and dragged heavily in the second half. Amar Kaushik's direction couldn't save the weak script.",
  },
  {
    label: "Spoiler Alert Example",
    text: "Great emotional performance by Cillian Murphy, but I was shocked when the key character dies in the climax twist revealing the secret conspiracy.",
  },
  {
    label: "Hollywood Masterpiece",
    text: "Christopher Nolan delivers an absolute masterpiece. The breathtaking visuals, Ludwig Goransson's score, and gripping performances keep you on the edge of your seat.",
  },
];

export default function AnalyzeReviewPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<SentimentAnalysisResult & { predicted_rating?: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const analyzeReview = async (inputText: string) => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/analyze-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(
        `CineSense Sentiment Verdict: ${result.sentiment.toUpperCase()} (${result.confidence}% confidence)\nPredicted Rating: ${result.predicted_rating}/10\nCompound Score: ${result.compound_score}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080d] text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-4xl space-y-10">
        <div className="text-center space-y-3">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Real NLP Test Bench
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
            Analyze Your Movie Review
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Test our real NLP engine with reviews in English, Kannada, Hindi, Hinglish, or Kanglish. Inspect instant aspect breakdowns and spoiler detection.
          </p>
        </div>

        {/* Preset Sample Buttons */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-semibold block">Try a sample review:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_REVIEWS.map((sample, i) => (
              <button
                key={i}
                onClick={() => {
                  setText(sample.text);
                  analyzeReview(sample.text);
                }}
                className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Box */}
        <div className="bg-[#101018] border border-white/10 rounded-2xl p-6 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Type or paste your review here to analyze sentiment, detect aspects, and flag spoilers..."
            className="w-full bg-[#181826] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500 leading-relaxed resize-y"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              {text.length} characters • Powered by VADER NLP + Multilingual Lexicon
            </span>

            <button
              onClick={() => analyzeReview(text)}
              disabled={loading || !text.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium text-xs transition-colors cursor-pointer shadow-lg shadow-purple-600/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? "Analyzing..." : "Analyze Sentiment"}</span>
            </button>
          </div>
        </div>

        {/* Results Panel */}
        {result && (
          <div className="bg-[#101018] border border-white/10 rounded-2xl p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                  Overall Verdict
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-2xl sm:text-3xl font-display font-bold ${
                      result.sentiment === "positive"
                        ? "text-emerald-400"
                        : result.sentiment === "negative"
                        ? "text-rose-400"
                        : "text-amber-400"
                    }`}
                  >
                    {result.sentiment === "positive"
                      ? "😊 Highly Positive"
                      : result.sentiment === "negative"
                      ? "😞 Critical / Negative"
                      : "😐 Neutral / Mixed"}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-slate-200">
                    {result.confidence}% Confidence
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10 transition-colors cursor-pointer"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Breakdown"}</span>
                </button>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Predicted Rating */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  Predicted Rating
                </span>
                <p className="text-2xl font-bold text-amber-400">
                  {result.predicted_rating ? `${result.predicted_rating}/10` : "N/A"}
                </p>
                <p className="text-[11px] text-slate-400">Estimated from compound intensity</p>
              </div>

              {/* Language Detected */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-purple-400" />
                  Detected Language
                </span>
                <p className="text-2xl font-bold text-white uppercase font-mono">
                  {result.detected_language}
                </p>
                <p className="text-[11px] text-slate-400">Regional grammar analysis</p>
              </div>

              {/* Compound Score */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-xs text-slate-400">VADER Compound Score</span>
                <p className="text-2xl font-bold text-white font-mono">
                  {result.compound_score > 0 ? `+${result.compound_score}` : result.compound_score}
                </p>
                <p className="text-[11px] text-slate-400">Range: -1.0 to +1.0</p>
              </div>
            </div>

            {/* Spoiler Warning (B6) */}
            {result.is_spoiler && (
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>
                  <strong>Spoiler Detected:</strong> This review appears to disclose critical plot twists, endings, or character fates. It would automatically be blurred in the public feed.
                </span>
              </div>
            )}

            {/* Aspect-Based Breakdown (B4) */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Aspect-Based Sentiment Breakdown</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(result.aspects).map(([aspect, val]) => (
                  <div
                    key={aspect}
                    className={`p-3 rounded-xl border text-center ${
                      val === "positive"
                        ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                        : val === "negative"
                        ? "bg-rose-950/20 border-rose-500/30 text-rose-400"
                        : val === "neutral"
                        ? "bg-amber-950/20 border-amber-500/30 text-amber-400"
                        : "bg-white/5 border-white/10 text-slate-500"
                    }`}
                  >
                    <span className="text-xs font-semibold block capitalize">{aspect}</span>
                    <span className="text-[11px] font-mono mt-1 block">
                      {val ? val.toUpperCase() : "Not Mentioned"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
