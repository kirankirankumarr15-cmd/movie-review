-- CineSense / Moctale Production Schema
-- Supports Kannada, Hindi, Telugu, Tamil, Malayalam and Hollywood movies
-- Includes RLS, foreign keys, indexes, and seed data

-- 1. Movies Table
CREATE TABLE IF NOT EXISTS public.movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tmdb_id INTEGER UNIQUE,
    title VARCHAR(255) NOT NULL,
    original_title VARCHAR(255),
    overview TEXT,
    release_date DATE,
    year INTEGER,
    director VARCHAR(255),
    language VARCHAR(10) NOT NULL, -- 'kn', 'hi', 'te', 'ta', 'ml', 'en'
    age_rating VARCHAR(20) DEFAULT 'UA',
    runtime_minutes INTEGER,
    poster_path VARCHAR(255),
    backdrop_path VARCHAR(255),
    trailer_youtube_id VARCHAR(100),
    genres JSONB DEFAULT '[]'::jsonb,
    box_office JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON public.movies (tmdb_id);
CREATE INDEX IF NOT EXISTS idx_movies_language ON public.movies (language);
CREATE INDEX IF NOT EXISTS idx_movies_year ON public.movies (year);

-- 2. People Table (Cast & Crew)
CREATE TABLE IF NOT EXISTS public.people (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tmdb_person_id INTEGER UNIQUE,
    name VARCHAR(255) NOT NULL,
    biography TEXT,
    profile_path VARCHAR(255),
    known_for_department VARCHAR(100),
    place_of_birth VARCHAR(255),
    birthday DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_people_tmdb_id ON public.people (tmdb_person_id);

-- 3. Movie Cast & Crew Junction
CREATE TABLE IF NOT EXISTS public.movie_cast (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
    person_id UUID REFERENCES public.people(id) ON DELETE CASCADE,
    role_type VARCHAR(50) NOT NULL, -- 'cast' or 'crew'
    character_name VARCHAR(255),
    job VARCHAR(100), -- 'Director', 'Writer', 'Music', etc.
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_movie_cast_movie_id ON public.movie_cast (movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_cast_person_id ON public.movie_cast (person_id);

-- 4. Multi-Source Verified Reviews
-- RULE: Every review MUST carry source, author, date, original URL, text.
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
    tmdb_id INTEGER,
    source VARCHAR(50) NOT NULL, -- 'TMDB', 'YouTube', 'Reddit', 'The Hindu', 'Times of India', etc.
    author VARCHAR(255) NOT NULL,
    author_avatar VARCHAR(500),
    text TEXT NOT NULL,
    url VARCHAR(1000) NOT NULL,
    language VARCHAR(10) DEFAULT 'en', -- 'en', 'kn', 'hi', 'hinglish', 'kanglish'
    sentiment VARCHAR(20) NOT NULL, -- 'positive', 'neutral', 'negative'
    confidence FLOAT DEFAULT 0.0,
    compound_score FLOAT DEFAULT 0.0,
    aspects JSONB DEFAULT '{"story":null,"acting":null,"music":null,"direction":null,"visuals":null,"action":null}'::jsonb,
    is_spoiler BOOLEAN DEFAULT FALSE,
    helpfulness_up INTEGER DEFAULT 0,
    helpfulness_down INTEGER DEFAULT 0,
    posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_review_text_len CHECK (char_length(text) >= 15)
);

CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON public.reviews (movie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_tmdb_id ON public.reviews (tmdb_id);
CREATE INDEX IF NOT EXISTS idx_reviews_source ON public.reviews (source);
CREATE INDEX IF NOT EXISTS idx_reviews_sentiment ON public.reviews (sentiment);
CREATE INDEX IF NOT EXISTS idx_reviews_language ON public.reviews (language);

-- 5. User Profiles (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE,
    full_name VARCHAR(255),
    avatar_url VARCHAR(500),
    bio TEXT,
    badge_title VARCHAR(100) DEFAULT 'Film Novice',
    points INTEGER DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. User Reviews (Community Reviews on CineSense)
CREATE TABLE IF NOT EXISTS public.user_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
    tmdb_id INTEGER,
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    title VARCHAR(255),
    text TEXT NOT NULL CHECK (char_length(text) >= 15),
    sentiment VARCHAR(20) NOT NULL DEFAULT 'neutral',
    aspects JSONB DEFAULT '{}'::jsonb,
    is_spoiler BOOLEAN DEFAULT FALSE,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id)
);

-- 7. Comments and Replies
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- 'review', 'user_review', 'movie'
    target_id UUID NOT NULL,
    parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    dislikes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Watchlists & Watch Status
CREATE TABLE IF NOT EXISTS public.watchlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
    tmdb_id INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'watchlist', -- 'watchlist', 'watched', 'favorite'
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, movie_id, status)
);

