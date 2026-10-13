import { NextResponse } from 'next/server';
import { getMovieDetails } from '@/lib/api-clients/tmdb';
import { aggregateAllReviews } from '@/lib/adapters';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const sourceFilter = searchParams.get('source'); // 'all' or specific
    const sentimentFilter = searchParams.get('sentiment'); // 'all', 'positive', 'neutral', 'negative'
    const languageFilter = searchParams.get('language'); // 'all', 'en', 'kn', 'hi', etc.
    const sortBy = searchParams.get('sort') || 'latest'; // 'latest', 'most_helpful', 'confidence'
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const movie = await getMovieDetails(id);
    const { reviews, summary } = await aggregateAllReviews(
      movie.id,
      movie.title,
      movie.original_language,
      movie.trailer_youtube_id
    );

    // Apply filtering
    let filtered = reviews;

    if (sourceFilter && sourceFilter !== 'all') {
      filtered = filtered.filter((r) => r.source.toLowerCase() === sourceFilter.toLowerCase());
    }

    if (sentimentFilter && sentimentFilter !== 'all') {
      filtered = filtered.filter((r) => r.sentiment.toLowerCase() === sentimentFilter.toLowerCase());
    }

    if (languageFilter && languageFilter !== 'all') {
      filtered = filtered.filter((r) => r.language.toLowerCase() === languageFilter.toLowerCase());
    }

    // Apply sorting
    if (sortBy === 'most_helpful') {
      filtered.sort((a, b) => (b.helpfulness_up - b.helpfulness_down) - (a.helpfulness_up - a.helpfulness_down));
    } else if (sortBy === 'confidence') {
      filtered.sort((a, b) => b.confidence - a.confidence);
    } else {
      // Latest
      filtered.sort((a, b) => new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime());
    }

    // Pagination
    const totalCount = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      reviews: paginated,
      summary,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error('Error in reviews route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', message: error.message },
      { status: 500 }
    );
  }
}
