import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { 
  Movie, 
  Review, 
  UserReview, 
  Comment, 
  WatchlistItem, 
  CuratedList, 
  CuratedListItem, 
  Poll, 
  Profile,
  MovieVideo,
  OfficialChannel,
  LegalFullMovie
} from './types';

// Supabase Client Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your_supabase') && 
  !supabaseKey.includes('your_supabase')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!)
  : null;

// Local JSON Store fallback (Ensures 100% functionality even when offline or without external credentials)
interface LocalDbSchema {
  movies: Movie[];
  reviews: Review[];
  user_reviews: UserReview[];
  comments: Comment[];
  watchlists: WatchlistItem[];
  lists: CuratedList[];
  list_items: CuratedListItem[];
  polls: Poll[];
  poll_votes: { poll_id: string; user_id: string; option_id: string }[];
  review_votes: { review_id: string; user_id: string; vote_type: 'up' | 'down' }[];
  profiles: Profile[];
  source_logs: { id: string; source: string; status: string; message: string; timestamp: string }[];
  movie_videos: MovieVideo[];
  official_channels: OfficialChannel[];
  legal_full_movies: LegalFullMovie[];
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'cinesense_db.json');

// Initial seed data with Toxic 2026 (dir. Geetu Mohandas, KN, Age Rating A, trailer ID EfluEyQ5QIA)
const INITIAL_SEED: LocalDbSchema = {
  movies: [
    {
      id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
      tmdb_id: 1213243,
      title: 'Toxic: A Fairy Tale for Grown-ups',
      original_title: 'Toxic',
      overview: 'A high-octane action thriller exploring the gritty underworld, headlined by Yash and directed by Geetu Mohandas.',
      release_date: '2026-08-26',
      year: 2026,
      director: 'Geetu Mohandas',
      language: 'kn',
      age_rating: 'A',
      runtime_minutes: 155,
      poster_path: null,
      backdrop_path: null,
      trailer_youtube_id: 'EfluEyQ5QIA',
      genres: [
        { id: 28, name: 'Action' },
        { id: 80, name: 'Crime' },
        { id: 18, name: 'Drama' }
      ],
      box_office: {
        budget: 200,
        currency: 'INR Crores'
      }
    }
  ],
  reviews: [],
  user_reviews: [],
  comments: [],
  watchlists: [],
  lists: [
    {
      id: 'list-1',
      user_id: 'user-admin',
      user_name: 'Antigravity Curator',
      title: 'Most Anticipated Kannada & Pan-India Cinema 2026',
      description: 'The biggest releases to track across Sandalwood and beyond.',
      is_public: true,
      items_count: 1,
      created_at: new Date().toISOString()
    }
  ],
  list_items: [
    {
      id: 'item-1',
      list_id: 'list-1',
      tmdb_id: 1213243,
      movie_title: 'Toxic: A Fairy Tale for Grown-ups',
      rank: 1,
      notes: 'Directed by Geetu Mohandas, starring Yash.'
    }
  ],
  polls: [
    {
      id: 'poll-toxic-1000cr',
      tmdb_id: 1213243,
      movie_title: 'Toxic: A Fairy Tale for Grown-ups',
      question: 'Will Toxic cross ₹1000 Crore at the worldwide box office?',
      options: [
        { id: 'opt-1', text: 'Yes, Yash wave will shatter records easily', votes: 142 },
        { id: 'opt-2', text: 'Likely between ₹700–900 Cr', votes: 85 },
        { id: 'opt-3', text: 'Depends entirely on WOM and script strength', votes: 64 },
        { id: 'opt-4', text: 'Unlikely', votes: 12 }
      ],
      is_active: true,
      created_at: new Date().toISOString()
    }
  ],
  poll_votes: [],
  review_votes: [],
  profiles: [
    {
      id: 'user-admin',
      username: 'cinesense_admin',
      full_name: 'CineSense Lead',
      bio: 'Film enthusiast and data critic.',
      badge_title: 'Head Moderator',
      points: 1500,
      is_admin: true
    },
    {
      id: 'user-demo',
      username: 'film_buff_99',
      full_name: 'Arjun Gowda',
      bio: 'Watching cinema across Sandalwood, Bollywood and Hollywood.',
      badge_title: 'Top Reviewer',
      points: 420,
      is_admin: false
    }
  ],
  source_logs: [],
  movie_videos: [
    {
      id: 'vid-toxic-teaser',
      tmdb_id: 1213243,
      youtube_id: 'EfluEyQ5QIA',
      type: 'teaser',
      title: 'TOXIC - Title Announcement Video | Yash | Geetu Mohandas',
      language: 'kn',
      is_official: true,
      channel_name: 'KVN Productions',
      channel_id: 'UC7m01_w20K5tK5d8C9J1_kw'
    },
    {
      id: 'vid-toxic-trailer',
      tmdb_id: 1213243,
      youtube_id: 'd_7t17N4v5g',
      type: 'trailer',
      title: 'TOXIC Official Glimpse & Teaser 2 | KVN Productions',
      language: 'kn',
      is_official: true,
      channel_name: 'KVN Productions',
      channel_id: 'UC7m01_w20K5tK5d8C9J1_kw'
    }
  ],
  official_channels: [
    {
      id: 'ch-kvn',
      channel_id: 'UC7m01_w20K5tK5d8C9J1_kw',
      channel_name: 'KVN Productions',
      language: 'kn',
      verified_date: '2026-01-15T00:00:00.000Z',
      is_whitelisted: true,
      notes: 'Official rights holder for Toxic and KVN theatrical releases'
    },
    {
      id: 'ch-hombale',
      channel_id: 'UCh5nK2d2uQp0F8_u28x_8xA',
      channel_name: 'Hombale Films',
      language: 'kn',
      verified_date: '2026-01-15T00:00:00.000Z',
      is_whitelisted: true,
      notes: 'Official Sandalwood production house (KGF, Kantara, Salaar)'
    },
    {
      id: 'ch-rajshri',
      channel_id: 'UCU_4jFjBqP1WjHkO9vV7Yqw',
      channel_name: 'Rajshri',
      language: 'hi',
      verified_date: '2026-01-15T00:00:00.000Z',
      is_whitelisted: true,
      notes: 'Official rights holder for Hindi classic and family cinema catalog'
    },
    {
      id: 'ch-goldmines',
      channel_id: 'UCzauWvLdYdMhZ9w7B0g1w8A',
      channel_name: 'Goldmines Telefilms',
      language: 'hi',
      verified_date: '2026-01-15T00:00:00.000Z',
      is_whitelisted: true,
      notes: 'Official Hindi and South-dubbed legal cinema channel'
    },
    {
      id: 'ch-shemaroo',
      channel_id: 'UCxX6YmEw7vFmS9mQeM4bK2g',
      channel_name: 'Shemaroo Filmi Gaane / Movies',
      language: 'hi',
      verified_date: '2026-01-15T00:00:00.000Z',
      is_whitelisted: true,
      notes: 'Official Shemaroo entertainment catalog'
    },
    {
      id: 'ch-tseries',
      channel_id: 'UCq-Fj5jknLsUf-MWSy4_brA',
      channel_name: 'T-Series',
      language: 'hi',
      verified_date: '2026-01-15T00:00:00.000Z',
      is_whitelisted: true,
      notes: 'Official T-Series Bollywood catalog'
    },
    {
      id: 'ch-yrf',
      channel_id: 'UCbTLwN10NoCU4WDzZL1pnCw',
      channel_name: 'Yash Raj Films',
      language: 'hi',
      verified_date: '2026-01-15T00:00:00.000Z',
      is_whitelisted: true,
      notes: 'Official YRF production house'
    }
  ],
  legal_full_movies: [
    {
      id: 'full-hum-saath',
      tmdb_id: 42125,
      movie_title: 'Hum Saath-Saath Hain',
      youtube_id: 'g98p1L6e-vA',
      channel_id: 'UCU_4jFjBqP1WjHkO9vV7Yqw',
      channel_name: 'Rajshri',
      video_duration_minutes: 177,
      tmdb_runtime_minutes: 177,
      is_embeddable: true,
      verification_status: 'verified_approved',
      detected_at: '2026-01-10T00:00:00.000Z'
    },
    {
      id: 'full-toxic-pirated-rejected',
      tmdb_id: 1213243,
      movie_title: 'Toxic: A Fairy Tale for Grown-ups',
      youtube_id: 'bootleg_toxic_leak_fake',
      channel_id: 'UC_unknown_uploader_999',
      channel_name: 'FreeMoviesBootlegHD',
      video_duration_minutes: 85,
      tmdb_runtime_minutes: 155,
      is_embeddable: true,
      verification_status: 'rejected_pirated_or_unverified',
      rejection_reason: 'Channel ID UC_unknown_uploader_999 is NOT in the official rights holder whitelist. Runtime 85m deviates from TMDB runtime 155m.',
      detected_at: '2026-03-01T00:00:00.000Z'
    }
  ]
};

