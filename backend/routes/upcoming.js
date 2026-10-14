const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const {
  UpcomingMovie,
  ReleaseDateHistory,
  MovieVideo,
  VideoStatsSnapshot,
  AnticipationScore,
  Announcement,
  Reminder,
  ExcitementVote,
  FanDiscussion,
  RelatedNews,
  AdminLog,
} = require('../database');
const { calculateAnticipationScore } = require('../services/anticipation');
const { syncUpcomingFromTMDB, getISTDateString } = require('../services/tmdbSync');

// Timezone-safe IST Date calculations
function computeCountdown(targetDateStr) {
  if (!targetDateStr) {
    return { days: null, label: 'Date TBA', isToday: false, isTomorrow: false, isTba: true };
  }
  const todayStr = getISTDateString();
  const today = new Date(`${todayStr}T00:00:00+05:30`);
  const target = new Date(`${targetDateStr}T00:00:00+05:30`);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: diffDays, label: 'Released', isToday: false, isTomorrow: false, isTba: false };
  }
  if (diffDays === 0) {
    return { days: 0, label: 'Releasing Today', isToday: true, isTomorrow: false, isTba: false };
  }
  if (diffDays === 1) {
    return { days: 1, label: 'Tomorrow', isToday: false, isTomorrow: true, isTba: false };
  }
  return { days: diffDays, label: `${diffDays} days to go`, isToday: false, isTomorrow: false, isTba: false };
}

function getMovieGroup(releaseDateStr, todayStr) {
  if (!releaseDateStr) return 'Date TBA';
  const today = new Date(`${todayStr}T00:00:00+05:30`);
  const target = new Date(`${releaseDateStr}T00:00:00+05:30`);
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) return 'This Week';
  if (diffDays <= 30) return 'This Month';
  return 'Later';
}

/* ── 1. GET /api/upcoming ─────────────────────────────────── */
router.get('/', async (req, res) => {
  try {
    const {
      language,
      genre,
      month,
      release_type,
      has_trailer,
      has_teaser,
      sort = 'soonest',
      view = 'grouped',
      page = 1,
      limit = 40,
    } = req.query;

    const todayStr = getISTDateString();

    // STRICT RULE: past releases never appear
    const where = {
      is_hidden: false,
      [Op.or]: [
        { release_date: { [Op.gte]: todayStr } },
        { release_date: null },
        { release_date: '' },
      ],
    };

    // Filter by language
    if (language && language !== 'all') {
      where.original_language = language.toLowerCase();
    }

    // Filter by release type
    if (release_type && release_type !== 'all') {
      where.release_type = release_type;
    }

    // Filter by has_trailer / has_teaser
    if (has_trailer === 'true') where.has_trailer = true;
    if (has_teaser === 'true') where.has_teaser = true;

    // Filter by month
    if (month && month !== 'all') {
      if (month === 'tba') {
        where[Op.or] = [{ release_date: null }, { release_date: '' }];
      } else {
        where.release_date = { [Op.like]: `${month}%`, [Op.gte]: todayStr };
      }
    }

    // Fetch upcoming movies
    const movies = await UpcomingMovie.findAll({ where });

    // Attach related metadata: score, history, videos
    const enriched = await Promise.all(
      movies.map(async (m) => {
        const item = m.toJSON();
        const tmdbId = item.tmdb_id;

        // Anticipation score
        const scoreRow = await AnticipationScore.findOne({ where: { tmdb_id: tmdbId } });
        let scoreData = null;
        if (scoreRow) {
          scoreData = {
            score: scoreRow.score,
            sample_size: scoreRow.sample_size,
            is_enough_data: scoreRow.sample_size >= 5,
            last_updated: scoreRow.computed_at,
            components: scoreRow.components ? JSON.parse(scoreRow.components) : null,
          };
        }

        // Date history check for "Date Changed" badge
        const historyRow = await ReleaseDateHistory.findOne({
          where: { tmdb_id: tmdbId },
          order: [['changed_at', 'DESC']],
        });

        // Videos
        const videos = await MovieVideo.findAll({
          where: { tmdb_id: tmdbId },
          order: [['sort_order', 'ASC']],
        });

        const countdown = computeCountdown(item.release_date);

        return {
          ...item,
          genres_list: item.genres ? (item.genres.startsWith('[') ? JSON.parse(item.genres) : item.genres.split(',')) : [],
          countdown,
          group: getMovieGroup(item.release_date, todayStr),
          anticipation: scoreData,
          date_history: historyRow
            ? {
                is_changed: true,
                old_date: historyRow.old_date,
                new_date: historyRow.new_date,
                reason: historyRow.reason,
                source_url: historyRow.source_url,
              }
            : { is_changed: false },
          videos_count: videos.length,
          primary_video: videos[0] || null,
        };
      })
    );

    // Filter by genre in memory if genres was stored as JSON
    let filtered = enriched;
    if (genre && genre !== 'all') {
      filtered = filtered.filter((m) =>
        m.genres_list.some((g) => String(g).toLowerCase().includes(genre.toLowerCase()))
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sort === 'soonest') {
        if (!a.release_date) return 1;
        if (!b.release_date) return -1;
        return a.release_date.localeCompare(b.release_date);
      }
      if (sort === 'most_anticipated') {
        const scoreA = a.anticipation?.score || 0;
        const scoreB = b.anticipation?.score || 0;
        return scoreB - scoreA;
      }
      if (sort === 'most_watched') {
        const viewsA = a.anticipation?.components?.trailer_growth?.views || 0;
        const viewsB = b.anticipation?.components?.trailer_growth?.views || 0;
        return viewsB - viewsA;
      }
      if (sort === 'recently_added') {
        return b.id - a.id;
      }
      return 0;
    });

    if (view === 'grouped') {
      const groups = {
        'This Week': filtered.filter((m) => m.group === 'This Week'),
        'This Month': filtered.filter((m) => m.group === 'This Month'),
        'Later': filtered.filter((m) => m.group === 'Later'),
        'Date TBA': filtered.filter((m) => m.group === 'Date TBA'),
      };
      return res.json({
        view: 'grouped',
        today: todayStr,
        total: filtered.length,
        groups,
      });
    }

    // Flat pagination
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const paginated = filtered.slice(offset, offset + parseInt(limit, 10));

    res.json({
      view: 'flat',
      today: todayStr,
      total: filtered.length,
      page: parseInt(page, 10),
      totalPages: Math.ceil(filtered.length / parseInt(limit, 10)),
      movies: paginated,
    });
  } catch (err) {
    console.error('Error in GET /api/upcoming:', err);
    res.status(500).json({ error: 'Failed to fetch upcoming movies', details: err.message });
  }
});

