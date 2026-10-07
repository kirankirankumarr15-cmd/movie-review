import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Search, Filter } from 'lucide-react';
import type { Review, Sentiment } from '../types';
import { reviewsApi } from '../services/api';
import ReviewCard from '../components/ReviewCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function History() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingId, setIsDeletingId] = useState<number | null>(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState<Sentiment | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const loadReviews = async () => {
    try {
      const data = await reviewsApi.getAll({
        search: search.trim() || undefined,
        sentiment: sentimentFilter !== 'all' ? sentimentFilter : undefined,
        sort: sortOrder
      });
      setReviews(data.reviews);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const debounce = setTimeout(loadReviews, 300);
    return () => clearTimeout(debounce);
  }, [search, sentimentFilter, sortOrder]);

  const handleDelete = async (id: number) => {
    setIsDeletingId(id);
    try {
      await reviewsApi.delete(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Review deleted.');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete review.');
    } finally {
      setIsDeletingId(null);
    }
  };

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header & Controls */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center gap-2">
            <HistoryIcon size={24} className="text-purple-400" />
            <h1 className={cn('font-display text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              Review History
            </h1>
          </div>
          
          <div className={cn(
            'flex flex-col sm:flex-row gap-3 p-4 rounded-xl border',
            isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
          )}>
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className={cn('absolute left-3 top-1/2 -translate-y-1/2', isDark ? 'text-slate-500' : 'text-slate-400')} />
              <input
                type="text"
                placeholder="Search reviews or movie names..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-9"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <select
                value={sentimentFilter}
                onChange={e => setSentimentFilter(e.target.value as any)}
                className="input sm:w-auto"
                aria-label="Filter by sentiment"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
              
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as any)}
                className="input sm:w-auto"
                aria-label="Sort order"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingState message="Loading your history..." />
        ) : reviews.length > 0 ? (
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {reviews.map(review => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onDelete={handleDelete}
                  isDeleting={isDeletingId === review.id}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <EmptyState
            icon={Filter}
            title={search || sentimentFilter !== 'all' ? 'No matches found' : 'No history yet'}
            description={
              search || sentimentFilter !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'Analyze your first movie review to start building your history.'
            }
          />
        )}
      </div>
    </main>
  );
}
