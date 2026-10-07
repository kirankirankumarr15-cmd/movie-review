import { motion } from 'framer-motion';
import { HelpCircle, Terminal, Layers, Heart } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';

export default function About() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-16">
          
          {/* Header */}
          <section className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600 mb-6 shadow-glow">
              <Heart size={32} className="text-white" />
            </div>
            <h1 className={cn('font-display text-4xl font-bold mb-4', isDark ? 'text-white' : 'text-slate-900')}>
              About CineSense
            </h1>
            <p className={cn('text-lg max-w-2xl mx-auto', isDark ? 'text-slate-400' : 'text-slate-500')}>
              CineSense is an NLP-based movie review sentiment analyzer that categorizes reviews into positive, neutral, or negative sentiment to help you understand what audiences really feel.
            </p>
          </section>

          {/* Architecture */}
          <section id="how-it-works">
            <h2 className={cn('font-display text-2xl font-bold mb-6', isDark ? 'text-white' : 'text-slate-900')}>
              How it works
            </h2>
            <div className={cn(
              'rounded-xl border p-8 font-mono text-sm overflow-x-auto',
              isDark ? 'bg-[#1a1a25] border-[#2a2a3d] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            )}>
              <pre>
{`Movie Review
     ↓
Text Processing
     ↓
NLTK VADER
     ↓
Sentiment Scores
     ↓
Classification
     ↓
Visualization`}
              </pre>
            </div>
          </section>

          {/* Technology */}
          <section>
            <h2 className={cn('font-display text-2xl font-bold mb-6 flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
              <Layers size={24} className="text-purple-400" /> Technology Stack
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { name: 'React', type: 'Frontend' },
                { name: 'TypeScript', type: 'Language' },
                { name: 'Tailwind CSS', type: 'Styling' },
                { name: 'Recharts', type: 'Charts' },
                { name: 'Python', type: 'Backend' },
                { name: 'Flask', type: 'API' },
                { name: 'NLTK', type: 'NLP Engine' },
                { name: 'SQLite', type: 'Database' },
              ].map(tech => (
                <div key={tech.name} className={cn(
                  'rounded-lg border p-4 text-center transition-all hover:-translate-y-0.5',
                  isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
                )}>
                  <div className={cn('font-semibold mb-1', isDark ? 'text-slate-200' : 'text-slate-800')}>{tech.name}</div>
                  <div className={cn('text-xs uppercase tracking-wide', isDark ? 'text-slate-500' : 'text-slate-400')}>{tech.type}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Target Audiences */}
          <section id="audiences">
            <h2 className={cn('font-display text-2xl font-bold mb-6 flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
              <Heart size={24} className="text-purple-400" /> Who is CineSense for?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: 'Movie Viewers & Audience',
                  desc: 'Enter your movie reviews, instantly get positive/neutral/negative sentiment scores, and review your previous analyses.'
                },
                {
                  title: 'Movie Critics',
                  desc: 'Analyze large numbers of movie reviews rapidly to identify overall audience sentiment and compare reactions.'
                },
                {
                  title: 'Movie Enthusiasts',
                  desc: 'Track your personal opinions about different movies and analyze how your reviews vary over time using the dashboard.'
                },
                {
                  title: 'Students & Researchers',
                  desc: 'Use CineSense as a practical NLP learning tool to study sentiment analysis, VADER lexical rules, and explore data trends.'
                },
                {
                  title: 'Production & Marketing Teams',
                  desc: 'Analyze audience feedback to identify whether reviews are generally positive or negative, helping to understand post-release reactions.'
                }
              ].map(persona => (
                <div key={persona.title} className={cn(
                  'rounded-xl border p-5',
                  isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
                )}>
                  <h3 className={cn('font-semibold mb-2', isDark ? 'text-slate-200' : 'text-slate-800')}>{persona.title}</h3>
                  <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{persona.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section id="faq">
            <h2 className={cn('font-display text-2xl font-bold mb-6 flex items-center gap-2', isDark ? 'text-white' : 'text-slate-900')}>
              <HelpCircle size={24} className="text-purple-400" /> Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  q: 'What is sentiment analysis?',
                  a: 'Sentiment analysis is the use of natural language processing (NLP) to computationally identify and categorize opinions expressed in a piece of text, determining whether the writer\'s attitude is positive, negative, or neutral.'
                },
                {
                  q: 'How does CineSense analyze reviews?',
                  a: 'CineSense uses NLTK (Natural Language Toolkit) and VADER (Valence Aware Dictionary and sEntiment Reasoner), a lexicon and rule-based sentiment analysis tool specifically attuned to sentiments expressed in social media and short texts.'
                },
                {
                  q: 'What does the compound score mean?',
                  a: 'The compound score is a normalized metric calculated by VADER that ranges from -1 (most extreme negative) to +1 (most extreme positive). We classify anything above 0.05 as positive, and below -0.05 as negative.'
                },
                {
                  q: 'Can I use CineSense without an account?',
                  a: 'Yes, you can use the Analyzer tool as a guest. However, creating a free account allows you to save your history and view analytics on your personal dashboard.'
                },
                {
                  q: 'Can sentiment analysis be wrong?',
                  a: 'Yes. While VADER is highly accurate for general text, NLP models can sometimes struggle with heavy sarcasm, slang, irony, mixed opinions, or complex domain-specific context.'
                }
              ].map(faq => (
                <div key={faq.q} className={cn(
                  'rounded-xl border p-6',
                  isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
                )}>
                  <h3 className={cn('font-semibold text-lg mb-2', isDark ? 'text-slate-200' : 'text-slate-800')}>{faq.q}</h3>
                  <p className={cn('text-sm leading-relaxed', isDark ? 'text-slate-400' : 'text-slate-600')}>{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

        </motion.div>
      </div>
    </main>
  );
}
