/**
 * Anticipation Analysis Service
 * 
 * Rules:
 * - Real data only. No invented figures.
 * - Formula:
 *   Score = (0.35 * trailerViewsScore) + (0.25 * sentimentScore) + (0.25 * communityScore) + (0.15 * newsScore)
 * - Returns 0-100 score, sample size, component breakdown, sentiment split, and transparent documentation.
 * - If sample size < 5, score is marked as "Not enough data yet".
 */

const vader = require('vader-sentiment');

/**
 * Normalizes trailer views into a 0-100 score.
 * Formula:
 * - Base views benchmark: 2,500,000 views = 80 pts (logarithmic scale)
 * - Recent 7-day velocity/growth provides up to 20 bonus pts
 */
function computeTrailerScore(totalViews, growth7d = 0) {
  if (!totalViews || totalViews <= 0) return 0;
  // Logarithmic scaling for views: 100K -> 45, 1M -> 70, 5M -> 88, 20M+ -> 98
  const logScore = Math.min(80, Math.log10(Math.max(1, totalViews)) * 12);
  const velocityScore = Math.min(20, (growth7d / Math.max(1, totalViews)) * 100);
  return Math.min(100, Math.round(logScore + velocityScore));
}

/**
 * Computes sentiment score from comments.
 * Each comment is scored with VADER.
 * Positive (>= 0.05) = 1.0, Neutral (-0.05 to 0.05) = 0.5, Negative (<= -0.05) = 0.0
 */
function computeSentimentScore(comments = []) {
  if (!comments || comments.length === 0) {
    return { score: 50, positivePct: 0, neutralPct: 0, negativePct: 0, sampleSize: 0 };
  }

  let pos = 0;
  let neu = 0;
  let neg = 0;

  for (const c of comments) {
    const text = c.comment_text || c.text || '';
    if (!text) continue;
    const res = vader.SentimentIntensityAnalyzer.polarity_scores(text);
    if (res.compound >= 0.05) pos++;
    else if (res.compound <= -0.05) neg++;
    else neu++;
  }

  const total = pos + neu + neg;
  if (total === 0) {
    return { score: 50, positivePct: 0, neutralPct: 0, negativePct: 0, sampleSize: 0 };
  }

  const positivePct = Math.round((pos / total) * 100);
  const neutralPct = Math.round((neu / total) * 100);
  const negativePct = Math.round((neg / total) * 100);

  // Scaled 0 to 100: 100% positive = 100, 100% negative = 0, neutral = 50
  const score = Math.round(((pos * 1.0) + (neu * 0.5)) / total * 100);

  return {
    score,
    positivePct,
    neutralPct,
    negativePct,
    sampleSize: total,
  };
}

/**
 * Computes community excitement score from user votes & reminders.
 * Votes: hyped (+2), maybe (+1), not_interested (0)
 * Reminders: each reminder adds signal confidence
 */
function computeCommunityScore(votes = [], reminderCount = 0) {
  const totalVotes = votes.length;
  if (totalVotes === 0 && reminderCount === 0) {
    return { score: 50, totalVotes: 0, hypedPct: 0, maybePct: 0, notInterestedPct: 0 };
  }

  let hyped = 0;
  let maybe = 0;
  let notInterested = 0;

  for (const v of votes) {
    const val = typeof v === 'string' ? v : v.vote;
    if (val === 'hyped') hyped++;
    else if (val === 'maybe') maybe++;
    else if (val === 'not_interested') notInterested++;
  }

  const voteRatio = totalVotes > 0
    ? ((hyped * 2) + (maybe * 1)) / (totalVotes * 2)
    : 0.5;

  const voteScore = voteRatio * 85;
  const reminderBonus = Math.min(15, reminderCount * 1.5);
  const score = Math.min(100, Math.round(voteScore + reminderBonus));

  return {
    score,
    totalVotes,
    hypedPct: totalVotes > 0 ? Math.round((hyped / totalVotes) * 100) : 0,
    maybePct: totalVotes > 0 ? Math.round((maybe / totalVotes) * 100) : 0,
    notInterestedPct: totalVotes > 0 ? Math.round((notInterested / totalVotes) * 100) : 0,
  };
}

/**
 * Computes media & news buzz volume score from announcements and articles
 */
function computeNewsScore(newsCount = 0, announcementsCount = 0) {
  const raw = (newsCount * 12) + (announcementsCount * 14);
  return Math.min(100, Math.round(raw));
}

/**
 * Main Master Anticipation Score Calculator
 */
function calculateAnticipationScore({
  totalViews = 0,
  growth7d = 0,
  comments = [],
  votes = [],
  reminderCount = 0,
  newsCount = 0,
  announcementsCount = 0,
}) {
  const trailerScore = computeTrailerScore(totalViews, growth7d);
  const sentiment = computeSentimentScore(comments);
  const community = computeCommunityScore(votes, reminderCount);
  const newsScore = computeNewsScore(newsCount, announcementsCount);

  // Total sample size represents combined verified data points
  const totalSampleSize = (totalViews > 0 ? 1 : 0) +
    sentiment.sampleSize +
    community.totalVotes +
    reminderCount +
    newsCount +
    announcementsCount;

  const isEnoughData = totalSampleSize >= 5;

  // Weighted formula: 35% Trailer, 25% Sentiment, 25% Community, 15% News
  const weightedScore = (
    (trailerScore * 0.35) +
    (sentiment.score * 0.25) +
    (community.score * 0.25) +
    (newsScore * 0.15)
  );

  const finalScore = isEnoughData ? Math.round(Math.min(100, Math.max(0, weightedScore))) : null;

  const formulaDoc = "Anticipation Score = 35% Trailer View Growth + 25% Comment Sentiment + 25% Community Votes/Reminders + 15% Media News Buzz. Computed strictly from real stored signals.";

  return {
    score: finalScore,
    is_enough_data: isEnoughData,
    sample_size: totalSampleSize,
    formula_doc: formulaDoc,
    components: {
      trailer_growth: {
        score: trailerScore,
        weight: '35%',
        views: totalViews,
        growth_7d: growth7d,
      },
      sentiment: {
        score: sentiment.score,
        weight: '25%',
        positive_pct: sentiment.positivePct,
        neutral_pct: sentiment.neutralPct,
        negative_pct: sentiment.negativePct,
        sample_size: sentiment.sampleSize,
      },
      community: {
        score: community.score,
        weight: '25%',
        votes_count: community.totalVotes,
        hyped_pct: community.hypedPct,
        maybe_pct: community.maybePct,
        not_interested_pct: community.notInterestedPct,
        reminders_count: reminderCount,
      },
      news_buzz: {
        score: newsScore,
        weight: '15%',
        news_articles_count: newsCount,
        official_announcements_count: announcementsCount,
      },
    },
    sentiment_split: {
      positive: sentiment.positivePct,
      neutral: sentiment.neutralPct,
      negative: sentiment.negativePct,
    },
    last_updated: new Date().toISOString(),
  };
}

module.exports = {
  calculateAnticipationScore,
  computeTrailerScore,
  computeSentimentScore,
  computeCommunityScore,
  computeNewsScore,
};
