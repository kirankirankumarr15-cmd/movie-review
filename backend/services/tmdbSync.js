/**
 * TMDB Upcoming Movies Sync & Anticipation Recompute Service
 * 
 * Rules:
 * - Real data only from official TMDB API + YouTube oEmbed/metadata.
 * - Filters strictly for upcoming releases (primary_release_date.gte=today in IST, or TBA/unannounced).
 * - Periodically records video statistics snapshots.
 * - Computes and updates anticipation scores.
 */

const axios = require('axios');
const { calculateAnticipationScore } = require('./anticipation');

const TMDB_TOKEN = process.env.TMDB_TOKEN || process.env.TMDB_API_KEY || '';
const TMDB_HEADERS = {
  Authorization: `Bearer ${TMDB_TOKEN}`,
  accept: 'application/json',
};

// Returns today's date formatted as YYYY-MM-DD in Indian Standard Time (IST)
function getISTDateString() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

/**
 * Fetch real YouTube view count & stats
 */
async function fetchYouTubeVideoStats(youtubeId) {
  try {
    const url = `https://www.youtube.com/watch?v=${youtubeId}`;
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 7000,
    });
    const html = res.data;
    let views = 0;
    const viewMatch = html.match(/"viewCount":"(\d+)"/);
    if (viewMatch) views = parseInt(viewMatch[1], 10);

    let likes = 0;
    const likesMatch = html.match(/"likeCount":"(\d+)"/);
    if (likesMatch) likes = parseInt(likesMatch[1], 10);

    return { views, likes, comments: 0 };
  } catch (err) {
    return { views: 0, likes: 0, comments: 0 };
  }
}

/**
 * Sync TMDB upcoming movies into database
 */
