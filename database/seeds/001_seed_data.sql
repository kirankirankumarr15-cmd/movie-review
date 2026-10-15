-- ==============================================================================
-- CineSense Seed Data: Core Demonstrations & Verified Trailers
-- ==============================================================================

-- 1. Demo User
INSERT INTO "Users" ("id", "name", "email", "password_hash", "createdAt", "updatedAt") 
VALUES (1, 'CineSense Reviewer', 'demo@cinesense.com', '$2a$10$wT1rK..seed_dummy_hash_for_offline_reproducibility', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 2. Canonical Movies (Toxic 2026, Jana Nayagan, Inception)
INSERT INTO "Movies" ("id", "title", "year", "director", "language", "age_rating", "trailer_youtube_id", "tmdb_id", "createdAt", "updatedAt")
VALUES 
(1, 'Toxic: A Fairy Tale for Grown-ups', 2026, 'Geetu Mohandas', 'KN', 'A', 'EfluEyQ5QIA', 1213243, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 'Jana Nayagan', 2026, 'H. Vinoth', 'TA', 'UA', 'gB1qR14eT3g', 1235877, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 'Inception', 2010, 'Christopher Nolan', 'EN', 'UA', 'YoHD9XEInc0', 27205, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 3. Verified Official Movie Videos (Trailers & Teasers)
INSERT INTO "MovieVideos" ("id", "tmdb_id", "youtube_id", "type", "title", "language", "is_official", "sort_order", "published_at", "embeddable", "createdAt", "updatedAt")
VALUES
(1, 1213243, 'EfluEyQ5QIA', 'teaser', 'TOXIC - Title Announcement Video | Yash | Geetu Mohandas', 'kn', 1, 0, '2023-12-08', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, 1213243, 'd_7t17N4v5g', 'trailer', 'TOXIC Official Glimpse & Teaser 2 | KVN Productions', 'kn', 1, 1, '2024-01-08', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 1235877, 'gB1qR14eT3g', 'teaser', 'Thalapathy 69 Official Announcement Teaser | KVN Productions', 'ta', 1, 0, '2024-09-14', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 4. Sample Multi-Aspect Reviews
INSERT INTO "Reviews" ("id", "movie_name", "review_text", "sentiment", "compound_score", "positive_score", "neutral_score", "negative_score", "createdAt", "updatedAt", "user_id")
VALUES
(1, 'Toxic: A Fairy Tale for Grown-ups', 'The visual scale and intense dark tone set a completely new benchmark for Indian action cinema.', 'positive', 0.92, 0.45, 0.55, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
(2, 'Jana Nayagan', 'Electrifying background score by Anirudh and stellar screen presence by Thalapathy Vijay.', 'positive', 0.88, 0.40, 0.60, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
(3, 'Inception', 'A timeless masterpiece of visionary world-building and psychological depth.', 'positive', 0.95, 0.50, 0.50, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
ON CONFLICT ("id") DO NOTHING;
