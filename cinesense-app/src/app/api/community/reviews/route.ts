import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';
import { analyzeReviewSentiment } from '@/lib/sentiment';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tmdbId = parseInt(searchParams.get('tmdbId') || '0');

    if (!tmdbId) {
      return NextResponse.json({ error: 'tmdbId is required' }, { status: 400 });
    }

    const reviews = await dbService.getUserReviews(tmdbId);
    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fetch failed', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tmdbId, rating, title, text, userId = 'user-demo', userName = 'Community Reviewer' } = body;

    if (!tmdbId || !text || text.trim().length < 15) {
      return NextResponse.json(
        { error: 'Review text must be at least 15 characters long.' },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 10.' },
        { status: 400 }
      );
    }

    // Run real sentiment analysis on user review
    const analysis = analyzeReviewSentiment(text);

    const saved = await dbService.addUserReview({
      user_id: userId,
      user_name: userName,
      tmdb_id: tmdbId,
      rating: parseInt(rating),
      title: title || undefined,
      text: text.trim(),
      sentiment: analysis.sentiment,
      aspects: analysis.aspects,
      is_spoiler: analysis.is_spoiler,
    });

    return NextResponse.json({ success: true, review: saved });
  } catch (error: any) {
    console.error('Community review submission failed:', error);
    return NextResponse.json(
      { error: 'Submission failed', message: error.message },
      { status: 500 }
    );
  }
}
