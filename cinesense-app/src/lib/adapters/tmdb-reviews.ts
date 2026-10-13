import { Review } from '../db/types';
import { analyzeReviewSentiment } from '../sentiment';

const TMDB_BASE_URL = 'https://api.tmdb.org/3';

export async function fetchTmdbReviews(tmdbId: number): Promise<Review[]> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return [];

  const url = `${TMDB_BASE_URL}/movie/${tmdbId}/reviews?page=1`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        accept: 'application/json',
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const data = await res.json();
    const rawReviews = data.results || [];

    const reviews: Review[] = rawReviews
      .filter((r: any) => r.content && r.content.trim().length >= 15)
      .map((r: any) => {
        const text = r.content.trim();
        const analysis = analyzeReviewSentiment(text);

        return {
          id: `tmdb-${r.id}`,
          tmdb_id: tmdbId,
          source: 'TMDB',
          author: r.author_details?.username || r.author || 'TMDB User',
          author_avatar: r.author_details?.avatar_path
            ? r.author_details.avatar_path.startsWith('/http')
              ? r.author_details.avatar_path.slice(1)
              : `https://image.tmdb.org/t/p/w185${r.author_details.avatar_path}`
            : undefined,
          text,
          url: r.url || `https://www.themoviedb.org/review/${r.id}`,
          language: analysis.detected_language,
          sentiment: analysis.sentiment,
          confidence: analysis.confidence,
          compound_score: analysis.compound_score,
          aspects: analysis.aspects,
          is_spoiler: analysis.is_spoiler,
          helpfulness_up: 0,
          helpfulness_down: 0,
          posted_at: r.created_at || new Date().toISOString(),
          fetched_at: new Date().toISOString(),
        };
      });

    return reviews;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('TMDB reviews fetch failed/timed out:', err);
    return [];
  }
}
