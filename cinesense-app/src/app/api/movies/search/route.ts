import { NextResponse } from 'next/server';
import { searchMovies, getDiscoveryMovies } from '@/lib/api-clients/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const lang = searchParams.get('lang');

    if (!query || query.trim().length === 0) {
      // If query is empty, return popular/trending movies for the requested language
      const results = await getDiscoveryMovies('trending', lang || undefined);
      return NextResponse.json({ results });
    }

    const results = await searchMovies(query, lang || undefined);
    return NextResponse.json({ results });
  } catch (error: any) {
    console.error('Error in /api/movies/search:', error);
    return NextResponse.json(
      { error: 'Failed to search movies', message: error.message },
      { status: 500 }
    );
  }
}
