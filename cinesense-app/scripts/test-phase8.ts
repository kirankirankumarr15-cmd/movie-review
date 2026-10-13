import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import sitemap from '../src/app/sitemap';
import manifest from '../src/app/manifest';
import { dbService } from '../src/lib/db';

async function runPhase8Tests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 8 VERIFICATION TESTS (Moctale CineSense)');
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
    // 1. SEO Sitemap Generation (G4)
    console.log('--- Test 1: SEO Sitemap Generation ---');
    const sitemapEntries = sitemap();
    assert(sitemapEntries.length >= 10, 'Sitemap generates all primary routes', `Count: ${sitemapEntries.length}`);
    const hasKannadaHub = sitemapEntries.some(e => e.url.includes('/hub/kn'));
    assert(hasKannadaHub, 'Sitemap includes Sandalwood Kannada Hub route');
    const hasToxicMovie = sitemapEntries.some(e => e.url.includes('/movie/1213243'));
    assert(hasToxicMovie, 'Sitemap includes canonical Toxic (1213243) movie route');

    // 2. PWA Manifest (G2)
    console.log('\n--- Test 2: PWA Manifest Integrity ---');
    const manifestObj = manifest();
    assert(Boolean(manifestObj.name?.includes('CineSense')), 'Manifest name is configured correctly', manifestObj.name || '');
    assert(manifestObj.start_url === '/', 'Manifest start_url is /');
    assert(manifestObj.display === 'standalone', 'Manifest display mode is standalone for PWA');

    // 3. Admin Logs & Health Monitor (G5)
    console.log('\n--- Test 3: Admin Logs & Health Monitor ---');
    await dbService.logSourceFetch('TMDB', 'SUCCESS', 'Automated test health check pass');
    const logs = await dbService.getSourceLogs();
    assert(logs.length > 0, 'Source adapter logs recorded in admin monitor', `Logs count: ${logs.length}`);
    assert(logs[0].source === 'TMDB', 'Latest source log has expected source name', logs[0].source);

  } catch (error: any) {
    console.error('Fatal test error in Phase 8:', error);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 PHASE 8 RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase8Tests();
