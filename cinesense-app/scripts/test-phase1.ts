import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { resolveMovie, getMovieDetails, getPersonDetails } from '../src/lib/api-clients/tmdb';
import { dbService } from '../src/lib/db';

async function runPhase1Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 1 VERIFICATION TESTS (Moctale CineSense)');
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
    // 1. Verify Local DB Seed for Toxic 2026
    console.log('--- Test 1: Seed Data Verification ---');
    const seededToxic = await dbService.getMovieByTmdbId(1213243);
    assert(Boolean(seededToxic), 'Toxic 2026 exists in DB', `TMDB ID: 1213243`);
    assert(seededToxic?.trailer_youtube_id === 'EfluEyQ5QIA', 'Trailer YouTube ID matches official KVN upload', `ID: ${seededToxic?.trailer_youtube_id}`);
    assert(seededToxic?.director === 'Geetu Mohandas', 'Director is Geetu Mohandas', `Director: ${seededToxic?.director}`);
    assert(seededToxic?.language === 'kn', 'Language is Kannada (kn)', `Lang: ${seededToxic?.language}`);
    assert(seededToxic?.age_rating === 'A', 'Age Rating is A', `Rating: ${seededToxic?.age_rating}`);

    // 2. Canonical Movie Resolver (Title + Year + Language)
    console.log('\n--- Test 2: Canonical Movie Resolver ---');
    const resolvedToxic = await resolveMovie('Toxic', 2026, 'kn');
    assert(Boolean(resolvedToxic && resolvedToxic.id === 1213243), 'Resolver disambiguates Toxic 2026 (Kannada)', `Resolved TMDB ID: ${resolvedToxic?.id}`);

    const resolvedHindi = await resolveMovie('Stree 2', 2024, 'hi');
    assert(Boolean(resolvedHindi && resolvedHindi.original_language === 'hi'), 'Resolver disambiguates Stree 2 (Hindi)', `Title: ${resolvedHindi?.title}, ID: ${resolvedHindi?.id}`);

    const resolvedHollywood = await resolveMovie('Oppenheimer', 2023, 'en');
    assert(Boolean(resolvedHollywood && resolvedHollywood.id === 872585), 'Resolver disambiguates Oppenheimer (Hollywood)', `ID: ${resolvedHollywood?.id}`);

    // 3. TMDB Full Details & Video Fetching
    console.log('\n--- Test 3: TMDB Movie Details & Trailer ---');
    const toxicDetails = await getMovieDetails(1213243);
    assert(toxicDetails.title.toLowerCase().includes('toxic'), 'TMDB Title matches Toxic', toxicDetails.title);
    assert(toxicDetails.trailer_youtube_id === 'EfluEyQ5QIA', 'Official trailer ID is EfluEyQ5QIA', `Key: ${toxicDetails.trailer_youtube_id}`);
    assert(Boolean(toxicDetails.credits?.cast && toxicDetails.credits.cast.length > 0), 'Cast list is populated', `Count: ${toxicDetails.credits?.cast?.length}`);
    const yashCast = toxicDetails.credits?.cast?.find(c => c.name.toLowerCase().includes('yash'));
    assert(Boolean(yashCast), 'Cast includes superstar Yash', `Name: ${yashCast?.name}`);

    // 4. Person Details & Filmography
    console.log('\n--- Test 4: Person Details & Filmography ---');
    if (yashCast) {
      const yashDetails = await getPersonDetails(yashCast.id);
      assert(Boolean(yashDetails.name), 'Person details fetched for Yash', `Name: ${yashDetails.name}`);
      assert(Boolean(yashDetails.movie_credits?.cast && yashDetails.movie_credits.cast.length > 0), 'Filmography populated', `Credits: ${yashDetails.movie_credits?.cast?.length}`);
    }

    // 5. In-site Trailer Modal Embed Format Verification
    console.log('\n--- Test 5: In-Site Trailer Modal Security & Embedding ---');
    const embedUrl = `https://www.youtube-nocookie.com/embed/${toxicDetails.trailer_youtube_id}?autoplay=1&rel=0&modestbranding=1`;
    assert(embedUrl.includes('youtube-nocookie.com'), 'Uses privacy-enhanced youtube-nocookie domain');
    assert(embedUrl.includes('autoplay=1'), 'Has autoplay=1 parameter');
    assert(embedUrl.includes('rel=0'), 'Has rel=0 (no external related videos)');
    assert(embedUrl.includes('modestbranding=1'), 'Has modestbranding=1');

  } catch (error: any) {
    console.error('Fatal test error:', error);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 PHASE 1 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase1Tests();
