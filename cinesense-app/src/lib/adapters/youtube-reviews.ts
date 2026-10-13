import { Review } from '../db/types';
import { analyzeReviewSentiment } from '../sentiment';

export async function fetchYouTubeComments(
  tmdbId: number,
  trailerYoutubeId?: string
): Promise<Review[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || !trailerYoutubeId) {
    // Graceful no-op when key is absent
    return [];
  }

  const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${trailerYoutubeId}&maxResults=10&order=relevance&key=${apiKey}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);
    if (!res.ok) return [];

    const data = await res.json();
    const items = data?.items || [];

    const reviews: Review[] = [];

    for (const item of items) {
      const topComment = item?.snippet?.topLevelComment?.snippet;
      if (!topComment) continue;

      const text = (topComment.textDisplay || topComment.textOriginal || '').trim();
      if (text.length < 15) continue;

      const analysis = analyzeReviewSentiment(text);

      reviews.push({
        id: `yt-${item.id}`,
        tmdb_id: tmdbId,
        source: 'YouTube',
        author: topComment.authorDisplayName || 'YouTube Viewer',
        author_avatar: topComment.authorProfileImageUrl,
        text,
        url: `https://www.youtube.com/watch?v=${trailerYoutubeId}&lc=${item.id}`,
        language: analysis.detected_language,
        sentiment: analysis.sentiment,
        confidence: analysis.confidence,
        compound_score: analysis.compound_score,
        aspects: analysis.aspects,
        is_spoiler: analysis.is_spoiler,
        helpfulness_up: topComment.likeCount || 0,
        helpfulness_down: 0,
        posted_at: topComment.publishedAt || new Date().toISOString(),
        fetched_at: new Date().toISOString(),
      });
    }

    return reviews;
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('YouTube comments fetch error:', err);
    return [];
  }
}
