import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Film, Calendar, Star, TrendingUp, Trash2 } from 'lucide-react';
import type { Review } from '../types';
import { formatDateTime } from '../lib/utils';
import SentimentBadge from './SentimentBadge';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface ReviewDetailModalProps {
  review: Review | null;
  onClose: () => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
}

const SENTIMENT_COLOR = {
  positive: { bar: '#22c55e', glow: 'rgba(34,197,94,0.15)', text: '#4ade80' },
  neutral:  { bar: '#f59e0b', glow: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
  negative: { bar: '#ef4444', glow: 'rgba(239,68,68,0.15)',  text: '#f87171' },
};

const SENTIMENT_EMOJI = {
  positive: '😊',
  neutral:  '😐',
  negative: '😞',
};

export default function ReviewDetailModal({ review, onClose, onDelete, isDeleting }: ReviewDetailModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  if (!review) return null;

  const colors = SENTIMENT_COLOR[review.sentiment];
  const emoji  = SENTIMENT_EMOJI[review.sentiment];

  // Scores as percentages for display
  const posPercent = Math.round(review.positive_score * 100);
  const neuPercent = Math.round(review.neutral_score  * 100);
  const negPercent = Math.round(review.negative_score * 100);

  const handleReanalyze = () => {
    onClose();
    navigate('/analyzer', { state: { defaultMovie: review.movie_name, defaultReview: review.review_text } });
  };

  return (
    <AnimatePresence>
      {review && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              'fixed z-50 inset-x-4 top-1/2 -translate-y-1/2 mx-auto max-w-xl w-full rounded-2xl border shadow-2xl overflow-hidden',
              isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
            )}
            role="dialog"
            aria-modal="true"
            aria-label={`Review detail for ${review.movie_name}`}
          >
            {/* Colored top accent bar */}
            <div className="h-1 w-full" style={{ background: colors.bar }} />

            {/* Header */}
            <div className={cn('flex items-center justify-between px-6 py-4 border-b', isDark ? 'border-[#2a2a3d]' : 'border-slate-100')}>
              <div className="flex items-center gap-2.5">
                <Film size={16} className="text-purple-400" />
                <span className={cn('font-display font-bold text-lg truncate max-w-[240px]', isDark ? 'text-white' : 'text-slate-900')}>
                  {review.movie_name || 'Untitled Movie'}
                </span>
              </div>
              <button
                onClick={onClose}
                className={cn('p-1.5 rounded-lg transition-colors', isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500')}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin">

              {/* Date + Sentiment badge */}
              <div className="flex items-center justify-between">
                <p className={cn('text-xs flex items-center gap-1.5', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  <Calendar size={12} />
                  <time dateTime={review.created_at}>{formatDateTime(review.created_at)}</time>
                </p>
                <SentimentBadge sentiment={review.sentiment} size="sm" />
              </div>

              {/* Compound score hero */}
              <div
                className="rounded-xl p-4 text-center"
                style={{ background: colors.glow, border: `1px solid ${colors.bar}30` }}
              >
                <div className="text-4xl mb-1" aria-hidden>{emoji}</div>
                <div className="text-3xl font-display font-bold mb-0.5" style={{ color: colors.text }}>
                  {review.compound_score >= 0 ? '+' : ''}{review.compound_score.toFixed(3)}
                </div>
                <div className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
                  VADER Compound Score
                </div>
              </div>

              {/* Breakdown bars */}
              <div className="space-y-3">
                <h3 className={cn('text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  <TrendingUp size={12} /> Sentiment Breakdown
                </h3>
                {[
                  { label: 'Positive', value: posPercent, color: '#22c55e' },
                  { label: 'Neutral',  value: neuPercent, color: '#f59e0b' },
                  { label: 'Negative', value: negPercent, color: '#ef4444' },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{row.label}</span>
                      <span className="font-mono font-semibold" style={{ color: row.color }}>{row.value}%</span>
                    </div>
                    <div className={cn('h-2 rounded-full overflow-hidden', isDark ? 'bg-[#2a2a3d]' : 'bg-slate-100')}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${row.value}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ backgroundColor: row.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Full review text */}
              <div>
                <h3 className={cn('text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  <Star size={12} /> Your Review
                </h3>
                <div className={cn('rounded-xl border p-4 text-sm leading-relaxed', isDark ? 'bg-[#16161f] border-[#2a2a3d] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700')}>
                  {review.review_text}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className={cn('flex items-center justify-between gap-3 px-6 py-4 border-t', isDark ? 'border-[#2a2a3d]' : 'border-slate-100')}>
              <button
                onClick={() => { onDelete(review.id); onClose(); }}
                disabled={isDeleting}
                className="btn-danger text-xs py-2 px-4"
              >
                <Trash2 size={12} /> {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
              <button
                onClick={handleReanalyze}
                className="btn-primary text-xs py-2 px-5"
              >
                <Sparkles size={13} /> Re-Analyze This Review
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
