-- ==============================================================================
-- CineSense Migration 001: Initial Core Schema
-- Compatible with PostgreSQL and SQLite
-- ==============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS "Users" (
    "id" INTEGER PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Movies Table (Catalog of Analyzed Movies)
CREATE TABLE IF NOT EXISTS "Movies" (
    "id" INTEGER PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "year" INTEGER,
    "director" VARCHAR(255),
    "language" VARCHAR(50),
    "age_rating" VARCHAR(20),
    "trailer_youtube_id" VARCHAR(100),
    "tmdb_id" INTEGER UNIQUE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Reviews Table
CREATE TABLE IF NOT EXISTS "Reviews" (
    "id" INTEGER PRIMARY KEY,
    "movie_name" VARCHAR(255),
    "review_text" TEXT NOT NULL,
    "sentiment" VARCHAR(255) NOT NULL,
    "compound_score" FLOAT NOT NULL,
    "positive_score" FLOAT NOT NULL,
    "neutral_score" FLOAT NOT NULL,
    "negative_score" FLOAT NOT NULL,
    "media_type" VARCHAR(50) DEFAULT 'movie',
    "season_number" INTEGER,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "user_id" INTEGER REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 4. Upcoming Movies Table
CREATE TABLE IF NOT EXISTS "UpcomingMovies" (
    "id" INTEGER PRIMARY KEY,
    "tmdb_id" INTEGER NOT NULL UNIQUE,
    "title" VARCHAR(255) NOT NULL,
    "original_title" VARCHAR(255),
    "original_language" VARCHAR(50) DEFAULT 'en',
    "overview" TEXT,
    "poster_path" VARCHAR(255),
    "backdrop_path" VARCHAR(255),
    "genres" TEXT,
    "release_date" VARCHAR(50),
    "release_status" VARCHAR(50) DEFAULT 'Planned',
    "date_confirmed" BOOLEAN DEFAULT 1,
    "release_type" VARCHAR(50) DEFAULT 'theatrical',
    "ott_partner" VARCHAR(100),
    "popularity" FLOAT DEFAULT 0,
    "has_trailer" BOOLEAN DEFAULT 0,
    "has_teaser" BOOLEAN DEFAULT 0,
    "director" VARCHAR(255),
    "cast" TEXT,
    "banner" VARCHAR(255),
    "music_director" VARCHAR(255),
    "runtime" INTEGER,
    "certification" VARCHAR(20),
    "is_hidden" BOOLEAN DEFAULT 0,
    "last_synced_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Movie Videos Table (Trailers, Teasers, Songs, Clips)
CREATE TABLE IF NOT EXISTS "MovieVideos" (
    "id" INTEGER PRIMARY KEY,
    "tmdb_id" INTEGER NOT NULL,
    "youtube_id" VARCHAR(100) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'trailer',
    "title" VARCHAR(255),
    "language" VARCHAR(50),
    "is_official" BOOLEAN DEFAULT 1,
    "sort_order" INTEGER DEFAULT 0,
    "published_at" VARCHAR(255),
    "embeddable" BOOLEAN DEFAULT 1,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Release Date History Table
CREATE TABLE IF NOT EXISTS "ReleaseDateHistories" (
    "id" INTEGER PRIMARY KEY,
    "tmdb_id" INTEGER NOT NULL,
    "old_date" VARCHAR(50),
    "new_date" VARCHAR(50) NOT NULL,
    "reason" VARCHAR(255),
    "source_url" VARCHAR(500),
    "changed_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
