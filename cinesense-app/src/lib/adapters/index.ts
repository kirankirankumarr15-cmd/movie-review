import { Review, SentimentSummary, ReviewAspects } from '../db/types';
import { dbService } from '../db';
import { fetchTmdbReviews } from './tmdb-reviews';
import { fetchRedditReviews } from './reddit-reviews';
import { fetchYouTubeComments } from './youtube-reviews';
import { fetchNewsCriticReviews } from './news-reviews';
import { extractThemes } from '../sentiment';

export async function aggregateAllReviews(
  tmdbId: number,
  title: string,
  language: string = 'en',
  trailerYoutubeId?: string
): Promise<{ reviews: Review[]; summary: SentimentSummary }> {
  // First check if reviews already exist in DB
  let existingReviews = await dbService.getReviewsByTmdbId(tmdbId);

  // If no reviews in DB, fetch from all sources in parallel with Promise.allSettled
  if (existingReviews.length === 0) {
    const startTime = Date.now();

    const [tmdbRes, redditRes, ytRes, newsRes] = await Promise.allSettled([
      fetchTmdbReviews(tmdbId),
      fetchRedditReviews(tmdbId, title, language),
      fetchYouTubeComments(tmdbId, trailerYoutubeId),
      fetchNewsCriticReviews(tmdbId),
    ]);

    const collected: Review[] = [];

    // Process TMDB
    if (tmdbRes.status === 'fulfilled' && tmdbRes.value.length > 0) {
      collected.push(...tmdbRes.value);
      await dbService.logSourceFetch('TMDB', 'SUCCESS', `Fetched ${tmdbRes.value.length} reviews`);
    } else {
      await dbService.logSourceFetch('TMDB', 'EMPTY', 'No reviews on TMDB');
    }

    // Process Reddit
    if (redditRes.status === 'fulfilled' && redditRes.value.length > 0) {
      collected.push(...redditRes.value);
      await dbService.logSourceFetch('Reddit', 'SUCCESS', `Fetched ${redditRes.value.length} posts`);
    } else {
      await dbService.logSourceFetch('Reddit', 'EMPTY', 'No matching Reddit posts');
    }

    // Process YouTube
    if (ytRes.status === 'fulfilled' && ytRes.value.length > 0) {
      collected.push(...ytRes.value);
      await dbService.logSourceFetch('YouTube', 'SUCCESS', `Fetched ${ytRes.value.length} comments`);
    } else {
      await dbService.logSourceFetch('YouTube', 'EMPTY', 'No YouTube comments or key omitted');
    }

    // Process Critic / News
    if (newsRes.status === 'fulfilled' && newsRes.value.length > 0) {
      collected.push(...newsRes.value);
      await dbService.logSourceFetch('News', 'SUCCESS', `Fetched ${newsRes.value.length} critic reviews`);
    } else {
      await dbService.logSourceFetch('News', 'EMPTY', 'No critic reviews matched');
    }

    // Deduplicate and filter (>= 15 chars, genuine content)
    const seenUrls = new Set<string>();
    const seenTexts = new Set<string>();
    const uniqueReviews: Review[] = [];

    for (const r of collected) {
      if (r.text.length < 15) continue;
      if (seenUrls.has(r.url) || seenTexts.has(r.text)) continue;
      seenUrls.add(r.url);
      seenTexts.add(r.text);
      uniqueReviews.push(r);
    }

    // Persist to database
    if (uniqueReviews.length > 0) {
      await dbService.addReviews(uniqueReviews);
      existingReviews = uniqueReviews;
    }
  }

  // Calculate Sentiment Summary
  const summary = calculateSentimentSummary(existingReviews);

  return { reviews: existingReviews, summary };
}

/**
 * Calculates mathematical sentiment distribution and aspect aggregates
 */
export function calculateSentimentSummary(reviews: Review[]): SentimentSummary {
  const total = reviews.length;
  if (total === 0) {
    return {
      total_reviews: 0,
      positive_count: 0,
      neutral_count: 0,
      negative_count: 0,
      positive_pct: 0,
      neutral_pct: 0,
      negative_pct: 0,
      average_confidence: 0,
      sources_count: 0,
      sources_breakdown: {},
      aspects_summary: {},
      top_positive_themes: [],
      top_negative_themes: [],
      last_updated: new Date().toISOString(),
    };
  }

  let posCount = 0;
  let neuCount = 0;
  let negCount = 0;
  let totalConfidence = 0;
  const sourcesBreakdown: Record<string, number> = {};

  const aspectsSummary: Record<string, { positive: number; neutral: number; negative: number }> = {
    story: { positive: 0, neutral: 0, negative: 0 },
    acting: { positive: 0, neutral: 0, negative: 0 },
    music: { positive: 0, neutral: 0, negative: 0 },
    direction: { positive: 0, neutral: 0, negative: 0 },
    visuals: { positive: 0, neutral: 0, negative: 0 },
    action: { positive: 0, neutral: 0, negative: 0 },
  };

  for (const r of reviews) {
    if (r.sentiment === 'positive') posCount++;
    else if (r.sentiment === 'negative') negCount++;
    else neuCount++;

    totalConfidence += r.confidence || 75;
    sourcesBreakdown[r.source] = (sourcesBreakdown[r.source] || 0) + 1;

    // Aspect aggregates
    if (r.aspects) {
      for (const [aspectKey, aspectVal] of Object.entries(r.aspects)) {
        if (aspectVal && aspectsSummary[aspectKey]) {
          const valKey = aspectVal as 'positive' | 'neutral' | 'negative';
          if (aspectsSummary[aspectKey][valKey] !== undefined) {
            aspectsSummary[aspectKey][valKey]++;
          }
        }
      }
    }
  }

  const { top_positive_themes, top_negative_themes } = extractThemes(reviews);

  return {
    total_reviews: total,
    positive_count: posCount,
    neutral_count: neuCount,
    negative_count: negCount,
    positive_pct: Math.round((posCount / total) * 100),
    neutral_pct: Math.round((neuCount / total) * 100),
    negative_pct: Math.round((negCount / total) * 100),
    average_confidence: Math.round(totalConfidence / total),
    sources_count: Object.keys(sourcesBreakdown).length,
    sources_breakdown: sourcesBreakdown,
    aspects_summary: aspectsSummary,
    top_positive_themes,
    top_negative_themes,
    last_updated: new Date().toISOString(),
  };
}
