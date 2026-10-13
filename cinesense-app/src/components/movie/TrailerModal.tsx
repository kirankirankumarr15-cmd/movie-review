"use client";

import { useEffect, useRef, useState } from "react";
import { X, ExternalLink, Play, AlertCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  youtubeId?: string;
  movieTitle: string;
  triggerButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export default function TrailerModal({
  isOpen,
  onClose,
  youtubeId,
  movieTitle,
  triggerButtonRef,
}: TrailerModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [embedError, setEmbedError] = useState(false);

  // Lock body scroll and handle focus trap + Esc key
  useEffect(() => {
    if (!isOpen) return;

    // Reset error state
    setEmbedError(false);

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus close button on open
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      // Return focus to trigger button
      triggerButtonRef?.current?.focus();
    };
  }, [isOpen, onClose, triggerButtonRef]);

  if (!isOpen || !youtubeId) return null;

  const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
  const fallbackUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-md"
        role="dialog"
        aria-modal="true"
        aria-label={`Official Trailer: ${movieTitle}`}
        onClick={onClose}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#171724]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <h3 className="text-base md:text-lg font-semibold text-white tracking-wide truncate">
                {movieTitle} — Official Trailer
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={fallbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                title="Watch on YouTube (External)"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Watch on YouTube</span>
              </a>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close trailer modal"
                className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Video Container (16:9 Aspect Ratio) */}
          <div className="relative w-full aspect-video bg-black flex items-center justify-center">
            {!embedError ? (
              <iframe
                id="cinesense-trailer-iframe"
                src={embedUrl}
                title={`Official trailer for ${movieTitle}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
                onError={() => setEmbedError(true)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="w-12 h-12 text-amber-400 mb-3" />
                <p className="text-white font-medium mb-1">Trailer embedding is restricted for this video.</p>
                <p className="text-sm text-slate-400 mb-4">You can watch the official video directly on YouTube.</p>
                <a
                  href={fallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-colors shadow-lg shadow-purple-600/30"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open on YouTube
                </a>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-3 bg-[#0d0d14] flex items-center justify-between text-xs text-slate-400">
            <span>Powered by official YouTube embed player (privacy-enhanced)</span>
            <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200">Esc</kbd> to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
