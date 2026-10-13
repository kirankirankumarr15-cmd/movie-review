import { NextResponse } from 'next/server';
import { analyzeReviewSentiment } from '@/lib/sentiment';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Review text cannot be empty' }, { status: 400 });
    }

    const analysis = analyzeReviewSentiment(text.trim());

    // Predict numerical rating from compound score (Scale 1 to 10)
    // compound [-1, 1] mapped to [1, 10]: 5.5 + compound * 4.5
    const predictedRating = Math.min(
      10,
      Math.max(1, parseFloat((5.5 + analysis.compound_score * 4.5).toFixed(1)))
    );

    return NextResponse.json({
      ...analysis,
      predicted_rating: predictedRating,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Analysis failed', message: error.message },
      { status: 500 }
    );
  }
}