-- 9. Custom Curated Lists
CREATE TABLE IF NOT EXISTS public.lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE,
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
    tmdb_id INTEGER,
    rank INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(list_id, movie_id)
);

-- 10. User Follows
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (follower_id, following_id)
);

-- 11. Polls & Votes
CREATE TABLE IF NOT EXISTS public.polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
    question VARCHAR(500) NOT NULL,
    options JSONB NOT NULL, -- array of { id, text, votes }
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    option_id VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_id)
);

-- 12. Review Helpfulness & Votes
CREATE TABLE IF NOT EXISTS public.review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    review_id UUID,
    vote_type VARCHAR(10) NOT NULL, -- 'up' or 'down'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, review_id)
);

-- 13. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Reports & Moderation
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type VARCHAR(50) NOT NULL, -- 'review', 'user_review', 'comment'
    target_id UUID NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Source Logs & Health
CREATE TABLE IF NOT EXISTS public.source_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_name VARCHAR(50) NOT NULL,
    movie_id UUID,
    status VARCHAR(20) NOT NULL, -- 'SUCCESS', 'FAILED', 'TIMEOUT', 'RATE_LIMITED'
    message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Row Level Security (RLS)
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_cast ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_logs ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public can view movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Public can view people" ON public.people FOR SELECT USING (true);
CREATE POLICY "Public can view movie_cast" ON public.movie_cast FOR SELECT USING (true);
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public can view user_reviews" ON public.user_reviews FOR SELECT USING (true);
CREATE POLICY "Public can view comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public can view public lists" ON public.lists FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Public can view list_items" ON public.list_items FOR SELECT USING (true);
CREATE POLICY "Public can view polls" ON public.polls FOR SELECT USING (true);

-- Authenticated User Write Policies
CREATE POLICY "Users manage own profiles" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users manage own user_reviews" ON public.user_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own watchlists" ON public.watchlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own comments" ON public.comments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own lists" ON public.lists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own list_items" ON public.list_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.lists WHERE lists.id = list_items.list_id AND lists.user_id = auth.uid())
);
CREATE POLICY "Users manage own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);
CREATE POLICY "Users cast poll votes" ON public.poll_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage review votes" ON public.review_votes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- SEED DATA (Non-Negotiable Seed: Toxic 2026, dir. Geetu Mohandas, KN, Age Rating A, trailer ID EfluEyQ5QIA)
INSERT INTO public.movies (
    id, tmdb_id, title, original_title, overview, release_date, year, director, language, age_rating, runtime_minutes, trailer_youtube_id, genres
) VALUES (
    'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    1213243,
    'Toxic: A Fairy Tale for Grown-ups',
    'Toxic',
    'A high-octane action thriller exploring the gritty underworld, headlined by Yash and directed by Geetu Mohandas.',
    '2026-08-26',
    2026,
    'Geetu Mohandas',
    'kn',
    'A',
    155,
    'EfluEyQ5QIA',
    '[{"id": 28, "name": "Action"}, {"id": 80, "name": "Crime"}, {"id": 18, "name": "Drama"}]'::jsonb
) ON CONFLICT (tmdb_id) DO UPDATE SET
    trailer_youtube_id = EXCLUDED.trailer_youtube_id,
    director = EXCLUDED.director,
    age_rating = EXCLUDED.age_rating;

