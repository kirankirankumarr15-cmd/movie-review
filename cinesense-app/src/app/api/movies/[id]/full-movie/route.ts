import { NextResponse } from 'next/server';
import { LegalFullMovieService } from '@/lib/services/legal-full-movie';
import { getMovieDetails } from '@/lib/api-clients/tmdb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tmdbId = parseInt(id, 10);
    if (isNaN(tmdbId)) {
      return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
    }

    const movie = await getMovieDetails(tmdbId);
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }

    const releaseYear = movie.release_date ? parseInt(movie.release_date.slice(0, 4), 10) : 2026;
    const result = await LegalFullMovieService.findVerifiedFullMovie(
      tmdbId,
      movie.title,
      releaseYear,
      movie.runtime || 0
    );

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching full movie status:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
