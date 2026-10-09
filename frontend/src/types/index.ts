// ── Shared TypeScript types ──────────────────────────────────────────────────

export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface SentimentWords {
  positive: string[];
  negative: string[];
}

export interface AnalysisResult {
  movie: {
    title: string;
    year: number;
    director: string;
    genres: string[];
    runtime: string;
    cast: string[];
    poster: string;
  };
  ratings: {
    imdb: string;
    rottenTomatoes: string;
    metacritic: string;
  };
  userAnalysis: {
    sentiment: Sentiment | 'Positive' | 'Neutral' | 'Negative' | 'Mixed';
    score: number;
    confidence: number;
    emotions: string[];
    aspects: Record<string, { sentiment: string; score: number }>;
  };
  publicReception: {
    criticSentiment: string;
    audienceSentiment: string;
    commonPraises: string[];
    commonCriticisms: string[];
  };
  comparison: {
    alignment: string;
    explanation: string;
  };
  verdict: string;
  sources: Array<{ name: string; url: string }>;
  
  review_id?: number | null;
  saved?: boolean;
}

export interface Review {
  id: number;
  user_id: number;
  movie_name: string;
  review_text: string;
  sentiment: Sentiment;
  compound_score: number;
  positive_score: number;
  neutral_score: number;
  negative_score: number;
  created_at: string;
}

export interface TrendDataPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

export interface Stats {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  average_compound: number;
  most_common_sentiment: string;
  trend_data: TrendDataPoint[];
  recent_reviews: Review[];
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiError {
  error?: string;
  errors?: Record<string, string>;
  message?: string;
}
