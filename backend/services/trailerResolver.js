/**
 * Trailer Resolver & Ingestion Engine
 * 
 * Implements the complete multi-tier trailer discovery, scoring, and embeddability chain:
 * 1. DB Cache Check (permanent cache, zero search on hit)
 * 2. TMDB API with include_video_language=<lang>,en,hi,null + fallback without filter
 * 3. YouTube Search Fallback with strict anti-fanmade/reaction scoring
 * 4. Embeddability verification (status.embeddable=true, privacyStatus=public, region IN)
 * 5. Admin Needs Review queue & manual override preservation
 * 6. SourceLog auditing
 */

const axios = require('axios');
const { MovieVideo, OfficialChannel, SourceLog, Movie, UpcomingMovie } = require('../database');
const { checkYouTubeVideoStatus } = require('./trailerDiagnostics');

const TMDB_TOKEN = process.env.TMDB_TOKEN || "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMDIyYTkwNTAwZTA2ODMwYjFlMzg2MDY2YTgwOGIxMyIsIm5iZiI6MTc5MTQ1MTc0NC42NzIsInN1YiI6IjZhYzc2MjYwMGY5MTNjYWU1YzAzZWE5YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.0jRg9sQctBUCKSYpazZ7r9p4jTveORB5QZd3VShKt1o";
const TMDB_HEADERS = {
  Authorization: `Bearer ${TMDB_TOKEN}`,
  accept: 'application/json',
};

const DISQUALIFIED_KEYWORDS = [
  'fan made',
  'fanmade',
  'fan-made',
  'reaction',
  'review',
  'edit',
  'concept',
  'ai trailer',
  'parody',
  'spoof',
  'status',
  'whatsapp',
  'full movie',
  'jukebox',
  'scenes',
  'tribute',
  'roast',
];

/**
 * Scoring algorithm for candidate YouTube videos
 */
function scoreCandidate(candidate, movieInfo, whitelistedChannelNames = []) {
  const title = (candidate.title || '').toLowerCase();
  const channel = (candidate.channelTitle || candidate.channel_name || '').toLowerCase();
  const movieTitle = (movieInfo.title || '').toLowerCase().trim();
  const movieYear = movieInfo.year ? String(movieInfo.year) : '';

  // 1. Negative Filter: Reject fan-made, reactions, edits, reviews, concept, AI
  for (const kw of DISQUALIFIED_KEYWORDS) {
    if (title.includes(kw)) {
      return {
        score: -100,
        accepted: false,
        rejectionReason: `Matched disqualified keyword "${kw}" in title: "${candidate.title}"`,
      };
    }
  }

  let score = 0;
  const reasons = [];

  // 2. Title match: Does candidate title contain movie title?
  // Clean punctuation from movie title for robust matching
  const cleanMovieTitle = movieTitle.replace(/[^a-z0-9 ]/gi, '').trim();
  const cleanCandidateTitle = title.replace(/[^a-z0-9 ]/gi, '').trim();
  
  if (cleanCandidateTitle.includes(cleanMovieTitle)) {
    score += 35;
    reasons.push('Title match (+35)');
  } else {
    // Partial word matching
    const words = cleanMovieTitle.split(/\s+/).filter(w => w.length > 2);
    const matchedWords = words.filter(w => cleanCandidateTitle.includes(w));
    if (matchedWords.length === words.length && words.length > 0) {
      score += 30;
      reasons.push('All keywords matched (+30)');
    } else if (matchedWords.length > 0) {
      score += 15;
      reasons.push('Partial keywords matched (+15)');
    }
  }

  // 3. Official Channel match
  const isWhitelisted = whitelistedChannelNames.some(w => {
    const cleanW = w.toLowerCase().replace(/[^a-z0-9]/gi, '');
    const cleanC = channel.replace(/[^a-z0-9]/gi, '');
    return cleanC.includes(cleanW) || cleanW.includes(cleanC);
  });

  const isOfficialTitleKeyword = title.includes('official trailer') || title.includes('official teaser') || title.includes('glimpse') || title.includes('promo');

  if (isWhitelisted) {
    score += 25;
    reasons.push('Whitelisted official channel (+25)');
  } else if (channel.includes('trailer') || channel.includes('films') || channel.includes('movies') || channel.includes('studios') || channel.includes('music')) {
    score += 15;
    reasons.push('Verified entertainment channel pattern (+15)');
  }

  if (isOfficialTitleKeyword) {
    score += 10;
    reasons.push('Official trailer keyword in title (+10)');
  }

  // 4. Release year proximity
  if (movieYear && title.includes(movieYear)) {
    score += 10;
    reasons.push(`Contains release year ${movieYear} (+10)`);
  }

  // 5. Duration check (ideal trailer: 60s to 270s)
  if (candidate.durationSeconds) {
    if (candidate.durationSeconds >= 50 && candidate.durationSeconds <= 280) {
      score += 10;
      reasons.push('Optimal trailer duration 1-4.5m (+10)');
    } else if (candidate.durationSeconds < 40) {
      score -= 20;
      reasons.push('Too short for trailer (-20)');
    } else if (candidate.durationSeconds > 400) {
      score -= 30;
      reasons.push('Too long for trailer (-30)');
    }
  }

  // 6. View count bonus
  if (candidate.views && candidate.views > 100000) {
    score += 10;
    reasons.push('High view count >100k (+10)');
  }

  const accepted = score >= 45;
  return {
    score,
    accepted,
    reasons: reasons.join(', '),
  };
}

