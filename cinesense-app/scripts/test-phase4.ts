import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { dbService } from '../src/lib/db';
import { analyzeReviewSentiment } from '../src/lib/sentiment';

async function runPhase4Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 4 VERIFICATION TESTS (Moctale CineSense)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    if (condition) {
      console.log(`✅ [PASS] ${testName} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      failed++;
    }
  }

  try {
    // 1. Community User Review Submission (C3)
    console.log('--- Test 1: Community Review Submission ---');
    const userReviewText = 'Absolutely thrilled by the teaser. Geetu Mohandas direction paired with Yash screen presence is pure fire!';
    const analysis = analyzeReviewSentiment(userReviewText);

    const savedReview = await dbService.addUserReview({
      user_id: 'user-test-4',
      user_name: 'Sandalwood Enthusiast',
      tmdb_id: 1213243,
      rating: 9,
      title: 'A New Dawn for Kannada Cinema',
      text: userReviewText,
      sentiment: analysis.sentiment,
      aspects: analysis.aspects,
      is_spoiler: analysis.is_spoiler,
    });

    assert(Boolean(savedReview.id), 'Community review created with unique ID', savedReview.id);
    assert(savedReview.rating === 9, 'Star rating preserved accurately', `Rating: ${savedReview.rating}/10`);
    assert(savedReview.sentiment === 'positive', 'Live sentiment computed on community review', savedReview.sentiment);

    const communityReviews = await dbService.getUserReviews(1213243);
    assert(communityReviews.length > 0, 'Community reviews retrieved for Toxic', `Count: ${communityReviews.length}`);

    // 2. Watchlist & Favorites Toggles (C2)
    console.log('\n--- Test 2: Watchlist & Favorites Management ---');
    const testUserId = `user-test-${Date.now()}`;
    const watchAdd = await dbService.toggleWatchlist({
      user_id: testUserId,
      tmdb_id: 1213243,
      movie_title: 'Toxic: A Fairy Tale for Grown-ups',
      status: 'watchlist',
    });
    assert(watchAdd.added === true, 'Movie successfully added to Watchlist');

    const watchlist = await dbService.getWatchlist(testUserId);
    const toxicInWatch = watchlist.find(w => w.tmdb_id === 1213243 && w.status === 'watchlist');
    assert(Boolean(toxicInWatch), 'Movie exists in user watchlist array', toxicInWatch?.movie_title);

    const favAdd = await dbService.toggleWatchlist({
      user_id: testUserId,
      tmdb_id: 1213243,
      movie_title: 'Toxic: A Fairy Tale for Grown-ups',
      status: 'favorite',
    });
    assert(favAdd.added === true, 'Movie successfully added to Favorites');

    // 3. Curated Lists (C7)
    console.log('\n--- Test 3: Curated Custom Lists ---');
    const lists = await dbService.getLists();
    assert(lists.length > 0, 'Public curated lists available', `Count: ${lists.length}`);
    assert(Boolean(lists[0].title), 'List contains valid title', lists[0].title);

  } catch (error: any) {
    console.error('Fatal test error in Phase 4:', error);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 PHASE 4 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase4Tests();
