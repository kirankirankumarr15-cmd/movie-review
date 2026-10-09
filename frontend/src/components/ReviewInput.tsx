import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Film,  Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../hooks/useTheme';

interface ReviewInputProps {
  onAnalyze: (reviewText: string, movieName: string) => void;
  isLoading: boolean;
  defaultMovie?: string;
}

const EXAMPLES = [
  {
    label: 'Positive',
    text: 'Absolutely loved this movie. The performances were outstanding, the cinematography was breathtaking, and the story kept me hooked until the very end.',
    color: 'green',
  },
  {
    label: 'Neutral',
    text: 'The movie was okay. Some parts were interesting and well-directed, while others felt slow and dragged on a bit too long.',
    color: 'amber',
  },
  {
    label: 'Negative',
    text: 'The story was completely predictable, the acting felt weak, and the pacing was painfully slow. A disappointing experience overall.',
    color: 'red',
  },
] as const;

const MAX_CHARS = 1000;

export default function ReviewInput({ onAnalyze, isLoading, defaultMovie = '' }: ReviewInputProps) {
  const [reviewText, setReviewText] = useState('');
  const [movieName, setMovieName] = useState(defaultMovie);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleAnalyze = () => {
    if (!reviewText.trim()) {
      setError('Review cannot be empty.');
      textareaRef.current?.focus();
      return;
    }
    if (reviewText.length > MAX_CHARS) {
      setError(`Review must be ${MAX_CHARS} characters or fewer.`);
      return;
    }
    setError('');
    onAnalyze(reviewText.trim(), movieName.trim());
  };

  const handleClear = () => {
    setReviewText('');
    setMovieName('');
    setError('');
    textareaRef.current?.focus();
  };

  useEffect(() => {
    if (defaultMovie) {
      setMovieName(defaultMovie);
    }
  }, [defaultMovie]);

  const loadExample = (text: string) => {
    setReviewText(text);
    setError('');
    textareaRef.current?.focus();
  };

  const charsRemaining = MAX_CHARS - reviewText.length;
  const isOverLimit = reviewText.length > MAX_CHARS;

  return (
    <div className="space-y-4">
      {/* Movie Name */}
      <div>
        <label htmlFor="movie-name" className={cn('label', isDark ? 'text-slate-300' : 'text-slate-700')}>
          <Film size={14} className="inline mr-1.5 -mt-0.5" aria-hidden />
          Movie Name <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>(optional)</span>
        </label>
        <input
          id="movie-name"
          type="text"
          value={movieName}
          onChange={e => setMovieName(e.target.value)}
          placeholder="e.g. Inception, Interstellar, Dune..."
          className="input"
          disabled={isLoading}
          maxLength={200}
          autoComplete="off"
        />
      </div>

      {/* Review Textarea */}
      <div>
        <label htmlFor="review-text" className={cn('label', isDark ? 'text-slate-300' : 'text-slate-700')}>
          Your Review <span className="text-red-400" aria-hidden>*</span>
        </label>
        <textarea
          id="review-text"
          ref={textareaRef}
          value={reviewText}
          onChange={e => {
            setReviewText(e.target.value);
            if (error) setError('');
          }}
          placeholder="Write your movie review here... Share what you loved, hated, or felt about the film."
          rows={7}
          className={cn('input resize-none', error && 'border-red-500 focus:ring-red-500/30')}
          disabled={isLoading}
          aria-describedby={error ? 'review-error' : 'review-hint'}
          aria-invalid={!!error}
          aria-required="true"
          maxLength={MAX_CHARS + 100} // soft limit via JS
        />
        <div className="flex items-center justify-between mt-1.5">
          <div>
            {error && (
              <p id="review-error" role="alert" className="text-xs text-red-400 flex items-center gap-1">
                <span aria-hidden>⚠</span> {error}
              </p>
            )}
            {!error && (
              <p id="review-hint" className={cn('text-xs', isDark ? 'text-slate-600' : 'text-slate-400')}>
                Required • Max {MAX_CHARS} characters
              </p>
            )}
          </div>
          <span className={cn(
            'text-xs font-mono tabular-nums',
            isOverLimit ? 'text-red-400' : isDark ? 'text-slate-600' : 'text-slate-400'
          )} aria-live="polite">
            {charsRemaining} left
          </span>
        </div>
      </div>

      {/* Example Buttons */}
      <div>
        <p className={cn('text-xs font-medium mb-2', isDark ? 'text-slate-500' : 'text-slate-400')}>
          Try an example:
        </p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex.label}
              onClick={() => loadExample(ex.text)}
              disabled={isLoading}
              className={cn(
                'text-xs px-3 py-1.5 rounded-lg border font-medium transition-all duration-150 active:scale-95 disabled:opacity-50',
                ex.color === 'green'
                  ? 'border-green-500/30 text-green-400 hover:bg-green-500/10 bg-green-500/5'
                  : ex.color === 'amber'
                    ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10 bg-amber-500/5'
                    : 'border-red-500/30 text-red-400 hover:bg-red-500/10 bg-red-500/5'
              )}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={handleClear}
          disabled={isLoading || (!reviewText && !movieName)}
          className={cn(
            'btn-secondary flex-shrink-0',
            isDark ? '' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
          )}
          aria-label="Clear review"
        >
          <RotateCcw size={14} aria-hidden /> Clear
        </button>
        <motion.button
          onClick={handleAnalyze}
          disabled={isLoading || isOverLimit}
          className="btn-primary flex-1"
          whileTap={{ scale: 0.97 }}
          aria-label="Analyze review"
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <motion.span
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                aria-hidden
              />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles size={14} aria-hidden />
              Analyze Review
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
