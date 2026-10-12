import { NextResponse } from 'next/server';
import { searchMovies } from '@/lib/api-clients/tmdb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const lang = searchParams.get('lang');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
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
