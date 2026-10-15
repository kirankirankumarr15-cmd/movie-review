-- ==============================================================================
-- CineSense Migration 002: Trailer Diagnostics & Health Columns
-- Adds observability & embeddability tracking to MovieVideos
-- ==============================================================================

-- Safely add diagnostic columns to MovieVideos if they do not exist
ALTER TABLE "MovieVideos" ADD COLUMN "checked_at" TIMESTAMP WITH TIME ZONE;
ALTER TABLE "MovieVideos" ADD COLUMN "source" VARCHAR(50) DEFAULT 'auto';
ALTER TABLE "MovieVideos" ADD COLUMN "status" VARCHAR(50) DEFAULT 'OK';
ALTER TABLE "MovieVideos" ADD COLUMN "channel_title" VARCHAR(255);
ALTER TABLE "MovieVideos" ADD COLUMN "channel_id" VARCHAR(255);
ALTER TABLE "MovieVideos" ADD COLUMN "score" FLOAT;
ALTER TABLE "MovieVideos" ADD COLUMN "diagnostic_reason" TEXT;
