import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { AnalysisResult } from '../types';
import { analyzeApi } from '../services/api';
import ReviewInput from '../components/ReviewInput';
import ResultCard from '../components/ResultCard';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function Analyzer() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();
  const defaultMovie = location.state?.defaultMovie || '';

  const handleAnalyze = async (reviewText: string, movieName: string) => {
    setIsLoading(true);
    try {
      const data = await analyzeApi.analyze(reviewText, movieName);
      setResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to analyze the review. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="pt-16 min-h-screen">
      <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10')}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={20} className="text-purple-400" aria-hidden />
            <h1 className={cn('font-display text-3xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              Analyze Your Review
            </h1>
          </div>
          <p className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
            Enter a movie review below and get instant NLP-powered sentiment analysis.
            {' '}<span className={isDark ? 'text-slate-600' : 'text-slate-400'}>No login required.</span>
          </p>
        </motion.div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Input panel */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={cn(
              'rounded-2xl border p-6',
              isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
            )}
          >
            <h2 className={cn('font-semibold text-base mb-5', isDark ? 'text-slate-200' : 'text-slate-800')}>
              Write Your Review
            </h2>
            <ReviewInput onAnalyze={handleAnalyze} isLoading={isLoading} defaultMovie={defaultMovie} />
          </motion.div>

          {/* Results panel */}
          <div>
            <AnimatePresence mode="wait">
              {isLoading && !result && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'rounded-2xl border p-10 flex flex-col items-center justify-center',
                    isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
                  )}
                  aria-live="polite"
                  aria-busy="true"
                >
                  <motion.div
                    className="w-12 h-12 rounded-full border-2 border-purple-500/20 border-t-purple-500 mb-6"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
                    aria-hidden
                  />
                  <h3 className={cn('font-semibold mb-4 text-center', isDark ? 'text-slate-200' : 'text-slate-800')}>
                    Analyzing your review...
                  </h3>
                  
                  <div className="w-full max-w-sm space-y-2 text-sm">
                    {[
                      'Identifying movie',
                      'Gathering movie information',
                      'Researching audience reception',
                      'Researching critic reception',
                      'Analyzing your review',
                      'Comparing opinions',
                      'Generating movie intelligence'
                    ].map((step, idx) => (
                      <motion.div 
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 1.5, duration: 0.5 }}
                        className={cn('flex items-center gap-2', isDark ? 'text-slate-400' : 'text-slate-600')}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: (idx * 1.5) + 0.5, type: 'spring' }}
                          className="text-green-500"
                        >
                          ✓
                        </motion.div>
                        {step}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {!isLoading && !result && (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'rounded-2xl border p-12 flex flex-col items-center justify-center text-center',
                    isDark ? 'bg-[#1a1a25] border-[#2a2a3d] border-dashed' : 'bg-slate-50 border-slate-200 border-dashed'
                  )}
                >
                  <div className="text-5xl mb-4" aria-hidden>🎬</div>
                  <h3 className={cn('font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>
                    Analysis Results
                  </h3>
                  <p className={cn('text-sm', isDark ? 'text-slate-500' : 'text-slate-400')}>
                    Enter a review and click Analyze to see sentiment results here.
                  </p>
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={cn('font-semibold text-base', isDark ? 'text-slate-200' : 'text-slate-800')}>
                      Analysis Result
                    </h2>
                    <button
                      onClick={() => setResult(null)}
                      className={cn('text-xs px-2 py-1 rounded-lg transition-colors',
                        isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-white/5' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100')}
                    >
                      Clear
                    </button>
                  </div>
                  <ResultCard result={result} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}