-- 16. Movie Videos (Hero In-Player: Teasers, Trailers, Clips, Songs)
CREATE TABLE IF NOT EXISTS public.movie_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    movie_id UUID REFERENCES public.movies(id) ON DELETE CASCADE,
    tmdb_id INTEGER NOT NULL,
    youtube_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'trailer', -- 'teaser', 'trailer', 'clip', 'song'
    title VARCHAR(255) NOT NULL,
    language VARCHAR(10) DEFAULT 'kn',
    is_official BOOLEAN DEFAULT TRUE,
    channel_name VARCHAR(255),
    channel_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_movie_videos_tmdb ON public.movie_videos(tmdb_id);

-- 17. Official Rights Holder Channels (Admin Whitelist for Feature A8)
CREATE TABLE IF NOT EXISTS public.official_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id VARCHAR(100) UNIQUE NOT NULL,
    channel_name VARCHAR(255) NOT NULL,
    language VARCHAR(50),
    verified_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_whitelisted BOOLEAN DEFAULT TRUE,
    notes TEXT
);

-- 18. Legal Full-Movie Detection & Verification (Feature A8)
CREATE TABLE IF NOT EXISTS public.legal_full_movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tmdb_id INTEGER NOT NULL,
    movie_title VARCHAR(255) NOT NULL,
    youtube_id VARCHAR(50) NOT NULL,
    channel_id VARCHAR(100) NOT NULL,
    channel_name VARCHAR(255) NOT NULL,
    video_duration_minutes INTEGER NOT NULL,
    tmdb_runtime_minutes INTEGER NOT NULL,
    is_embeddable BOOLEAN DEFAULT TRUE,
    verification_status VARCHAR(50) NOT NULL DEFAULT 'pending_admin', -- 'verified_approved', 'pending_admin', 'rejected_pirated_or_unverified'
    rejection_reason TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_legal_full_movies_tmdb ON public.legal_full_movies(tmdb_id);

-- Seed Official Channels Whitelist
INSERT INTO public.official_channels (channel_id, channel_name, language, notes) VALUES
('UC7m01_w20K5tK5d8C9J1_kw', 'KVN Productions', 'kn', 'Official rights holder for Toxic and KVN theatrical releases'),
('UCh5nK2d2uQp0F8_u28x_8xA', 'Hombale Films', 'kn', 'Official Sandalwood production house (KGF, Kantara, Salaar)'),
('UCU_4jFjBqP1WjHkO9vV7Yqw', 'Rajshri', 'hi', 'Official rights holder for Hindi classic and family cinema catalog'),
('UCzauWvLdYdMhZ9w7B0g1w8A', 'Goldmines Telefilms', 'hi', 'Official Hindi and South-dubbed legal cinema channel'),
('UCxX6YmEw7vFmS9mQeM4bK2g', 'Shemaroo Filmi Gaane / Movies', 'hi', 'Official Shemaroo entertainment catalog'),
('UCq-Fj5jknLsUf-MWSy4_brA', 'T-Series', 'hi', 'Official T-Series Bollywood catalog'),
('UCbTLwN10NoCU4WDzZL1pnCw', 'Yash Raj Films', 'hi', 'Official YRF production house')
ON CONFLICT (channel_id) DO NOTHING;

-- Seed Toxic 2026 Movie Videos (Verified KVN Productions uploads)
INSERT INTO public.movie_videos (tmdb_id, youtube_id, type, title, language, is_official, channel_name, channel_id) VALUES
(1213243, 'EfluEyQ5QIA', 'teaser', 'TOXIC - Title Announcement Video | Yash | Geetu Mohandas | KVN Productions', 'kn', true, 'KVN Productions', 'UC7m01_w20K5tK5d8C9J1_kw'),
(1213243, 'd_7t17N4v5g', 'trailer', 'TOXIC Official Glimpse & Trailer | KVN Productions', 'kn', true, 'KVN Productions', 'UC7m01_w20K5tK5d8C9J1_kw')
ON CONFLICT DO NOTHING;

