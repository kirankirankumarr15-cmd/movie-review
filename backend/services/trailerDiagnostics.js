/**
 * Trailer Diagnostics Service
 * 
 * Inspects all movies in the database and evaluates:
 * - Stored video IDs in MovieVideo
 * - TMDB response from /movie/{id}/videos
 * - Embeddability and privacy status on YouTube
 * - Classifies into:
 *   OK | NO_VIDEO_FOUND | NOT_EMBEDDABLE | VIDEO_REMOVED/PRIVATE |
 *   WRONG_LANGUAGE_FILTERED | QUOTA_EXCEEDED | API_ERROR | MISMATCHED_MOVIE
 */

const axios = require('axios');
const { Movie, UpcomingMovie, MovieVideo, SourceLog } = require('../database');

const TMDB_TOKEN = process.env.TMDB_TOKEN || process.env.TMDB_API_KEY || '';
const TMDB_HEADERS = {
  Authorization: `Bearer ${TMDB_TOKEN}`,
  accept: 'application/json',
};

/**
 * Checks YouTube video embeddability and availability
 */
async function checkYouTubeVideoStatus(youtubeId) {
  if (!youtubeId || typeof youtubeId !== 'string') {
    return { status: 'INVALID_ID', embeddable: false, error: 'Empty or non-string YouTube ID' };
  }

  // 1. Check YouTube Data API if key exists
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (apiKey) {
    try {
      const res = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'status,contentDetails,snippet',
          id: youtubeId,
          key: apiKey,
        },
        timeout: 5000,
      });

      if (res.data.items && res.data.items.length > 0) {
        const item = res.data.items[0];
        const isEmbeddable = item.status?.embeddable === true;
        const isPublic = item.status?.privacyStatus === 'public';
        const regionBlocked = item.contentDetails?.regionRestriction?.blocked?.includes('IN');

        if (!isPublic) {
          return { status: 'VIDEO_REMOVED/PRIVATE', embeddable: false, reason: `privacyStatus is ${item.status?.privacyStatus}` };
        }
        if (!isEmbeddable) {
          return { status: 'NOT_EMBEDDABLE', embeddable: false, reason: 'YouTube status.embeddable is false' };
        }
        if (regionBlocked) {
          return { status: 'NOT_EMBEDDABLE', embeddable: false, reason: 'Region restricted: blocked in IN' };
        }

        return { status: 'OK', embeddable: true, title: item.snippet?.title, channel: item.snippet?.channelTitle };
      } else {
        return { status: 'VIDEO_REMOVED/PRIVATE', embeddable: false, reason: 'Video ID not found in YouTube videos.list' };
      }
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.error?.errors?.[0]?.reason === 'quotaExceeded') {
        return { status: 'QUOTA_EXCEEDED', embeddable: false, reason: 'YouTube Data API quota exceeded (HTTP 403 quotaExceeded)' };
      }
      // Fall through to oEmbed check
    }
  }

  // 2. Resilient oEmbed check (always works without API key / quota)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`;
    const res = await axios.get(oembedUrl, { timeout: 5000 });
    if (res.status === 200 && res.data?.title) {
      return { status: 'OK', embeddable: true, title: res.data.title, channel: res.data.author_name };
    }
    return { status: 'OK', embeddable: true };
  } catch (err) {
    const code = err.response?.status;
    if (code === 401) {
      return { status: 'NOT_EMBEDDABLE', embeddable: false, reason: 'YouTube oEmbed HTTP 401: Embedding disabled by uploader' };
    }
    if (code === 404 || code === 400) {
      return { status: 'VIDEO_REMOVED/PRIVATE', embeddable: false, reason: `YouTube oEmbed HTTP ${code}: Video private, removed or invalid` };
    }
    return { status: 'API_ERROR', embeddable: false, reason: `Network error contacting YouTube: ${err.message}` };
  }
}

/**
 * Run Trailer Diagnostics on all movies in DB
 * @param {Object} options
 * @param {boolean} options.useAdvancedTMDB - whether to simulate legacy baseline (false) or new fixed logic (true)
 */
