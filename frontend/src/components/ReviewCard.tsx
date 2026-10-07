import { motion } from 'framer-motion';
import { Trash2, Film } from 'lucide-react';
import type { Review } from '../types';
import { formatDateTime, truncateText } from '../lib/utils';
import SentimentBadge from './SentimentBadge';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

interface ReviewCardProps {
  review: Review;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export default function ReviewCard({ review, onDelete, isDeleting }: ReviewCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className={cn(
        'rounded-xl border p-5 transition-all duration-200 hover:-translate-y-0.5',
        isDark
          ? 'bg-[#1a1a25] border-[#2a2a3d] hover:border-[#3d3d5c] hover:shadow-card-hover'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
      )}
      aria-label={`Review for ${review.movie_name || 'Unknown movie'}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Film size={13} className="text-purple-400 flex-shrink-0" aria-hidden />
            <span className={cn('font-semibold text-sm truncate', isDark ? 'text-slate-200' : 'text-slate-800')}>
              {review.movie_name || <span className="italic opacity-50">No title</span>}
            </span>
          </div>
          <p className={cn('text-xs', isDark ? 'text-slate-600' : 'text-slate-400')}>
            <time dateTime={review.created_at}>{formatDateTime(review.created_at)}</time>
          </p>
        </div>
        <SentimentBadge sentiment={review.sentiment} size="sm" />
      </div>

      <p className={cn('text-sm leading-relaxed mb-4', isDark ? 'text-slate-400' : 'text-slate-600')}>
        {truncateText(review.review_text, 150)}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={cn('text-xs', isDark ? 'text-slate-600' : 'text-slate-400')}>
            Score:{' '}
            <span className="font-mono font-semibold" style={{
              color: review.sentiment === 'positive' ? '#4ade80' : review.sentiment === 'negative' ? '#f87171' : '#fbbf24'
            }}>
              {review.compound_score >= 0 ? '+' : ''}{review.compound_score.toFixed(2)}
            </span>
          </span>
        </div>
        <button
          onClick={() => onDelete(review.id)}
          disabled={isDeleting}
          className="btn-danger text-xs py-1 px-3"
          aria-label={`Delete review for ${review.movie_name || 'this movie'}`}
        >
          <Trash2 size={12} aria-hidden />
          {isDeleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </motion.article>
  );
}
