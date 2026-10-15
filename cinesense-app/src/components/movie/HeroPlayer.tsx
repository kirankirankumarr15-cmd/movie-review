'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Movie, MovieVideo } from '@/lib/db/types';

interface HeroPlayerProps {
  movie: Movie;
  videos: MovieVideo[];
  onClose?: () => void;
  enableAutoPreview?: boolean;
}

export function HeroPlayer({
  movie,
  videos,
  onClose,
  enableAutoPreview = false
}: HeroPlayerProps) {
  // Order videos: Teaser first, then Trailer, Clip, Song
  const sortedVideos = React.useMemo(() => {
    const orderPriority: Record<string, number> = {
      teaser: 1,
      trailer: 2,
      clip: 3,
      song: 4
    };
    return [...videos].sort((a, b) => {
      const pA = orderPriority[a.type] || 5;
      const pB = orderPriority[b.type] || 5;
      return pA - pB;
    });
  }, [videos]);

  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasEnded, setHasEnded] = useState<boolean>(false);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState<boolean>(false);
  const [hasEmbedError, setHasEmbedError] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentVideo: MovieVideo | undefined = sortedVideos[activeVideoIndex];

  // YouTube postMessage controller helper
  const sendYtCommand = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func,
          args
        }),
        '*'
      );
    }
  }, []);

  const handlePlay = useCallback(() => {
    if (!currentVideo) return;
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    setIsLoadingPlayer(true);
    setHasEmbedError(false);
    setHasEnded(false);
    setIsPaused(false);
    setIsPlaying(true);

    // Guaranteed timeout to dismiss loading overlay within 1s even if iframe event is delayed
    setTimeout(() => {
      setIsLoadingPlayer(false);
    }, 900);
  }, [currentVideo]);

  const handleClose = useCallback(() => {
    setIsPlaying(false);
    setIsPaused(false);
    setHasEnded(false);
    setIsLoadingPlayer(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    // Return focus to play button
    setTimeout(() => {
      playButtonRef.current?.focus();
    }, 50);
    if (onClose) onClose();
  }, [onClose]);

  const togglePause = useCallback(() => {
    if (isPaused) {
      sendYtCommand('playVideo');
      setIsPaused(false);
    } else {
      sendYtCommand('pauseVideo');
      setIsPaused(true);
    }
  }, [isPaused, sendYtCommand]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      sendYtCommand('unMute');
      setIsMuted(false);
    } else {
      sendYtCommand('mute');
      setIsMuted(true);
    }
  }, [isMuted, sendYtCommand]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(() => {});
    }
  }, []);

  // Keyboard accessibility: Space (Play/Pause), M (Mute), F (Fullscreen), Esc (Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.code === 'Space') {
        e.preventDefault();
        togglePause();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, handleClose, togglePause, toggleMute, toggleFullscreen]);

  // Single player management: Pause video when scrolled out of view (IntersectionObserver)
  useEffect(() => {
    if (!containerRef.current || !isPlaying) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting && !isPaused) {
            sendYtCommand('pauseVideo');
            setIsPaused(true);
          }
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isPlaying, isPaused, sendYtCommand]);

  // Pause video when tab/document is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying && !isPaused) {
        sendYtCommand('pauseVideo');
        setIsPaused(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying, isPaused, sendYtCommand]);

  // Listen to postMessage events from YouTube IFrame Player
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          try {
            data = JSON.parse(data);
          } catch {
            return;
          }
        }
        if (!data || typeof data !== 'object') return;

        if (data.event === 'onReady' || data.event === 'initialDelivery') {
          setIsLoadingPlayer(false);
        } else if (data.event === 'infoDelivery' && data.info) {
          setIsLoadingPlayer(false);
          if (data.info.playerState === 0) { // 0 = YT.PlayerState.ENDED
            setHasEnded(true);
            setIsPlaying(false);
          } else if (data.info.playerState === 1) { // 1 = PLAYING
            setIsPaused(false);
          } else if (data.info.playerState === 2) { // 2 = PAUSED
            setIsPaused(true);
          }
        } else if (data.event === 'onError') {
          setHasEmbedError(true);
          setIsLoadingPlayer(false);
        }
      } catch {
        // Not a valid message, ignore
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Desktop auto-preview feature flag after 3 seconds
  useEffect(() => {
    if (!enableAutoPreview || isPlaying || !currentVideo) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isSaveData = (navigator as any).connection?.saveData;
    const isDesktop = window.innerWidth >= 1024;

    if (isDesktop && !prefersReducedMotion && !isSaveData) {
      previewTimerRef.current = setTimeout(() => {
        setIsMuted(true);
        setIsPlaying(true);
      }, 3000);
    }

    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [enableAutoPreview, isPlaying, currentVideo]);

  const selectVideo = (index: number) => {
    setActiveVideoIndex(index);
    setHasEnded(false);
    setHasEmbedError(false);
    if (isPlaying) {
      setIsLoadingPlayer(true);
    }
  };

  const backdropUrl = movie.backdrop_path 
    ? (movie.backdrop_path.startsWith('http') ? movie.backdrop_path : `https://image.tmdb.org/t/p/original${movie.backdrop_path}`)
    : (currentVideo ? `https://img.youtube.com/vi/${currentVideo.youtube_id}/maxresdefault.jpg` : '/posters/placeholder.jpg');

  const posterUrl = movie.poster_path
    ? (movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`)
    : (currentVideo ? `https://img.youtube.com/vi/${currentVideo.youtube_id}/hqdefault.jpg` : '/posters/placeholder.jpg');

  return (
    <div
      ref={containerRef}
      id="movie-hero-player-container"
      className="relative w-full aspect-video md:aspect-[21/9] min-h-[380px] max-h-[640px] bg-black overflow-hidden rounded-2xl shadow-2xl transition-all duration-500"
    >
      {/* 1. In-Hero Video Player View (Plays directly in the hero banner) */}
      {isPlaying && currentVideo && (
        <div className="absolute inset-0 z-30 w-full h-full bg-black flex items-center justify-center animate-fade-in">
          {/* Loading Skeleton */}
          {isLoadingPlayer && (
            <div className="absolute inset-0 z-10 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 pointer-events-none transition-opacity duration-300 animate-pulse">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-zinc-300 text-sm font-semibold tracking-wide">
                Loading official {currentVideo.type}...
              </span>
            </div>
          )}

          {/* Embed Error / Blocked State */}
          {hasEmbedError ? (
            <div className="absolute inset-0 z-20 bg-zinc-950/95 flex flex-col items-center justify-center p-6 text-center">
              <span className="text-4xl mb-3">⚠️</span>
              <h3 className="text-lg font-bold text-white mb-1">
                Direct Embed Restricted by YouTube
              </h3>
              <p className="text-xs text-zinc-400 max-w-md mb-4">
                This official video restricts in-site playback on external domains. You can watch it directly on the official channel.
              </p>
              <div className="flex gap-3">
                <a
                  href={`https://www.youtube.com/watch?v=${currentVideo.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2"
                >
                  Watch on YouTube ↗
                </a>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-sm"
                >
                  Return to Overview
                </button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              id="hero-youtube-iframe"
              src={`https://www.youtube-nocookie.com/embed/${currentVideo.youtube_id}?enablejsapi=1&autoplay=1&mute=${isMuted ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`}
              title={currentVideo.title || `${movie.title} ${currentVideo.type}`}
              className="w-full h-full border-0"
              onLoad={() => setIsLoadingPlayer(false)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}

          {/* Floating Player Control Bar */}
          <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
            {/* Play / Pause */}
            <button
              onClick={togglePause}
              aria-label={isPaused ? "Resume video" : "Pause video"}
              className="p-1.5 text-zinc-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="Space to play/pause"
            >
              {isPaused ? (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              ) : (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              )}
            </button>

            {/* Mute / Unmute */}
            <button
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              className="p-1.5 text-zinc-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="M to mute/unmute"
            >
              {isMuted ? (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
              ) : (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
              )}
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              className="p-1.5 text-zinc-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              title="F for fullscreen"
            >
              {isFullscreen ? (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-14v3h3v2h-5V5h2z" /></svg>
              ) : (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" /></svg>
              )}
            </button>

            <div className="w-[1px] h-4 bg-white/20 mx-0.5" />

            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Close trailer and return to backdrop"
              className="p-1.5 text-zinc-300 hover:text-white hover:bg-red-600/80 rounded-full transition-all"
              title="Esc to close"
            >
              <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 2. Finished Video "Watch Again" Overlay */}
      {hasEnded && (
        <div className="absolute inset-0 z-30 bg-black/90 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <span className="text-amber-400 text-3xl mb-2">🎬</span>
          <h3 className="text-xl font-bold text-white mb-2">Video Finished</h3>
          <p className="text-zinc-400 text-sm max-w-sm mb-5">
            You watched {currentVideo?.title || 'the trailer'}.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlay}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" /></svg>
              Watch Again
            </button>
            {sortedVideos.length > 1 && (
              <button
                onClick={() => {
                  const nextIdx = (activeVideoIndex + 1) % sortedVideos.length;
                  selectVideo(nextIdx);
                  handlePlay();
                }}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl text-sm transition-all"
              >
                Next Video ({sortedVideos[(activeVideoIndex + 1) % sortedVideos.length]?.type})
              </button>
            )}
            <button
              onClick={handleClose}
              className="px-4 py-2.5 bg-transparent hover:bg-white/10 text-zinc-300 rounded-xl text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* 3. Default Hero Backdrop View (Crossfades when video starts) */}
      <div className={`relative w-full h-full transition-opacity duration-700 ${isPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Backdrop Image */}
        <div className="absolute inset-0">
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-top opacity-40 brightness-75 filter blur-[1px] md:blur-none transition-all duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>

        {/* Hero Content: Poster, Title, Meta, and Centered Play Button */}
        <div className="relative z-10 w-full h-full p-6 md:p-10 flex flex-col justify-end">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 max-w-5xl">
            {/* Poster Thumbnail */}
            <div className="relative w-24 h-36 md:w-36 md:h-52 rounded-xl overflow-hidden shadow-2xl border border-white/10 shrink-0 hidden sm:block">
              <Image
                src={posterUrl}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 96px, 144px"
                className="object-cover"
              />
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {movie.language === 'kn' ? 'Sandalwood (Kannada)' :
                   movie.language === 'hi' ? 'Bollywood (Hindi)' :
                   movie.language === 'te' ? 'Tollywood (Telugu)' :
                   movie.language === 'ta' ? 'Kollywood (Tamil)' :
                   movie.language === 'ml' ? 'Mollywood (Malayalam)' : 'Hollywood (English)'}
                </span>
                {movie.age_rating && (
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs font-bold border border-zinc-700">
                    {movie.age_rating}
                  </span>
                )}
                <span className="text-xs text-zinc-400 font-medium">
                  {movie.year} {movie.runtime_minutes ? `• ${movie.runtime_minutes}m` : ''}
                </span>
              </div>

              <h1 className="text-2xl md:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                {movie.title}
              </h1>

              {movie.director && (
                <p className="text-xs md:text-sm text-zinc-300 font-medium">
                  Directed by <span className="text-amber-400 font-semibold">{movie.director}</span>
                </p>
              )}

              {/* Play Button & Multi-video Chips */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                {currentVideo ? (
                  <button
                    ref={playButtonRef}
                    id="hero-play-button"
                    onClick={handlePlay}
                    aria-label={`Play ${currentVideo.type} directly on screen`}
                    className="group px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 fill-black ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <span className="tracking-wide">
                      Play {currentVideo.type.toUpperCase()}
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 py-2">
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + ' official trailer')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-red-600/25 transition-all transform hover:scale-105 active:scale-95"
                    >
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                      <span>Search Trailer on YouTube ↗</span>
                    </a>
                  </div>
                )}

                {/* Multiple Videos Tabs/Chips (Teaser | Trailer | Clip | Song) */}
                {sortedVideos.length > 1 && (
                  <div className="flex items-center gap-1.5 bg-zinc-900/80 backdrop-blur-md p-1 rounded-xl border border-white/10">
                    {sortedVideos.map((vid, idx) => (
                      <button
                        key={vid.youtube_id || idx}
                        onClick={() => selectVideo(idx)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                          activeVideoIndex === idx
                            ? 'bg-amber-500 text-black shadow-sm font-bold'
                            : 'text-zinc-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {vid.type}
                        {vid.language && vid.language !== movie.language && ` (${vid.language})`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
