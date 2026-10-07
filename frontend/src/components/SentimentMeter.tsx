import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

interface SentimentMeterProps {
  compound: number; // -1.0 to +1.0
}

export default function SentimentMeter({ compound }: SentimentMeterProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Map compound from -1..+1 to 0..100%
  const position = ((compound + 1) / 2) * 100;

  // Color interpolation
  const getMarkerColor = () => {
    if (compound >= 0.05) return '#22c55e';
    if (compound <= -0.05) return '#ef4444';
    return '#f59e0b';
  };

  return (
    <div className="select-none" aria-label={`Sentiment meter: compound score ${compound.toFixed(2)}`}>
      <div className="flex justify-between text-xs font-medium mb-2">
        <span className="text-red-400">Negative</span>
        <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Neutral</span>
        <span className="text-green-400">Positive</span>
      </div>

      {/* Track */}
      <div
        className="relative h-3 rounded-full overflow-hidden"
        style={{
          background: isDark
            ? 'linear-gradient(to right, #ef4444 0%, #4a4a6a 40%, #4a4a6a 60%, #22c55e 100%)'
            : 'linear-gradient(to right, #fca5a5 0%, #e2e8f0 40%, #e2e8f0 60%, #86efac 100%)',
        }}
      >
        {/* Center line */}
        <div
          className="absolute top-0 bottom-0 w-px opacity-50"
          style={{ left: '50%', backgroundColor: isDark ? '#ffffff' : '#94a3b8' }}
        />

        {/* Marker */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
          animate={{ left: `${position}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          style={{ left: `${position}%` }}
        >
          <div
            className="w-5 h-5 rounded-full border-2 border-white shadow-lg"
            style={{ backgroundColor: getMarkerColor() }}
            aria-hidden="true"
          />
        </motion.div>
      </div>

      {/* Score labels */}
      <div className="flex justify-between text-xs mt-2" style={{ color: isDark ? '#4a5568' : '#94a3b8' }}>
        <span>-1.0</span>
        <span>0.0</span>
        <span>+1.0</span>
      </div>
    </div>
  );
}
