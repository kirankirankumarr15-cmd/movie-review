import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import { searchMovies, getDiscoveryMovies, getMovieDetails } from '../src/lib/api-clients/tmdb';

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 3 VERIFICATION TESTS (Moctale CineSense)');
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
    // 1. Search with Autocomplete & Multi-Language Filter (D1)
    console.log('--- Test 1: Search & Autocomplete ---');
    const searchRes = await searchMovies('Toxic', 'kn');
    assert(searchRes.length > 0, 'Search for "Toxic" with Kannada language filter returns results', `Count: ${searchRes.length}`);
    const toxicMatch = searchRes.find(m => m.id === 1213243);
    assert(Boolean(toxicMatch), 'Results contain canonical Toxic 2026', `ID: ${toxicMatch?.id}`);

    // 2. Discovery Categories (D2)
    console.log('\n--- Test 2: Discovery Sections ---');
    const trending = await getDiscoveryMovies('trending');
    assert(trending.length > 0, 'Trending movies section populated', `Count: ${trending.length}`);

    const upcoming = await getDiscoveryMovies('upcoming');
    assert(upcoming.length > 0, 'Upcoming movies section populated', `Count: ${upcoming.length}`);

    const topRated = await getDiscoveryMovies('top_rated');
    assert(topRated.length > 0, 'Top-rated movies section populated', `Count: ${topRated.length}`);

    // 3. Language Hubs: Sandalwood, Bollywood, Hollywood (D7)
    console.log('\n--- Test 3: Language Hubs ---');
    const sandalwood = await getDiscoveryMovies('top_rated', 'kn');
    assert(sandalwood.length > 0, 'Sandalwood (Kannada) Hub populated with films', `Count: ${sandalwood.length}`);

    const bollywood = await getDiscoveryMovies('top_rated', 'hi');
    assert(bollywood.length > 0, 'Bollywood (Hindi) Hub populated with films', `Count: ${bollywood.length}`);

    const hollywood = await getDiscoveryMovies('top_rated', 'en');
    assert(hollywood.length > 0, 'Hollywood (English) Hub populated with films', `Count: ${hollywood.length}`);

    // 4. Movie Comparison (D5)
    console.log('\n--- Test 4: Movie Comparison Head-to-Head ---');
    const movieA = await getMovieDetails(1213243); // Toxic
    const movieB = await getMovieDetails(872585);  // Oppenheimer
    assert(movieA.title.toLowerCase().includes('toxic'), 'Movie A details retrieved for comparison', movieA.title);
    assert(movieB.title.toLowerCase().includes('oppenheimer'), 'Movie B details retrieved for comparison', movieB.title);
    assert(movieA.director === 'Geetu Mohandas', 'Movie A Director extracted', movieA.director);
    assert(movieB.director === 'Christopher Nolan', 'Movie B Director extracted', movieB.director);

  } catch (error: any) {
    console.error('Fatal test error in Phase 3:', error);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 PHASE 3 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase3Tests();
