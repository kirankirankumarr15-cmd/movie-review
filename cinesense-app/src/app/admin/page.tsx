"use client";

import { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Activity, 
  Film, 
  MessageSquare, 
  Vote, 
  CheckCircle2, 
  RefreshCw, 
  Server
} from "lucide-react";
import { formatDisplayDate } from "@/lib/utils";

// Comprehensive i18n dictionary for English and Kannada (Hindi removed as requested)
const I18N = {
  en: {
    title: "Admin Command Center",
    subtitle: "Source adapter health, review moderation queue, and data pipeline analytics.",
    refresh: "Refresh",
    refreshQueue: "Refresh Queue",
    moviesCataloged: "Movies Cataloged",
    resolverActive: "Canonical resolver active",
    verifiedReviews: "Verified Reviews",
    strictChecks: "Strict URL + Author checks",
    activePolls: "Active Polls",
    audienceLive: "Audience predictions live",
    platformSentiment: "Platform Sentiment",
    weightedConsensus: "Weighted average consensus",
    pipelineHealth: "Source Adapter Pipeline Health",
    parallelExec: "Parallel Promise.allSettled execution",
    operational: "OPERATIONAL",
    standby: "STANDBY",
    tmdbDesc: "Movie details, cast, trailers, watch providers.",
    redditDesc: "r/kannada, r/sandalwood public discussions.",
    criticDesc: "Deccan Herald, Prajavani, Vijayavani, The Hindu.",
    ytDesc: "Official trailers embedding via youtube-nocookie.",
    modQueue: "Verified Review Moderation Queue",
    zeroFake: "Zero fake reviews allowed",
    source: "Source",
    author: "Author",
    sentiment: "Sentiment",
    excerpt: "Excerpt",
    date: "Date",
    status: "Status",
    verified: "Verified",
    positive: "Positive",
    negative: "Negative",
    featureA8Title: "Feature A8: Legal Full-Movie Detection Queue",
    featureA8Desc: "Strict rights-holder whitelist + runtime verification. Pirated/bootlegs strictly rejected.",
    movieCol: "Movie",
    uploaderCol: "Uploader / Channel",
    durationCol: "Duration vs TMDB",
    reasonCol: "Notes / Reason",
    actionsCol: "Actions",
    approve: "Approve",
    reject: "Reject",
    whitelistTitle: "Official Rights-Holder Channels Whitelist",
    whitelistDesc: "Only YouTube uploads from these authorized channels are ever accepted for legal full-movie embeds.",
    channelName: "Channel Name",
    channelId: "YouTube Channel ID",
    language: "Language",
    addChannel: "+ Add Channel",
    whitelisted: "✓ Whitelisted",
    remove: "Remove",
  },
  kn: {
    title: "ಆಡಳಿತ ಕಮಾಂಡ್ ಕೇಂದ್ರ",
    subtitle: "ಮೂಲ ಅಡಾಪ್ಟರ್ ಸ್ಥಿತಿ, ವಿಮರ್ಶೆ ನಿಯಂತ್ರಣ ಸರತಿ ಮತ್ತು ಡೇಟಾ ಪೈಪ್‌ಲೈನ್ ವಿಶ್ಲೇಷಣೆ.",
    refresh: "ರಿಫ್ರೆಶ್",
    refreshQueue: "ಸರತಿ ರಿಫ್ರೆಶ್ ಮಾಡಿ",
    moviesCataloged: "ದಾಖಲಾದ ಚಲನಚಿತ್ರಗಳು",
    resolverActive: "ಕ್ಯಾನೊನಿಕಲ್ ಪರಿಹಾರಕ ಸಕ್ರಿಯವಾಗಿದೆ",
    verifiedReviews: "ಪರಿಶೀಲಿಸಿದ ವಿಮರ್ಶೆಗಳು",
    strictChecks: "ಕಟ್ಟುನಿಟ್ಟಾದ URL + ಲೇಖಕರ ಪರಿಶೀಲನೆ",
    activePolls: "ಸಕ್ರಿಯ ಸಮೀಕ್ಷೆಗಳು",
    audienceLive: "ವೀಕ್ಷಕರ ಭವಿಷ್ಯ ಲೈವ್",
    platformSentiment: "ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಒಟ್ಟಾರೆ ಭಾವನೆ",
    weightedConsensus: "ತೂಕದ ಸರಾಸರಿ ಒಮ್ಮತ",
    pipelineHealth: "ಮೂಲ ಅಡಾಪ್ಟರ್ ಪೈಪ್‌ಲೈನ್ ಸ್ಥಿತಿ",
    parallelExec: "ಸಮಾನಾಂತರ Promise.allSettled ಚಾಲನೆ",
    operational: "ಕಾರ್ಯನಿರತ (OPERATIONAL)",
    standby: "ಸಿದ್ಧತೆ (STANDBY)",
    tmdbDesc: "ಚಿತ್ರದ ವಿವರಗಳು, ತಾರಾಗಣ, ಟ್ರೇಲರ್‌ಗಳು, ವೀಕ್ಷಣಾ ಮೂಲಗಳು.",
    redditDesc: "r/kannada, r/sandalwood ಸಾರ್ವಜನಿಕ ಚರ್ಚೆಗಳು.",
    criticDesc: "ಡೆಕ್ಕನ್ ಹೆರಾಲ್ಡ್, ಪ್ರಜಾವಾಣಿ, ವಿಜಯವಾಣಿ, ದಿ ಹಿಂದೂ.",
    ytDesc: "ಅಧಿಕೃತ ಟ್ರೇಲರ್‌ಗಳ ಎಂಬೆಡಿಂಗ್ (youtube-nocookie).",
    modQueue: "ಪರಿಶೀಲಿಸಿದ ವಿಮರ್ಶೆಗಳ ನಿಯಂತ್ರಣ ಸರತಿ",
    zeroFake: "ನಕಲಿ ವಿಮರ್ಶೆಗಳಿಗೆ ಅವಕಾಶವಿಲ್ಲ",
    source: "ಮೂಲ",
    author: "ಲೇಖಕರು",
    sentiment: "ಭಾವನೆ",
    excerpt: "ಉಲ್ಲೇಖ",
    date: "ದಿನಾಂಕ",
    status: "ಸ್ಥಿತಿ",
    verified: "ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
    positive: "ಸಕಾರಾತ್ಮಕ",
    negative: "ನಕಾರಾತ್ಮಕ",
    featureA8Title: "ವೈಶಿಷ್ಟ್ಯ A8: ಕಾನೂನುಬದ್ಧ ಪೂರ್ಣ ಚಲನಚಿತ್ರ ಪರಿಶೀಲನಾ ಸರತಿ",
    featureA8Desc: "ಕಟ್ಟುನಿಟ್ಟಾದ ಹಕ್ಕುಸ್ವಾಮ್ಯ ಹೊಂದಿರುವವರ ಪಟ್ಟಿ + ಅವಧಿ ಪರಿಶೀಲನೆ. ಪೈರೇಟೆಡ್ ಚಿತ್ರಗಳು ಕಡ್ಡಾಯವಾಗಿ ತಿರಸ್ಕೃತ.",
    movieCol: "ಚಲನಚಿತ್ರ",
    uploaderCol: "ಅಪ್‌ಲೋಡರ್ / ಚಾನೆಲ್",
    durationCol: "ಅವಧಿ vs TMDB",
    reasonCol: "ಟಿಪ್ಪಣಿ / ಕಾರಣ",
    actionsCol: "ಕ್ರಮಗಳು",
    approve: "ಅನುಮೋದಿಸಿ",
    reject: "ತಿರಸ್ಕರಿಸಿ",
    whitelistTitle: "ಅಧಿಕೃತ ಹಕ್ಕುಸ್ವಾಮ್ಯ ಚಾನೆಲ್‌ಗಳ ಶ್ವೇತಪಟ್ಟಿ",
    whitelistDesc: "ಕಾನೂನುಬದ್ಧ ಪೂರ್ಣ ಚಲನಚಿತ್ರಗಳಿಗಾಗಿ ಅಧಿಕೃತ ಚಾನೆಲ್‌ಗಳಿಂದ ಮಾತ್ರ ಅಪ್‌ಲೋಡ್‌ಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗುತ್ತದೆ.",
    channelName: "ಚಾನೆಲ್ ಹೆಸರು",
    channelId: "ಯೂಟ್ಯೂಬ್ ಚಾನೆಲ್ ID",
    language: "ಭಾಷೆ",
    addChannel: "+ ಚಾನೆಲ್ ಸೇರಿಸಿ",
    whitelisted: "✓ ಶ್ವೇತಪಟ್ಟಿ ಮಾಡಲಾಗಿದೆ",
    remove: "ತೆಗೆದುಹಾಕಿ",
  },
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uiLanguage, setUiLanguage] = useState<"kn" | "en">("kn");

  const t = I18N[uiLanguage];

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error("Admin load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080d] text-slate-100 py-12">
      <div className="container mx-auto px-4 max-w-6xl space-y-10">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#101018] border border-white/10 rounded-3xl p-6 md:p-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                {t.title}
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* UI Language Switcher: Kannada (Default) & English (Hindi Removed) */}
            <select
              value={uiLanguage}
              onChange={(e) => setUiLanguage(e.target.value as "kn" | "en")}
              className="bg-[#181826] border border-purple-500/30 focus:border-purple-500 rounded-xl px-3 py-2 text-xs font-semibold text-white cursor-pointer shadow-md"
            >
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="en">English (US)</option>
            </select>

            <button
              onClick={loadStats}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-slate-300 border border-white/10 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{t.refresh}</span>
            </button>
          </div>
        </div>

        {/* 1. KEY METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-[#101018] border border-white/10 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-purple-400" />
              {t.moviesCataloged}
            </span>
            <p className="text-3xl font-display font-bold text-white">
              {data?.stats?.totalMovies || 3}
            </p>
            <p className="text-[11px] text-purple-400">{t.resolverActive}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#101018] border border-white/10 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              {t.verifiedReviews}
            </span>
            <p className="text-3xl font-display font-bold text-white">
              {data?.stats?.totalReviews || 10}
            </p>
            <p className="text-[11px] text-emerald-400">{t.strictChecks}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#101018] border border-white/10 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Vote className="w-3.5 h-3.5 text-pink-400" />
              {t.activePolls}
            </span>
            <p className="text-3xl font-display font-bold text-white">
              {data?.stats?.totalPolls || 1}
            </p>
            <p className="text-[11px] text-pink-400">{t.audienceLive}</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#101018] border border-white/10 space-y-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              {t.platformSentiment}
            </span>
            <p className="text-3xl font-display font-bold text-white">
              {data?.stats?.positivePct || 70}%
            </p>
            <p className="text-[11px] text-amber-400">{t.weightedConsensus}</p>
          </div>
        </div>

        {/* 2. SOURCE ADAPTER HEALTH */}
        <div className="bg-[#101018] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-400" />
              {t.pipelineHealth}
            </h2>
            <span className="text-xs text-slate-400">{t.parallelExec}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">TMDB v3 API</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  {t.operational}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{t.tmdbDesc}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Reddit Search</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  {t.operational}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{t.redditDesc}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Critic & News Desk</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                  {t.operational}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{t.criticDesc}</p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">YouTube Data API</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                  {t.standby}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{t.ytDesc}</p>
            </div>
          </div>
        </div>

        {/* 3. MODERATION QUEUE */}
        <div className="bg-[#101018] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-pink-400" />
              {t.modQueue}
            </h2>
            <span className="text-xs text-slate-400">{t.zeroFake}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#181826] text-slate-400 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">{t.source}</th>
                  <th className="p-3">{t.author}</th>
                  <th className="p-3">{t.sentiment}</th>
                  <th className="p-3">{t.excerpt}</th>
                  <th className="p-3">{t.date}</th>
                  <th className="p-3">{t.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data?.recentReviews?.map((r: any) => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-semibold text-white">{r.source}</td>
                    <td className="p-3">{r.author}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        r.sentiment === "positive" ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
                      }`}>
                        {r.sentiment === "positive" ? t.positive : t.negative}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs truncate">{r.text}</td>
                    <td className="p-3 font-mono" suppressHydrationWarning>{formatDisplayDate(r.posted_at)}</td>
                    <td className="p-3 text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t.verified}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. FEATURE A8: LEGAL FULL-MOVIE VERIFICATION & MODERATION QUEUE */}
        <FullMovieModerationSection onRefresh={loadStats} t={t} />

        {/* 5. FEATURE A8: OFFICIAL RIGHTS-HOLDER CHANNELS WHITELIST */}
        <OfficialChannelsWhitelistSection t={t} />
      </div>
    </div>
  );
}

function FullMovieModerationSection({ onRefresh, t }: { onRefresh: () => void; t: any }) {
  const [movies, setMovies] = useState<any[]>([]);

  const loadFullMovies = async () => {
    try {
      const res = await fetch('/api/admin/full-movies');
      if (res.ok) {
        const d = await res.json();
        setMovies(d);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadFullMovies();
  }, []);

  const handleUpdateStatus = async (id: string, status: string, reason?: string) => {
    try {
      const res = await fetch('/api/admin/full-movies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, reason })
      });
      if (res.ok) {
        await loadFullMovies();
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to update full movie status:', err);
    }
  };

  return (
    <div className="bg-[#101018] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            {t.featureA8Title}
          </h2>
          <p className="text-xs text-slate-400">
            {t.featureA8Desc}
          </p>
        </div>
        <button
          onClick={loadFullMovies}
          className="text-xs text-amber-400 hover:text-amber-300 font-medium px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 cursor-pointer"
        >
          {t.refreshQueue}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#181826] text-slate-400 uppercase font-mono text-[10px]">
            <tr>
              <th className="p-3">{t.movieCol}</th>
              <th className="p-3">{t.uploaderCol}</th>
              <th className="p-3">{t.durationCol}</th>
              <th className="p-3">{t.status}</th>
              <th className="p-3">{t.reasonCol}</th>
              <th className="p-3">{t.actionsCol}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {movies.map((m) => (
              <tr key={m.id} className="hover:bg-white/5 transition-colors">
                <td className="p-3 font-semibold text-white">
                  <div>{m.movie_title}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">TMDB: {m.tmdb_id}</div>
                </td>
                <td className="p-3">
                  <div>{m.channel_name}</div>
                  <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[120px]">{m.channel_id}</div>
                </td>
                <td className="p-3 font-mono">
                  {m.video_duration_minutes}m / {m.tmdb_runtime_minutes}m
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                      m.verification_status === 'verified_approved'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : m.verification_status === 'rejected_pirated_or_unverified'
                        ? 'text-rose-400 bg-rose-500/10'
                        : 'text-amber-400 bg-amber-500/10'
                    }`}
                  >
                    {m.verification_status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="p-3 max-w-xs text-[11px] text-zinc-400 truncate">
                  {m.rejection_reason || 'Verified official studio upload'}
                </td>
                <td className="p-3 space-x-2">
                  {m.verification_status !== 'verified_approved' && (
                    <button
                      onClick={() => handleUpdateStatus(m.id, 'verified_approved')}
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-medium text-[10px] cursor-pointer"
                    >
                      {t.approve}
                    </button>
                  )}
                  {m.verification_status !== 'rejected_pirated_or_unverified' && (
                    <button
                      onClick={() => handleUpdateStatus(m.id, 'rejected_pirated_or_unverified', 'Rejected by admin: unverified rights holder')}
                      className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded font-medium text-[10px] cursor-pointer"
                    >
                      {t.reject}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OfficialChannelsWhitelistSection({ t }: { t: any }) {
  const [channels, setChannels] = useState<any[]>([]);
  const [newChannelId, setNewChannelId] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newLanguage, setNewLanguage] = useState('kn');
  const [newNotes, setNewNotes] = useState('');

  const loadChannels = async () => {
    try {
      const res = await fetch('/api/admin/channels');
      if (res.ok) {
        const d = await res.json();
        setChannels(d);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  const handleAddChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelId || !newChannelName) return;

    try {
      const res = await fetch('/api/admin/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: newChannelId.trim(),
          channel_name: newChannelName.trim(),
          language: newLanguage,
          notes: newNotes.trim()
        })
      });
      if (res.ok) {
        setNewChannelId('');
        setNewChannelName('');
        setNewNotes('');
        await loadChannels();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveChannel = async (channelId: string) => {
    try {
      const res = await fetch(`/api/admin/channels?channel_id=${encodeURIComponent(channelId)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await loadChannels();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-[#101018] border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-indigo-400" />
          {t.whitelistTitle}
        </h2>
        <p className="text-xs text-slate-400">
          {t.whitelistDesc}
        </p>
      </div>

      {/* Add New Channel Form - Hindi removed from options */}
      <form onSubmit={handleAddChannel} className="p-4 rounded-2xl bg-[#161622] border border-white/5 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-[11px] text-zinc-400 font-medium mb-1">{t.channelName}</label>
          <input
            type="text"
            required
            placeholder="e.g. KVN Productions, Hombale Films"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            className="w-full bg-[#101018] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[11px] text-zinc-400 font-medium mb-1">{t.channelId}</label>
          <input
            type="text"
            required
            placeholder="e.g. UC7m01_w20K5tK5d8C9J1_kw"
            value={newChannelId}
            onChange={(e) => setNewChannelId(e.target.value)}
            className="w-full bg-[#101018] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
          />
        </div>
        <div className="w-36">
          <label className="block text-[11px] text-zinc-400 font-medium mb-1">{t.language}</label>
          <select
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            className="w-full bg-[#101018] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value="kn">Kannada (ಕನ್ನಡ)</option>
            <option value="te">Telugu</option>
            <option value="ta">Tamil</option>
            <option value="ml">Malayalam</option>
            <option value="en">English</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs cursor-pointer"
        >
          {t.addChannel}
        </button>
      </form>

      {/* Whitelist Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-[#181826] text-slate-400 uppercase font-mono text-[10px]">
            <tr>
              <th className="p-3">{t.channelName}</th>
              <th className="p-3">{t.channelId}</th>
              <th className="p-3">{t.language}</th>
              <th className="p-3">{t.status}</th>
              <th className="p-3">{t.actionsCol}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {channels.map((ch) => (
              <tr key={ch.channel_id} className="hover:bg-white/5 transition-colors">
                <td className="p-3 font-semibold text-white">{ch.channel_name}</td>
                <td className="p-3 font-mono text-zinc-400">{ch.channel_id}</td>
                <td className="p-3 uppercase">{ch.language}</td>
                <td className="p-3 text-emerald-400 font-semibold">{t.whitelisted}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleRemoveChannel(ch.channel_id)}
                    className="text-rose-400 hover:text-rose-300 text-xs cursor-pointer"
                  >
                    {t.remove}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
