const express = require('express');
const { Op } = require('sequelize');
const { Review } = require('../database');
const { authMiddleware, requireAuth } = require('./auth');

const router = express.Router();

router.use(authMiddleware);
router.use(requireAuth);

router.get('/', async (req, res) => {
  const { sentiment = '', sort = 'newest', search = '' } = req.query;

  const where = { user_id: req.user.id };

  if (['positive', 'neutral', 'negative'].includes(sentiment)) {
    where.sentiment = sentiment;
  }

  if (search.trim()) {
    const likeSearch = `%${search.trim()}%`;
    where[Op.or] = [
      { movie_name: { [Op.like]: likeSearch } },
      { review_text: { [Op.like]: likeSearch } }
    ];
  }

  const order = [['createdAt', sort === 'oldest' ? 'ASC' : 'DESC']];

  try {
    const reviews = await Review.findAll({ where, order });
    res.json({
      reviews: reviews.map(r => ({
        id: r.id,
        user_id: r.user_id,
        movie_name: r.movie_name || '',
        review_text: r.review_text,
        sentiment: r.sentiment,
        compound_score: r.compound_score,
        positive_score: r.positive_score,
        neutral_score: r.neutral_score,
        negative_score: r.negative_score,
        created_at: r.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

router.delete('/:id', async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found.' });
  
  if (review.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  await review.destroy();
  res.json({ message: 'Review deleted successfully.' });
});

router.get('/:id', async (req, res) => {
  const review = await Review.findByPk(req.params.id);
  if (!review) return res.status(404).json({ error: 'Review not found.' });
  
  if (review.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  res.json({ review: {
    id: review.id,
    user_id: review.user_id,
    movie_name: review.movie_name || '',
    review_text: review.review_text,
    sentiment: review.sentiment,
    compound_score: review.compound_score,
    positive_score: review.positive_score,
    neutral_score: review.neutral_score,
    negative_score: review.negative_score,
    created_at: review.createdAt
  }});
});

module.exports = router;
