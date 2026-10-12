const express = require('express');
const router = express.Router();
const { Movie } = require('../database');
const { Op } = require('sequelize');

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
