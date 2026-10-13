import { NextResponse } from 'next/server';
import { getMovieDetails } from '@/lib/api-clients/tmdb';
import { dbService } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Movie ID is required' }, { status: 400 });
    }

    const movieDetails = await getMovieDetails(id);

    // Sync movie details with database
    await dbService.upsertMovie({
      tmdb_id: movieDetails.id,
      title: movieDetails.title,
      original_title: movieDetails.original_title,
      overview: movieDetails.overview,
      release_date: movieDetails.release_date,
      year: movieDetails.release_date ? parseInt(movieDetails.release_date.slice(0, 4)) : 2024,
      director: movieDetails.director,
      language: movieDetails.original_language,
      age_rating: movieDetails.age_rating || 'UA',
      runtime_minutes: movieDetails.runtime || undefined,
      poster_path: movieDetails.poster_path,
      backdrop_path: movieDetails.backdrop_path,
      trailer_youtube_id: movieDetails.trailer_youtube_id,
      genres: movieDetails.genres,
      box_office: {
        budget: movieDetails.budget,
        revenue: movieDetails.revenue,
      }
    });

    return NextResponse.json(movieDetails);
  } catch (error: any) {
    console.error('Error fetching movie details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch movie details', message: error.message },
      { status: 500 }
    );
  }
}