async function runDiagnostics(options = {}) {
  const { useAdvancedTMDB = false } = options;

  // 1. Gather all unique movies from Movie and UpcomingMovie tables
  const movies = await Movie.findAll({ order: [['id', 'ASC']] });
  const upcoming = await UpcomingMovie.findAll({ order: [['id', 'ASC']] });

  const allMoviesMap = new Map();
  for (const m of movies) {
    allMoviesMap.set(m.tmdb_id, {
      movie_id: m.tmdb_id,
      db_id: m.id,
      title: m.title,
      language: m.language ? m.language.toLowerCase() : 'en',
      year: m.year,
      source_table: 'Movie',
      legacy_trailer: m.trailer_youtube_id,
    });
  }
  for (const u of upcoming) {
    if (!allMoviesMap.has(u.tmdb_id)) {
      allMoviesMap.set(u.tmdb_id, {
        movie_id: u.tmdb_id,
        db_id: u.id,
        title: u.title,
        language: u.original_language ? u.original_language.toLowerCase() : 'en',
        year: u.release_date ? parseInt(u.release_date.substring(0, 4), 10) : null,
        source_table: 'UpcomingMovie',
      });
    }
  }

  const allMovies = Array.from(allMoviesMap.values());
  const results = [];

  const counts = {
    OK: 0,
    NO_VIDEO_FOUND: 0,
    NOT_EMBEDDABLE: 0,
    'VIDEO_REMOVED/PRIVATE': 0,
    WRONG_LANGUAGE_FILTERED: 0,
    QUOTA_EXCEEDED: 0,
    API_ERROR: 0,
    MISMATCHED_MOVIE: 0,
  };

  for (const m of allMovies) {
    const tmdbId = m.movie_id;

    // Check DB stored videos
    const storedVideos = await MovieVideo.findAll({ where: { tmdb_id: tmdbId } });
    const storedIds = storedVideos.map(v => v.youtube_id);

    // If movie has legacy_trailer in Movie table and not in storedIds, record it
    if (m.legacy_trailer && !storedIds.includes(m.legacy_trailer)) {
      storedIds.push(m.legacy_trailer);
    }

    let movieStatus = 'NO_VIDEO_FOUND';
    let exactReason = '';
    let validatedVideoId = null;

    if (storedIds.length > 0) {
      // Test the stored videos
      let hasEmbeddable = false;
      let lastCheck = null;

      for (const ytId of storedIds) {
        const check = await checkYouTubeVideoStatus(ytId);
        lastCheck = check;
        if (check.status === 'OK') {
          hasEmbeddable = true;
          validatedVideoId = ytId;
          break;
        }
      }

      if (hasEmbeddable) {
        movieStatus = 'OK';
        exactReason = `Playable official video confirmed (${validatedVideoId})`;
      } else {
        movieStatus = lastCheck ? lastCheck.status : 'VIDEO_REMOVED/PRIVATE';
        exactReason = lastCheck?.reason || 'All stored videos failed playback / privacy check';
      }
    } else {
      // No video in DB: check what TMDB returns for this movie
      try {
        let tmdbUrl = `https://api.tmdb.org/3/movie/${tmdbId}/videos`;
        if (useAdvancedTMDB) {
          tmdbUrl += `?include_video_language=${m.language},en,hi,null`;
        }

        const tmdbRes = await axios.get(tmdbUrl, { headers: TMDB_HEADERS, timeout: 5000 });
        const tmdbVideos = tmdbRes.data?.results || [];

        if (tmdbVideos.length === 0) {
          // If baseline without language filter failed, check if regional videos existed
          if (!useAdvancedTMDB) {
            try {
              const checkLangRes = await axios.get(`https://api.tmdb.org/3/movie/${tmdbId}/videos?include_video_language=${m.language},en,hi,null`, {
                headers: TMDB_HEADERS,
                timeout: 5000,
              });
              if ((checkLangRes.data?.results || []).length > 0) {
                movieStatus = 'WRONG_LANGUAGE_FILTERED';
                exactReason = `TMDB has ${checkLangRes.data.results.length} regional videos, but default call returned 0 because include_video_language was missing`;
              } else {
                movieStatus = 'NO_VIDEO_FOUND';
                exactReason = `TMDB /movie/${tmdbId}/videos returned 0 videos for title "${m.title}"`;
              }
            } catch {
              movieStatus = 'NO_VIDEO_FOUND';
              exactReason = `TMDB /movie/${tmdbId}/videos returned 0 videos for title "${m.title}"`;
            }
          } else {
            movieStatus = 'NO_VIDEO_FOUND';
            exactReason = `TMDB returned 0 videos even with language inclusion for "${m.title}"`;
          }
        } else {
          // TMDB returned videos, but DB didn't have them cached
          const first = tmdbVideos.find(v => v.site === 'YouTube') || tmdbVideos[0];
          if (first && first.site === 'YouTube') {
            const check = await checkYouTubeVideoStatus(first.key);
            if (check.status === 'OK') {
              movieStatus = 'NO_VIDEO_FOUND'; // Still not saved in DB prior to fix
              exactReason = `TMDB has video ${first.key} (${first.name}), but it was not stored or surfaced in DB`;
            } else {
              movieStatus = check.status;
              exactReason = `TMDB returned ${first.key}, but ${check.reason}`;
            }
          } else {
            movieStatus = 'NO_VIDEO_FOUND';
            exactReason = 'TMDB returned videos but none on YouTube';
          }
        }
      } catch (err) {
        movieStatus = 'API_ERROR';
        exactReason = `TMDB API error HTTP ${err.response?.status || '500'}: ${err.message}`;
      }
    }

    counts[movieStatus] = (counts[movieStatus] || 0) + 1;

    results.push({
      movie_id: tmdbId,
      title: m.title,
      language: m.language,
      year: m.year,
      stored_video_ids: storedIds,
      status: movieStatus,
      exact_reason: exactReason,
      validated_video_id: validatedVideoId,
    });
  }

  return {
    total_movies: allMovies.length,
    playable_count: counts.OK,
    failing_count: allMovies.length - counts.OK,
    counts_by_reason: counts,
    movies: results,
    checked_at: new Date().toISOString(),
  };
}

module.exports = {
  checkYouTubeVideoStatus,
  runDiagnostics,
};
