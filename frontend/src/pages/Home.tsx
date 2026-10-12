import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Clock, Film, Star, TrendingUp, Sparkles, PenLine, BrainCircuit, PieChart } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import SearchMovie from '../components/SearchMovie';

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

// Container variants
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};
const itemVariants: Variants = {
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
        'relative min-h-[90vh] flex flex-col items-center justify-center pt-16 pb-20 px-4 overflow-hidden',
        isDark ? 'bg-[#0a0a0f]' : 'bg-slate-50'
      )}>
        {/* Background gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-purple-900/20 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-900/20 blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight tracking-tight"
          >
            Understand what audiences <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">really feel.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-300 mb-12 max-w-2xl"
          >
            Instantly aggregate reviews from across the web. We analyze the sentiment of 
            millions of opinions to give you the ultimate verdict on any movie.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full"
          >
            <SearchMovie />
          </motion.div>
        </div>
        
        {/* Footer text */}
        <div className="absolute bottom-8 text-center text-slate-500 text-sm">
          Powered by TMDB, OMDb, Reddit, and Claude AI
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
