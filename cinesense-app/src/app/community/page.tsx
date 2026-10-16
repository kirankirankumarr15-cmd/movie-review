"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  Users, 
  Award, 
  Bookmark, 
  Heart, 
  CheckCircle, 
  ListOrdered, 
  UserPlus, 
  Film, 
  Star,
  ShieldCheck,
  Edit3,
  Check
} from "lucide-react";
import { WatchlistItem, CuratedList } from "@/lib/db/types";

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<"watchlist" | "lists" | "badges">("watchlist");
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [lists, setLists] = useState<CuratedList[]>([]);
  const [userStatus, setUserStatus] = useState<"watchlist" | "watched" | "favorite">("watchlist");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    username: string;
    badge: string;
    points: number;
  } | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    // Load local user from session
    try {
      const stored = localStorage.getItem("cinesense_user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
        setNameInput(parsed.name || "");
      }
    } catch (e) {
      console.error(e);
    }

    // Load local watchlist
    fetch(`/api/watchlist?userId=user-demo`)
      .then((r) => r.json())
      .then((d) => setWatchlist(d.items || []))
      .catch(() => {});
  }, []);

  const handleSaveName = () => {
    if (!nameInput.trim()) return;
    const updated = currentUser
      ? { ...currentUser, name: nameInput.trim() }
      : {
          id: `user-${Date.now()}`,
          name: nameInput.trim(),
          email: "user@cinesense.app",
          username: nameInput.trim().toLowerCase().replace(/\s+/g, "_"),
          role: "user",
          badge: "Verified Reviewer",
          points: 100,
        };
    setCurrentUser(updated as any);
    localStorage.setItem("cinesense_user", JSON.stringify(updated));
    setIsEditingName(false);
  };

  const badges = [
    { name: "Top Reviewer", desc: "Contributed 10+ authentic reviews with high helpfulness score", earned: true, icon: Award, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { name: "Sandalwood Scholar", desc: "Reviewed 5+ landmark Kannada cinema releases", earned: true, icon: Film, color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { name: "Spoiler Sentinel", desc: "Helped tag and blur spoiler reviews accurately", earned: true, icon: ShieldCheck, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { name: "Centurion Film Buff", desc: "Logged 100 movies in Watched collection", earned: false, icon: Star, color: "text-slate-400 bg-white/5 border-white/10" },
  ];

  const filteredWatchlist = watchlist.filter((w) => w.status === userStatus);

  const displayName = currentUser?.name || "Film Buff";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const username = currentUser?.username || (currentUser?.email ? currentUser.email.split("@")[0] : "cinephile");
  const badge = currentUser?.badge || "Verified Member";
  const points = currentUser?.points || 100;

  return (
    <div className="min-h-screen bg-[#08080d] text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl space-y-10">
        {/* User Profile Card */}
        <div className="bg-[#101018] border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-purple-600/30">
              {initials}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                {isEditingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Your full name"
                      className="bg-[#181826] border border-purple-500 rounded-xl px-3 py-1 text-sm text-white focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-xl sm:text-2xl font-display font-bold text-white">
                      {displayName}
                    </h1>
                    <button
                      type="button"
                      onClick={() => {
                        setNameInput(displayName);
                        setIsEditingName(true);
                      }}
                      className="p-1 text-slate-400 hover:text-purple-400 transition-colors cursor-pointer"
                      title="Edit Display Name"
                    >
                      <Edit3 size={15} />
                    </button>
                  </>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {badge}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">@{username} • Verified Critic</p>
              <p className="text-xs text-slate-300 pt-1">
                Watching cinema across Sandalwood, Bollywood and Hollywood. {points} reputation points.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setNameInput(displayName);
                setIsEditingName(!isEditingName);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile Name</span>
            </button>
            <div className="text-center px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm font-bold text-white">128</p>
              <p className="text-[10px] text-slate-400">Followers</p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <button
            onClick={() => setActiveTab("watchlist")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "watchlist"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            My Collection & Watchlist
          </button>
          <button
            onClick={() => setActiveTab("badges")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "badges"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Badges & Milestones
          </button>
        </div>

        {/* Tab Content: Watchlist */}
        {activeTab === "watchlist" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUserStatus("watchlist")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  userStatus === "watchlist" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Want to Watch
              </button>
              <button
                onClick={() => setUserStatus("watched")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  userStatus === "watched" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Watched
              </button>
              <button
                onClick={() => setUserStatus("favorite")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                  userStatus === "favorite" ? "bg-white/15 text-white" : "text-slate-400 hover:text-white"
                }`}
              >
                Favorites
              </button>
            </div>

            {filteredWatchlist.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredWatchlist.map((item) => (
                  <Link
                    key={item.id}
                    href={`/movie/${item.tmdb_id}`}
                    className="group block bg-[#11111a] border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all"
                  >
                    <div className="relative aspect-[2/3] bg-[#181826]">
                      {item.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                          alt={item.movie_title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Film className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-semibold text-white truncate">{item.movie_title}</h4>
                      <p className="text-[10px] text-purple-400 capitalize">{item.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#101018] border border-white/10 rounded-2xl p-12 text-center text-slate-400 space-y-2">
                <Bookmark className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                <p className="text-sm font-medium text-white">Your collection is empty.</p>
                <p className="text-xs text-slate-500">
                  Visit any movie page and click "Add to Watchlist" or "Favorite" to save it here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Badges */}
        {activeTab === "badges" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {badges.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className={`p-5 rounded-2xl border flex items-start gap-4 ${b.color}`}
                >
                  <div className="p-3 rounded-xl bg-black/20 shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{b.name}</h3>
                      {b.earned && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold">
                          Earned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{b.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
