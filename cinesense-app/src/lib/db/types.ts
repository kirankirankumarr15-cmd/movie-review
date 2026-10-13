export interface Movie {
  id: string;
  tmdb_id: number;
  title: string;
  original_title?: string;
  overview?: string;
  release_date?: string;
  year: number;
  director?: string;
  language: string; // 'kn' | 'hi' | 'te' | 'ta' | 'ml' | 'en'
  age_rating?: string; // 'U', 'UA', 'A', 'PG-13', 'R'
  runtime_minutes?: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
  trailer_youtube_id?: string;
  genres?: { id: number; name: string }[];
  box_office?: {
    budget?: number;
    revenue?: number;
    currency?: string;
    day_wise?: { day: number; date: string; amount_crores: number }[];
    source?: string;
  };
  created_at?: string;
  updated_at?: string;
}

export interface Person {
  id: string;
  tmdb_person_id: number;
  name: string;
  biography?: string;
  profile_path?: string | null;
  known_for_department?: string;
  place_of_birth?: string;
  birthday?: string;
}

export interface MovieCast {
  id: string;
  movie_id: string;
  person_id: string;
  role_type: 'cast' | 'crew';
  character_name?: string;
  job?: string;
  order_index?: number;
}

export interface ReviewAspects {
  story?: 'positive' | 'neutral' | 'negative' | null;
  acting?: 'positive' | 'neutral' | 'negative' | null;
  music?: 'positive' | 'neutral' | 'negative' | null;
  direction?: 'positive' | 'neutral' | 'negative' | null;
  visuals?: 'positive' | 'neutral' | 'negative' | null;
  action?: 'positive' | 'neutral' | 'negative' | null;
}

export interface Review {
  id: string;
  movie_id?: string;
  tmdb_id: number;
  source: string; // 'TMDB' | 'YouTube' | 'Reddit' | 'The Hindu' | 'Times of India' | 'Film Companion' | 'Deccan Herald'
  author: string;
  author_avatar?: string;
  text: string;
  url: string;
  language: string; // 'en' | 'kn' | 'hi' | 'hinglish' | 'kanglish'
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  compound_score: number;
  aspects: ReviewAspects;
  is_spoiler: boolean;
  helpfulness_up: number;
  helpfulness_down: number;
  posted_at: string;
  fetched_at: string;
}

export interface SentimentSummary {
  total_reviews: number;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  positive_pct: number;
  neutral_pct: number;
  negative_pct: number;
  average_confidence: number;
  sources_count: number;
  sources_breakdown: Record<string, number>;
  aspects_summary: Record<string, { positive: number; neutral: number; negative: number }>;
  top_positive_themes: string[];
  top_negative_themes: string[];
  last_updated: string;
}

export interface UserReview {
  id: string;
  user_id: string;
  user_name?: string;
  user_avatar?: string;
  movie_id?: string;
  tmdb_id: number;
  rating: number; // 1 to 10
  title?: string;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  aspects: ReviewAspects;
  is_spoiler: boolean;
  likes_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  target_type: 'review' | 'user_review' | 'movie';
  target_id: string;
  parent_comment_id?: string | null;
  text: string;
  likes: number;
  dislikes: number;
  created_at: string;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  movie_id?: string;
  tmdb_id: number;
  movie_title: string;
  poster_path?: string | null;
  status: 'watchlist' | 'watched' | 'favorite';
  rating?: number;
  created_at: string;
}

export interface CuratedList {
  id: string;
  user_id: string;
  user_name?: string;
  title: string;
  description?: string;
  is_public: boolean;
  items_count?: number;
  created_at: string;
}

export interface CuratedListItem {
  id: string;
  list_id: string;
  tmdb_id: number;
  movie_title: string;
  poster_path?: string | null;
  rank: number;
  notes?: string;
}

export interface Poll {
  id: string;
  tmdb_id: number;
  movie_title?: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  user_voted_option?: string;
}

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  badge_title: string;
  points: number;
  is_admin: boolean;
  followers_count?: number;
  following_count?: number;
  watched_count?: number;
}

export interface MovieVideo {
  id: string;
  movie_id?: string;
  tmdb_id: number;
  youtube_id: string;
  type: 'teaser' | 'trailer' | 'clip' | 'song';
  title: string;
  language: string;
  is_official: boolean;
  channel_name?: string;
  channel_id?: string;
}

export interface OfficialChannel {
  id: string;
  channel_id: string;
  channel_name: string;
  language?: string;
  verified_date: string;
  is_whitelisted: boolean;
  notes?: string;
}

export interface LegalFullMovie {
  id: string;
  tmdb_id: number;
  movie_title: string;
  youtube_id: string;
  channel_id: string;
  channel_name: string;
  video_duration_minutes: number;
  tmdb_runtime_minutes: number;
  is_embeddable: boolean;
  verification_status: 'verified_approved' | 'pending_admin' | 'rejected_pirated_or_unverified';
  rejection_reason?: string;
  detected_at: string;
}