/* ── 2. GET /api/upcoming/calendar ────────────────────────── */
router.get('/calendar', async (req, res) => {
  try {
    const { month } = req.query; // YYYY-MM
    const todayStr = getISTDateString();
    const currentMonth = month || todayStr.substring(0, 7);

    const movies = await UpcomingMovie.findAll({
      where: {
        is_hidden: false,
        release_date: {
          [Op.like]: `${currentMonth}%`,
          [Op.gte]: todayStr,
        },
      },
      order: [['release_date', 'ASC']],
    });

    // Group by exact date
    const byDate = {};
    for (const m of movies) {
      const d = m.release_date;
      if (!byDate[d]) byDate[d] = [];
      const scoreRow = await AnticipationScore.findOne({ where: { tmdb_id: m.tmdb_id } });
      byDate[d].push({
        id: m.id,
        tmdb_id: m.tmdb_id,
        title: m.title,
        original_language: m.original_language,
        poster_path: m.poster_path,
        release_date: m.release_date,
        anticipation_score: scoreRow?.score ?? null,
      });
    }

    res.json({ month: currentMonth, today: todayStr, dates: byDate });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
});

/* ── 3. GET /api/upcoming/:movie_id ───────────────────────── */
router.get('/:movie_id', async (req, res) => {
  try {
    const tmdbId = parseInt(req.params.movie_id, 10);
    if (!tmdbId) return res.status(400).json({ error: 'Valid TMDB movie_id required' });

    let movie = await UpcomingMovie.findOne({ where: { tmdb_id: tmdbId } });
    if (!movie) {
      return res.status(404).json({ error: 'Upcoming movie not found' });
    }

    const todayStr = getISTDateString();
    const item = movie.toJSON();

    // 1. Full Anticipation Analysis
    const scoreRow = await AnticipationScore.findOne({ where: { tmdb_id: tmdbId } });
    let anticipation = null;
    if (scoreRow) {
      anticipation = {
        score: scoreRow.score,
        sample_size: scoreRow.sample_size,
        is_enough_data: scoreRow.sample_size >= 5,
        formula_doc: scoreRow.formula_doc,
        components: scoreRow.components ? JSON.parse(scoreRow.components) : null,
        sentiment_split: scoreRow.sentiment_split ? JSON.parse(scoreRow.sentiment_split) : null,
        last_updated: scoreRow.computed_at,
      };
    }

    // 2. Videos
    const videos = await MovieVideo.findAll({
      where: { tmdb_id: tmdbId },
      order: [['sort_order', 'ASC']],
    });

    // 3. Official Announcements Timeline
    const announcements = await Announcement.findAll({
      where: { tmdb_id: tmdbId },
      order: [['date', 'ASC']],
    });

    // 4. Video Stats Snapshots (Growth Curve)
    const snapshots = await VideoStatsSnapshot.findAll({
      where: { tmdb_id: tmdbId },
      order: [['captured_at', 'ASC']],
    });

    // 5. Fan Discussion / Comments
    const fanComments = await FanDiscussion.findAll({
      where: { tmdb_id: tmdbId },
      order: [['likes', 'DESC']],
      limit: 10,
    });

    // 6. Related Verified News
    const news = await RelatedNews.findAll({
      where: { tmdb_id: tmdbId },
      order: [['published_date', 'DESC']],
      limit: 6,
    });

    // 7. Date History
    const dateHistory = await ReleaseDateHistory.findAll({
      where: { tmdb_id: tmdbId },
      order: [['changed_at', 'DESC']],
    });

    // 8. Excitement Votes summary
    const votes = await ExcitementVote.findAll({ where: { tmdb_id: tmdbId } });
    const votesSummary = {
      total: votes.length,
      hyped: votes.filter(v => v.vote === 'hyped').length,
      maybe: votes.filter(v => v.vote === 'maybe').length,
      not_interested: votes.filter(v => v.vote === 'not_interested').length,
    };

    // 9. Reminders count
    const remindersCount = await Reminder.count({ where: { tmdb_id: tmdbId } });

    res.json({
      ...item,
      genres_list: item.genres ? (item.genres.startsWith('[') ? JSON.parse(item.genres) : item.genres.split(',')) : [],
      countdown: computeCountdown(item.release_date),
      anticipation,
      videos,
      announcements,
      snapshots,
      fan_comments: fanComments,
      news,
      date_history: dateHistory,
      votes_summary: votesSummary,
      reminders_count: remindersCount,
      ott_status: {
        is_announced: Boolean(item.ott_partner),
        partner: item.ott_partner || 'Not announced',
      },
    });
  } catch (err) {
    console.error('Error in GET /api/upcoming/:movie_id:', err);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

/* ── 4. POST /api/reminders ───────────────────────────────── */
router.post('/reminders', async (req, res) => {
  try {
    const { tmdb_id, email, reminder_type = 'theatrical_release' } = req.body;
    if (!tmdb_id || !email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid tmdb_id and email are required' });
    }

    const movie = await UpcomingMovie.findOne({ where: { tmdb_id } });
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    const [reminder, created] = await Reminder.findOrCreate({
      where: { tmdb_id, user_email: email.toLowerCase() },
      defaults: {
        tmdb_id,
        user_email: email.toLowerCase(),
        reminder_type,
        trigger_date: movie.release_date || null,
        status: 'pending',
      },
    });

    res.json({
      success: true,
      message: created ? 'Reminder set successfully! You will be notified 1 day before release.' : 'Reminder already registered for this email.',
      reminder,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to set reminder' });
  }
});

/* ── 5. POST /api/reminders/test-trigger ──────────────────── */
router.post('/reminders/test-trigger', async (req, res) => {
  try {
    const { email } = req.body;
    const pending = await Reminder.findAll({
      where: email ? { user_email: email } : { status: 'pending' },
      limit: 5,
    });

    const dispatched = [];
    for (const r of pending) {
      await r.update({ status: 'sent', sent_at: new Date() });
      dispatched.push({
        id: r.id,
        email: r.user_email,
        tmdb_id: r.tmdb_id,
        sent_at: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: `Test reminder dispatched to ${dispatched.length} recipients`,
      dispatched,
    });
  } catch (err) {
    res.status(500).json({ error: 'Test trigger failed' });
  }
});

/* ── 6. POST /api/excitement-votes ────────────────────────── */
router.post('/excitement-votes', async (req, res) => {
  try {
    const { tmdb_id, vote, session_id } = req.body;
    if (!tmdb_id || !['hyped', 'maybe', 'not_interested'].includes(vote)) {
      return res.status(400).json({ error: 'Valid tmdb_id and vote (hyped, maybe, not_interested) required' });
    }

    const sess = session_id || req.ip || 'guest-session';

    // Check if session already voted
    let existing = await ExcitementVote.findOne({ where: { tmdb_id, session_id: sess } });
    if (existing) {
      await existing.update({ vote });
    } else {
      await ExcitementVote.create({ tmdb_id, vote, session_id: sess });
    }

    // Return updated summary
    const allVotes = await ExcitementVote.findAll({ where: { tmdb_id } });
    const summary = {
      total: allVotes.length,
      hyped: allVotes.filter(v => v.vote === 'hyped').length,
      maybe: allVotes.filter(v => v.vote === 'maybe').length,
      not_interested: allVotes.filter(v => v.vote === 'not_interested').length,
      user_vote: vote,
    };

    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

/* ── 7. Admin Endpoints ───────────────────────────────────── */

// Override or confirm release date
router.post('/admin/override-date', async (req, res) => {
  try {
    const { tmdb_id, new_date, reason, source_url } = req.body;
    if (!tmdb_id || !new_date) {
      return res.status(400).json({ error: 'tmdb_id and new_date required' });
    }

    const movie = await UpcomingMovie.findOne({ where: { tmdb_id } });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    const oldDate = movie.release_date;
    await movie.update({
      release_date: new_date,
      date_confirmed: true,
      release_status: 'Planned',
    });

    if (oldDate && oldDate !== new_date) {
      await ReleaseDateHistory.create({
        tmdb_id,
        old_date: oldDate,
        new_date,
        reason: reason || 'Official production date update',
        source_url: source_url || 'https://cinesense.internal',
      });
    }

    await AdminLog.create({
      action: 'OVERRIDE_DATE',
      details: JSON.stringify({ tmdb_id, oldDate, new_date, reason }),
    });

    res.json({ success: true, message: `Release date updated to ${new_date}`, movie });
  } catch (err) {
    res.status(500).json({ error: 'Failed to override date' });
  }
});

// Add official announcement
router.post('/admin/announcements', async (req, res) => {
  try {
    const { tmdb_id, type, title, url, date, details } = req.body;
    if (!tmdb_id || !type || !title || !date) {
      return res.status(400).json({ error: 'Missing required announcement fields' });
    }

    const ann = await Announcement.create({
      tmdb_id,
      type,
      title,
      url,
      date,
      details,
    });

    await AdminLog.create({
      action: 'ADD_ANNOUNCEMENT',
      details: JSON.stringify({ tmdb_id, title, date }),
    });

    res.json({ success: true, announcement: ann });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add announcement' });
  }
});

// Toggle movie visibility
router.post('/admin/toggle-hide', async (req, res) => {
  try {
    const { tmdb_id, is_hidden } = req.body;
    const movie = await UpcomingMovie.findOne({ where: { tmdb_id } });
    if (!movie) return res.status(404).json({ error: 'Movie not found' });

    await movie.update({ is_hidden: Boolean(is_hidden) });
    await AdminLog.create({
      action: 'TOGGLE_HIDE',
      details: JSON.stringify({ tmdb_id, is_hidden }),
    });

    res.json({ success: true, movie });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle visibility' });
  }
});

// Trigger 12-hour TMDB sync on-demand
router.post('/admin/sync', async (req, res) => {
  try {
    const { sequelize, ...models } = require('../database');
    const syncRes = await syncUpcomingFromTMDB(models);
    await AdminLog.create({
      action: 'TRIGGER_SYNC',
      details: JSON.stringify(syncRes),
    });
    res.json(syncRes);
  } catch (err) {
    res.status(500).json({ error: 'Sync failed', details: err.message });
  }
});

// Admin logs
router.get('/admin/logs', async (req, res) => {
  try {
    const logs = await AdminLog.findAll({
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

module.exports = router;
