import type { Sentiment } from '../types';
import { getSentimentEmoji, getSentimentLabel } from '../lib/utils';
import { cn } from '../lib/utils';

interface SentimentBadgeProps {
  sentiment: Sentiment;
  size?: 'sm' | 'md' | 'lg';
  showEmoji?: boolean;
}

export default function SentimentBadge({ sentiment, size = 'md', showEmoji = true }: SentimentBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={cn(`badge-${sentiment}`, sizeClasses[size])}
      aria-label={`Sentiment: ${getSentimentLabel(sentiment)}`}
    >
      {showEmoji && <span aria-hidden="true">{getSentimentEmoji(sentiment)}</span>}
      <span>{getSentimentLabel(sentiment).toUpperCase()}</span>
    </span>
  );
}
