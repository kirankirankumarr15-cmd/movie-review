import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Clock, Film, Star, TrendingUp, Sparkles, Shield, PenLine, BrainCircuit, PieChart } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Instant Analysis',
    description: 'Get sentiment classification within seconds using real NLP — no waiting, no delays.',
    color: '#7c3aed',
    to: '/analyzer',
  },
  {
    icon: Star,
    title: 'Three-Way Classification',
    description: 'Reviews are classified as Positive, Neutral, or Negative using VADER thresholds.',
    color: '#22c55e',
    to: '/analyzer',
  },
  {
    icon: TrendingUp,
    title: 'Sentiment Score',
    description: 'View the underlying VADER compound score from -1.0 to +1.0 for every analysis.',
    color: '#3b82f6',
    to: '/analyzer',
  },
  {
    icon: Clock,
    title: 'Review History',
    description: 'Logged-in users can save and revisit all their previous analyses.',
    color: '#f59e0b',
    to: '/history',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Understand sentiment trends with interactive charts powered by real database data.',
    color: '#ec4899',
    to: '/dashboard',
  },
  {
    icon: Film,
    title: 'Responsive Design',
    description: 'Works flawlessly across mobile, tablet, laptop, and desktop screens.',
    color: '#06b6d4',
    to: '/about',
  },
];

const HERO_EXAMPLE = {
  review: '"The visuals were incredible and the story kept me hooked till the very end — a masterpiece."',
  sentiment: 'POSITIVE',
  emoji: '😊',
  score: '+0.87',
  confidence: '87%',
  color: '#22c55e',
};

