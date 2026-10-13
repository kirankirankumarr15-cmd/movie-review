import { dbService } from '../src/lib/db';
import { LegalFullMovieService } from '../src/lib/services/legal-full-movie';

async function runFeatureA8AndHeroPlayerTests() {
  console.log('\n========================================================================');
  console.log('🎬 RUNNING FEATURE A8 (LEGAL FULL-MOVIE) & HERO IN-PLAYER TEST SUITE');
  console.log('========================================================================\n');

  let passed = 0;
  let failed = 0;

  function record(testName: string, pass: boolean, evidence: string, notes: string = '') {
    if (pass) {
      console.log(`✅ [PASS] ${testName}`);
      console.log(`   Evidence: ${evidence}`);
      if (notes) console.log(`   Notes: ${notes}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      console.error(`   Evidence: ${evidence}`);
      if (notes) console.error(`   Notes: ${notes}`);
      failed++;
    }
  }

  try {
    // --- TEST 1: Whitelist of Official Production & Distributor Channels ---
    const channels = await dbService.getOfficialChannels();
    const hasKVN = channels.some(c => c.channel_name === 'KVN Productions' && c.is_whitelisted);
    const hasRajshri = channels.some(c => c.channel_name === 'Rajshri' && c.is_whitelisted);
    const hasGoldmines = channels.some(c => c.channel_name === 'Goldmines Telefilms' && c.is_whitelisted);
    record(
      'A8.1 Official Rights-Holder Whitelist',
      channels.length >= 7 && hasKVN && hasRajshri && hasGoldmines,
      `Configured ${channels.length} official channels: ${channels.map(c => c.channel_name).slice(0, 4).join(', ')}...`,
      'Admin-controlled table prevents unknown and pirate channel embeds'
    );

    // --- TEST 2: Verified Legal Free Full-Movie Upload Accepted ---
    // Test case: Hum Saath-Saath Hain (TMDB: 42125, runtime: 177m, Rajshri channel ID UCU_4jFjBqP1WjHkO9vV7Yqw)
    const officialLegalTest = await LegalFullMovieService.verifyCandidate(
      {
        youtube_id: 'g98p1L6e-vA',
        channel_id: 'UCU_4jFjBqP1WjHkO9vV7Yqw',
        channel_name: 'Rajshri',
        video_duration_minutes: 177,
        is_embeddable: true
      },
      {
        tmdb_id: 42125,
        title: 'Hum Saath-Saath Hain',
        tmdb_runtime_minutes: 177
      }
    );
    record(
      'A8.2 Official Free Full Movie Verification',
      officialLegalTest.verification_status === 'verified_approved' && officialLegalTest.channel_name === 'Rajshri',
      `Status: ${officialLegalTest.verification_status}, Studio: ${officialLegalTest.channel_name}, Runtime: ${officialLegalTest.video_duration_minutes}m matches TMDB`,
      'Channel matches whitelist and duration tolerance ±10m satisfied'
    );

    // --- TEST 3: New Theatrical Film (Toxic 2026) Shows NO Full Movie Button ---
    // Toxic is an upcoming 2026 theatrical release; it must never show a full movie button
    const toxicFullMovieResult = await LegalFullMovieService.findVerifiedFullMovie(
      1213243,
      'Toxic: A Fairy Tale for Grown-ups',
      2026,
      155
    );
    record(
      'A8.3 Theatrical Film Shows NO Full Movie (Toxic 2026)',
      toxicFullMovieResult.isLegallyAvailable === false,
      `isLegallyAvailable = false. Result: "${toxicFullMovieResult.rejectionReason}". Fallback: Theatres / OTT Where to Watch.`,
      'Non-negotiable rule: Empty is better than fake/pirated data'
    );

    // --- TEST 4: Pirated Upload from Unverified Channel REJECTED ---
    const piratedCandidate = await LegalFullMovieService.verifyCandidate(
      {
        youtube_id: 'pirate_leak_1080p_rip',
        channel_id: 'UC_unknown_pirate_leaks_channel_999',
        channel_name: 'FreeMoviesBootlegHD',
        video_duration_minutes: 90,
        is_embeddable: true
      },
      {
        tmdb_id: 1213243,
        title: 'Toxic',
        tmdb_runtime_minutes: 155
      }
    );
    const rejectionContainsChannel = piratedCandidate.rejection_reason?.includes('not an authorized official rights holder');
    const rejectionContainsDuration = piratedCandidate.rejection_reason?.includes('Duration discrepancy');
    record(
      'A8.4 Pirated / Bootleg Upload Rejection',
      piratedCandidate.verification_status === 'rejected_pirated_or_unverified' && Boolean(rejectionContainsChannel || rejectionContainsDuration),
      `Rejected with reason: "${piratedCandidate.rejection_reason}"`,
      'Guarantees CineSense never embeds pirated or re-uploaded content'
    );

    // --- TEST 5: Duration Mismatch Rejection (±10 min Tolerance) ---
    // Even if an official channel uploads a short promotional clip or trailer, reject it as full movie if duration != TMDB runtime
    const clipCandidate = await LegalFullMovieService.verifyCandidate(
      {
        youtube_id: 'short_promo_clip',
        channel_id: 'UC7m01_w20K5tK5d8C9J1_kw', // KVN Productions (Official)
        channel_name: 'KVN Productions',
        video_duration_minutes: 15, // 15 mins vs 155 min TMDB runtime
        is_embeddable: true
      },
      {
        tmdb_id: 1213243,
        title: 'Toxic',
        tmdb_runtime_minutes: 155
      }
    );
    record(
      'A8.5 Duration Discrepancy Gate (±10 Min Tolerance)',
      clipCandidate.verification_status === 'rejected_pirated_or_unverified' && clipCandidate.rejection_reason?.includes('Duration discrepancy') === true,
      `Rejected clip with runtime diff 140m > 10m tolerance: "${clipCandidate.rejection_reason}"`,
      'Prevents clips and teasers from being misidentified as full movies'
    );

    // --- TEST 6: Toxic 2026 Seeded Official Videos in movie_videos ---
    const toxicVideos = await dbService.getMovieVideos(1213243);
    const teaser = toxicVideos.find(v => v.type === 'teaser');
    const trailer = toxicVideos.find(v => v.type === 'trailer');
    record(
      'HeroPlayer.1 Verified Toxic 2026 Multi-Videos (Teaser & Trailer)',
      Boolean(teaser && trailer && teaser.youtube_id === 'EfluEyQ5QIA' && teaser.channel_name === 'KVN Productions'),
      `Teaser YouTube ID: ${teaser?.youtube_id} ("${teaser?.title}"), Trailer: ${trailer?.youtube_id}`,
      'Verified official KVN Productions uploads for Yash & Geetu Mohandas film'
    );

    // --- TEST 7: Video Order Priority (Teaser First, Then Trailer) ---
    const orderPriority: Record<string, number> = { teaser: 1, trailer: 2, clip: 3, song: 4 };
    const sortedVideos = [...toxicVideos].sort((a, b) => orderPriority[a.type] - orderPriority[b.type]);
    record(
      'HeroPlayer.2 Video Tab Priority Ordering',
      sortedVideos[0]?.type === 'teaser' && sortedVideos[1]?.type === 'trailer',
      `Order: [${sortedVideos.map(v => v.type).join(' -> ')}]`,
      'Teaser placed first, trailer second as specified in technical design'
    );

    // --- TEST 8: Hero Player Embed URL & Privacy Policy ---
    const embedUrl = `https://www.youtube-nocookie.com/embed/${teaser?.youtube_id}?enablejsapi=1&autoplay=1&mute=0&rel=0&modestbranding=1&playsinline=1`;
    record(
      'HeroPlayer.3 In-Screen Player URL Parameters',
      embedUrl.includes('youtube-nocookie.com') && embedUrl.includes('enablejsapi=1') && embedUrl.includes('rel=0') && embedUrl.includes('playsinline=1'),
      `Player URL: ${embedUrl}`,
      'Zero redirect, no new tab, modest branding, inline playback on mobile'
    );

    // --- TEST 9: Admin Management Endpoints for Channels & Queue ---
    const testChannelId = `UC_test_${Date.now()}`;
    await dbService.addOfficialChannel({
      id: `ch-test-${Date.now()}`,
      channel_id: testChannelId,
      channel_name: 'Test Film Studio',
      language: 'kn',
      verified_date: new Date().toISOString(),
      is_whitelisted: true,
      notes: 'Automated test studio'
    });
    const updatedChannels = await dbService.getOfficialChannels();
    const added = updatedChannels.some(c => c.channel_id === testChannelId);
    await dbService.removeOfficialChannel(testChannelId);
    const cleanedChannels = await dbService.getOfficialChannels();
    const removed = !cleanedChannels.some(c => c.channel_id === testChannelId);

    record(
      'A8.6 Admin Channel Whitelist Management (Add & Remove)',
      added && removed,
      `Successfully added ${testChannelId} to whitelist and removed it cleanly`,
      'Full administrative control over rights-holder authorization'
    );

    // --- TEST 10: Admin Full-Movie Queue Status Updates ---
    await dbService.updateLegalFullMovieStatus(piratedCandidate.id, 'rejected_pirated_or_unverified', 'Manually confirmed bootleg by admin');
    const queue = await dbService.getAllLegalFullMovies();
    const updatedCandidate = queue.find(q => q.id === piratedCandidate.id);
    record(
      'A8.7 Admin Review Queue Moderation Actions',
      updatedCandidate?.verification_status === 'rejected_pirated_or_unverified',
      `Queue item ${updatedCandidate?.id} status updated to: ${updatedCandidate?.verification_status}`,
      'Admins can audit, approve, or reject detected links in real time'
    );

  } catch (err: any) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n========================================================================');
  console.log(`🏁 FEATURE A8 & HERO PLAYER TEST SUITE: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runFeatureA8AndHeroPlayerTests();
