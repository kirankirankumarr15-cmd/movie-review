const express = require('express');
const router = express.Router();
const { Movie, MovieVideo } = require('../database');
const { Op } = require('sequelize');

const { resolveMovieVideos } = require('../services/trailerResolver');
const { SourceLog } = require('../database');

// GET /api/movies/videos/:tmdbId — returns typed video list (teaser/trailer/clip/song)
router.get('/videos/:tmdbId', async (req, res) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    if (isNaN(tmdbId)) return res.status(400).json({ error: 'Invalid tmdb_id' });

    // Look up movie details for context
    const movie = await Movie.findOne({ where: { tmdb_id: tmdbId } });

    const result = await resolveMovieVideos({
      tmdb_id: tmdbId,
      title: movie?.title || '',
      year: movie?.year || null,
      language: movie?.language || 'en',
    });

    const videos = result.videos || [];
    const isEmbeddable = videos.some(v => v.embeddable !== false);

    return res.json({
      tmdb_id: tmdbId,
      status: result.status,
      source: result.source,
      has_video: videos.length > 0,
      embeddable: isEmbeddable,
      videos: videos.map(v => ({
        youtube_id: v.youtube_id,
        type: v.type,
        title: v.title,
        language: v.language,
        is_official: v.is_official,
        embeddable: v.embeddable !== false,
        source: v.source,
      })),
    });
  } catch (err) {
    console.error('Error fetching movie videos:', err.message);
    res.status(500).json({ error: 'Server error retrieving videos' });
  }
});

// POST /api/movies/report-video-error — IFrame Player error telemetry (2, 5, 100, 101, 150)
router.post('/report-video-error', async (req, res) => {
  try {
    const { tmdb_id, youtube_id, error_code, error_message } = req.body;
    const tmdbId = parseInt(tmdb_id, 10);
    if (!tmdbId || !youtube_id) {
      return res.status(400).json({ error: 'tmdb_id and youtube_id are required' });
    }

    const isNotEmbeddable = error_code === 150 || error_code === 101;
    const status = isNotEmbeddable ? 'NOT_EMBEDDABLE' : 'VIDEO_REMOVED/PRIVATE';

    await MovieVideo.update(
      {
        status,
        embeddable: false,
        diagnostic_reason: `Reported by player onError code ${error_code}: ${error_message || 'Playback blocked'}`,
        checked_at: new Date(),
      },
      {
        where: { tmdb_id: tmdbId, youtube_id },
      }
    );

    await SourceLog.create({
      movie_id: tmdbId,
      action: 'player_error',
      status,
      details: `Player reported onError code ${error_code} for video ${youtube_id}`,
    }).catch(() => {});

    console.log(`[Player Telemetry] Flagged video ${youtube_id} as ${status} (error ${error_code}) for movie ${tmdbId}`);

    res.json({ success: true, status, error_code });
  } catch (err) {
    console.error('Error reporting video failure:', err);
    res.status(500).json({ error: 'Failed to record error' });
  }
});

// GET /api/movies/trailer/:idOrTmdbId
router.get('/trailer/:idOrTmdbId', async (req, res) => {
  try {
    const param = req.params.idOrTmdbId;
    const isNum = !isNaN(param);
    
    const movie = await Movie.findOne({
      where: isNum
        ? { [Op.or]: [{ id: Number(param) }, { tmdb_id: Number(param) }] }
        : { title: { [Op.like]: `%${param}%` } }
    });

    if (movie && movie.trailer_youtube_id) {
      return res.json({
        found: true,
        trailer_youtube_id: movie.trailer_youtube_id,
        movie
      });
    }

    return res.json({
      found: false,
      trailer_youtube_id: null
    });
  } catch (err) {
    console.error('Error fetching trailer from DB:', err.message);
    res.status(500).json({ error: 'Server error retrieving trailer' });
  }
});

// GET /api/movies/:idOrTmdbId
router.get('/:idOrTmdbId', async (req, res) => {
  try {
    const param = req.params.idOrTmdbId;
    const isNum = !isNaN(param);

    const movie = await Movie.findOne({
      where: isNum
        ? { [Op.or]: [{ id: Number(param) }, { tmdb_id: Number(param) }] }
        : { title: { [Op.like]: `%${param}%` } }
    });

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found in database' });
    }

    res.json({ movie });
  } catch (err) {
    res.status(500).json({ error: 'Server error retrieving movie' });
  }
});

module.exports = router;
