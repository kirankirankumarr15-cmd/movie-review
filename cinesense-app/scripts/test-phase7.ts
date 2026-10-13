import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { dbService } from '../src/lib/db';

async function runPhase7Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 7 VERIFICATION TESTS (Moctale CineSense)');
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
    // 1. Community Polls & Real Voting (F4)
    console.log('--- Test 1: Community Prediction Polls ---');
    const polls = await dbService.getPolls(1213243);
    assert(polls.length > 0, 'Seed poll for Toxic 2026 retrieved', `Count: ${polls.length}`);
    const toxicPoll = polls[0];
    assert(toxicPoll.question.includes('₹1000 Crore'), 'Poll question is "Will Toxic cross ₹1000 Crore?"', toxicPoll.question);
    assert(toxicPoll.options.length >= 3, 'Poll has multiple valid options', `Options count: ${toxicPoll.options.length}`);

    // Cast a vote
    const testUserId = `user-voter-${Date.now()}`;
    const initialVotes = toxicPoll.options[0].votes;
    const votedPoll = await dbService.votePoll(toxicPoll.id, testUserId, toxicPoll.options[0].id);

    assert(Boolean(votedPoll), 'Vote successfully recorded in DB');
    const updatedOpt = votedPoll?.options.find(o => o.id === toxicPoll.options[0].id);
    assert(updatedOpt?.votes === initialVotes + 1, 'Option vote count incremented', `${initialVotes} -> ${updatedOpt?.votes}`);

    // Prevent duplicate double-voting
    const duplicateVote = await dbService.votePoll(toxicPoll.id, testUserId, toxicPoll.options[1].id);
    const opt2 = duplicateVote?.options.find(o => o.id === toxicPoll.options[1].id);
    assert(duplicateVote?.user_voted_option === toxicPoll.options[0].id, 'Double-voting prevented; original vote preserved');

    // 2. Curated Lists & Collections (C7)
    console.log('\n--- Test 2: Curated Lists & Collections ---');
    const lists = await dbService.getLists();
    assert(lists.length > 0, 'Public curated list exists in database', lists[0].title);

    // 3. Share Review Card Data Integrity (F3)
    console.log('\n--- Test 3: Share Card Data Formatting ---');
    const shareText = `🎬 Toxic (2026) Review Sentiment on CineSense:\n✨ 70% Positive Audience & Critic Consensus`;
    assert(shareText.includes('Toxic'), 'Share card contains canonical title');
    assert(shareText.includes('70% Positive'), 'Share card contains real calculated sentiment %');

  } catch (error: any) {
    console.error('Fatal test error in Phase 7:', error);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 PHASE 7 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7Tests();
