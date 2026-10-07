import { motion } from 'framer-motion';
import { AlertCircle, Info } from 'lucide-react';
import type { AnalysisResult } from '../types';
import { formatScore, formatPercent, getSentimentExplanation } from '../lib/utils';
import SentimentBadge from './SentimentBadge';
import SentimentMeter from './SentimentMeter';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

interface ResultCardProps {
  result: AnalysisResult;
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.35, ease: 'easeOut' },
  }),
};

export default function ResultCard({ result }: ResultCardProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const scoreData = [
    { label: 'Positive', value: result.positive, color: '#22c55e' },
    { label: 'Neutral',  value: result.neutral,  color: '#f59e0b' },
    { label: 'Negative', value: result.negative, color: '#ef4444' },
  ];

  const explanation = getSentimentExplanation(result.sentiment, result.compound);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Header: Sentiment + Score + Confidence */}
      <motion.div
        custom={0}
        variants={fadeUp}
        className={cn(
          'rounded-xl border p-5 text-center',
          isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
        )}
      >
        <div className="flex justify-center mb-3">
          <SentimentBadge sentiment={result.sentiment} size="lg" />
        </div>

        <div className={cn('text-4xl font-display font-bold mb-1', {
          'text-gradient-positive': result.sentiment === 'positive',
          'text-gradient-negative': result.sentiment === 'negative',
          'text-[#fbbf24]': result.sentiment === 'neutral',
        })}>
          {formatScore(result.compound)}
        </div>
        <div className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>
          Compound Score
        </div>

        <div className={cn(
          'mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold',
          isDark ? 'bg-purple-500/10 text-purple-300' : 'bg-purple-50 text-purple-700'
        )}>
          {Math.round(result.confidence * 100)}% Confidence Indicator
        </div>

        <p className={cn('text-xs mt-2', isDark ? 'text-slate-600' : 'text-slate-400')}>
          Confidence is an application-defined indicator, not a calibrated probability.
        </p>
      </motion.div>

      {/* Sentiment Meter */}
      <motion.div
        custom={1}
        variants={fadeUp}
        className={cn('rounded-xl border p-5', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}
      >
        <h3 className={cn('text-sm font-semibold mb-4', isDark ? 'text-slate-300' : 'text-slate-700')}>
          Sentiment Meter
        </h3>
        <SentimentMeter compound={result.compound} />
      </motion.div>

      {/* Score Breakdown */}
      <motion.div
        custom={2}
        variants={fadeUp}
        className={cn('rounded-xl border p-5', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}
      >
        <h3 className={cn('text-sm font-semibold mb-4', isDark ? 'text-slate-300' : 'text-slate-700')}>
          Breakdown
        </h3>
        <div className="space-y-3">
          {scoreData.map(({ label, value, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>{label}</span>
                <span className="font-semibold" style={{ color }}>{formatPercent(value)}</span>
              </div>
              <div className={cn('h-2 rounded-full overflow-hidden', isDark ? 'bg-[#2a2a3d]' : 'bg-slate-100')}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${value * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Explanation */}
      <motion.div
        custom={3}
        variants={fadeUp}
        className={cn('rounded-xl border p-5', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}
      >
        <div className="flex items-center gap-2 mb-3">
          <Info size={14} className="text-purple-400 flex-shrink-0" />
          <h3 className={cn('text-sm font-semibold', isDark ? 'text-slate-300' : 'text-slate-700')}>
            What this means
          </h3>
        </div>
        <p className={cn('text-sm leading-relaxed mb-3', isDark ? 'text-slate-400' : 'text-slate-600')}>
          {explanation}
        </p>
        <div className={cn(
          'flex items-start gap-2 text-xs rounded-lg p-3',
          isDark ? 'bg-amber-500/5 border border-amber-500/15 text-amber-300/70' : 'bg-amber-50 border border-amber-200 text-amber-700'
        )}>
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          <span>Sentiment is an NLP-based prediction and may not correctly understand sarcasm, slang, irony, or complex context.</span>
        </div>
      </motion.div>

      {/* Sentiment-bearing words */}
      {(result.words.positive.length > 0 || result.words.negative.length > 0) && (
        <motion.div
          custom={4}
          variants={fadeUp}
          className={cn('rounded-xl border p-5', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}
        >
          <h3 className={cn('text-sm font-semibold mb-1', isDark ? 'text-slate-300' : 'text-slate-700')}>
            Sentiment-bearing words detected
          </h3>
          <p className={cn('text-xs mb-4', isDark ? 'text-slate-600' : 'text-slate-400')}>
            Approximate lexical insight — these words influenced the score directionally.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {result.words.positive.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-green-400 mb-2">Positive</div>
                <div className="flex flex-wrap gap-1.5">
                  {result.words.positive.map(w => (
                    <span key={w} className="text-xs px-2 py-0.5 rounded-md" style={{
                      background: 'rgba(34,197,94,0.1)',
                      color: '#4ade80',
                      border: '1px solid rgba(34,197,94,0.2)'
                    }}>{w}</span>
                  ))}
                </div>
              </div>
            )}
            {result.words.negative.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-red-400 mb-2">Negative</div>
                <div className="flex flex-wrap gap-1.5">
                  {result.words.negative.map(w => (
                    <span key={w} className="text-xs px-2 py-0.5 rounded-md" style={{
                      background: 'rgba(239,68,68,0.1)',
                      color: '#f87171',
                      border: '1px solid rgba(239,68,68,0.2)'
                    }}>{w}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {result.saved && (
        <motion.div
          custom={5}
          variants={fadeUp}
          className="text-center text-xs text-green-400/70"
        >
          ✓ Review saved to your history
        </motion.div>
      )}
    </motion.div>
  );
}
