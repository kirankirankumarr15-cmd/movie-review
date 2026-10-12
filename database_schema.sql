-- CineSense Database Schema

CREATE TABLE "Users" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password_hash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE TABLE "Reviews" (
    "id" SERIAL PRIMARY KEY,
    "movie_name" VARCHAR(255),
    "review_text" TEXT NOT NULL,
    "sentiment" VARCHAR(255) NOT NULL,
    "compound_score" FLOAT NOT NULL,
    "positive_score" FLOAT NOT NULL,
    "neutral_score" FLOAT NOT NULL,
    "negative_score" FLOAT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "user_id" INTEGER REFERENCES "Users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Movies" (
    "id" SERIAL PRIMARY KEY,
    "title" VARCHAR(255) NOT NULL,
    "year" INTEGER,
    "director" VARCHAR(255),
    "language" VARCHAR(50),
    "age_rating" VARCHAR(20),
    "trailer_youtube_id" VARCHAR(100),
    "tmdb_id" INTEGER UNIQUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Sample Data (Demo Reviews)
INSERT INTO "Users" ("name", "email", "password_hash", "createdAt", "updatedAt") 
VALUES ('Demo User', 'demo@cinesense.com', 'hashed_password_here', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Reviews" ("movie_name", "review_text", "sentiment", "compound_score", "positive_score", "neutral_score", "negative_score", "createdAt", "updatedAt", "user_id") 
VALUES 
('Inception', 'The performances were outstanding and the cinematography was beautiful.', 'positive', 0.85, 0.45, 0.55, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('Average Movie', 'The movie had some good moments, but overall it was average.', 'neutral', 0.23, 0.15, 0.75, 0.1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('Bad Movie', 'The story was predictable and the pacing was painfully slow.', 'negative', -0.65, 0.0, 0.6, 0.4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1);

-- Seed Toxic (2026, dir. Geetu Mohandas, KN, Age Rating A) with trailer ID EfluEyQ5QIA
INSERT INTO "Movies" ("title", "year", "director", "language", "age_rating", "trailer_youtube_id", "tmdb_id", "createdAt", "updatedAt")
VALUES ('Toxic: A Fairy Tale for Grown-ups', 2026, 'Geetu Mohandas', 'KN', 'A', 'EfluEyQ5QIA', 1213243, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

