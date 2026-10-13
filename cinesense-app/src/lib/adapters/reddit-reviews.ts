import { Review } from '../db/types';
import { analyzeReviewSentiment } from '../sentiment';

const SUBREDDITS_BY_LANGUAGE: Record<string, string[]> = {
  kn: ['sandalwood', 'kannada', 'movies'],
  hi: ['bollywood', 'indianmedia', 'movies'],
  te: ['tollywood', 'movies'],
  ta: ['kollywood', 'movies'],
  ml: ['malayalammovies', 'movies'],
  en: ['movies', 'flicks'],
};

export async function fetchRedditReviews(
  tmdbId: number,
  movieTitle: string,
  language: string = 'en'
): Promise<Review[]> {
  const subreddits = SUBREDDITS_BY_LANGUAGE[language] || ['movies', 'bollywood'];
  const targetSub = subreddits[0];

  const query = `${movieTitle} review`;
  const url = `https://www.reddit.com/r/${targetSub}/search.json?q=${encodeURIComponent(
    query
  )}&restrict_sr=on&sort=relevance&limit=5`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CineSense/1.0; +https://cinesense.app)',
        Accept: 'application/json',
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const data = await res.json();
    const children = data?.data?.children || [];

    const reviews: Review[] = [];

    for (const item of children) {
      const post = item.data;
      if (!post || post.over_18 || post.is_video) continue;

      const rawText = post.selftext ? `${post.title}. ${post.selftext}` : post.title;
      const text = rawText.trim();

      // Rule: Clean & validate length >= 15 chars, not bot spam
      if (
        text.length < 15 ||
        post.author === 'AutoModerator' ||
        post.author === '[deleted]'
      ) {
        continue;
      }

      // Filter out pure link-only posts
      if (text.startsWith('http://') || text.startsWith('https://')) continue;

      const analysis = analyzeReviewSentiment(text);

      reviews.push({
        id: `reddit-${post.id}`,
        tmdb_id: tmdbId,
        source: 'Reddit',
        author: `u/${post.author}`,
        author_avatar: undefined,
        text: text.length > 800 ? `${text.slice(0, 800)}...` : text,
        url: `https://www.reddit.com${post.permalink}`,
        language: analysis.detected_language,
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        compound_score: analysis.compound_score,
        aspects: analysis.aspects,
        is_spoiler: analysis.is_spoiler,
        helpfulness_up: post.ups || 0,
        helpfulness_down: 0,
        posted_at: new Date(post.created_utc * 1000).toISOString(),
        fetched_at: new Date().toISOString(),
      });
    }

    return reviews;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error(`Reddit search failed for r/${targetSub}:`, err);
    return [];
  }
}
