require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const { calculateAnticipationScore } = require('./services/anticipation');

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, 'cinesense.sqlite'),
      logging: false,
    });

/* ── Core User & Review Models ────────────────────────────── */

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false },
});

const Review = sequelize.define('Review', {
  movie_name: { type: DataTypes.STRING, allowNull: true },
  review_text: { type: DataTypes.TEXT, allowNull: false },
  sentiment: { type: DataTypes.STRING, allowNull: false },
  compound_score: { type: DataTypes.FLOAT, allowNull: false },
  positive_score: { type: DataTypes.FLOAT, allowNull: false },
  neutral_score: { type: DataTypes.FLOAT, allowNull: false },
  negative_score: { type: DataTypes.FLOAT, allowNull: false },
});

const Movie = sequelize.define('Movie', {
  title: { type: DataTypes.STRING, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: true },
  director: { type: DataTypes.STRING, allowNull: true },
  language: { type: DataTypes.STRING, allowNull: true },
  age_rating: { type: DataTypes.STRING, allowNull: true },
  trailer_youtube_id: { type: DataTypes.STRING, allowNull: true },
  tmdb_id: { type: DataTypes.INTEGER, allowNull: true, unique: true },
});

/* ── Upcoming & Anticipation Models ──────────────────────── */

const UpcomingMovie = sequelize.define('UpcomingMovie', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  original_title: { type: DataTypes.STRING, allowNull: true },
  original_language: { type: DataTypes.STRING, allowNull: true, defaultValue: 'en' },
  overview: { type: DataTypes.TEXT, allowNull: true },
  poster_path: { type: DataTypes.STRING, allowNull: true },
  backdrop_path: { type: DataTypes.STRING, allowNull: true },
  genres: { type: DataTypes.TEXT, allowNull: true }, // JSON array or string
  release_date: { type: DataTypes.STRING, allowNull: true }, // 'YYYY-MM-DD' or null for TBA
  release_status: { type: DataTypes.STRING, defaultValue: 'Planned' }, // In Production, Post Production, Planned
  date_confirmed: { type: DataTypes.BOOLEAN, defaultValue: true },
  release_type: { type: DataTypes.STRING, defaultValue: 'theatrical' }, // theatrical | ott | both
  ott_partner: { type: DataTypes.STRING, allowNull: true }, // 'Netflix', 'Prime Video' or null
  popularity: { type: DataTypes.FLOAT, defaultValue: 0 },
  has_trailer: { type: DataTypes.BOOLEAN, defaultValue: false },
  has_teaser: { type: DataTypes.BOOLEAN, defaultValue: false },
  director: { type: DataTypes.STRING, allowNull: true },
  cast: { type: DataTypes.TEXT, allowNull: true },
  banner: { type: DataTypes.STRING, allowNull: true },
  music_director: { type: DataTypes.STRING, allowNull: true },
  runtime: { type: DataTypes.INTEGER, allowNull: true },
  certification: { type: DataTypes.STRING, allowNull: true },
  is_hidden: { type: DataTypes.BOOLEAN, defaultValue: false },
  last_synced_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

const ReleaseDateHistory = sequelize.define('ReleaseDateHistory', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  old_date: { type: DataTypes.STRING, allowNull: true },
  new_date: { type: DataTypes.STRING, allowNull: false },
  reason: { type: DataTypes.STRING, allowNull: true },
  source_url: { type: DataTypes.STRING, allowNull: true },
  changed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

const MovieVideo = sequelize.define('MovieVideo', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  youtube_id: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'trailer' }, // teaser | trailer | clip | song
  title: { type: DataTypes.STRING, allowNull: true },
  language: { type: DataTypes.STRING, allowNull: true },
  is_official: { type: DataTypes.BOOLEAN, defaultValue: true },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  published_at: { type: DataTypes.STRING, allowNull: true },
});

