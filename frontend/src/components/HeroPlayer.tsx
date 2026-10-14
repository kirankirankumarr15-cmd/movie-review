/**
 * HeroPlayer — Netflix / Moctale-style in-hero YouTube player.
 *
 * Features:
 *  - YouTube IFrame Player API (youtube-nocookie.com, enablejsapi, playsinline)
 *  - Video type tabs: Teaser | Trailer | Clip | Song
 *  - Floating control bar: Play/Pause, Mute/Unmute, Fullscreen, Close
 *  - IntersectionObserver: pauses when scrolled out of view
 *  - Visibility API: pauses when tab is hidden
 *  - Keyboard: Space=play/pause, M=mute, F=fullscreen, Esc=close
 *  - Loading skeleton while player initialises
 *  - Error state (embed blocked) → "Watch on YouTube" fallback
 *  - Optional muted background autoplay on desktop after 3 s
 *  - "Watch again" + next video chip when video ends
 *  - No layout shift (aspect-ratio reserved)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ExternalLink,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';

/* ─── Types ─────────────────────────────────────────────────── */

export interface HeroVideo {
  youtube_id: string;
  type: 'teaser' | 'trailer' | 'clip' | 'song' | string;
  title?: string;
  language?: string;
  is_official?: boolean;
}

interface HeroPlayerProps {
  /** Sorted list of videos (teaser first, then trailer, etc.) */
  videos: HeroVideo[];
  /** Movie title (for aria-labels) */
  movieTitle?: string;
  /** Backdrop image URL */
  backdropUrl?: string;
  /** Poster URL used as thumbnail placeholder */
  posterUrl?: string;
  /** Called when user closes the player */
  onClose: () => void;
  /**
   * Feature flag: silently autoplay a muted teaser in the background
   * 3 s after mount (desktop only, respects prefers-reduced-motion + data-saver).
   */
  enableBgAutoplay?: boolean;
}

/* ─── YouTube IFrame API types (minimal) ──────────────────── */

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

/* ─── Helpers ─────────────────────────────────────────────── */

const VIDEO_ORDER: Record<string, number> = { teaser: 0, trailer: 1, clip: 2, song: 3 };
const TYPE_LABEL: Record<string, string> = {
  teaser: 'Teaser',
  trailer: 'Trailer',
  clip: 'Clip',
  song: 'Song',
};

function sortedVideos(videos: HeroVideo[]): HeroVideo[] {
  return [...videos].sort(
    (a, b) => (VIDEO_ORDER[a.type] ?? 99) - (VIDEO_ORDER[b.type] ?? 99),
  );
}

function loadYTApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  return new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    if (!document.getElementById('yt-iframe-api')) {
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  });
}

/* ─── Component ───────────────────────────────────────────── */

