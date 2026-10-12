import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Loader2 } from 'lucide-react';

export interface TrailerModalProps {
  videoId: string;
  onClose: () => void;
  title?: string;
}

export default function TrailerModal({ videoId, onClose, title }: TrailerModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll while modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

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
  const embedUrl = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1`;

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
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 text-slate-400 gap-2">
                <Loader2 size={32} className="animate-spin text-purple-500" />
                <span className="text-xs">Loading trailer stream...</span>
              </div>
            )}

            <iframe
              src={embedUrl}
              title={title ? `${title} Trailer` : 'Movie Trailer'}
              onLoad={() => setIsLoading(false)}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="w-full h-full border-0"
            />
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