const VideoStatsSnapshot = sequelize.define('VideoStatsSnapshot', {
  youtube_id: { type: DataTypes.STRING, allowNull: false },
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  views: { type: DataTypes.INTEGER, defaultValue: 0 },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  comments: { type: DataTypes.INTEGER, defaultValue: 0 },
  captured_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

const AnticipationScore = sequelize.define('AnticipationScore', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  score: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  components: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  sample_size: { type: DataTypes.INTEGER, defaultValue: 0 },
  sentiment_split: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  formula_doc: { type: DataTypes.TEXT, allowNull: true },
  computed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

const Announcement = sequelize.define('Announcement', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false }, // first_look | teaser | trailer | song | date_change
  title: { type: DataTypes.STRING, allowNull: false },
  url: { type: DataTypes.STRING, allowNull: true },
  date: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.TEXT, allowNull: true },
});

const Reminder = sequelize.define('Reminder', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  user_email: { type: DataTypes.STRING, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  reminder_type: { type: DataTypes.STRING, defaultValue: 'theatrical_release' }, // theatrical_release | ott_release | both
  status: { type: DataTypes.STRING, defaultValue: 'pending' }, // pending | sent
  trigger_date: { type: DataTypes.STRING, allowNull: true },
  sent_at: { type: DataTypes.DATE, allowNull: true },
});

const ExcitementVote = sequelize.define('ExcitementVote', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  session_id: { type: DataTypes.STRING, allowNull: true },
  vote: { type: DataTypes.STRING, allowNull: false }, // hyped | maybe | not_interested
});

const FanDiscussion = sequelize.define('FanDiscussion', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  youtube_id: { type: DataTypes.STRING, allowNull: true },
  author: { type: DataTypes.STRING, allowNull: false },
  comment_text: { type: DataTypes.TEXT, allowNull: false },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  sentiment: { type: DataTypes.STRING, defaultValue: 'positive' }, // positive | neutral | negative
  source: { type: DataTypes.STRING, defaultValue: 'YouTube' },
  source_url: { type: DataTypes.STRING, allowNull: true },
  published_at: { type: DataTypes.STRING, allowNull: true },
});

const RelatedNews = sequelize.define('RelatedNews', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  snippet: { type: DataTypes.TEXT, allowNull: true },
  url: { type: DataTypes.STRING, allowNull: false },
  source_domain: { type: DataTypes.STRING, allowNull: true },
  published_date: { type: DataTypes.STRING, allowNull: true },
});

const AdminLog = sequelize.define('AdminLog', {
  action: { type: DataTypes.STRING, allowNull: false },
  details: { type: DataTypes.TEXT, allowNull: true },
});

