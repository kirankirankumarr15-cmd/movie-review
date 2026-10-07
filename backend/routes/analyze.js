const express = require('express');
const { Review } = require('../database');
const { analyzeSentiment } = require('../services/sentiment_analyzer');
const { authMiddleware } = require('./auth');

const router = express.Router();
const MAX_REVIEW_LENGTH = 1000;

router.post('/analyze', authMiddleware, async (req, res) => {
  const reviewText = (req.body.review_text || req.body.reviewText || '').trim();
  const movieName = (req.body.movie_name || req.body.movieName || '').trim();

  if (!reviewText) {
    return res.status(400).json({ error: 'Review text cannot be empty.' });
  }
  if (reviewText.length > MAX_REVIEW_LENGTH) {
    return res.status(400).json({ error: `Review must be ${MAX_REVIEW_LENGTH} characters or fewer.` });
  }

  let result;
  try {
    result = analyzeSentiment(reviewText);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to analyze review. Please try again.' });
  }

  let review_id = null;
  if (req.user) {
    try {
      const review = await Review.create({
        user_id: req.user.id,
        movie_name: movieName || null,
        review_text: reviewText,
        sentiment: result.sentiment,
        compound_score: result.compound,
        positive_score: result.positive,
        neutral_score: result.neutral,
        negative_score: result.negative,
      });
      review_id = review.id;
    } catch (err) {
      console.error(err);
    }
  }

  res.json({
    ...result,
    review_id,
    saved: review_id !== null
  });
});

module.exports = router;
