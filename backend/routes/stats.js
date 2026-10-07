const express = require('express');
const { Review, sequelize } = require('../database');
const { authMiddleware, requireAuth } = require('./auth');

const router = express.Router();

router.use(authMiddleware);
router.use(requireAuth);

router.get('/stats', async (req, res) => {
  try {
    const user_id = req.user.id;
    const total = await Review.count({ where: { user_id } });
    const positive = await Review.count({ where: { user_id, sentiment: 'positive' } });
    const neutral = await Review.count({ where: { user_id, sentiment: 'neutral' } });
    const negative = await Review.count({ where: { user_id, sentiment: 'negative' } });

    // SQLite avg requires raw query or specific syntax, let's just do it simple:
    const avgResult = await Review.findAll({
      where: { user_id },
      attributes: [[sequelize.fn('AVG', sequelize.col('compound_score')), 'avg']]
    });
    const avg_compound = total > 0 && avgResult[0]?.dataValues.avg ? parseFloat(avgResult[0].dataValues.avg) : 0;

    let most_common = 'N/A';
    if (total > 0) {
      const counts = { positive, neutral, negative };
      most_common = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    }

    const recentReviews = await Review.findAll({
      where: { user_id },
      order: [['createdAt', 'DESC']],
      limit: 30
    });

    const trend_map = {};
    for (const r of recentReviews) {
      // YYYY-MM-DD
      const dateStr = r.createdAt.toISOString().split('T')[0];
      if (!trend_map[dateStr]) {
        trend_map[dateStr] = { date: dateStr, positive: 0, neutral: 0, negative: 0, total: 0 };
      }
      trend_map[dateStr][r.sentiment]++;
      trend_map[dateStr].total++;
    }

    const trend_data = Object.values(trend_map).sort((a, b) => a.date.localeCompare(b.date));
    
    // recent 5
    const recent = recentReviews.slice(0, 5).map(r => ({
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
    }));

    res.json({
      total,
      positive,
      neutral,
      negative,
      average_compound: Number(avg_compound.toFixed(4)),
      most_common_sentiment: most_common,
      trend_data,
      recent_reviews: recent
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats.' });
  }
});

module.exports = router;
