"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar as CalendarIcon, Bell, Check, Film, Loader2 } from "lucide-react";
import { MovieSearchResult } from "@/lib/api-clients/tmdb";

export default function CalendarPage() {
  const [upcoming, setUpcoming] = useState<MovieSearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadUpcoming() {
      try {
        const res = await fetch("/api/movies/discovery?category=upcoming");
        const data = await res.json();
        setUpcoming(data.results || []);
      } catch (err) {
        console.error("Calendar fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadUpcoming();
  }, []);

  const toggleReminder = (id: number) => {
    setReminders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#08080d] text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl space-y-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold">
            <CalendarIcon className="w-4 h-4" />
            <span>Theatrical & OTT Schedule</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
            Release Calendar & Reminders
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Never miss an opening day. Track release dates and set notifications for the most anticipated films.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
            <span>Loading release calendar...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {upcoming.map((m) => {
              const hasReminder = reminders[m.id];

              return (
                <div
                  key={m.id}
                  className="bg-[#101018] border border-white/10 hover:border-white/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 sm:w-20 aspect-[2/3] rounded-xl overflow-hidden relative bg-[#181826] shrink-0">
                      {m.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w185${m.poster_path}`}
                          alt={m.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Film className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-purple-500/20 text-purple-300">
                          {m.original_language}
                        </span>
                        <span className="text-xs text-amber-400 font-semibold">
                          {m.release_date || "Date TBA"}
                        </span>
                      </div>
                      <Link
                        href={`/movie/${m.id}`}
                        className="text-base sm:text-lg font-bold text-white hover:text-purple-400 transition-colors"
                      >
                        {m.title}
                      </Link>
                      <p className="text-xs text-slate-400 max-w-lg line-clamp-2">
                        {m.overview || "Upcoming theatrical release."}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleReminder(m.id)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                      hasReminder
                        ? "bg-emerald-600 text-white"
                        : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                    }`}
                  >
                    {hasReminder ? <Check className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                    <span>{hasReminder ? "Reminder Set" : "Notify Me"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
