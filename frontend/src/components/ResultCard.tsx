import { motion } from 'framer-motion';
import type { AnalysisResult } from '../types';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { Star, ThumbsUp, ThumbsDown, Film, Users, AlignCenter } from 'lucide-react';

interface ResultCardProps {
  result: AnalysisResult;
}

import type { Variants } from 'framer-motion';

const fadeUp: Variants = {
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

  const getSentimentColor = (sentiment: string) => {
    const s = sentiment.toLowerCase();
    if (s.includes('positive')) return 'text-green-500';
    if (s.includes('negative')) return 'text-red-500';
    return 'text-amber-500';
  };
  
  const getSentimentBg = (sentiment: string) => {
    const s = sentiment.toLowerCase();
    if (s.includes('positive')) return isDark ? 'bg-green-500/10' : 'bg-green-50';
    if (s.includes('negative')) return isDark ? 'bg-red-500/10' : 'bg-red-50';
    return isDark ? 'bg-amber-500/10' : 'bg-amber-50';
  };

  const getSentimentBarColor = (sentiment: string) => {
    const s = sentiment.toLowerCase();
    if (s.includes('positive')) return '#22c55e';
    if (s.includes('negative')) return '#ef4444';
    return '#f59e0b';
  };

  return (
    <motion.div initial="hidden" animate="visible" className="space-y-6">
      
      {/* 1. MOVIE OVERVIEW */}
      <motion.div custom={0} variants={fadeUp} className={cn('rounded-xl border p-5 flex flex-col sm:flex-row gap-5', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}>
        {result.movie.poster && (
          <div className="flex-shrink-0 w-24 sm:w-32 rounded-lg overflow-hidden shadow-lg border border-white/10">
            <img src={result.movie.poster} alt={result.movie.title} className="w-full h-auto object-cover" />
          </div>
        )}
        <div className="flex-1 space-y-3">
          <div>
            <h2 className={cn('text-2xl font-bold font-display leading-tight', isDark ? 'text-white' : 'text-slate-900')}>
              {result.movie.title} <span className={cn('text-lg font-normal', isDark ? 'text-slate-400' : 'text-slate-500')}>({result.movie.year})</span>
            </h2>
            <div className={cn('text-xs flex flex-wrap gap-2 mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
              <span>{result.movie.genres?.join(', ')}</span>
              <span>•</span>
              <span>{result.movie.runtime}</span>
              <span>•</span>
              <span>Dir. {result.movie.director}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 pt-2">
            <div className={cn('flex flex-col rounded-lg px-3 py-1.5 border', isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200')}>
              <span className="text-[10px] uppercase font-semibold text-amber-500 flex items-center gap-1"><Star size={10} /> IMDb</span>
              <span className={cn('font-bold text-sm', isDark ? 'text-slate-200' : 'text-slate-800')}>{result.ratings.imdb || 'N/A'}</span>
            </div>
            <div className={cn('flex flex-col rounded-lg px-3 py-1.5 border', isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200')}>
              <span className="text-[10px] uppercase font-semibold text-red-500 flex items-center gap-1">🍅 Rotten Tomatoes</span>
              <span className={cn('font-bold text-sm', isDark ? 'text-slate-200' : 'text-slate-800')}>{result.ratings.rottenTomatoes || 'N/A'}</span>
            </div>
            <div className={cn('flex flex-col rounded-lg px-3 py-1.5 border', isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200')}>
              <span className="text-[10px] uppercase font-semibold text-green-500 flex items-center gap-1">Ⓜ️ Metacritic</span>
              <span className={cn('font-bold text-sm', isDark ? 'text-slate-200' : 'text-slate-800')}>{result.ratings.metacritic || 'N/A'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. YOUR SENTIMENT */}
        <motion.div custom={1} variants={fadeUp} className={cn('rounded-xl border p-5 flex flex-col items-center justify-center text-center', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}>
          <h3 className={cn('text-xs uppercase font-bold tracking-wider mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>Your Sentiment</h3>
          
          <div className="relative mb-2">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="6" fill="none" className={cn(isDark ? 'text-slate-800' : 'text-slate-100')} />
              <motion.circle 
                cx="48" cy="48" r="44" 
                stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round"
                className={getSentimentColor(result.userAnalysis.sentiment)}
                initial={{ strokeDasharray: '276', strokeDashoffset: '276' }}
                animate={{ strokeDashoffset: 276 - (276 * result.userAnalysis.score) / 100 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-2xl font-bold font-display', isDark ? 'text-white' : 'text-slate-800')}>{result.userAnalysis.score}</span>
            </div>
          </div>
          
          <div className={cn('text-lg font-bold uppercase tracking-wide', getSentimentColor(result.userAnalysis.sentiment))}>
            {result.userAnalysis.sentiment}
          </div>
          
          <div className={cn('text-xs mt-3 px-3 py-1 rounded-full', isDark ? 'bg-purple-500/10 text-purple-300' : 'bg-purple-50 text-purple-700')}>
            {result.userAnalysis.confidence}% Confidence
          </div>
          
          {result.userAnalysis.emotions?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 justify-center mt-4">
              {result.userAnalysis.emotions.map(e => (
                <span key={e} className={cn('text-[10px] px-2 py-0.5 rounded border', isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600')}>
                  {e}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        {/* 3. ASPECT SENTIMENT */}
        <motion.div custom={2} variants={fadeUp} className={cn('rounded-xl border p-5', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}>
          <h3 className={cn('text-xs uppercase font-bold tracking-wider mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>Aspect Analysis</h3>
          <div className="space-y-3">
            {Object.entries(result.userAnalysis.aspects || {}).map(([aspect, data], i) => (
              <div key={aspect}>
                <div className="flex justify-between text-xs mb-1">
                  <span className={isDark ? 'text-slate-300' : 'text-slate-700 font-medium'}>{aspect}</span>
                  <span className={getSentimentColor(data.sentiment)}>{data.score}%</span>
                </div>
                <div className={cn('h-1.5 rounded-full overflow-hidden', isDark ? 'bg-[#2a2a3d]' : 'bg-slate-100')}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: getSentimentBarColor(data.sentiment) }}
                    initial={{ width: 0 }}
                    animate={{ width: `${data.score}%` }}
                    transition={{ duration: 0.6, delay: 0.4 + (i * 0.1), ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
            {Object.keys(result.userAnalysis.aspects || {}).length === 0 && (
              <div className={cn('text-sm text-center py-6', isDark ? 'text-slate-500' : 'text-slate-400')}>
                No specific aspects (acting, story, etc.) detected.
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 4. PUBLIC RECEPTION */}
      <motion.div custom={3} variants={fadeUp} className={cn('rounded-xl border p-5', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}>
        <h3 className={cn('text-xs uppercase font-bold tracking-wider mb-4 flex items-center gap-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
          <Users size={14} /> Public Reception
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div className={cn('p-3 rounded-lg border', getSentimentBg(result.publicReception.criticSentiment), isDark ? 'border-white/5' : 'border-black/5')}>
            <div className={cn('text-xs font-semibold mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>CRITICS CONSENSUS</div>
            <div className={cn('font-bold', getSentimentColor(result.publicReception.criticSentiment))}>{result.publicReception.criticSentiment}</div>
          </div>
          <div className={cn('p-3 rounded-lg border', getSentimentBg(result.publicReception.audienceSentiment), isDark ? 'border-white/5' : 'border-black/5')}>
            <div className={cn('text-xs font-semibold mb-1', isDark ? 'text-slate-400' : 'text-slate-500')}>AUDIENCE CONSENSUS</div>
            <div className={cn('font-bold', getSentimentColor(result.publicReception.audienceSentiment))}>{result.publicReception.audienceSentiment}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h4 className={cn('text-xs font-semibold mb-2 flex items-center gap-1', isDark ? 'text-green-400' : 'text-green-600')}>
              <ThumbsUp size={12} /> Common Praises
            </h4>
            <ul className={cn('text-sm space-y-1.5 list-disc pl-4', isDark ? 'text-slate-300' : 'text-slate-700')}>
              {result.publicReception.commonPraises?.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
          <div>
            <h4 className={cn('text-xs font-semibold mb-2 flex items-center gap-1', isDark ? 'text-red-400' : 'text-red-600')}>
              <ThumbsDown size={12} /> Common Criticisms
            </h4>
            <ul className={cn('text-sm space-y-1.5 list-disc pl-4', isDark ? 'text-slate-300' : 'text-slate-700')}>
              {result.publicReception.commonCriticisms?.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* 5. COMPARISON & VERDICT */}
      <motion.div custom={4} variants={fadeUp} className={cn('rounded-xl border p-5 bg-gradient-to-br', isDark ? 'from-purple-900/20 to-[#1a1a25] border-purple-500/20' : 'from-purple-50 to-white border-purple-100')}>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <h3 className={cn('text-xs uppercase font-bold tracking-wider mb-2 flex items-center gap-2', isDark ? 'text-purple-400' : 'text-purple-600')}>
              <AlignCenter size={14} /> Alignment: {result.comparison.alignment}
            </h3>
            <p className={cn('text-sm mb-4', isDark ? 'text-slate-300' : 'text-slate-700')}>
              {result.comparison.explanation}
            </p>
            
            <div className="h-px w-full bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 my-4" />
            
            <h3 className={cn('text-xs uppercase font-bold tracking-wider mb-2 flex items-center gap-2', isDark ? 'text-purple-400' : 'text-purple-600')}>
              <Film size={14} /> AI Movie Verdict
            </h3>
            <p className={cn('text-sm font-medium leading-relaxed', isDark ? 'text-white' : 'text-slate-900')}>
              "{result.verdict}"
            </p>
          </div>
        </div>
      </motion.div>

      {/* 6. SOURCES */}
      <motion.div custom={5} variants={fadeUp} className="pt-2">
        <h3 className={cn('text-[10px] uppercase font-bold tracking-wider mb-3', isDark ? 'text-slate-500' : 'text-slate-400')}>
          Research Sources & Citations
        </h3>
        <div className="flex flex-wrap gap-2 mb-2">
          {result.sources?.map((s, i) => (
            <a 
              key={i} 
              href={s.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn('text-xs px-2.5 py-1 rounded-md border transition-colors flex items-center gap-1', 
                isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white' 
                       : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900')}
            >
              {s.name}
            </a>
          ))}
        </div>
        <p className={cn('text-[10px]', isDark ? 'text-slate-600' : 'text-slate-500')}>
          Information retrieved from publicly available sources in real-time. This is an AI analysis and may contain inaccuracies.
        </p>
      </motion.div>

    </motion.div>
  );
}
