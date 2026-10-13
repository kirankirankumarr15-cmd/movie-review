import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { analyzeReviewSentiment, detectLanguage, checkIsSpoiler } from '../src/lib/sentiment';
import { aggregateAllReviews } from '../src/lib/adapters';
import { dbService } from '../src/lib/db';

async function runPhase2Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 2 VERIFICATION TESTS (Moctale CineSense)');
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
    // 1. Sentiment Engine Tests
    console.log('--- Test 1: Sentiment Analysis & Aspect Breakdown ---');
    const positiveReview = 'The cinematography and visuals are absolutely breathtaking, and Yash gives an intense, powerful performance!';
    const posRes = analyzeReviewSentiment(positiveReview);
    assert(posRes.sentiment === 'positive', 'Correctly classifies positive review', `Score: ${posRes.compound_score}`);
    assert(posRes.aspects.acting === 'positive' || posRes.aspects.visuals === 'positive', 'Detects aspect sentiment for acting/visuals', JSON.stringify(posRes.aspects));

    const negativeReview = 'The storyline was completely boring, predictable, and the pacing was a total disaster.';
    const negRes = analyzeReviewSentiment(negativeReview);
    assert(negRes.sentiment === 'negative', 'Correctly classifies negative review', `Score: ${negRes.compound_score}`);
    assert(negRes.aspects.story === 'negative', 'Detects aspect sentiment for story', JSON.stringify(negRes.aspects));

    // 2. Multilingual & Regional Slang Lexicon
    console.log('\n--- Test 2: Multilingual Support & Regional Lexicon ---');
    const kannadaSlang = 'Yash entry scene sakkath aagide, goosebumps guaranteed!';
    const knRes = analyzeReviewSentiment(kannadaSlang);
    assert(knRes.sentiment === 'positive', 'Kanglish slang "sakkath" recognized as positive', `Score: ${knRes.compound_score}`);

    const hindiSlang = 'Total bakwas film, waste of time and money.';
    const hiRes = analyzeReviewSentiment(hindiSlang);
    assert(hiRes.sentiment === 'negative', 'Hinglish slang "bakwas" recognized as negative', `Score: ${hiRes.compound_score}`);

    // 3. Spoiler Detection
    console.log('\n--- Test 3: Spoiler Detection ---');
    const spoilerReview = 'Great movie until the villain dies in the climax twist.';
    assert(checkIsSpoiler(spoilerReview), 'Identifies spoiler keyword "dies in the climax twist"');
    const nonSpoiler = 'Superb visual treatment and grand scale.';
    assert(!checkIsSpoiler(nonSpoiler), 'Does not flag innocent review as spoiler');

    // 4. Multi-Source Pipeline & Non-Negotiable Review Rules
    console.log('\n--- Test 4: Real Multi-Source Reviews (Toxic 2026) ---');
    const toxicData = await aggregateAllReviews(1213243, 'Toxic', 'kn', 'EfluEyQ5QIA');
    assert(toxicData.reviews.length > 0, 'Toxic reviews fetched and aggregated', `Count: ${toxicData.reviews.length}`);

    // Verify NON-NEGOTIABLE RULE 1: Every review has source, author, date, url, text >= 15 chars
    let allReviewsValid = true;
    for (const r of toxicData.reviews) {
      if (!r.source || !r.author || !r.posted_at || !r.url || !r.text || r.text.length < 15) {
        allReviewsValid = false;
        console.error('Invalid review item found:', r);
        break;
      }
    }
    assert(allReviewsValid, 'Every review strictly carries source, author, date, URL, text >= 15 chars');

    // Verify Sentiment Summary math (B2)
    const summary = toxicData.summary;
    assert(summary.total_reviews === toxicData.reviews.length, 'Summary total matches review count', `${summary.total_reviews} === ${toxicData.reviews.length}`);
    assert(
      summary.positive_pct + summary.neutral_pct + summary.negative_pct >= 99 &&
      summary.positive_pct + summary.neutral_pct + summary.negative_pct <= 101,
      'Sentiment % sum equals 100% (within rounding)',
      `${summary.positive_pct}% + ${summary.neutral_pct}% + ${summary.negative_pct}%`
    );
    assert(summary.sources_count > 0, 'Multiple verified sources included in summary', `Sources: ${summary.sources_count}`);

    // 5. Helpfulness Voting Mechanism (B9)
    console.log('\n--- Test 5: Review Helpfulness Voting ---');
    const firstReview = toxicData.reviews[0];
    if (firstReview) {
      const voteRes = await dbService.voteReviewHelpfulness(firstReview.id, 'test-user-1', 'up');
      assert(voteRes.up >= 1, 'Upvoting review increments helpfulness count', `Up: ${voteRes.up}`);
    }

  } catch (error: any) {
    console.error('Fatal test error in Phase 2:', error);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 PHASE 2 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase2Tests();
