const express = require('express');
const router = express.Router();
const { runDiagnostics, checkYouTubeVideoStatus } = require('../services/trailerDiagnostics');
const { resolveMovieVideos } = require('../services/trailerResolver');
const { runNightlyValidation } = require('../services/nightlyValidator');
const { Movie, UpcomingMovie, MovieVideo, OfficialChannel, SourceLog } = require('../database');

/**
 * Extracts 11-char YouTube ID from URL or raw ID
 */
function extractYouTubeId(input) {
  if (!input || typeof input !== 'string') return null;
  const clean = input.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;

  const urlPatterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const p of urlPatterns) {
    const match = clean.match(p);
    if (match && match[1]) return match[1];
  }

  return null;
}

// GET /api/admin/trailer-diagnostics
router.get('/', async (req, res) => {
  try {
    const report = await runDiagnostics({ useAdvancedTMDB: true });
    res.json(report);
  } catch (err) {
    console.error('Diagnostics error:', err);
    res.status(500).json({ error: 'Failed to run trailer diagnostics', details: err.message });
  }
});

// POST /api/admin/trailer-diagnostics/override — Manual YouTube URL/ID override
router.post('/override', async (req, res) => {
  try {
    const { tmdb_id, youtube_url_or_id, title, type = 'trailer' } = req.body;
    const tmdbId = parseInt(tmdb_id, 10);
    if (!tmdbId) {
      return res.status(400).json({ error: 'Valid tmdb_id is required' });
    }

    const youtubeId = extractYouTubeId(youtube_url_or_id);
    if (!youtubeId) {
      return res.status(400).json({ error: 'Invalid YouTube URL or 11-character video ID' });
    }

    // Verify video on YouTube
    const check = await checkYouTubeVideoStatus(youtubeId);
    const isEmbeddable = check.status === 'OK';

    // Find movie info for title & lang
    const movie = await Movie.findOne({ where: { tmdb_id: tmdbId } }) ||
                  await UpcomingMovie.findOne({ where: { tmdb_id: tmdbId } });

    // Mark previous videos as lower priority or unpin
    await MovieVideo.update({ sort_order: 99 }, { where: { tmdb_id: tmdbId } });

    // Insert or update manual video
    const [video, created] = await MovieVideo.upsert({
      tmdb_id: tmdbId,
      youtube_id: youtubeId,
      type,
      title: title || check.title || `${movie?.title || 'Movie'} Official Trailer`,
      language: movie?.language ? movie.language.toLowerCase() : 'en',
      is_official: true,
      sort_order: 0,
      embeddable: isEmbeddable,
      checked_at: new Date(),
      source: 'manual', // MANUAL OVERRIDE takes top priority
      status: isEmbeddable ? 'OK' : 'NOT_EMBEDDABLE',
      diagnostic_reason: `Manual override: ${check.reason || 'Manually verified'}`,
    });

    if (movie) {
      await movie.update({ trailer_youtube_id: youtubeId }).catch(() => {});
    }

    await SourceLog.create({
      movie_id: tmdbId,
      action: 'manual_override',
      status: 'OK',
      details: `Admin manually set trailer to ${youtubeId} (${isEmbeddable ? 'Embeddable' : 'Un-embeddable'}) for tmdb_id ${tmdbId}`,
    }).catch(() => {});

    res.json({
      success: true,
      message: 'Trailer manually updated with top priority (source: manual)',
      video,
      embeddable: isEmbeddable,
    });
  } catch (err) {
    console.error('Manual override error:', err);
    res.status(500).json({ error: 'Failed to save manual trailer override', details: err.message });
  }
});

// POST /api/admin/trailer-diagnostics/re-scan — Auto-repair all failing movies
router.post('/re-scan', async (req, res) => {
  try {
    const { fillMissing = true } = req.body;
    let autoFilled = 0;

    if (fillMissing) {
      const movies = await Movie.findAll();
      const upcoming = await UpcomingMovie.findAll();
      const allMovies = [...movies, ...upcoming];

      for (const m of allMovies) {
        const tmdbId = m.tmdb_id;
        const hasValid = await MovieVideo.count({
          where: { tmdb_id: tmdbId, status: 'OK', embeddable: true }
        });

        if (hasValid === 0) {
          try {
            const resolved = await resolveMovieVideos({
              tmdb_id: tmdbId,
              title: m.title,
              year: m.year || (m.release_date ? parseInt(m.release_date.substring(0, 4), 10) : null),
              language: m.language || m.original_language,
            });
            if (resolved.status === 'OK') autoFilled++;
          } catch (e) {
            console.warn(`Re-scan notice for ${m.title}:`, e.message);
          }
        }
      }
    }

    const updatedReport = await runDiagnostics({ useAdvancedTMDB: true });
    res.json({
      success: true,
      auto_filled_count: autoFilled,
      report: updatedReport,
    });
  } catch (err) {
    res.status(500).json({ error: 'Re-scan failed', details: err.message });
  }
});

// GET /api/admin/trailer-diagnostics/logs
router.get('/logs', async (req, res) => {
  try {
    const logs = await SourceLog.findAll({
      order: [['timestamp', 'DESC']],
      limit: 50,
    });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch source logs' });
  }
});

// GET /api/admin/trailer-diagnostics/channels
router.get('/channels', async (req, res) => {
  try {
    const channels = await OfficialChannel.findAll({ order: [['channel_name', 'ASC']] });
    res.json({ channels });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch official channels' });
  }
});

module.exports = router;
