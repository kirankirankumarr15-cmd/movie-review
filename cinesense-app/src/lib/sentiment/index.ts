// @ts-ignore
import vader from 'vader-sentiment';
import { ReviewAspects } from '../db/types';

// Multilingual lexicon additions for Indian cinema & slang
const HINDI_KANGLISH_SENTIMENT_WEIGHTS: Record<string, number> = {
  // Positive slang (Hindi, Kannada, Kanglish, Hinglish)
  'sakkath': 3.5,
  'sakath': 3.5,
  'adbhuta': 3.2,
  'channagide': 2.8,
  'superb': 3.0,
  'banger': 3.2,
  'goosebumps': 3.4,
  'paisa vasool': 3.5,
  'zabardast': 3.4,
  'shandar': 3.2,
  'khatarnak': 2.8,
  'faad': 3.3,
  'dhamaal': 2.9,
  'masterpiece': 3.8,
  'blockbuster': 3.2,
  'swag': 2.5,
  'marana mass': 3.6,
  'mass': 2.8,
  'pure fire': 3.6,
  'is fire': 3.4,
  'lit': 3.0,
  'thrilled': 3.2,
  'extraordinary': 3.4,
  'breathtaking': 3.5,
  'phenomenal': 3.5,
  'brilliant': 3.4,
  'outstanding': 3.5,
  'chitranna': -2.5, // Kannada negative slang for mess
  'daridra': -3.2, // Kannada negative
  'bekku': -2.0,
  'kachada': -3.5,
  'waste': -3.0,
  'bakwas': -3.2,
  'bore': -2.5,
  'maha bore': -3.5,
  'disaster': -3.5,
  'headache': -3.0,
  'slow': -1.5,
  'cringe': -2.8,
};

const SPOILER_KEYWORDS = [
  'dies',
  'killed',
  'death',
  'murderer is',
  'killer is',
  'ending is',
  'climax twist',
  'plot twist',
  'in the end',
  'post credits scene',
  'post credit',
  'cameo by',
  'spoiler',
  'revealed that',
  'secret villain',
];

const ASPECT_KEYWORDS = {
  story: ['story', 'plot', 'script', 'screenplay', 'writing', 'climax', 'interval', 'twist', 'narrative'],
  acting: ['acting', 'performance', 'actor', 'actress', 'hero', 'heroine', 'cast', 'role', 'character', 'yash', 'presence'],
  music: ['music', 'bgm', 'score', 'songs', 'soundtrack', 'sound', 'audio', 'composer', 'tunes'],
  direction: ['direction', 'director', 'filmmaking', 'craft', 'vision', 'pacing', 'execution', 'style'],
  visuals: ['visual', 'visuals', 'cinematography', 'vfx', 'cgi', 'camera', 'frames', 'shots', 'color', 'lighting'],
  action: ['action', 'stunts', 'fights', 'fight scenes', 'chase', 'combat', 'thrill', 'violence'],
};

export interface SentimentAnalysisResult {
  sentiment: 'positive' | 'neutral' | 'negative';
  compound_score: number;
  confidence: number;
  aspects: ReviewAspects;
  is_spoiler: boolean;
  detected_language: string;
}

/**
 * Detect language heuristics (Kannada, Hindi, Hinglish/Kanglish, English)
 */
export function detectLanguage(text: string): string {
  // Kannada Unicode range: 0C80–0CFF
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  // Devanagari (Hindi) Unicode range: 0900–097F
  if (/[\u0900-\u097F]/.test(text)) return 'hi';

  const lower = text.toLowerCase();
  // Heuristic Kanglish check
  if (['sakkath', 'channagide', 'guru', 'macha', 'film nodi', 'adbhuta'].some(w => lower.includes(w))) {
    return 'kanglish';
  }
  // Heuristic Hinglish check
  if (['bhai', 'yaar', 'zabardast', 'bakwas', 'paisa vasool', 'shandar', 'matlab'].some(w => lower.includes(w))) {
    return 'hinglish';
  }

  return 'en';
}