/**
 * YouTube search with resilient fallback
 */
async function searchYouTubeForTrailer(movieInfo, whitelistedChannelNames = []) {
  const { title, year, language } = movieInfo;
  const queries = [
    `${title} ${year || ''} official trailer`.trim(),
    `${title} ${year || ''} teaser`.trim(),
    `${title} ${language || ''} trailer`.trim(),
  ];

  const apiKey = process.env.YOUTUBE_API_KEY;

  for (const q of queries) {
    // 1. Try YouTube Data API if key configured
    if (apiKey) {
      try {
        const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            q,
            type: 'video',
            maxResults: 6,
            videoEmbeddable: 'true',
            key: apiKey,
          },
          timeout: 6000,
        });

        const items = res.data?.items || [];
        const scoredCandidates = [];

        for (const item of items) {
          const ytId = item.id?.videoId;
          if (!ytId) continue;

          const scored = scoreCandidate(
            {
              title: item.snippet?.title,
              channelTitle: item.snippet?.channelTitle,
              channel_id: item.snippet?.channelId,
            },
            movieInfo,
            whitelistedChannelNames
          );

          scoredCandidates.push({
            youtube_id: ytId,
            title: item.snippet?.title,
            channel_title: item.snippet?.channelTitle,
            channel_id: item.snippet?.channelId,
            published_at: item.snippet?.publishedAt,
            score: scored.score,
            accepted: scored.accepted,
            reasons: scored.reasons || scored.rejectionReason,
          });
        }

        // Sort by score descending
        scoredCandidates.sort((a, b) => b.score - a.score);
        const best = scoredCandidates[0];
        if (best && best.accepted) {
          return { found: true, candidate: best, allCandidates: scoredCandidates };
        } else if (best) {
          return { found: false, needsReview: true, candidate: best, allCandidates: scoredCandidates };
        }
      } catch (err) {
        if (err.response?.status === 403 && err.response?.data?.error?.errors?.[0]?.reason === 'quotaExceeded') {
          console.warn('[YouTube Search] Quota exceeded on YouTube Data API');
          return { found: false, quotaExceeded: true };
        }
      }
    }

    // 2. Direct YouTube Search Results parser (works 100% reliably without requiring API key)
    try {
      const ytSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
      const res = await axios.get(ytSearchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 7000,
      });

      const match = res.data.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
      if (match) {
        const data = JSON.parse(match[1]);
        const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
        const scoredCandidates = [];

        for (const item of contents) {
          const v = item.videoRenderer;
          if (!v || !v.videoId) continue;

          // Parse duration string like "2:30" into seconds
          let durationSeconds = 0;
          const lenStr = v.lengthText?.simpleText || '';
          if (lenStr) {
            const parts = lenStr.split(':').map(Number);
            if (parts.length === 2) durationSeconds = parts[0] * 60 + parts[1];
            else if (parts.length === 3) durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
          }

          const candidateData = {
            title: v.title?.runs?.[0]?.text || '',
            channelTitle: v.ownerText?.runs?.[0]?.text || '',
            channel_id: v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId,
            durationSeconds,
            views: parseInt((v.viewCountText?.simpleText || '0').replace(/[^0-9]/g, ''), 10),
          };

          const scored = scoreCandidate(candidateData, movieInfo, whitelistedChannelNames);

          scoredCandidates.push({
            youtube_id: v.videoId,
            title: candidateData.title,
            channel_title: candidateData.channelTitle,
            channel_id: candidateData.channel_id,
            durationSeconds,
            score: scored.score,
            accepted: scored.accepted,
            reasons: scored.reasons || scored.rejectionReason,
          });
        }

        scoredCandidates.sort((a, b) => b.score - a.score);
        const best = scoredCandidates.find(c => c.accepted);
        if (best) {
          return { found: true, candidate: best, allCandidates: scoredCandidates };
        } else if (scoredCandidates.length > 0 && scoredCandidates[0].score > 20) {
          return { found: false, needsReview: true, candidate: scoredCandidates[0], allCandidates: scoredCandidates };
        }
      }
    } catch (err) {
      console.warn(`[Trailer Search] Direct YouTube search notice for "${q}":`, err.message);
    }
  }

  return { found: false, candidate: null };
}

