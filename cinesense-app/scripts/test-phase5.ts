import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { analyzeReviewSentiment } from '../src/lib/sentiment';

async function runPhase5Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 5 VERIFICATION TESTS (Moctale CineSense)');
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
    // 1. Interactive Review Analysis & Rating Prediction (B3, E4)
    console.log('--- Test 1: Real NLP Analysis & Rating Prediction ---');
    const positiveText = 'Yash performance is extraordinary. Breathtaking visual effects and Ludwig Goransson level music score!';
    const posAnalysis = analyzeReviewSentiment(positiveText);
    const predictedRatingPos = parseFloat((5.5 + posAnalysis.compound_score * 4.5).toFixed(1));

    assert(posAnalysis.sentiment === 'positive', 'Correctly classified as positive', `Compound: ${posAnalysis.compound_score}`);
    assert(predictedRatingPos >= 7.5, 'Rating prediction yields high score for positive text', `Predicted: ${predictedRatingPos}/10`);
    assert(posAnalysis.aspects.acting === 'positive' || posAnalysis.aspects.visuals === 'positive', 'Identifies performance and visuals aspects', JSON.stringify(posAnalysis.aspects));

    // 2. Critical Review & Aspect Breakdown (B4)
    console.log('\n--- Test 2: Negative Review & Aspect Detection ---');
    const negativeText = 'Terrible script and painfully slow direction. Even the action stunts were badly choreographed.';
    const negAnalysis = analyzeReviewSentiment(negativeText);
    const predictedRatingNeg = parseFloat((5.5 + negAnalysis.compound_score * 4.5).toFixed(1));

    assert(negAnalysis.sentiment === 'negative', 'Correctly classified as negative', `Compound: ${negAnalysis.compound_score}`);
    assert(predictedRatingNeg <= 4.0, 'Rating prediction yields low score for critical text', `Predicted: ${predictedRatingNeg}/10`);
    assert(negAnalysis.aspects.story === 'negative' || negAnalysis.aspects.direction === 'negative', 'Identifies negative story/direction aspects', JSON.stringify(negAnalysis.aspects));

    // 3. Live Spoiler Detection (B6)
    console.log('\n--- Test 3: Spoiler Flagging ---');
    const spoilerText = 'The climax twist where the main hero dies in the end was completely uncalled for.';
    const spoilerAnalysis = analyzeReviewSentiment(spoilerText);
    assert(spoilerAnalysis.is_spoiler === true, 'Accurately flags plot twist/death spoiler');

    // 4. Regional Kanglish / Sandalwood Sentiment (B8)
    console.log('\n--- Test 4: Kanglish & Regional Sentiment ---');
    const kanglishText = 'Film nodi tumba channagide, Yash screen presence sakkath mass!';
    const knAnalysis = analyzeReviewSentiment(kanglishText);
    assert(knAnalysis.sentiment === 'positive', 'Accurately scores Kannada/Kanglish positive review', `Score: ${knAnalysis.compound_score}`);

  } catch (error: any) {
    console.error('Fatal test error in Phase 5:', error);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 PHASE 5 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase5Tests();