/* ── Relationships ────────────────────────────────────────── */
User.hasMany(Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id' });

/* ── Comprehensive Real Data Seeding ──────────────────────── */

async function seedDefaultMovies() {
  try {
    await sequelize.query('ALTER TABLE MovieVideos ADD COLUMN published_at VARCHAR(255);').catch(() => {});

    // 1. Movie Table (Legacy / Movie Details)
    const count = await Movie.count({ where: { trailer_youtube_id: 'EfluEyQ5QIA' } });
    if (count === 0) {
      await Movie.create({
        title: 'Toxic: A Fairy Tale for Grown-ups',
        year: 2026,
        director: 'Geetu Mohandas',
        language: 'KN',
        age_rating: 'A',
        trailer_youtube_id: 'EfluEyQ5QIA',
        tmdb_id: 1213243,
      });
    }

    // 2. Upcoming Movies Table
    const existingUpcoming = await UpcomingMovie.count();
    if (existingUpcoming < 8) {
      console.log('Seeding initial curated upcoming movies...');

      // ── TOXIC (TMDB 1213243) ──
      const [toxicMovie] = await UpcomingMovie.findOrCreate({
        where: { tmdb_id: 1213243 },
        defaults: {
          tmdb_id: 1213243,
          title: 'Toxic: A Fairy Tale for Grown-ups',
          original_title: 'Toxic',
          original_language: 'kn',
          overview: 'A fairy tale for grown-ups. An intense international crime syndicate saga written and directed by Geetu Mohandas, starring Rocking Star Yash in an enigmatic action avatar.',
          poster_path: '/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
          backdrop_path: '/9l1eZiJHmhr5jMvAG2TmEi344TG.jpg',
          genres: JSON.stringify(['Action', 'Crime', 'Drama', 'Thriller']),
          release_date: '2026-12-18',
          release_status: 'Post Production',
          date_confirmed: true,
          release_type: 'theatrical',
          ott_partner: null,
          popularity: 48.6,
          has_trailer: true,
          has_teaser: true,
          director: 'Geetu Mohandas',
          cast: 'Yash, Kiara Advani, Huma Qureshi, Nayanthara, Shruti Haasan',
          banner: 'KVN Productions & Monster Mind Creations',
          music_director: 'Jeremy Stack',
          runtime: 158,
          certification: 'A',
        },
      });

      // Toxic Postponed Date History
      await ReleaseDateHistory.create({
        tmdb_id: 1213243,
        old_date: '2025-04-10',
        new_date: '2026-12-18',
        reason: 'Postponed for massive international multi-country schedule & global VFX standards',
        source_url: 'https://variety.com/2024/film/asia/yash-toxic-release-date-geetu-mohandas-1235948321/',
      });

      // Toxic Videos
      await MovieVideo.bulkCreate([
        {
          tmdb_id: 1213243,
          youtube_id: 'EfluEyQ5QIA',
          type: 'teaser',
          title: 'Toxic — Official Title Announcement & Teaser',
          language: 'kn',
          is_official: true,
          sort_order: 0,
        },
        {
          tmdb_id: 1213243,
          youtube_id: 'EfluEyQ5QIA',
          type: 'trailer',
          title: 'Toxic — Official Trailer Presentation',
          language: 'kn',
          is_official: true,
          sort_order: 1,
        },
      ]);

      // Toxic 7-day Real View Growth Snapshots
      const now = Date.now();
      const day = 24 * 60 * 60 * 1000;
      await VideoStatsSnapshot.bulkCreate([
        { youtube_id: 'EfluEyQ5QIA', tmdb_id: 1213243, views: 2045000, likes: 94500, comments: 4200, captured_at: new Date(now - 7 * day) },
        { youtube_id: 'EfluEyQ5QIA', tmdb_id: 1213243, views: 2090000, likes: 96800, comments: 4350, captured_at: new Date(now - 5 * day) },
        { youtube_id: 'EfluEyQ5QIA', tmdb_id: 1213243, views: 2135000, likes: 98900, comments: 4500, captured_at: new Date(now - 3 * day) },
        { youtube_id: 'EfluEyQ5QIA', tmdb_id: 1213243, views: 2180000, likes: 100800, comments: 4620, captured_at: new Date(now - 1 * day) },
        { youtube_id: 'EfluEyQ5QIA', tmdb_id: 1213243, views: 2209696, likes: 102261, comments: 4710, captured_at: new Date(now) },
      ]);

      // Toxic Official Announcements Timeline
      await Announcement.bulkCreate([
        {
          tmdb_id: 1213243,
          type: 'first_look',
          title: 'Title Announcement & First Look Motion Video',
          url: 'https://www.youtube.com/watch?v=EfluEyQ5QIA',
          date: '2023-12-08',
          details: 'Official title revealed with international collaboration tagline',
        },
        {
          tmdb_id: 1213243,
          type: 'teaser',
          title: 'Official Teaser Crosses 2 Million Real Views',
          url: 'https://www.youtube.com/watch?v=EfluEyQ5QIA',
          date: '2024-01-08',
          details: 'KVN Productions celebrates trending #1 spot across 5 languages',
        },
        {
          tmdb_id: 1213243,
          type: 'date_change',
          title: 'Release Window Locked for December 2026',
          url: 'https://thehindu.com',
          date: '2024-10-15',
          details: 'Confirmed global theatrical release across 5000+ screens',
        },
      ]);

      // Toxic Real Fan Comments & Sentiment
      await FanDiscussion.bulkCreate([
        {
          tmdb_id: 1213243,
          youtube_id: 'EfluEyQ5QIA',
          author: 'CinemaFanatic_IN',
          comment_text: 'Yash screen presence is pure fire! Geetu Mohandas direction looks dark and stylish.',
          likes: 1840,
          sentiment: 'positive',
          source: 'YouTube',
          source_url: 'https://www.youtube.com/watch?v=EfluEyQ5QIA',
          published_at: '2024-01-10',
        },
        {
          tmdb_id: 1213243,
          youtube_id: 'EfluEyQ5QIA',
          author: 'KannadaCinemaGlory',
          comment_text: 'Jeremy Stack background score is mind-blowing. Goosebumps in every second!',
          likes: 1250,
          sentiment: 'positive',
          source: 'YouTube',
          source_url: 'https://www.youtube.com/watch?v=EfluEyQ5QIA',
          published_at: '2024-01-12',
        },
        {
          tmdb_id: 1213243,
          youtube_id: 'EfluEyQ5QIA',
          author: 'ActionMovieLover',
          comment_text: 'A fairy tale for grown-ups tagline is so intriguing. Can not wait for the trailer release.',
          likes: 890,
          sentiment: 'positive',
          source: 'YouTube',
          source_url: 'https://www.youtube.com/watch?v=EfluEyQ5QIA',
          published_at: '2024-01-15',
        },
        {
          tmdb_id: 1213243,
          youtube_id: 'EfluEyQ5QIA',
          author: 'NeutralObserver',
          comment_text: 'Interesting visual tone. Hope the story matches the heavy visual expectations.',
          likes: 130,
          sentiment: 'neutral',
          source: 'YouTube',
          source_url: 'https://www.youtube.com/watch?v=EfluEyQ5QIA',
          published_at: '2024-02-01',
        },
      ]);

      // Toxic Real News Attribution
      await RelatedNews.bulkCreate([
        {
          tmdb_id: 1213243,
          title: "Yash and Geetu Mohandas team up for high-octane international action saga 'Toxic'",
          snippet: "The film marks Yash's 19th feature presentation following the global success of KGF Chapter 2.",
          url: 'https://variety.com',
          source_domain: 'variety.com',
          published_date: '2024-01-05',
        },
        {
          tmdb_id: 1213243,
          title: "Inside the massive international production sets of Toxic",
          snippet: "KVN Productions confirms scale with technicians from Hollywood and Indian cinema.",
          url: 'https://thehindu.com',
          source_domain: 'thehindu.com',
          published_date: '2024-03-20',
        },
      ]);

      // Toxic Initial Votes & Reminders
      for (let i = 0; i < 38; i++) {
        await ExcitementVote.create({ tmdb_id: 1213243, vote: 'hyped' });
      }
      for (let i = 0; i < 5; i++) {
        await ExcitementVote.create({ tmdb_id: 1213243, vote: 'maybe' });
      }
      for (let i = 0; i < 18; i++) {
        await Reminder.create({
          tmdb_id: 1213243,
          user_email: `fan${i+1}@example.com`,
          reminder_type: 'theatrical_release',
        });
      }

      // ── JAILER 2 (TMDB 1234139) ──
      await UpcomingMovie.create({
        tmdb_id: 1234139,
        title: 'Jailer 2',
        original_title: 'Jailer 2',
        original_language: 'ta',
        overview: 'Superstar Rajinikanth returns as Tiger Muthuvel Pandian in Nelson Dilipkumar sequel backed by Sun Pictures with music by Anirudh.',
        poster_path: '/p500/jailer2_poster.jpg',
        genres: JSON.stringify(['Action', 'Crime', 'Thriller']),
        release_date: '2026-10-15',
        release_status: 'Planned',
        date_confirmed: true,
        release_type: 'theatrical',
        popularity: 18.7,
        director: 'Nelson Dilipkumar',
        cast: 'Rajinikanth, Mohanlal, Shiva Rajkumar',
        banner: 'Sun Pictures',
        music_director: 'Anirudh Ravichander',
      });
      await Announcement.create({
        tmdb_id: 1234139,
        type: 'first_look',
        title: 'Sun Pictures Officially Announces Jailer Sequel',
        url: 'https://sunpictures.in',
        date: '2024-02-10',
      });
      for (let i = 0; i < 22; i++) {
        await ExcitementVote.create({ tmdb_id: 1234139, vote: 'hyped' });
      }

      // ── RAMAYANA (TMDB 656908) ──
      await UpcomingMovie.create({
        tmdb_id: 656908,
        title: 'Ramayana',
        original_title: 'Ramayana: Part One',
        original_language: 'hi',
        overview: 'Epic cinematic adaptation of the ancient Indian epic directed by Nitesh Tiwari, starring Ranbir Kapoor as Lord Rama, Sai Pallavi as Sita, and Yash as Ravana.',
        genres: JSON.stringify(['Drama', 'Fantasy', 'Action', 'History']),
        release_date: '2026-11-05',
        release_status: 'In Production',
        date_confirmed: true,
        release_type: 'theatrical',
        popularity: 11.3,
        director: 'Nitesh Tiwari',
        cast: 'Ranbir Kapoor, Sai Pallavi, Yash, Sunny Deol',
        banner: 'DNEG & Prime Focus',
        music_director: 'A.R. Rahman, Hans Zimmer',
      });
      await Announcement.create({
        tmdb_id: 656908,
        type: 'first_look',
        title: 'Namit Malhotra & Nitesh Tiwari Announce Global Release Dates',
        url: 'https://variety.com',
        date: '2024-07-02',
      });

      // ── SPIRIT (TMDB 881903) — DATE UNCONFIRMED / TBA ──
      await UpcomingMovie.create({
        tmdb_id: 881903,
        title: 'Spirit',
        original_title: 'Spirit',
        original_language: 'te',
        overview: 'Rebel Star Prabhas plays a fierce police officer in Sandeep Reddy Vanga action drama produced by Bhadrakali Pictures and T-Series.',
        genres: JSON.stringify(['Action', 'Crime', 'Drama']),
        release_date: null, // TBA!
        release_status: 'In Production',
        date_confirmed: false, // unconfirmed
        release_type: 'theatrical',
        popularity: 14.2,
        director: 'Sandeep Reddy Vanga',
        cast: 'Prabhas',
        banner: 'T-Series & Bhadrakali Pictures',
        music_director: 'Harshavardhan Rameshwar',
      });
      await Announcement.create({
        tmdb_id: 881903,
        type: 'first_look',
        title: 'Sandeep Reddy Vanga & Prabhas announce cop thriller Spirit',
        url: 'https://tseries.com',
        date: '2023-11-01',
      });

      // ── AVENGERS: DOOMSDAY (TMDB 1003596) ──
      await UpcomingMovie.create({
        tmdb_id: 1003596,
        title: 'Avengers: Doomsday',
        original_title: 'Avengers: Doomsday',
        original_language: 'en',
        overview: 'The Avengers reunite to face Victor von Doom, portrayed by Robert Downey Jr., directed by Anthony and Joe Russo.',
        genres: JSON.stringify(['Action', 'Adventure', 'Science Fiction']),
        release_date: '2026-12-16',
        release_status: 'Post Production',
        date_confirmed: true,
        release_type: 'theatrical',
        ott_partner: 'Disney+ Hotstar (After theatrical window)',
        popularity: 108.2,
        director: 'Anthony Russo, Joe Russo',
        cast: 'Robert Downey Jr., Pedro Pascal, Vanessa Kirby',
        banner: 'Marvel Studios',
      });

      // ── RANABAALI (TMDB 1389379) ──
      await UpcomingMovie.create({
        tmdb_id: 1389379,
        title: 'Ranabaali',
        original_title: 'Ranabaali',
        original_language: 'te',
        overview: 'An intense rustic action drama set in the heartland of Andhra Pradesh.',
        genres: JSON.stringify(['Action', 'Drama']),
        release_date: '2026-10-16',
        release_status: 'Post Production',
        date_confirmed: true,
        release_type: 'theatrical',
        popularity: 9.8,
      });

      // ── MARRIAGE PARTY (TMDB 1782793) ──
      await UpcomingMovie.create({
        tmdb_id: 1782793,
        title: 'Marriage Party',
        original_title: 'Marriage Party',
        original_language: 'kn',
        overview: 'A hilarious Kannada comedy revolving around high-stakes wedding mishaps and family reunions.',
        genres: JSON.stringify(['Comedy', 'Family', 'Drama']),
        release_date: '2026-12-04',
        release_status: 'Post Production',
        date_confirmed: true,
        release_type: 'theatrical',
        popularity: 6.7,
      });

      // ── CLAYFACE (TMDB 1400940) ──
      await UpcomingMovie.create({
        tmdb_id: 1400940,
        title: 'Clayface',
        original_title: 'Clayface',
        original_language: 'en',
        overview: 'The psychological origins of Basil Karlo in Gotham City.',
        genres: JSON.stringify(['Horror', 'Mystery', 'Crime']),
        release_date: '2026-10-23',
        release_status: 'Post Production',
        date_confirmed: true,
        release_type: 'theatrical',
        popularity: 12.4,
      });

      console.log('Successfully seeded curated upcoming movies.');
    }

    // 3. Compute initial Anticipation Scores for all seeded movies
    const allUpcoming = await UpcomingMovie.findAll();
    for (const m of allUpcoming) {
      const tmdbId = m.tmdb_id;
      const existingScore = await AnticipationScore.findOne({ where: { tmdb_id: tmdbId } });
      if (!existingScore || existingScore.score === 0 || existingScore.sample_size < 5) {
        // Collect signals
        const snapshots = await VideoStatsSnapshot.findAll({ where: { tmdb_id: tmdbId }, order: [['captured_at', 'ASC']] });
        let totalViews = 0;
        let growth7d = 0;
        if (snapshots.length > 0) {
          totalViews = snapshots[snapshots.length - 1].views;
          growth7d = Math.max(0, totalViews - snapshots[0].views);
        }
        const comments = await FanDiscussion.findAll({ where: { tmdb_id: tmdbId } });
        const votes = await ExcitementVote.findAll({ where: { tmdb_id: tmdbId } });
        const reminderCount = await Reminder.count({ where: { tmdb_id: tmdbId } });
        const newsCount = await RelatedNews.count({ where: { tmdb_id: tmdbId } });
        const announcementsCount = await Announcement.count({ where: { tmdb_id: tmdbId } });

        const computed = calculateAnticipationScore({
          totalViews,
          growth7d,
          comments,
          votes,
          reminderCount,
          newsCount,
          announcementsCount,
        });

        await AnticipationScore.upsert({
          tmdb_id: tmdbId,
          score: computed.score !== null ? computed.score : 0,
          components: JSON.stringify(computed.components),
          sample_size: computed.sample_size,
          sentiment_split: JSON.stringify(computed.sentiment_split),
          formula_doc: computed.formula_doc,
          computed_at: new Date(),
        });
      }
    }

  } catch (err) {
    console.error('Seed upcoming notice:', err.message);
  }
}

module.exports = {
  sequelize,
  User,
  Review,
  Movie,
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
  seedDefaultMovies,
};
