"use client";

import { useState } from "react";
import { Poll } from "@/lib/db/types";
import { Vote, CheckCircle2, TrendingUp, Users } from "lucide-react";

interface MoviePollCardProps {
  initialPolls: Poll[];
  movieTitle: string;
}

export default function MoviePollCard({ initialPolls, movieTitle }: MoviePollCardProps) {
  const [polls, setPolls] = useState<Poll[]>(initialPolls);
  const [votingState, setVotingState] = useState<Record<string, boolean>>({});

  if (!polls || polls.length === 0) return null;

  const handleVote = async (pollId: string, optionId: string) => {
    if (votingState[pollId]) return;
    setVotingState((prev) => ({ ...prev, [pollId]: true }));

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      if (res.ok) {
        const data = await res.json();
        setPolls((prev) =>
          prev.map((p) => (p.id === pollId ? data.poll : p))
        );
      }
    } catch (err) {
      console.error("Poll vote error:", err);
    } finally {
      setVotingState((prev) => ({ ...prev, [pollId]: false }));
    }
  };

  return (
    <div className="space-y-4">
      {polls.map((poll) => {
        const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);

        return (
          <section
            key={poll.id}
            className="bg-[#101018] border border-white/10 rounded-2xl p-6 md:p-8 space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Vote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-white">Community Prediction Poll</h3>
                  <p className="text-xs text-slate-400">Cast your vote and view live audience consensus</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>{totalVotes} total votes</span>
              </div>
            </div>

            <h4 className="text-base sm:text-lg font-semibold text-white leading-snug">
              {poll.question}
            </h4>

            {/* Options List */}
            <div className="space-y-3">
              {poll.options.map((opt) => {
                const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                const isSelected = poll.user_voted_option === opt.id;

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleVote(poll.id, opt.id)}
                    disabled={Boolean(poll.user_voted_option)}
                    className={`w-full text-left p-4 rounded-xl border relative overflow-hidden transition-all cursor-pointer ${
                      isSelected
                        ? "border-purple-500 bg-purple-950/20 shadow-md shadow-purple-600/10"
                        : "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {/* Background Progress Fill */}
                    {poll.user_voted_option && (
                      <div
                        style={{ width: `${pct}%` }}
                        className={`absolute inset-y-0 left-0 transition-all duration-500 pointer-events-none ${
                          isSelected ? "bg-purple-600/25" : "bg-white/5"
                        }`}
                      />
                    )}

                    <div className="relative z-10 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-purple-400 bg-purple-500" : "border-slate-500"
                        }`}>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                        <span className="text-xs sm:text-sm font-medium text-slate-200">
                          {opt.text}
                        </span>
                      </div>

                      {poll.user_voted_option && (
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono font-bold text-white">{pct}%</span>
                          <span className="text-[11px] text-slate-400">({opt.votes})</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {poll.user_voted_option && (
              <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 pt-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>You voted in this poll. Results update live with each vote.</span>
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}
