const assert = require('assert');
const {
  calculateAnticipationScore,
  computeTrailerScore,
  computeSentimentScore,
  computeCommunityScore,
  computeNewsScore,
} = require('../services/anticipation');

console.log('--- RUNNING ANTICIPATION FORMULA UNIT TESTS ---');

// Test 1: computeTrailerScore calculation
{
  const score = computeTrailerScore(2200000, 150000);
  assert(score > 70 && score <= 100, `Expected trailer score between 70 and 100, got ${score}`);
  console.log('✓ Test 1 Passed: computeTrailerScore gives reasonable scale (2.2M views ->', score, ')');
}

// Test 2: computeSentimentScore with positive/neutral/negative comments
{
  const mockComments = [
    { comment_text: 'Yash looks absolutely incredible, masterpiece teaser!' },
    { comment_text: 'Cinematography and direction looks fantastic and great.' },
    { comment_text: 'Decent teaser, will wait for the trailer.' },
    { comment_text: 'Not really my type, looked a bit slow.' },
  ];
  const sentiment = computeSentimentScore(mockComments);
  assert.strictEqual(sentiment.sampleSize, 4, 'Sample size should be 4');
  assert(sentiment.score >= 50, `Expected sentiment score >= 50, got ${sentiment.score}`);
  console.log('✓ Test 2 Passed: computeSentimentScore correctly classifies comments (score:', sentiment.score, ')');
}

// Test 3: computeCommunityScore with votes
{
  const mockVotes = [
    { vote: 'hyped' },
    { vote: 'hyped' },
    { vote: 'hyped' },
    { vote: 'maybe' },
  ];
  const community = computeCommunityScore(mockVotes, 5);
  assert(community.score > 70, `Expected community score > 70, got ${community.score}`);
  console.log('✓ Test 3 Passed: computeCommunityScore properly calculates vote ratio + reminders (score:', community.score, ')');
}

// Test 4: computeNewsScore
{
  const news = computeNewsScore(3, 2);
  assert.strictEqual(news, (3 * 12) + (2 * 14)); // 36 + 28 = 64
  console.log('✓ Test 4 Passed: computeNewsScore matches documented linear model (score:', news, ')');
}

// Test 5: Full calculateAnticipationScore matches manual calculation
{
  const mockInput = {
    totalViews: 2200000,
    growth7d: 150000,
    comments: [
      { comment_text: 'Mindblowing teaser, Yash is on fire!' },
      { comment_text: 'Geetu Mohandas direction is brilliant.' },
      { comment_text: 'Music by Jeremy Stack is great.' },
      { comment_text: 'Can not wait to watch this in theatres.' },
    ],
    votes: [
      { vote: 'hyped' },
      { vote: 'hyped' },
      { vote: 'maybe' },
    ],
    reminderCount: 8,
    newsCount: 4,
    announcementsCount: 3,
  };

  const result = calculateAnticipationScore(mockInput);
  assert.strictEqual(result.is_enough_data, true, 'Should have enough data with > 5 signals');

  // Manual calculation check:
  const expectedTrailer = computeTrailerScore(mockInput.totalViews, mockInput.growth7d);
  const expectedSentiment = computeSentimentScore(mockInput.comments).score;
  const expectedCommunity = computeCommunityScore(mockInput.votes, mockInput.reminderCount).score;
  const expectedNews = computeNewsScore(mockInput.newsCount, mockInput.announcementsCount);

  const manualFormula = Math.round(
    (expectedTrailer * 0.35) +
    (expectedSentiment * 0.25) +
    (expectedCommunity * 0.25) +
    (expectedNews * 0.15)
  );

  assert.strictEqual(result.score, manualFormula, `Anticipation score ${result.score} must match manual calculation ${manualFormula}`);
  console.log(`✓ Test 5 Passed: Anticipation Score (${result.score}) EXACTLY matches manual calculation (${manualFormula})!`);
}

// Test 6: Insufficient data handling (< 5 sample size)
{
  const lowDataInput = {
    totalViews: 0,
    growth7d: 0,
    comments: [],
    votes: [{ vote: 'hyped' }],
    reminderCount: 0,
    newsCount: 1,
    announcementsCount: 1,
  };
  const result = calculateAnticipationScore(lowDataInput);
  assert.strictEqual(result.is_enough_data, false, 'Should be false when sample size < 5');
  assert.strictEqual(result.score, null, 'Score should be null when not enough data');
  console.log('✓ Test 6 Passed: Low data input correctly returns is_enough_data: false and score: null');
}

console.log('--- ALL ANTICIPATION FORMULA TESTS PASSED! ---');
