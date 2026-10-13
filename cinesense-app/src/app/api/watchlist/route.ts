import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'user-demo';

    const items = await dbService.getWatchlist(userId);
    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: 'Fetch failed', message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tmdbId, movieTitle, posterPath, status = 'watchlist', userId = 'user-demo' } = body;

    if (!tmdbId || !movieTitle) {
      return NextResponse.json({ error: 'tmdbId and movieTitle are required' }, { status: 400 });
    }

    const result = await dbService.toggleWatchlist({
      user_id: userId,
      tmdb_id: tmdbId,
      movie_title: movieTitle,
      poster_path: posterPath,
      status,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: 'Toggle failed', message: error.message }, { status: 500 });
  }
}