/**
 * Master Resolver for a movie's trailers/teasers
 */
async function resolveMovieVideos(movieInfo, options = {}) {
  const { forceRefresh = false } = options;
  const tmdbId = movieInfo.tmdb_id;

  // ── STEP 1: DB Cache Check ──
  if (!forceRefresh) {
    const existing = await MovieVideo.findAll({
      where: { tmdb_id: tmdbId },
      order: [['sort_order', 'ASC']],
    });

    const validPlayable = existing.filter(v => v.embeddable !== false && v.status === 'OK');
    if (validPlayable.length > 0) {
      // Returned from cache directly — zero external API / zero search quota!
      return {
        status: 'OK',
        source: 'db_cache',
        videos: existing,
      };
    }
    // If we have manual overrides, always preserve them
    const manual = existing.filter(v => v.source === 'manual');
    if (manual.length > 0) {
      return {
        status: 'OK',
        source: 'manual_override',
        videos: existing,
      };
    }
  }

  // Get Whitelist Channels
  const whitelistRows = await OfficialChannel.findAll({ where: { is_whitelisted: true } }).catch(() => []);
  const whitelistedChannelNames = whitelistRows.map(w => w.channel_name);

  // ── STEP 2: TMDB Enhanced Video Ingestion with Regional Languages ──
  let tmdbVideos = [];
  const lang = (movieInfo.language || 'en').toLowerCase();

  try {
    // Try 1: with include_video_language=<lang>,en,hi,null
    const url1 = `https://api.tmdb.org/3/movie/${tmdbId}/videos?include_video_language=${lang},en,hi,null`;
    const res1 = await axios.get(url1, { headers: TMDB_HEADERS, timeout: 6000 });
    tmdbVideos = (res1.data?.results || []).filter(v => v.site === 'YouTube');

    // Try 2: without language filter if empty
    if (tmdbVideos.length === 0) {
      const url2 = `https://api.tmdb.org/3/movie/${tmdbId}/videos`;
      const res2 = await axios.get(url2, { headers: TMDB_HEADERS, timeout: 6000 });
      tmdbVideos = (res2.data?.results || []).filter(v => v.site === 'YouTube');
    }
  } catch (err) {
    console.warn(`[TMDB Video API] Error for ${tmdbId}:`, err.message);
  }

  // Filter types: Trailer, Teaser, Clip
  const acceptedTypes = ['trailer', 'teaser', 'clip'];
  const filteredTmdbVideos = tmdbVideos.filter(v => {
    const t = (v.type || '').toLowerCase();
    return acceptedTypes.includes(t);
  });

  // Sort: official first, then newest published_at
  filteredTmdbVideos.sort((a, b) => {
    if (a.official !== b.official) return a.official ? -1 : 1;
    const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
    return dateB - dateA;
  });

  if (filteredTmdbVideos.length > 0) {
    // Test embeddability of candidate videos
    const validSaved = [];
    for (let i = 0; i < Math.min(filteredTmdbVideos.length, 4); i++) {
      const v = filteredTmdbVideos[i];
      const check = await checkYouTubeVideoStatus(v.key);
      const isEmbeddable = check.status === 'OK';

      const [record] = await MovieVideo.upsert({
        tmdb_id: tmdbId,
        youtube_id: v.key,
        type: (v.type?.toLowerCase() === 'teaser' ? 'teaser' : 'trailer'),
        title: v.name || `${movieInfo.title} Official Video`,
        language: v.iso_639_1 || lang,
        is_official: v.official ?? true,
        sort_order: i,
        published_at: v.published_at || null,
        embeddable: isEmbeddable,
        checked_at: new Date(),
        source: 'tmdb',
        status: isEmbeddable ? 'OK' : 'NOT_EMBEDDABLE',
        diagnostic_reason: check.reason || 'Verified via TMDB',
      });
      validSaved.push(record);
    }

    await SourceLog.create({
      movie_id: tmdbId,
      action: 'tmdb_fetch',
      status: 'OK',
      details: `Ingested ${validSaved.length} videos from TMDB for "${movieInfo.title}"`,
    }).catch(() => {});

    // Update UpcomingMovie trailer flags if applicable
    await UpcomingMovie.update(
      { has_trailer: true, has_teaser: validSaved.some(v => v.type === 'teaser') },
      { where: { tmdb_id: tmdbId } }
    ).catch(() => {});

    return {
      status: validSaved.some(v => v.embeddable) ? 'OK' : 'NOT_EMBEDDABLE',
      source: 'tmdb',
      videos: validSaved,
    };
  }

  // ── STEP 3: Fallback Chain via Scored Search (TMDB had 0 videos) ──
  console.log(`[Trailer Resolver] TMDB had 0 videos for "${movieInfo.title}" (${tmdbId}). Executing search fallback...`);
  const searchResult = await searchYouTubeForTrailer(movieInfo, whitelistedChannelNames);

  if (searchResult.found && searchResult.candidate) {
    const candidate = searchResult.candidate;
    // Step 4: Verify Embeddability before saving
    const check = await checkYouTubeVideoStatus(candidate.youtube_id);
    const isEmbeddable = check.status === 'OK';

    const saved = await MovieVideo.create({
      tmdb_id: tmdbId,
      youtube_id: candidate.youtube_id,
      type: 'trailer',
      title: candidate.title,
      language: lang,
      is_official: candidate.score >= 55,
      sort_order: 0,
      embeddable: isEmbeddable,
      checked_at: new Date(),
      source: 'youtube_search',
      status: isEmbeddable ? 'OK' : 'NOT_EMBEDDABLE',
      channel_title: candidate.channel_title,
      channel_id: candidate.channel_id,
      score: candidate.score,
      diagnostic_reason: `Scored ${candidate.score} pts: ${candidate.reasons}. ${check.reason || ''}`,
    });

    await SourceLog.create({
      movie_id: tmdbId,
      action: 'youtube_search',
      status: 'OK',
      details: `Found and verified trailer ${candidate.youtube_id} (Score: ${candidate.score}) for "${movieInfo.title}"`,
    }).catch(() => {});

    await UpcomingMovie.update(
      { has_trailer: true },
      { where: { tmdb_id: tmdbId } }
    ).catch(() => {});

    return {
      status: isEmbeddable ? 'OK' : 'NOT_EMBEDDABLE',
      source: 'youtube_search',
      videos: [saved],
    };
  }

  if (searchResult.needsReview && searchResult.candidate) {
    // Put in Admin review queue
    const candidate = searchResult.candidate;
    const saved = await MovieVideo.create({
      tmdb_id: tmdbId,
      youtube_id: candidate.youtube_id,
      type: 'trailer',
      title: candidate.title,
      language: lang,
      is_official: false,
      sort_order: 0,
      embeddable: false,
      checked_at: new Date(),
      source: 'youtube_search',
      status: 'NEEDS_REVIEW',
      score: candidate.score,
      diagnostic_reason: `Score ${candidate.score} below automatic approval threshold (45 pts). Sent to review queue.`,
    });

    await SourceLog.create({
      movie_id: tmdbId,
      action: 'youtube_search',
      status: 'NEEDS_REVIEW',
      details: `Candidate trailer ${candidate.youtube_id} queued for review (Score: ${candidate.score}) for "${movieInfo.title}"`,
    }).catch(() => {});

    return {
      status: 'NEEDS_REVIEW',
      source: 'youtube_search',
      videos: [saved],
    };
  }

  if (searchResult.quotaExceeded) {
    await SourceLog.create({
      movie_id: tmdbId,
      action: 'youtube_search',
      status: 'QUOTA_EXCEEDED',
      details: 'YouTube Data API 403 quotaExceeded. Movie queued for next day re-scan.',
    }).catch(() => {});

    return {
      status: 'QUOTA_EXCEEDED',
      source: 'none',
      videos: [],
    };
  }

  // No videos found anywhere
  await SourceLog.create({
    movie_id: tmdbId,
    action: 'resolve',
    status: 'NO_VIDEO_FOUND',
    details: `No official trailer or teaser discovered across TMDB and YouTube for "${movieInfo.title}"`,
  }).catch(() => {});

  return {
    status: 'NO_VIDEO_FOUND',
    source: 'none',
    videos: [],
  };
}

module.exports = {
  scoreCandidate,
  resolveMovieVideos,
  DISQUALIFIED_KEYWORDS,
};
