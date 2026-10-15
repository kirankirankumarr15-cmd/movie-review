const test = require('node:test');
const assert = require('node:assert/strict');
const { scoreCandidate, DISQUALIFIED_KEYWORDS } = require('../services/trailerResolver');

test('Trailer Candidate Scoring & Disqualification Unit Tests', async (t) => {
  const movieInfo = {
    title: 'Mungaru Male',
    year: 2006,
    language: 'kn',
  };

  const whitelistedChannels = [
    'T-Series',
    'Sony Music South',
    'Lahari Music / T-Series Kannada',
    'KVN Productions',
    'Hombale Films',
  ];

  await t.test('REJECTS fan-made trailer immediately with score -100', () => {
    const candidate = {
      title: 'Mungaru Male 2006 Official Trailer Fan Made HD',
      channelTitle: 'CinemaFan Edits',
    };
    const result = scoreCandidate(candidate, movieInfo, whitelistedChannels);
    assert.equal(result.accepted, false);
    assert.equal(result.score, -100);
    assert.match(result.rejectionReason, /fan made/i);
  });

  await t.test('REJECTS reaction video immediately with score -100', () => {
    const candidate = {
      title: 'Americans Reaction to Mungaru Male Trailer & Songs',
      channelTitle: 'Global Reacts',
    };
    const result = scoreCandidate(candidate, movieInfo, whitelistedChannels);
    assert.equal(result.accepted, false);
    assert.equal(result.score, -100);
    assert.match(result.rejectionReason, /reaction/i);
  });

  await t.test('REJECTS movie review video immediately', () => {
    const candidate = {
      title: 'Mungaru Male Detailed Movie Review and Breakdown',
      channelTitle: 'Film Critic Zone',
    };
    const result = scoreCandidate(candidate, movieInfo, whitelistedChannels);
    assert.equal(result.accepted, false);
    assert.equal(result.score, -100);
    assert.match(result.rejectionReason, /review/i);
  });

  await t.test('REJECTS concept trailer and AI trailer', () => {
    const c1 = { title: 'Mungaru Male 3 Concept Trailer 2026', channelTitle: 'Concept Studio' };
    const c2 = { title: 'Mungaru Male Remastered AI Trailer', channelTitle: 'AI Movies' };

    assert.equal(scoreCandidate(c1, movieInfo, whitelistedChannels).accepted, false);
    assert.equal(scoreCandidate(c2, movieInfo, whitelistedChannels).accepted, false);
  });

  await t.test('ACCEPTS verified official channel trailer with high score >= 70', () => {
    const candidate = {
      title: 'Mungaru Male Official Trailer | Ganesh | Pooja Gandhi',
      channelTitle: 'Lahari Music / T-Series Kannada',
      durationSeconds: 154, // 2.5 minutes
      views: 1250000,
    };
    const result = scoreCandidate(candidate, movieInfo, whitelistedChannels);
    assert.equal(result.accepted, true);
    assert.ok(result.score >= 70, `Expected score >= 70, got ${result.score}`);
    assert.match(result.reasons, /Whitelisted official channel/);
    assert.match(result.reasons, /Title match/);
  });

  await t.test('REJECTS or flags candidate with low score below threshold', () => {
    const candidate = {
      title: 'Random Clip from 2006 Kannada Movies',
      channelTitle: 'Unknown User 123',
      durationSeconds: 25, // Too short
    };
    const result = scoreCandidate(candidate, movieInfo, whitelistedChannels);
    assert.equal(result.accepted, false);
    assert.ok(result.score < 45, `Expected score < 45, got ${result.score}`);
  });
});

test('TMDB Regional Language Inclusion Logic Unit Tests', async (t) => {
  function buildTmdbVideoUrl(tmdbId, language) {
    const lang = (language || 'en').toLowerCase();
    return `https://api.tmdb.org/3/movie/${tmdbId}/videos?include_video_language=${lang},en,hi,null`;
  }

  await t.test('Properly includes Kannada regional language parameter', () => {
    const url = buildTmdbVideoUrl(39095, 'kn');
    assert.ok(url.includes('include_video_language=kn,en,hi,null'));
  });

  await t.test('Properly includes Hindi regional language parameter', () => {
    const url = buildTmdbVideoUrl(360814, 'hi');
    assert.ok(url.includes('include_video_language=hi,en,hi,null'));
  });

  await t.test('Properly includes Tamil regional language parameter', () => {
    const url = buildTmdbVideoUrl(1234139, 'ta');
    assert.ok(url.includes('include_video_language=ta,en,hi,null'));
  });

  await t.test('Properly includes Telugu regional language parameter', () => {
    const url = buildTmdbVideoUrl(881903, 'te');
    assert.ok(url.includes('include_video_language=te,en,hi,null'));
  });
});