export default function HeroPlayer({
  videos,
  movieTitle = 'Movie',
  backdropUrl,
  posterUrl,
  onClose,
  enableBgAutoplay = false,
}: HeroPlayerProps) {
  const sorted = sortedVideos(videos);

  const [activeIdx, setActiveIdx] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [ended, setEnded] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Bg muted autoplay state
  const [bgMode, setBgMode] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const apiReadyRef = useRef(false);
  const fallbackAttemptedRef = useRef(false);

  const activeVideo = sorted[activeIdx];
  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${activeVideo?.youtube_id}`;

  /* ── Load YT IFrame API once ─────────────────────────── */
  useEffect(() => {
    loadYTApi().then(() => {
      apiReadyRef.current = true;
    });
  }, []);

  /* ── Create / recreate player when active video changes ─ */
  useEffect(() => {
    if (!activeVideo || !iframeContainerRef.current) return;

    setPlayerReady(false);
    setHasError(false);
    setEnded(false);
    setIsPlaying(false);
    fallbackAttemptedRef.current = false;

    let destroyed = false;

    function createPlayer() {
      if (destroyed || !iframeContainerRef.current) return;

      // Destroy previous instance
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }

      // Clear container and create iframe with explicit referrerPolicy and allow headers
      iframeContainerRef.current.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.id = `yt-player-${Date.now()}`;
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const params = new URLSearchParams({
        enablejsapi: '1',
        autoplay: bgMode ? '0' : '1',
        mute: bgMode ? '1' : '0',
        rel: '0',
        modestbranding: '1',
        playsinline: '1',
        controls: '0',
        disablekb: '1',
        iv_load_policy: '3',
        ...(origin ? { origin } : {}),
        ...(bgMode ? { loop: '1', playlist: activeVideo.youtube_id } : {}),
      });
      iframe.src = `https://www.youtube.com/embed/${activeVideo.youtube_id}?${params.toString()}`;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.setAttribute('allowfullscreen', 'true');
      iframe.className = 'w-full h-full border-0';
      iframeContainerRef.current.appendChild(iframe);

      playerRef.current = new window.YT.Player(iframe, {
        events: {
          onReady: (e: any) => {
            if (destroyed) return;
            setPlayerReady(true);
            if (bgMode) {
              try { e.target.mute(); e.target.playVideo(); } catch {}
            } else {
              try { e.target.unMute(); e.target.playVideo(); } catch {}
              setIsPlaying(true);
              setIsMuted(false);
            }
          },
          onStateChange: (e: any) => {
            if (destroyed) return;
            // YT.PlayerState: PLAYING=1, PAUSED=2, ENDED=0
            if (e.data === 1) { setIsPlaying(true); setEnded(false); }
            if (e.data === 2) setIsPlaying(false);
            if (e.data === 0) { setIsPlaying(false); setEnded(true); }
          },
          onError: (e: any) => {
            if (destroyed) return;
            console.warn('YouTube Player error code:', e?.data);
            // If controls:0 or origin caused 150/153/2/101, try standard controls fallback once
            if (!fallbackAttemptedRef.current) {
              fallbackAttemptedRef.current = true;
              if (iframeContainerRef.current) {
                iframeContainerRef.current.innerHTML = '';
                const fallbackIframe = document.createElement('iframe');
                const fbParams = new URLSearchParams({
                  autoplay: '1',
                  rel: '0',
                  playsinline: '1',
                  controls: '1',
                  enablejsapi: '1',
                  ...(origin ? { origin } : {}),
                });
                fallbackIframe.src = `https://www.youtube.com/embed/${activeVideo.youtube_id}?${fbParams.toString()}`;
                fallbackIframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
                fallbackIframe.referrerPolicy = 'strict-origin-when-cross-origin';
                fallbackIframe.setAttribute('allowfullscreen', 'true');
                fallbackIframe.className = 'w-full h-full border-0';
                iframeContainerRef.current.appendChild(fallbackIframe);
                setPlayerReady(true);
                setIsPlaying(true);
                return;
              }
            }
            setHasError(true);
            setPlayerReady(true);
          },
        },
      });
    }

    if (apiReadyRef.current) {
      createPlayer();
    } else {
      loadYTApi().then(() => {
        apiReadyRef.current = true;
        createPlayer();
      });
    }

    return () => {
      destroyed = true;
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch {}
        playerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIdx, bgMode]);

  /* ── IntersectionObserver: pause when hero scrolled out ─ */
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && playerRef.current) {
          try { playerRef.current.pauseVideo(); } catch {}
          setIsPlaying(false);
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  /* ── Visibility API: pause on tab hide ────────────────── */
  useEffect(() => {
    const handle = () => {
      if (document.hidden && playerRef.current) {
        try { playerRef.current.pauseVideo(); } catch {}
        setIsPlaying(false);
      }
    };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, []);

  /* ── Optional bg muted autoplay (desktop, 3 s delay) ─── */
  useEffect(() => {
    if (!enableBgAutoplay) return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // data-saver check
    const dataSaver = (navigator as any).connection?.saveData === true;
    if (isMobile || prefersReduced || dataSaver) return;

    const t = setTimeout(() => setBgMode(true), 3000);
    return () => clearTimeout(t);
  }, [enableBgAutoplay]);

  /* ── Keyboard controls ────────────────────────────────── */
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as Element)?.tagName)) return;
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.key === 'm' || e.key === 'M') toggleMute();
      if (e.key === 'f' || e.key === 'F') handleFullscreen();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, isMuted]);

  /* ── Auto-hide controls after 3 s of inactivity ──────── */
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [resetControlsTimer]);

  /* ── Player control functions ─────────────────────────── */
  const postYTCommand = (func: string, args: any[] = []) => {
    const iframe = iframeContainerRef.current?.querySelector('iframe') as HTMLIFrameElement | null;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      try { playerRef.current?.pauseVideo?.(); } catch {}
      postYTCommand('pauseVideo');
      setIsPlaying(false);
    } else {
      try { playerRef.current?.playVideo?.(); } catch {}
      postYTCommand('playVideo');
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      try { playerRef.current?.unMute?.(); } catch {}
      postYTCommand('unMute');
      setIsMuted(false);
    } else {
      try { playerRef.current?.mute?.(); } catch {}
      postYTCommand('mute');
      setIsMuted(true);
    }
  };

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const switchVideo = (idx: number) => {
    if (idx === activeIdx) return;
    setActiveIdx(idx);
    setBgMode(false);
  };

  const watchAgain = () => {
    setEnded(false);
    setActiveIdx(activeIdx); // retrigger effect via key trick below
    if (playerRef.current) {
      try { playerRef.current.seekTo(0); playerRef.current.playVideo(); } catch {}
    }
  };

  const nextVideo = () => {
    const nextIdx = (activeIdx + 1) % sorted.length;
    switchVideo(nextIdx);
  };

  /* ─── Unmute button (bg mode) ──────────────────────── */
  const exitBgMode = () => {
    setBgMode(false);
    if (playerRef.current) {
      try { playerRef.current.unMute(); } catch {}
    }
    setIsMuted(false);
  };

  /* ─── Render ──────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className="relative w-full"
      onMouseMove={resetControlsTimer}
      onTouchStart={resetControlsTimer}
    >
      {/* ── 16:9 Aspect-ratio shell (no layout shift) ── */}
      <div className="relative w-full aspect-video bg-black overflow-hidden">

        {/* ── Skeleton loader ─────────────────────────── */}
        <AnimatePresence>
          {!playerReady && (
            <motion.div
              key="skeleton"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex items-center justify-center bg-black"
            >
              {backdropUrl && (
                <img
                  src={backdropUrl}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full border-4 border-purple-500/40 border-t-purple-500 animate-spin" />
                <span className="text-slate-400 text-xs">Loading player…</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Error / embed blocked fallback ──────────── */}
        <AnimatePresence>
          {hasError && playerReady && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gradient-to-br from-[#0d0d14] via-[#1a0a2e] to-[#0d0d14] px-6 text-center gap-5"
            >
              {(backdropUrl || posterUrl) && (
                <div
                  className="absolute inset-0 opacity-10 bg-cover bg-center"
                  style={{ backgroundImage: `url(${backdropUrl || posterUrl})` }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-base">Embedding Restricted</h3>
                  <p className="text-slate-400 text-sm max-w-xs mt-1">
                    The video owner has disabled in-app playback.
                  </p>
                </div>
                <a
                  href={youtubeWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all hover:scale-105 active:scale-95"
                >
                  <Play size={16} fill="white" />
                  <span>Watch on YouTube</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── "Ended" overlay ─────────────────────────── */}
        <AnimatePresence>
          {ended && !hasError && (
            <motion.div
              key="ended"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-4"
            >
              <button
                onClick={watchAgain}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-bold text-sm hover:bg-slate-200 transition-all hover:scale-105 active:scale-95"
                aria-label="Watch again"
              >
                <RotateCcw size={16} />
                Watch Again
              </button>

              {sorted.length > 1 && (
                <button
                  onClick={nextVideo}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all"
                  aria-label={`Play next: ${sorted[(activeIdx + 1) % sorted.length].title || TYPE_LABEL[sorted[(activeIdx + 1) % sorted.length].type] || 'Next Video'}`}
                >
                  <ChevronRight size={15} />
                  {sorted[(activeIdx + 1) % sorted.length].title
                    || TYPE_LABEL[sorted[(activeIdx + 1) % sorted.length].type]
                    || 'Next Video'}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── YT IFrame container (fills the shell) ───── */}
        <div
          ref={iframeContainerRef}
          className="absolute inset-0 z-10 [&>iframe]:w-full [&>iframe]:h-full [&>div]:w-full [&>div]:h-full"
          aria-label={`${movieTitle} video player`}
        />

        {/* ── Floating controls bar ────────────────────── */}
        <AnimatePresence>
          {!hasError && playerReady && (
            <motion.div
              key="controls"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: showControls ? 1 : 0, y: showControls ? 0 : 8 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-0 left-0 right-0 z-30 px-4 pb-3 pt-8 bg-gradient-to-t from-black/80 to-transparent"
              aria-label="Video controls"
            >
              <div className="flex items-center justify-between gap-3">
                {/* Left: Play/Pause + Mute */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {isPlaying
                      ? <Pause size={16} className="text-white" fill="white" />
                      : <Play size={16} className="text-white ml-0.5" fill="white" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {isMuted
                      ? <VolumeX size={16} className="text-white" />
                      : <Volume2 size={16} className="text-white" />}
                  </button>
                </div>

                {/* Center: Video title */}
                <div className="flex-1 text-center">
                  <span className="text-xs text-slate-300 font-medium truncate block max-w-[200px] mx-auto">
                    {activeVideo?.title
                      || `${movieTitle} — ${TYPE_LABEL[activeVideo?.type] || 'Video'}`}
                  </span>
                </div>

                {/* Right: Fullscreen + Close */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleFullscreen}
                    aria-label="Toggle fullscreen"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 border border-white/15 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <Maximize size={15} className="text-white" />
                  </button>

                  <button
                    onClick={onClose}
                    aria-label="Close player"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-red-500/60 border border-white/15 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <X size={16} className="text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bg-mode: unmute button ──────────────────── */}
        {bgMode && playerReady && !hasError && (
          <button
            onClick={exitBgMode}
            aria-label="Unmute and play with audio"
            className="absolute bottom-4 right-4 z-30 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/20 text-white text-xs font-medium backdrop-blur-sm hover:bg-black/80 transition"
          >
            <VolumeX size={13} />
            Unmute
          </button>
        )}
      </div>

      {/* ── Video type tabs (Teaser | Trailer | Clip | Song) */}
      {sorted.length > 1 && (
        <div
          className="flex items-center gap-2 mt-3 flex-wrap"
          role="tablist"
          aria-label="Video types"
        >
          {sorted.map((v, idx) => (
            <button
              key={`${v.type}-${idx}`}
              role="tab"
              aria-selected={idx === activeIdx}
              onClick={() => switchVideo(idx)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all',
                idx === activeIdx
                  ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-900/40'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/25',
              )}
            >
              {v.title || TYPE_LABEL[v.type] || v.type}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
