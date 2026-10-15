/**
 * Nightly Trailer Validator & Auto-Filler
 * 
 * Re-validates stored videos (checks for removed/private/un-embeddable videos)
 * and fills missing trailers/teasers for all movies in the database.
 * Logs all operations to SourceLog.
 */

const { Movie, UpcomingMovie, MovieVideo, SourceLog } = require('../database');
const { checkYouTubeVideoStatus } = require('./trailerDiagnostics');
const { resolveMovieVideos } = require('./trailerResolver');

async function runNightlyValidation() {
  console.log('[Nightly Job] Starting scheduled trailer validation and auto-fill...');
  const t0 = Date.now();

  let validatedCount = 0;
  let invalidCount = 0;
  let filledCount = 0;

  // 1. Re-validate existing stored videos
  const allStored = await MovieVideo.findAll();
  console.log(`[Nightly Job] Validating ${allStored.length} stored videos...`);

  for (const video of allStored) {
    try {
      const check = await checkYouTubeVideoStatus(video.youtube_id);
      if (check.status !== 'OK') {
        await video.update({
          status: check.status,
          embeddable: false,
          diagnostic_reason: check.reason || 'Failed nightly verification check',
          checked_at: new Date(),
        });
        invalidCount++;

        await SourceLog.create({
          movie_id: video.tmdb_id,
          action: 'nightly_revalidate',
          status: check.status,
          details: `Stored video ${video.youtube_id} failed: ${check.reason || 'Unplayable/Private'}`,
        }).catch(() => {});
      } else {
        await video.update({
          status: 'OK',
          embeddable: true,
          checked_at: new Date(),
        });
        validatedCount++;
      }
    } catch (err) {
      console.warn(`[Nightly Job] Validation notice for ${video.youtube_id}:`, err.message);
    }
  }

  // 2. Auto-fill missing videos for all movies
  const movies = await Movie.findAll();
  const upcoming = await UpcomingMovie.findAll();

  const allMovies = [...movies.map(m => ({
    tmdb_id: m.tmdb_id,
    title: m.title,
    year: m.year,
    language: m.language,
  })), ...upcoming.map(u => ({
    tmdb_id: u.tmdb_id,
    title: u.title,
    year: u.release_date ? parseInt(u.release_date.substring(0, 4), 10) : null,
    language: u.original_language,
  }))];

  for (const m of allMovies) {
    const hasValid = await MovieVideo.count({
      where: { tmdb_id: m.tmdb_id, status: 'OK', embeddable: true }
    });

    if (hasValid === 0) {
      try {
        const resolved = await resolveMovieVideos(m);
        if (resolved.status === 'OK' && resolved.videos?.length > 0) {
          filledCount++;
        }
      } catch (err) {
        console.warn(`[Nightly Job] Auto-fill notice for "${m.title}":`, err.message);
      }
    }
  }

  const duration = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`[Nightly Job] Completed in ${duration}s. Valid: ${validatedCount}, Invalidated: ${invalidCount}, Auto-filled: ${filledCount}.`);

  await SourceLog.create({
    action: 'nightly_summary',
    status: 'OK',
    details: `Validated ${validatedCount} videos, flagged ${invalidCount} invalid, auto-filled ${filledCount} new trailers in ${duration}s`,
  }).catch(() => {});

  return { validatedCount, invalidCount, filledCount, duration };
}

module.exports = { runNightlyValidation };
