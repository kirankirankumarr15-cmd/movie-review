import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getMovieDetails } from '@/lib/api-clients/tmdb';
import { aggregateAllReviews } from '@/lib/adapters';
import MovieClientView from './MovieClientView';
import SentimentSummaryCard from '@/components/movie/SentimentSummaryCard';
import ReviewList from '@/components/movie/ReviewList';

import CommunityReviewSection from '@/components/movie/CommunityReviewSection';
import MovieChatbot from '@/components/movie/MovieChatbot';
import MoviePollCard from '@/components/movie/MoviePollCard';
import { dbService } from '@/lib/db';
import { LegalFullMovieService } from '@/lib/services/legal-full-movie';
import { TrailerResolverService } from '@/lib/services/trailer-resolver';
import { MovieVideo } from '@/lib/db/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const movie = await getMovieDetails(id);
    const releaseYear = movie.release_date ? `(${movie.release_date.slice(0, 4)})` : '';
    return {
      title: `${movie.title} ${releaseYear} — Reviews & Sentiment Analysis | CineSense`,
      description: movie.overview
        ? movie.overview.slice(0, 160)
        : `Explore authentic multi-source reviews and real sentiment analytics for ${movie.title}.`,
      openGraph: {
        title: `${movie.title} — CineSense Sentiment & Reviews`,
        description: movie.overview?.slice(0, 160),
        images: movie.backdrop_path ? [`https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`] : [],
      },
    };
  } catch {
    return {
      title: 'Movie Details | CineSense',
      description: 'Understand what audiences really feel.',
    };
  }
}

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;

  let movie;
  try {
    movie = await getMovieDetails(id);
  } catch (error) {
    console.error('Failed to load movie for page:', error);
    notFound();
  }

  // 1. Fetch official videos (teasers, trailers, clips, songs)
  let videos = await dbService.getMovieVideos(movie.id);
  if (videos.length === 0 && movie.trailer_youtube_id) {
    videos = [
      {
        id: `vid-tmdb-${movie.id}`,
        tmdb_id: movie.id,
        youtube_id: movie.trailer_youtube_id,
        type: 'trailer',
        title: `${movie.title} Official Trailer`,
        language: movie.original_language,
        is_official: true,
      },
    ];
  }

  // 2. Intelligent Dynamic Trailer Resolution (for Sandalwood, regional, Vijay movies, & classics)
  if (videos.length === 0) {
    videos = await TrailerResolverService.resolveVideosForMovie({
      id: movie.id,
      title: movie.title,
      release_date: movie.release_date,
      original_language: movie.original_language,
    });
    if (videos.length > 0 && !movie.trailer_youtube_id) {
      movie.trailer_youtube_id = videos[0].youtube_id;
    }
  }

  // 3. Auto-fill missing backdrops or posters using high-res video thumbnails
  if (videos.length > 0) {
    const topVid = videos[0];
    if (!movie.backdrop_path) {
      movie.backdrop_path = `https://img.youtube.com/vi/${topVid.youtube_id}/maxresdefault.jpg`;
    }
    if (!movie.poster_path) {
      movie.poster_path = `https://img.youtube.com/vi/${topVid.youtube_id}/hqdefault.jpg`;
    }
  }

  // 4. Fetch real reviews & sentiment summary
  const { reviews, summary } = await aggregateAllReviews(
    movie.id,
    movie.title,
    movie.original_language,
    movie.trailer_youtube_id
  );

  // Check Feature A8: Legal Full-Movie Playback
  const releaseYearNum = movie.release_date ? parseInt(movie.release_date.slice(0, 4), 10) : 2026;
  const legalResult = await LegalFullMovieService.findVerifiedFullMovie(
    movie.id,
    movie.title,
    releaseYearNum,
    movie.runtime || 0
  );

  // Fetch polls
  const polls = await dbService.getPolls(movie.id);

  return (
    <MovieClientView
      movie={movie}
      movieVideos={videos}
      legalFullMovie={legalResult.isLegallyAvailable ? legalResult.legalMovie : null}
      sentimentSummarySlot={<SentimentSummaryCard summary={summary} />}
      reviewsSlot={<ReviewList initialReviews={reviews} tmdbId={movie.id} />}
      communityReviewsSlot={<CommunityReviewSection tmdbId={movie.id} movieTitle={movie.title} />}
      chatbotSlot={<MovieChatbot tmdbId={movie.id} movieTitle={movie.title} />}
      pollsSlot={<MoviePollCard initialPolls={polls} movieTitle={movie.title} />}
    />
  );
}
