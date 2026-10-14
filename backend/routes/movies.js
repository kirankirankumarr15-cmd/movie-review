const express = require('express');
const router = express.Router();
const { Movie, MovieVideo } = require('../database');
const { Op } = require('sequelize');

// GET /api/movies/videos/:tmdbId — returns typed video list (teaser/trailer/clip/song)
router.get('/videos/:tmdbId', async (req, res) => {
  try {
    const tmdbId = parseInt(req.params.tmdbId, 10);
    if (isNaN(tmdbId)) return res.status(400).json({ error: 'Invalid tmdb_id' });

    let videos = await MovieVideo.findAll({
      where: { tmdb_id: tmdbId, is_official: true },
      order: [['sort_order', 'ASC'], ['type', 'ASC']],
    });

    if (videos.length === 0) {
      // Check Movie table
      const movie = await Movie.findOne({ where: { tmdb_id: tmdbId } });
      if (movie && movie.trailer_youtube_id) {
        await MovieVideo.create({
          tmdb_id: tmdbId,
          youtube_id: movie.trailer_youtube_id,
          type: 'trailer',
          title: `${movie.title} — Official Trailer`,
          language: (movie.language || 'en').toLowerCase(),
          is_official: true,
          sort_order: 0,
        });
        videos = await MovieVideo.findAll({
          where: { tmdb_id: tmdbId, is_official: true },
          order: [['sort_order', 'ASC'], ['type', 'ASC']],
        });
      }
    }

    if (videos.length === 0) {
      // Fetch from TMDB API
      try {
        const TMDB_TOKEN = process.env.TMDB_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMDIyYTkwNTAwZTA2ODMwYjFlMzg2MDY2YTgwOGIxMyIsIm5iZiI6MTc5MTQ1MTc0NC42NzIsInN1YiI6IjZhYzc2MjYwMGY5MTNjYWU1YzAzZWE5YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.0jRg9sQctBUCKSYpazZ7r9p4jTveORB5QZd3VShKt1o";
        const axios = require('axios');
        const vRes = await axios.get(`https://api.tmdb.org/3/movie/${tmdbId}/videos`, {
          headers: { Authorization: `Bearer ${TMDB_TOKEN}`, accept: 'application/json' },
          timeout: 6000,
        });
        const vResults = (vRes.data?.results || []).filter(v => v.site === 'YouTube');
        if (vResults.length > 0) {
          const toInsert = vResults.slice(0, 5).map((v, idx) => ({
            tmdb_id: tmdbId,
            youtube_id: v.key,
            type: v.type?.toLowerCase() === 'teaser' ? 'teaser' : 'trailer',
            title: v.name,
            language: v.iso_639_1 || 'en',
            is_official: v.official ?? true,
            sort_order: idx,
          }));
          await MovieVideo.bulkCreate(toInsert);
          videos = await MovieVideo.findAll({
            where: { tmdb_id: tmdbId, is_official: true },
            order: [['sort_order', 'ASC'], ['type', 'ASC']],
          });
        }
      } catch (e) {
        console.warn('TMDB video fetch notice in movies router:', e.message);
      }
    }

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