/**
 * Checks for spoilers in review text
 */
export function checkIsSpoiler(text: string): boolean {
  const lower = text.toLowerCase();
  return SPOILER_KEYWORDS.some((kw) => lower.includes(kw));
}

/**
 * Analyzes full review text using VADER + Multilingual weights + Aspect detection
 */
export function analyzeReviewSentiment(text: string): SentimentAnalysisResult {
  const language = detectLanguage(text);
  const is_spoiler = checkIsSpoiler(text);

  // VADER Base Scores
  const polarity = vader.SentimentIntensityAnalyzer.polarity_scores(text);
  let compound = polarity.compound;

  // Augment with regional slang dictionary
  const lower = text.toLowerCase();
  let regionalScore = 0;
  let matches = 0;

  for (const [word, weight] of Object.entries(HINDI_KANGLISH_SENTIMENT_WEIGHTS)) {
    if (lower.includes(word)) {
      regionalScore += weight;
      matches++;
    }
  }

  if (matches > 0) {
    const normalizedRegional = regionalScore / (matches * 4); // normalize to [-1, 1]
    compound = (compound * 0.6) + (normalizedRegional * 0.4);
  }

  // Sentiment classification
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (compound >= 0.05) sentiment = 'positive';
  else if (compound <= -0.05) sentiment = 'negative';

  // Confidence calculation (scale 50 to 98 based on intensity and distance from boundary)
  const confidence = Math.min(98, Math.max(50, Math.round(50 + Math.abs(compound) * 48)));

  // Aspect-based sentiment analysis
  const aspects: ReviewAspects = {};
  const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 3);

  for (const [aspectName, keywords] of Object.entries(ASPECT_KEYWORDS)) {
    const relevantSentences = sentences.filter(s => {
      const sLower = s.toLowerCase();
      return keywords.some(kw => sLower.includes(kw));
    });

    if (relevantSentences.length > 0) {
      const combined = relevantSentences.join(' ');
      const aspectPolarity = vader.SentimentIntensityAnalyzer.polarity_scores(combined);
      let aspectCompound = aspectPolarity.compound;

      const combinedLower = combined.toLowerCase();
      for (const [w, weight] of Object.entries(HINDI_KANGLISH_SENTIMENT_WEIGHTS)) {
        if (combinedLower.includes(w)) {
          aspectCompound += weight * 0.15;
        }
      }

      if (aspectCompound >= 0.05) aspects[aspectName as keyof ReviewAspects] = 'positive';
      else if (aspectCompound <= -0.05) aspects[aspectName as keyof ReviewAspects] = 'negative';
      else aspects[aspectName as keyof ReviewAspects] = 'neutral';
    } else {
      aspects[aspectName as keyof ReviewAspects] = null;
    }
  }

  return {
    sentiment,
    compound_score: parseFloat(compound.toFixed(4)),
    confidence,
    aspects,
    is_spoiler,
    detected_language: language,
  };
}

/**
 * Extracts top positive and negative themes
 */
export function extractThemes(reviews: { text: string; sentiment: string }[]): {
  top_positive_themes: string[];
  top_negative_themes: string[];
} {
  const commonWords = new Set([
    'movie', 'film', 'this', 'that', 'with', 'from', 'have', 'been', 'were', 'very',
    'just', 'more', 'about', 'some', 'good', 'great', 'also', 'their', 'there'
  ]);

  const posCounts: Record<string, number> = {};
  const negCounts: Record<string, number> = {};

  for (const r of reviews) {
    const words = r.text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    for (const w of words) {
      if (commonWords.has(w)) continue;
      if (r.sentiment === 'positive') {
        posCounts[w] = (posCounts[w] || 0) + 1;
      } else if (r.sentiment === 'negative') {
        negCounts[w] = (negCounts[w] || 0) + 1;
      }
    }
  }

  const top_positive_themes = Object.entries(posCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

  const top_negative_themes = Object.entries(negCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([w]) => w.charAt(0).toUpperCase() + w.slice(1));

  return { top_positive_themes, top_negative_themes };
}
