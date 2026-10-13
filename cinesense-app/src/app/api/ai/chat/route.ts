import { NextResponse } from 'next/server';
import { getMovieDetails } from '@/lib/api-clients/tmdb';
import { dbService } from '@/lib/db';
import { calculateSentimentSummary } from '@/lib/adapters';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, tmdbId } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    if (!tmdbId) {
      return NextResponse.json({ error: 'tmdbId is required' }, { status: 400 });
    }

    const movie = await getMovieDetails(tmdbId);
    const reviews = await dbService.getReviewsByTmdbId(tmdbId);
    const summary = calculateSentimentSummary(reviews);

    const qLower = message.toLowerCase().trim();

    // 1. Director question
    if (qLower.includes('director') || qLower.includes('directed by') || qLower.includes('who directed')) {
      if (movie.director) {
        return NextResponse.json({
          reply: `"${movie.title}" is directed by **${movie.director}**.`,
          sources: [{ name: 'TMDB Credits', url: `https://www.themoviedb.org/movie/${movie.id}` }],
        });
      }
      return NextResponse.json({
        reply: `I don't know based on current verified data who is directing "${movie.title}".`,
        sources: [],
      });
    }

    // 2. Cast / Stars question
    if (qLower.includes('cast') || qLower.includes('actors') || qLower.includes('starring') || qLower.includes('hero') || qLower.includes('heroine')) {
      const topCast = movie.credits?.cast?.slice(0, 5).map(c => `${c.name} (as ${c.character})`);
      if (topCast && topCast.length > 0) {
        return NextResponse.json({
          reply: `Featured cast members for "${movie.title}" include:\n- ${topCast.join('\n- ')}`,
          sources: [{ name: 'TMDB Cast', url: `https://www.themoviedb.org/movie/${movie.id}` }],
        });
      }
      return NextResponse.json({
        reply: `Official cast details for "${movie.title}" have not been fully released yet.`,
        sources: [],
      });
    }

    // 3. Where to watch / Streaming
    if (qLower.includes('where to watch') || qLower.includes('streaming') || qLower.includes('ott') || qLower.includes('netflix') || qLower.includes('prime')) {
      const inProviders = movie['watch/providers']?.results?.IN?.flatrate;
      if (inProviders && inProviders.length > 0) {
        const names = inProviders.map(p => p.provider_name).join(', ');
        return NextResponse.json({
          reply: `"${movie.title}" is currently streaming on: **${names}** (India region).`,
          sources: [{ name: 'JustWatch / TMDB', url: `https://www.themoviedb.org/movie/${movie.id}/watch` }],
        });
      }
      return NextResponse.json({
        reply: `"${movie.title}" is currently not available on digital streaming platforms in India. It is either showing in theatres or awaiting OTT premiere.`,
        sources: [{ name: 'TMDB Watch Providers', url: `https://www.themoviedb.org/movie/${movie.id}/watch` }],
      });
    }

    // 4. Sentiment / What people are saying
    if (qLower.includes('sentiment') || qLower.includes('review') || qLower.includes('worth watching') || qLower.includes('good') || qLower.includes('opinion')) {
      if (summary.total_reviews > 0) {
        return NextResponse.json({
          reply: `Based on **${summary.total_reviews} verified reviews** across ${summary.sources_count} sources, audience and critic reception is **${summary.positive_pct}% positive**, **${summary.neutral_pct}% neutral**, and **${summary.negative_pct}% negative**.\n\nTop mentioned positive themes: ${summary.top_positive_themes.slice(0, 3).join(', ') || 'N/A'}.`,
          sources: [{ name: 'CineSense Review Aggregator', url: `/movie/${movie.id}` }],
        });
      }
      return NextResponse.json({
        reply: `There are currently no reviews recorded in our verified database for "${movie.title}". As this is an unreleased or recent film, genuine audience reception data is not yet available.`,
        sources: [],
      });
    }

    // 5. Runtime / Release date
    if (qLower.includes('runtime') || qLower.includes('duration') || qLower.includes('length') || qLower.includes('release date') || qLower.includes('when')) {
      const runtimeStr = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : 'Runtime TBA';
      return NextResponse.json({
        reply: `"${movie.title}" release date: **${movie.release_date || 'TBA'}**.\nDuration: **${runtimeStr}**.\nAge certification: **${movie.age_rating || 'UA'}**.`,
        sources: [{ name: 'TMDB Info', url: `https://www.themoviedb.org/movie/${movie.id}` }],
      });
    }

    // Fallback: Return movie factual overview or "I don't know"
    if (movie.overview) {
      return NextResponse.json({
        reply: `Here is what is verified about "${movie.title}":\n\n${movie.overview}\n\n- Directed by: ${movie.director || 'TBA'}\n- Rating: ${movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'N/A'}\n- Released: ${movie.release_date || 'TBA'}`,
        sources: [{ name: 'TMDB Overview', url: `https://www.themoviedb.org/movie/${movie.id}` }],
      });
    }

    return NextResponse.json({
      reply: `I don't know the answer based on current verified data. No unverified rumors or invented details are permitted on CineSense.`,
      sources: [],
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Chat failed', message: error.message },
      { status: 500 }
    );
  }
}
