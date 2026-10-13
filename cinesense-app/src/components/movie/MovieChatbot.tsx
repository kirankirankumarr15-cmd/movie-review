"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Sparkles, ExternalLink, Loader2, MessageCircle } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: { name: string; url: string }[];
}

interface MovieChatbotProps {
  tmdbId: number;
  movieTitle: string;
}

export default function MovieChatbot({ tmdbId, movieTitle }: MovieChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hello! I am your AI assistant for **${movieTitle}**. Ask me about the director, cast, verified audience sentiment, runtime, or where to watch. All my answers are grounded strictly in authentic data.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Who is the director?",
    "What are audiences saying?",
    "Where can I stream this?",
    "What is the runtime and rating?",
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend, tmdbId }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply, sources: data.sources },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I could not retrieve an answer at this time. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network error occurred while fetching verified data.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#101018] border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-display font-bold text-white flex items-center gap-1.5">
              <span>Ask CineSense AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                Grounded Factual
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Only answers from verified database • No hallucinations
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap gap-1.5">
        {quickPrompts.map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="max-h-80 overflow-y-auto space-y-3 p-3 bg-[#151522] rounded-xl border border-white/5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.role === "assistant" && (
              <div className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center shrink-0 text-xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                m.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-[#1c1c2b] text-slate-200 border border-white/10"
              }`}
            >
              <div className="whitespace-pre-line">{m.content}</div>

              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap gap-1">
                  {m.sources.map((s, idx) => (
                    <a
                      key={idx}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-purple-300"
                    >
                      <span>{s.name}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              )}
            </div>

            {m.role === "user" && (
              <div className="w-6 h-6 rounded-full bg-white/10 text-slate-300 flex items-center justify-center shrink-0 text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2.5 items-center text-xs text-purple-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Consulting verified database...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Field */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder={`Ask anything about ${movieTitle}...`}
          className="flex-1 bg-[#181826] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
        />
        <button
          onClick={() => handleSend(input)}
          disabled={loading || !input.trim()}
          className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
