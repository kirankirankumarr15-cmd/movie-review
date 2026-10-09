const express = require('express');
const { Review } = require('../database');
const { performMovieIntelligence } = require('../services/movieIntelligence');
const { authMiddleware } = require('./auth');

const router = express.Router();
const MAX_REVIEW_LENGTH = 2000; // Increased to allow more robust reviews

router.post('/analyze', authMiddleware, async (req, res) => {
  const reviewText = (req.body.review_text || req.body.reviewText || '').trim();
  const movieName = (req.body.movie_name || req.body.movieName || '').trim();

  if (!reviewText) {
    return res.status(400).json({ error: 'Review text cannot be empty.' });
  }
  if (!movieName) {
    return res.status(400).json({ error: 'Movie name cannot be empty.' });
  }
  if (reviewText.length > MAX_REVIEW_LENGTH) {
    return res.status(400).json({ error: `Review must be ${MAX_REVIEW_LENGTH} characters or fewer.` });
  }

  let finalResult;
  try {
    finalResult = await performMovieIntelligence(movieName, reviewText);
  } catch (err) {
    console.error("Movie Intelligence Error:", err);
    return res.status(500).json({ error: err.message || 'Failed to analyze review.' });
  }

  let review_id = null;
  if (req.user) {
    try {
      const sentimentMap = {
        'Positive': 'positive',
        'Neutral': 'neutral',
        'Negative': 'negative',
        'Mixed': 'neutral'
      };
      const score = finalResult.userAnalysis.score / 100;
      
      const review = await Review.create({
        user_id: req.user.id,
        movie_name: finalResult.movie.title,
        review_text: reviewText,
        sentiment: sentimentMap[finalResult.userAnalysis.sentiment] || 'neutral',
        compound_score: score,
        positive_score: finalResult.userAnalysis.sentiment === 'Positive' ? score : 0,
        neutral_score: finalResult.userAnalysis.sentiment === 'Neutral' || finalResult.userAnalysis.sentiment === 'Mixed' ? score : 0,
        negative_score: finalResult.userAnalysis.sentiment === 'Negative' ? score : 0,
      });
      review_id = review.id;
    } catch (err) {
      console.error(err);
    }
  }

  res.json({
    ...finalResult,
    review_id,
    saved: review_id !== null
  });
});

module.exports = router;
