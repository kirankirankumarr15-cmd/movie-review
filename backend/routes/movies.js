const express = require('express');
const router = express.Router();
const { Movie, MovieVideo } = require('../database');
const { Op } = require('sequelize');

// GET /api/movies/videos/:tmdbId — returns typed video list (teaser/trailer/clip/song)
router.get('/videos/:tmdbId', async (req, res) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    if (isNaN(tmdbId)) return res.status(400).json({ error: 'Invalid tmdb_id' });

    const videos = await MovieVideo.findAll({
      where: { tmdb_id: tmdbId, is_official: true },
      order: [['sort_order', 'ASC'], ['type', 'ASC']],
    });

    return res.json({
      tmdb_id: tmdbId,
      videos: videos.map(v => ({
        youtube_id: v.youtube_id,
        type: v.type,
        title: v.title,
        language: v.language,
        is_official: v.is_official,
      })),
    });
  } catch (err) {
    console.error('Error fetching movie videos:', err.message);
    res.status(500).json({ error: 'Server error retrieving videos' });
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