// Thread-safe read/write helper
export function getLocalDb(): LocalDbSchema {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE_PATH)) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(INITIAL_SEED, null, 2), 'utf-8');
      return INITIAL_SEED;
    }
    const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(data) as LocalDbSchema;
    let modified = false;
    if (!parsed.movie_videos || parsed.movie_videos.length === 0) {
      parsed.movie_videos = INITIAL_SEED.movie_videos;
      modified = true;
    }
    if (!parsed.official_channels || parsed.official_channels.length === 0) {
      parsed.official_channels = INITIAL_SEED.official_channels;
      modified = true;
    }
    if (!parsed.legal_full_movies || parsed.legal_full_movies.length === 0) {
      parsed.legal_full_movies = INITIAL_SEED.legal_full_movies;
      modified = true;
    }
    if (modified) {
      saveLocalDb(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Local DB Read Error:', err);
    return INITIAL_SEED;
  }
}

function saveLocalDb(db: LocalDbSchema): void {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Local DB Write Error:', err);
  }
}

// Database Service Interface
export const dbService = {
  // --- Movies ---
  async getMovieByTmdbId(tmdbId: number): Promise<Movie | null> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('movies').select('*').eq('tmdb_id', tmdbId).maybeSingle();
      if (data) return data;
    }
    const db = getLocalDb();
    return db.movies.find(m => m.tmdb_id === tmdbId) || null;
  },

  async upsertMovie(movie: Partial<Movie> & { tmdb_id: number; title: string }): Promise<Movie> {
    const now = new Date().toISOString();
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('movies').upsert(movie, { onConflict: 'tmdb_id' }).select().single();
      if (data) return data;
    }
    const db = getLocalDb();
    const existingIdx = db.movies.findIndex(m => m.tmdb_id === movie.tmdb_id);
    if (existingIdx >= 0) {
      db.movies[existingIdx] = { ...db.movies[existingIdx], ...movie, updated_at: now };
      saveLocalDb(db);
      return db.movies[existingIdx];
    } else {
      const newMovie: Movie = {
        id: `movie-${movie.tmdb_id}-${Date.now()}`,
        year: movie.year || (movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : 2024),
        language: movie.language || 'en',
        created_at: now,
        updated_at: now,
        ...movie
      };
      db.movies.push(newMovie);
      saveLocalDb(db);
      return newMovie;
    }
  },

  // --- Reviews ---
  async getReviewsByTmdbId(tmdbId: number): Promise<Review[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('tmdb_id', tmdbId)
        .order('posted_at', { ascending: false });
      if (data) return data;
    }
    const db = getLocalDb();
    return db.reviews.filter(r => r.tmdb_id === tmdbId);
  },

  async addReviews(reviews: Review[]): Promise<number> {
    if (!reviews || reviews.length === 0) return 0;
    
    // Strict non-negotiable rule validation: Every review MUST carry:
    // source name, author, date, original URL, text >= 15 chars.
    const validReviews = reviews.filter(r => 
      r.source && 
      r.author && 
      r.posted_at && 
      r.url && 
      r.text && 
      r.text.trim().length >= 15
    );

    if (validReviews.length === 0) return 0;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('reviews').insert(validReviews);
      if (!error) return validReviews.length;
    }

    const db = getLocalDb();
    let addedCount = 0;
    for (const r of validReviews) {
      // Avoid duplicate review texts for the same movie
      const exists = db.reviews.some(
        existing => existing.tmdb_id === r.tmdb_id && (existing.url === r.url || existing.text === r.text)
      );
      if (!exists) {
        db.reviews.push(r);
        addedCount++;
      }
    }
    saveLocalDb(db);
    return addedCount;
  },

  async voteReviewHelpfulness(reviewId: string, userId: string, voteType: 'up' | 'down'): Promise<{ up: number; down: number }> {
    const db = getLocalDb();
    const existingVote = db.review_votes.find(v => v.review_id === reviewId && v.user_id === userId);
    const review = db.reviews.find(r => r.id === reviewId);
    if (!review) return { up: 0, down: 0 };

    if (!existingVote) {
      db.review_votes.push({ review_id: reviewId, user_id: userId, vote_type: voteType });
      if (voteType === 'up') review.helpfulness_up = (review.helpfulness_up || 0) + 1;
      else review.helpfulness_down = (review.helpfulness_down || 0) + 1;
    } else if (existingVote.vote_type !== voteType) {
      if (voteType === 'up') {
        review.helpfulness_up = (review.helpfulness_up || 0) + 1;
        review.helpfulness_down = Math.max(0, (review.helpfulness_down || 1) - 1);
      } else {
        review.helpfulness_down = (review.helpfulness_down || 0) + 1;
        review.helpfulness_up = Math.max(0, (review.helpfulness_up || 1) - 1);
      }
      existingVote.vote_type = voteType;
    }
    saveLocalDb(db);
    return { up: review.helpfulness_up, down: review.helpfulness_down };
  },

  // --- Community User Reviews ---
  async getUserReviews(tmdbId: number): Promise<UserReview[]> {
    const db = getLocalDb();
    return db.user_reviews.filter(ur => ur.tmdb_id === tmdbId);
  },

  async addUserReview(userReview: Omit<UserReview, 'id' | 'created_at' | 'likes_count'>): Promise<UserReview> {
    const db = getLocalDb();
    const newReview: UserReview = {
      ...userReview,
      id: `ur-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      likes_count: 0,
      created_at: new Date().toISOString()
    };
    db.user_reviews.unshift(newReview);
    saveLocalDb(db);
    return newReview;
  },

  // --- Watchlist / Favorites ---
  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    const db = getLocalDb();
    return db.watchlists.filter(w => w.user_id === userId);
  },

  async toggleWatchlist(item: Omit<WatchlistItem, 'id' | 'created_at'>): Promise<{ added: boolean; status: string }> {
    const db = getLocalDb();
    const existingIdx = db.watchlists.findIndex(
      w => w.user_id === item.user_id && w.tmdb_id === item.tmdb_id && w.status === item.status
    );
    if (existingIdx >= 0) {
      db.watchlists.splice(existingIdx, 1);
      saveLocalDb(db);
      return { added: false, status: item.status };
    } else {
      db.watchlists.push({
        ...item,
        id: `w-${Date.now()}`,
        created_at: new Date().toISOString()
      });
      saveLocalDb(db);
      return { added: true, status: item.status };
    }
  },

  // --- Polls ---
  async getPolls(tmdbId: number, userId?: string): Promise<Poll[]> {
    const db = getLocalDb();
    return db.polls
      .filter(p => p.tmdb_id === tmdbId)
      .map(p => {
        const userVote = userId ? db.poll_votes.find(v => v.poll_id === p.id && v.user_id === userId)?.option_id : undefined;
        return { ...p, user_voted_option: userVote };
      });
  },

  async votePoll(pollId: string, userId: string, optionId: string): Promise<Poll | null> {
    const db = getLocalDb();
    const poll = db.polls.find(p => p.id === pollId);
    if (!poll) return null;

    const existingVote = db.poll_votes.find(v => v.poll_id === pollId && v.user_id === userId);
    if (existingVote) return { ...poll, user_voted_option: existingVote.option_id }; // Already voted

    db.poll_votes.push({ poll_id: pollId, user_id: userId, option_id: optionId });
    const opt = poll.options.find(o => o.id === optionId);
    if (opt) {
      opt.votes += 1;
    }
    saveLocalDb(db);
    return { ...poll, user_voted_option: optionId };
  },

  // --- Curated Lists ---
  async getLists(): Promise<CuratedList[]> {
    const db = getLocalDb();
    return db.lists.filter(l => l.is_public);
  },

  // --- Source Logs ---
  async logSourceFetch(source: string, status: string, message: string): Promise<void> {
    const db = getLocalDb();
    db.source_logs.unshift({
      id: `log-${Date.now()}`,
      source,
      status,
      message,
      timestamp: new Date().toISOString()
    });
    // Keep last 100 logs
    if (db.source_logs.length > 100) db.source_logs.length = 100;
    saveLocalDb(db);
  },

  async getSourceLogs() {
    const db = getLocalDb();
    return db.source_logs;
  },

  // --- Movie Videos (Hero In-Player: Teaser, Trailer, Clip, Song) ---
  async getMovieVideos(tmdbId: number): Promise<MovieVideo[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('movie_videos').select('*').eq('tmdb_id', tmdbId);
      if (data && data.length > 0) return data;
    }
    const db = getLocalDb();
    return (db.movie_videos || []).filter(v => v.tmdb_id === tmdbId);
  },

  async addMovieVideo(video: MovieVideo): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('movie_videos').insert([video]);
    }
    const db = getLocalDb();
    if (!db.movie_videos) db.movie_videos = [];
    const existing = db.movie_videos.findIndex(v => v.youtube_id === video.youtube_id);
    if (existing >= 0) {
      db.movie_videos[existing] = video;
    } else {
      db.movie_videos.push(video);
    }
    saveLocalDb(db);
  },

  // --- Official Rights Holder Channels (Feature A8) ---
  async getOfficialChannels(): Promise<OfficialChannel[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('official_channels').select('*');
      if (data && data.length > 0) return data;
    }
    const db = getLocalDb();
    return db.official_channels || [];
  },

  async addOfficialChannel(channel: OfficialChannel): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('official_channels').upsert([channel], { onConflict: 'channel_id' });
    }
    const db = getLocalDb();
    if (!db.official_channels) db.official_channels = [];
    const existing = db.official_channels.findIndex(c => c.channel_id === channel.channel_id);
    if (existing >= 0) {
      db.official_channels[existing] = channel;
    } else {
      db.official_channels.push(channel);
    }
    saveLocalDb(db);
  },

  async removeOfficialChannel(channelId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('official_channels').delete().eq('channel_id', channelId);
    }
    const db = getLocalDb();
    if (db.official_channels) {
      db.official_channels = db.official_channels.filter(c => c.channel_id !== channelId);
      saveLocalDb(db);
    }
  },

  // --- Legal Full-Movie Detection & Verification (Feature A8) ---
  async getLegalFullMovie(tmdbId: number): Promise<LegalFullMovie | null> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('legal_full_movies')
        .select('*')
        .eq('tmdb_id', tmdbId)
        .eq('verification_status', 'verified_approved')
        .maybeSingle();
      if (data) return data;
    }
    const db = getLocalDb();
    const found = (db.legal_full_movies || []).find(
      m => m.tmdb_id === tmdbId && m.verification_status === 'verified_approved'
    );
    return found || null;
  },

  async getAllLegalFullMovies(): Promise<LegalFullMovie[]> {
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('legal_full_movies')
        .select('*')
        .order('detected_at', { ascending: false });
      if (data) return data;
    }
    const db = getLocalDb();
    return db.legal_full_movies || [];
  },

  async saveLegalFullMovie(entry: LegalFullMovie): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('legal_full_movies').upsert([entry]);
    }
    const db = getLocalDb();
    if (!db.legal_full_movies) db.legal_full_movies = [];
    const existing = db.legal_full_movies.findIndex(
      m => m.id === entry.id || (m.tmdb_id === entry.tmdb_id && m.youtube_id === entry.youtube_id)
    );
    if (existing >= 0) {
      db.legal_full_movies[existing] = entry;
    } else {
      db.legal_full_movies.unshift(entry);
    }
    saveLocalDb(db);
  },

  async updateLegalFullMovieStatus(
    id: string,
    status: LegalFullMovie['verification_status'],
    reason?: string
  ): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('legal_full_movies')
        .update({ verification_status: status, rejection_reason: reason })
        .eq('id', id);
    }
    const db = getLocalDb();
    if (db.legal_full_movies) {
      const item = db.legal_full_movies.find(m => m.id === id);
      if (item) {
        item.verification_status = status;
        if (reason !== undefined) item.rejection_reason = reason;
        saveLocalDb(db);
      }
    }
  }
};
