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

-- Sample Data (Demo Reviews)
INSERT INTO "Users" ("name", "email", "password_hash", "createdAt", "updatedAt") 
VALUES ('Demo User', 'demo@cinesense.com', 'hashed_password_here', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO "Reviews" ("movie_name", "review_text", "sentiment", "compound_score", "positive_score", "neutral_score", "negative_score", "createdAt", "updatedAt", "user_id") 
VALUES 
('Inception', 'The performances were outstanding and the cinematography was beautiful.', 'positive', 0.85, 0.45, 0.55, 0.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('Average Movie', 'The movie had some good moments, but overall it was average.', 'neutral', 0.23, 0.15, 0.75, 0.1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1),
('Bad Movie', 'The story was predictable and the pacing was painfully slow.', 'negative', -0.65, 0.0, 0.6, 0.4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1);