async function syncUpcomingFromTMDB(models) {
  const { UpcomingMovie, MovieVideo, AnticipationScore, VideoStatsSnapshot, ExcitementVote, Reminder, Announcement, RelatedNews, FanDiscussion } = models;
  const todayStr = getISTDateString();
  console.log(`[TMDB Sync] Running upcoming sync for IST date: ${todayStr}...`);

  try {
    // 1. Discover upcoming films in India across key languages
    const discoverRes = await axios.get(
      `https://api.tmdb.org/3/discover/movie?region=IN&with_original_language=hi|kn|te|ta|ml|en&primary_release_date.gte=${todayStr}&sort_by=popularity.desc&page=1`,
      { headers: TMDB_HEADERS, timeout: 10000 }
    );
    const tmdbResults = discoverRes.data.results || [];

    // 2. Also fetch TMDB /movie/upcoming
    try {
      const upcomingRes = await axios.get(
        `https://api.tmdb.org/3/movie/upcoming?region=IN&page=1`,
        { headers: TMDB_HEADERS, timeout: 10000 }
      );
      const more = upcomingRes.data.results || [];
      for (const m of more) {
        if (!tmdbResults.find(r => r.id === m.id)) {
          tmdbResults.push(m);
        }
      }
    } catch {}

    let syncedCount = 0;

    for (const item of tmdbResults) {
      if (!item.id) continue;
      // Filter out past releases strictly
      if (item.release_date && item.release_date < todayStr) continue;

      const [movieRecord, created] = await UpcomingMovie.findOrCreate({
        where: { tmdb_id: item.id },
        defaults: {
          tmdb_id: item.id,
          title: item.title || item.original_title,
          original_title: item.original_title,
          original_language: item.original_language,
          overview: item.overview || '',
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          genres: JSON.stringify(item.genre_ids || []),
          release_date: item.release_date || null,
          release_status: item.release_date ? 'Planned' : 'In Production',
          date_confirmed: Boolean(item.release_date),
          release_type: 'theatrical',
          popularity: item.popularity || 0,
          last_synced_at: new Date(),
        },
      });

      if (!created) {
        await movieRecord.update({
          popularity: item.popularity || movieRecord.popularity,
          last_synced_at: new Date(),
        });
      }

      // Sync videos from TMDB if not yet present
      const vidCount = await MovieVideo.count({ where: { tmdb_id: item.id } });
      if (vidCount === 0) {
        try {
          const vRes = await axios.get(`https://api.tmdb.org/3/movie/${item.id}/videos`, {
            headers: TMDB_HEADERS,
            timeout: 5000,
          });
          const vResults = (vRes.data?.results || []).filter(v => v.site === 'YouTube');
          if (vResults.length > 0) {
            const toInsert = vResults.slice(0, 4).map((v, idx) => ({
              tmdb_id: item.id,
              youtube_id: v.key,
              type: v.type?.toLowerCase() === 'teaser' ? 'teaser' : 'trailer',
              title: v.name,
              language: v.iso_639_1 || item.original_language,
              is_official: v.official ?? true,
              sort_order: idx,
            }));
            await MovieVideo.bulkCreate(toInsert);
            await movieRecord.update({
              has_trailer: true,
              has_teaser: toInsert.some(x => x.type === 'teaser'),
            });
          }
        } catch {}
      }

      syncedCount++;
    }

    console.log(`[TMDB Sync] Successfully synced ${syncedCount} upcoming movies from TMDB`);

    // 3. Recompute anticipation scores for all upcoming movies
    await recomputeAllAnticipationScores(models);

    return { success: true, syncedCount };
  } catch (err) {
    console.error('[TMDB Sync] Sync error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Recompute Anticipation Score for all upcoming movies
 */
async function recomputeAllAnticipationScores(models) {
  const { UpcomingMovie, MovieVideo, AnticipationScore, VideoStatsSnapshot, ExcitementVote, Reminder, Announcement, RelatedNews, FanDiscussion } = models;
  const todayStr = getISTDateString();

  const movies = await UpcomingMovie.findAll({
    where: { is_hidden: false },
  });

  for (const movie of movies) {
    try {
      const tmdbId = movie.tmdb_id;

      // 1. Get official videos
      const videos = await MovieVideo.findAll({ where: { tmdb_id: tmdbId } });
      const primaryVideo = videos.find(v => v.type === 'teaser') || videos[0];

      let totalViews = 0;
      let growth7d = 0;

      if (primaryVideo) {
        // Get snapshot stats
        const snapshots = await VideoStatsSnapshot.findAll({
          where: { youtube_id: primaryVideo.youtube_id },
          order: [['captured_at', 'ASC']],
        });

        if (snapshots.length > 0) {
          const latest = snapshots[snapshots.length - 1];
          totalViews = latest.views || 0;
          if (snapshots.length > 1) {
            const oldest = snapshots[0];
            growth7d = Math.max(0, latest.views - oldest.views);
          }
        } else {
          // If no snapshot yet, grab real view count now
          const liveStats = await fetchYouTubeVideoStats(primaryVideo.youtube_id);
          totalViews = liveStats.views;
          if (totalViews > 0) {
            await VideoStatsSnapshot.create({
              youtube_id: primaryVideo.youtube_id,
              tmdb_id: tmdbId,
              views: totalViews,
              likes: liveStats.likes,
              comments: liveStats.comments,
              captured_at: new Date(),
            });
          }
        }
      }

      // 2. Comments & discussions
      const comments = await FanDiscussion.findAll({ where: { tmdb_id: tmdbId } });

      // 3. Votes
      const votes = await ExcitementVote.findAll({ where: { tmdb_id: tmdbId } });

      // 4. Reminders
      const reminderCount = await Reminder.count({ where: { tmdb_id: tmdbId } });

      // 5. News & Announcements
      const newsCount = await RelatedNews.count({ where: { tmdb_id: tmdbId } });
      const announcementsCount = await Announcement.count({ where: { tmdb_id: tmdbId } });

      // Calculate score
      const calcResult = calculateAnticipationScore({
        totalViews,
        growth7d,
        comments,
        votes,
        reminderCount,
        newsCount,
        announcementsCount,
      });

      // Save / update AnticipationScore in DB
      await AnticipationScore.upsert({
        tmdb_id: tmdbId,
        score: calcResult.score !== null ? calcResult.score : 0,
        components: JSON.stringify(calcResult.components),
        sample_size: calcResult.sample_size,
        sentiment_split: JSON.stringify(calcResult.sentiment_split),
        formula_doc: calcResult.formula_doc,
        computed_at: new Date(),
      });
    } catch (err) {
      console.warn(`[Anticipation Recompute] Warning for TMDB ${movie.tmdb_id}:`, err.message);
    }
  }
}

module.exports = {
  syncUpcomingFromTMDB,
  recomputeAllAnticipationScores,
  fetchYouTubeVideoStats,
  getISTDateString,
};