// Container variants
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function Home() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <main>
      {/* ── Hero ── */}
      <section className={cn(
        'relative min-h-[90vh] flex items-center pt-16',
        isDark ? 'bg-[#0a0a0f]' : 'bg-slate-50'
      )}>
        {/* Background grid pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `linear-gradient(${isDark ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#fff' : '#000'} 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
          {/* Soft purple radial */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-3xl"
            style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants}>
                <span className={cn(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-6',
                  isDark
                    ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300'
                    : 'bg-purple-50 border border-purple-200 text-purple-700'
                )}>
                  <Sparkles size={11} aria-hidden /> NLP-Powered Sentiment Analysis
                </span>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="font-display text-5xl sm:text-6xl font-bold leading-tight tracking-tight mb-6"
              >
                <span className={isDark ? 'text-white' : 'text-slate-900'}>Turn Movie Reviews</span>
                <br />
                <span className="text-gradient">Into Meaningful</span>
                <br />
                <span className={isDark ? 'text-white' : 'text-slate-900'}>Insights</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className={cn('text-lg leading-relaxed mb-8 max-w-lg', isDark ? 'text-slate-400' : 'text-slate-600')}
              >
                Analyze audience opinions with real NLP and instantly discover whether a review feels
                positive, neutral, or negative — powered by NLTK VADER.
              </motion.p>

              <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
                <Link to="/analyzer" className="btn-primary px-6 py-3 text-sm">
                  Analyze a Review <ArrowRight size={16} aria-hidden />
                </Link>
                <Link to="/dashboard" className={cn(
                  'btn-secondary px-6 py-3 text-sm',
                  isDark ? 'border-[#2a2a3d] text-slate-300 hover:bg-white/5' : ''
                )}>
                  Explore Dashboard
                </Link>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className={cn('flex items-center gap-6 mt-10 text-xs', isDark ? 'text-slate-600' : 'text-slate-400')}
              >
                <span className="flex items-center gap-1.5">
                  <Shield size={12} className="text-purple-400" /> Free to use
                </span>
                <span className="flex items-center gap-1.5">
                  <Star size={12} className="text-purple-400" /> No signup required
                </span>
                <span className="flex items-center gap-1.5">
                  <Sparkles size={12} className="text-purple-400" /> Real NLP
                </span>
              </motion.div>
            </motion.div>

            {/* Right: Demo Preview */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex justify-center lg:justify-end"
            >
              <div className={cn(
                'relative w-full max-w-md rounded-2xl border p-6 shadow-2xl',
                isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200 shadow-xl'
              )}>
                {/* Label: visual demo */}
                <div className={cn(
                  'absolute -top-3 left-4 rounded-full px-3 py-0.5 text-xs font-semibold',
                  isDark ? 'bg-[#2a2a3d] text-slate-400 border border-[#3d3d5c]' : 'bg-slate-100 text-slate-500 border border-slate-200'
                )}>
                  Visual Demo
                </div>

                {/* Review text */}
                <div className={cn(
                  'rounded-xl border p-4 mb-5 text-sm leading-relaxed italic',
                  isDark ? 'bg-[#16161f] border-[#2a2a3d] text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
                )}>
                  {HERO_EXAMPLE.review}
                </div>

                {/* Arrow */}
                <div className="text-center text-xl mb-5" aria-hidden>↓</div>

                {/* Result */}
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="text-5xl mb-3"
                    aria-hidden
                  >
                    {HERO_EXAMPLE.emoji}
                  </motion.div>
                  <div className="text-2xl font-display font-bold mb-1" style={{ color: HERO_EXAMPLE.color }}>
                    {HERO_EXAMPLE.sentiment}
                  </div>
                  <div className="text-4xl font-display font-bold mb-3 text-gradient-positive">
                    {HERO_EXAMPLE.score}
                  </div>
                  <div className={cn(
                    'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-4',
                    isDark ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-green-50 border border-green-200 text-green-600'
                  )}>
                    {HERO_EXAMPLE.confidence} Confidence Indicator
                  </div>

                  {/* Mini breakdown */}
                  <div className="space-y-2 text-left mt-4">
                    {[
                      { label: 'Positive', value: 72, color: '#22c55e' },
                      { label: 'Neutral',  value: 20, color: '#f59e0b' },
                      { label: 'Negative', value: 8,  color: '#ef4444' },
                    ].map(row => (
                      <div key={row.label}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{row.label}</span>
                          <span className="font-medium" style={{ color: row.color }}>{row.value}%</span>
                        </div>
                        <div className={cn('h-1.5 rounded-full', isDark ? 'bg-[#2a2a3d]' : 'bg-slate-100')}>
                          <div className="h-full rounded-full" style={{ width: `${row.value}%`, backgroundColor: row.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className={cn('text-xs text-center mt-4', isDark ? 'text-slate-700' : 'text-slate-300')}>
                  Example only — not a live result
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className={cn('py-20 px-4 sm:px-6 lg:px-8', isDark ? 'bg-[#0d0d14]' : 'bg-white')}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-14"
          >
            <h2 className={cn('font-display text-3xl font-bold mb-3', isDark ? 'text-white' : 'text-slate-900')}>
              How It Works
            </h2>
            <p className={cn('text-base max-w-xl mx-auto', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Three simple steps from review to insight.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Write', desc: 'Enter any movie review — long or short, praise or criticism.', icon: PenLine },
              { step: '02', title: 'Analyze', desc: 'CineSense processes the review using NLTK VADER NLP in real-time.', icon: BrainCircuit },
              { step: '03', title: 'Understand', desc: 'View sentiment classification, score, confidence, and detailed breakdown.', icon: PieChart },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className={cn(
                  'relative rounded-xl border p-6',
                  isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-slate-50 border-slate-200'
                )}
              >
                <item.icon size={32} className="text-purple-400 mb-4" aria-hidden />
                <div className="text-xs font-bold text-purple-400 mb-2 font-mono">{item.step}</div>
                <h3 className={cn('font-display text-xl font-bold mb-2', isDark ? 'text-white' : 'text-slate-900')}>
                  {item.title}
                </h3>
                <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={cn('py-20 px-4 sm:px-6 lg:px-8', isDark ? 'bg-[#0a0a0f]' : 'bg-slate-50')}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-center mb-14"
          >
            <h2 className={cn('font-display text-3xl font-bold mb-3', isDark ? 'text-white' : 'text-slate-900')}>
              Everything You Need
            </h2>
            <p className={cn('text-base max-w-xl mx-auto', isDark ? 'text-slate-400' : 'text-slate-500')}>
              A complete sentiment analysis toolkit for movie reviews.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {FEATURES.map(({ icon: Icon, title, description, color, to }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className={cn(
                  'rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover flex flex-col group',
                  isDark ? 'bg-[#1a1a25] border-[#2a2a3d] hover:border-purple-500/40' : 'bg-white border-slate-200 hover:border-purple-500/40'
                )}
              >
                <Link to={to} className="p-5 h-full flex flex-col focus:outline-none focus:ring-2 focus:ring-purple-500/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ background: `${color}18` }}>
                    <Icon size={20} style={{ color }} aria-hidden />
                  </div>
                  <h3 className={cn('font-semibold mb-2 group-hover:text-purple-500 transition-colors', isDark ? 'text-slate-200' : 'text-slate-800')}>
                    {title}
                  </h3>
                  <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-500' : 'text-slate-500')}>
                    {description}
                  </p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={cn('py-20 px-4', isDark ? 'bg-[#0d0d14]' : 'bg-white')}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="text-4xl mb-4" aria-hidden>🎬</div>
          <h2 className={cn('font-display text-3xl font-bold mb-4', isDark ? 'text-white' : 'text-slate-900')}>
            Ready to analyze your first review?
          </h2>
          <p className={cn('text-base mb-8', isDark ? 'text-slate-400' : 'text-slate-500')}>
            No account required. Paste any movie review and get instant sentiment analysis powered by real NLP.
          </p>
          <Link to="/analyzer" className="btn-primary px-8 py-3 text-base">
            Start Analyzing <ArrowRight size={16} aria-hidden />
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
