import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Loader2, PlayCircle, AlertTriangle } from 'lucide-react';

export interface TrailerModalProps {
  videoId: string;
  onClose: () => void;
  title?: string;
}

export default function TrailerModal({ videoId, onClose, title }: TrailerModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Listen for YouTube player errors via postMessage (Error 153 = embedding disabled)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube-nocookie.com' && event.origin !== 'https://www.youtube.com') return;
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data?.event === 'onError' || data?.info === 153 || data?.info === 150 || data?.info === 101) {
          setHasError(true);
          setIsLoading(false);
        }
      } catch {
        // ignore parse errors
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Fallback: if still loading after 8s, it's likely blocked — show error UI
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        setHasError(true);
        setIsLoading(false);
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Trap focus inside modal & handle Escape key
  useEffect(() => {
    // Focus the close button on open
    closeButtonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  // enablejsapi=1 allows postMessage error detection
  const embedUrl = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;

  const handleIframeLoad = () => {
    // Give player 1.5s to report errors via postMessage before hiding loader
    setTimeout(() => {
      if (!hasError) setIsLoading(false);
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-label={title ? `${title} Trailer` : 'Movie Trailer'}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-4xl bg-[#0d0d14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#12121c]">
            <div className="flex items-center gap-2 min-w-0 pr-4">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-sm sm:text-base font-semibold text-white truncate font-display">
                {title ? `${title} — Official Trailer` : 'Official Trailer'}
              </h2>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close trailer"
              className="p-1.5 sm:p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* 16:9 Video Player Container */}
          <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
            {/* Loading State */}
            {isLoading && !hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 text-slate-400 gap-2">
                <Loader2 size={32} className="animate-spin text-purple-500" />
                <span className="text-xs">Loading trailer stream...</span>
              </div>
            )}

            {/* Embedding Blocked Fallback UI */}
            {hasError ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#0d0d14] via-[#1a0a2e] to-[#0d0d14] z-10 px-6 text-center"
              >
                {/* Blurred thumbnail background */}
                <div
                  className="absolute inset-0 opacity-10 bg-cover bg-center"
                  style={{ backgroundImage: `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)` }}
                />
                <div className="relative z-10 flex flex-col items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                    <AlertTriangle size={28} className="text-red-400" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-white font-semibold text-lg">Embedding Restricted</h3>
                    <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
                      The video owner has disabled in-app playback. Watch it directly on YouTube.
                    </p>
                  </div>
                  <a
                    href={youtubeWatchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-red-900/40 hover:shadow-red-800/50 hover:scale-105 active:scale-95"
                  >
                    <PlayCircle size={18} />
                    <span>Watch on YouTube</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              </motion.div>
            ) : (
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title={title ? `${title} Trailer` : 'Movie Trailer'}
                onLoad={handleIframeLoad}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="w-full h-full border-0"
              />
            )}
          </div>

          {/* Footer Bar with Fallback link */}
          <div className="px-4 sm:px-6 py-2.5 bg-[#12121c] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200 font-mono text-[11px]">Esc</kbd> or click outside to close</span>
            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors hover:underline"
            >
              <span>Watch on YouTube</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
