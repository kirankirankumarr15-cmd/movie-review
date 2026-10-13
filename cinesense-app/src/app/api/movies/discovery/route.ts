import { NextResponse } from 'next/server';
import { getDiscoveryMovies } from '@/lib/api-clients/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = (searchParams.get('category') || 'trending') as
      | 'trending'
      | 'top_rated'
      | 'upcoming'
      | 'now_playing';
    const language = searchParams.get('lang') || undefined;
    const page = parseInt(searchParams.get('page') || '1');

    const movies = await getDiscoveryMovies(category, language, page);

    return NextResponse.json({
      category,
      language: language || 'all',
      results: movies,
    });
  } catch (error: any) {
    console.error('Error in discovery route:', error);
    return NextResponse.json(
      { error: 'Discovery fetch failed', message: error.message },
      { status: 500 }
    );
  }
}
