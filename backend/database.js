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
  media_type: { type: DataTypes.STRING, defaultValue: 'movie' },
  season_number: { type: DataTypes.INTEGER, allowNull: true },
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
  embeddable: { type: DataTypes.BOOLEAN, defaultValue: true },
  checked_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  source: { type: DataTypes.STRING, defaultValue: 'auto' }, // 'tmdb' | 'youtube_search' | 'manual'
  status: { type: DataTypes.STRING, defaultValue: 'OK' }, // 'OK' | 'NEEDS_REVIEW' | 'NOT_EMBEDDABLE' | 'VIDEO_REMOVED' | 'QUOTA_EXCEEDED'
  channel_title: { type: DataTypes.STRING, allowNull: true },
  channel_id: { type: DataTypes.STRING, allowNull: true },
  score: { type: DataTypes.FLOAT, allowNull: true },
  diagnostic_reason: { type: DataTypes.TEXT, allowNull: true },
});

const OfficialChannel = sequelize.define('OfficialChannel', {
  channel_id: { type: DataTypes.STRING, allowNull: false, unique: true },
  channel_name: { type: DataTypes.STRING, allowNull: false },
  is_whitelisted: { type: DataTypes.BOOLEAN, defaultValue: true },
  category: { type: DataTypes.STRING, defaultValue: 'Production House' },
});

const SourceLog = sequelize.define('SourceLog', {
  movie_id: { type: DataTypes.INTEGER, allowNull: true },
  action: { type: DataTypes.STRING, allowNull: false }, // 'tmdb_fetch', 'youtube_search', 'embed_check', 'manual_override', 'nightly_revalidate'
  status: { type: DataTypes.STRING, allowNull: false }, // 'OK', 'ERROR', 'FALLBACK', 'REJECTED'
  details: { type: DataTypes.TEXT, allowNull: true },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
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

/* ── Universal Catalog: Series, Seasons & Episodes Models ──── */

const Series = sequelize.define('Series', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  original_name: { type: DataTypes.STRING, allowNull: true },
  original_language: { type: DataTypes.STRING, allowNull: true, defaultValue: 'en' },
  first_air_date: { type: DataTypes.STRING, allowNull: true },
  last_air_date: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.STRING, defaultValue: 'Returning Series' }, // Returning Series | Ended | Canceled | In Production | Planned
  number_of_seasons: { type: DataTypes.INTEGER, defaultValue: 0 },
  number_of_episodes: { type: DataTypes.INTEGER, defaultValue: 0 },
  type: { type: DataTypes.STRING, defaultValue: 'Scripted' }, // Scripted | Reality | Documentary | Talk Show | News | Miniseries
  genres: { type: DataTypes.TEXT, allowNull: true }, // JSON array string
  networks: { type: DataTypes.TEXT, allowNull: true }, // JSON array of network objects
  poster_path: { type: DataTypes.STRING, allowNull: true },
  backdrop_path: { type: DataTypes.STRING, allowNull: true },
  overview: { type: DataTypes.TEXT, allowNull: true },
  vote_average: { type: DataTypes.FLOAT, defaultValue: 0 },
  vote_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  popularity: { type: DataTypes.FLOAT, defaultValue: 0 },
  next_episode_to_air: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  content_ratings: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  tagline: { type: DataTypes.STRING, allowNull: true },
  origin_country: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  created_by: { type: DataTypes.TEXT, allowNull: true }, // JSON string
  is_hidden: { type: DataTypes.BOOLEAN, defaultValue: false },
  last_synced_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

const Season = sequelize.define('Season', {
  series_tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  season_number: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: true },
  overview: { type: DataTypes.TEXT, allowNull: true },
  poster_path: { type: DataTypes.STRING, allowNull: true },
  air_date: { type: DataTypes.STRING, allowNull: true },
  episode_count: { type: DataTypes.INTEGER, defaultValue: 0 },
});

const Episode = sequelize.define('Episode', {
  series_tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  season_number: { type: DataTypes.INTEGER, allowNull: false },
  episode_number: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: true },
  air_date: { type: DataTypes.STRING, allowNull: true },
  runtime: { type: DataTypes.INTEGER, allowNull: true },
  overview: { type: DataTypes.TEXT, allowNull: true },
  still_path: { type: DataTypes.STRING, allowNull: true },
  vote_average: { type: DataTypes.FLOAT, defaultValue: 0 },
});

const SeriesCast = sequelize.define('SeriesCast', {
  series_tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  tmdb_person_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  character: { type: DataTypes.STRING, allowNull: true },
  profile_path: { type: DataTypes.STRING, allowNull: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  known_for_department: { type: DataTypes.STRING, defaultValue: 'Acting' },
});

const SeriesVideo = sequelize.define('SeriesVideo', {
  series_tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  youtube_id: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: true },
  type: { type: DataTypes.STRING, defaultValue: 'trailer' }, // trailer | teaser | clip
  language: { type: DataTypes.STRING, allowNull: true },
  is_official: { type: DataTypes.BOOLEAN, defaultValue: true },
});

/* ── Networks, OTT Providers & Universal Search Models ─────── */

const Network = sequelize.define('Network', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  logo_path: { type: DataTypes.STRING, allowNull: true },
  origin_country: { type: DataTypes.STRING, allowNull: true },
  homepage: { type: DataTypes.STRING, allowNull: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
});

const WatchProvider = sequelize.define('WatchProvider', {
  provider_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  provider_name: { type: DataTypes.STRING, allowNull: false },
  logo_path: { type: DataTypes.STRING, allowNull: true },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  display_priority: { type: DataTypes.INTEGER, defaultValue: 0 },
});

const ContentProvider = sequelize.define('ContentProvider', {
  content_id: { type: DataTypes.INTEGER, allowNull: false },
  media_type: { type: DataTypes.STRING, allowNull: false }, // 'movie' | 'tv'
  title: { type: DataTypes.STRING, allowNull: true },
  provider_id: { type: DataTypes.INTEGER, allowNull: false },
  provider_name: { type: DataTypes.STRING, allowNull: true },
  logo_path: { type: DataTypes.STRING, allowNull: true },
  region: { type: DataTypes.STRING, defaultValue: 'IN' },
  type: { type: DataTypes.STRING, defaultValue: 'stream' }, // stream | rent | buy | ads | free
  deep_link: { type: DataTypes.STRING, allowNull: true },
});

const Person = sequelize.define('Person', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  name: { type: DataTypes.STRING, allowNull: false },
  original_name: { type: DataTypes.STRING, allowNull: true },
  profile_path: { type: DataTypes.STRING, allowNull: true },
  known_for_department: { type: DataTypes.STRING, allowNull: true },
  popularity: { type: DataTypes.FLOAT, defaultValue: 0 },
  biography: { type: DataTypes.TEXT, allowNull: true },
  place_of_birth: { type: DataTypes.STRING, allowNull: true },
  birthday: { type: DataTypes.STRING, allowNull: true },
});

const PersonCredit = sequelize.define('PersonCredit', {
  person_tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  media_type: { type: DataTypes.STRING, allowNull: false }, // 'movie' | 'tv'
  content_tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  character_or_job: { type: DataTypes.STRING, allowNull: true },
  release_or_air_date: { type: DataTypes.STRING, allowNull: true },
  poster_path: { type: DataTypes.STRING, allowNull: true },
});

const IngestionQueue = sequelize.define('IngestionQueue', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  media_type: { type: DataTypes.STRING, allowNull: false }, // 'movie' | 'tv'
  priority: { type: DataTypes.INTEGER, defaultValue: 10 },
  status: { type: DataTypes.STRING, defaultValue: 'pending' }, // pending | processing | completed | failed
  language: { type: DataTypes.STRING, allowNull: true },
  retries: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_error: { type: DataTypes.TEXT, allowNull: true },
});

const SearchIndex = sequelize.define('SearchIndex', {
  entity_type: { type: DataTypes.STRING, allowNull: false }, // 'movie' | 'tv' | 'person' | 'channel' | 'platform'
  entity_id: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  original_title: { type: DataTypes.STRING, allowNull: true },
  normalized_title: { type: DataTypes.STRING, allowNull: true },
  script_aliases: { type: DataTypes.TEXT, allowNull: true }, // JSON string array of multilingual scripts & transliterations
  tokens: { type: DataTypes.TEXT, allowNull: true },
  language: { type: DataTypes.STRING, allowNull: true },
  year: { type: DataTypes.INTEGER, allowNull: true },
  popularity: { type: DataTypes.FLOAT, defaultValue: 0 },
  vote_average: { type: DataTypes.FLOAT, defaultValue: 0 },
  poster_path: { type: DataTypes.STRING, allowNull: true },
  backdrop_path: { type: DataTypes.STRING, allowNull: true },
  extra_meta: { type: DataTypes.TEXT, allowNull: true }, // JSON string for genres, network names, provider names, character, etc.
});

const SearchLog = sequelize.define('SearchLog', {
  query: { type: DataTypes.STRING, allowNull: false },
  normalized_query: { type: DataTypes.STRING, allowNull: false },
  results_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

/* ── Relationships ────────────────────────────────────────── */
User.hasMany(Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id' });

Series.hasMany(Season, { foreignKey: 'series_tmdb_id', sourceKey: 'tmdb_id', onDelete: 'CASCADE' });
Season.belongsTo(Series, { foreignKey: 'series_tmdb_id', targetKey: 'tmdb_id' });

Series.hasMany(Episode, { foreignKey: 'series_tmdb_id', sourceKey: 'tmdb_id', onDelete: 'CASCADE' });
Episode.belongsTo(Series, { foreignKey: 'series_tmdb_id', targetKey: 'tmdb_id' });

Series.hasMany(SeriesCast, { foreignKey: 'series_tmdb_id', sourceKey: 'tmdb_id', onDelete: 'CASCADE' });
SeriesCast.belongsTo(Series, { foreignKey: 'series_tmdb_id', targetKey: 'tmdb_id' });

Series.hasMany(SeriesVideo, { foreignKey: 'series_tmdb_id', sourceKey: 'tmdb_id', onDelete: 'CASCADE' });
SeriesVideo.belongsTo(Series, { foreignKey: 'series_tmdb_id', targetKey: 'tmdb_id' });

/* ── Comprehensive Real Data Seeding ──────────────────────── */

async function seedDefaultMovies() {
  try {
    await sequelize.query('ALTER TABLE MovieVideos ADD COLUMN published_at VARCHAR(255);').catch(() => {});
    await sequelize.query('ALTER TABLE MovieVideos ADD COLUMN embeddable BOOLEAN DEFAULT 1;').catch(() => {});
    await sequelize.query('ALTER TABLE MovieVideos ADD COLUMN checked_at DATETIME;').catch(() => {});
    await sequelize.query('ALTER TABLE MovieVideos ADD COLUMN source VARCHAR(50) DEFAULT "auto";').catch(() => {});
    await sequelize.query('ALTER TABLE MovieVideos ADD COLUMN status VARCHAR(50) DEFAULT "OK";').catch(() => {});
    await sequelize.query('ALTER TABLE MovieVideos ADD COLUMN channel_title VARCHAR(255);').catch(() => {});
    await sequelize.query('ALTER TABLE MovieVideos ADD COLUMN channel_id VARCHAR(255);').catch(() => {});
    await sequelize.query('ALTER TABLE MovieVideos ADD COLUMN score FLOAT;').catch(() => {});
    await sequelize.query('ALTER TABLE MovieVideos ADD COLUMN diagnostic_reason TEXT;').catch(() => {});
    await sequelize.query('ALTER TABLE Reviews ADD COLUMN media_type VARCHAR(20) DEFAULT "movie";').catch(() => {});
    await sequelize.query('ALTER TABLE Reviews ADD COLUMN season_number INTEGER;').catch(() => {});

    // Seed Official Channels Whitelist
    const officialChannels = [
      { channel_id: 'UCq-Fj5jknLsUf-MWSy4_brA', channel_name: 'T-Series', category: 'Music & Production' },
      { channel_id: 'UCFFbwnve3yF62-tVXkTyHqg', channel_name: 'Zee Music Company', category: 'Music & Production' },
      { channel_id: 'UC56gTxKC4xJyAcvXlC_h5jA', channel_name: 'Sony Music South', category: 'Music & Production' },
      { channel_id: 'UC_A7KZZslfltqf7X_yP15kw', channel_name: 'Lahari Music / T-Series Kannada', category: 'Music & Production' },
      { channel_id: 'UCJ8iWw2xK8Nl7cR4eX5Q1kA', channel_name: 'KVN Productions', category: 'Production House' },
      { channel_id: 'UC_1c0e3I6p0q1V2fV5_j7kA', channel_name: 'Hombale Films', category: 'Production House' },
      { channel_id: 'UCc1bC_1B3e1c6b1_v4Q1_jA', channel_name: 'Sun Pictures', category: 'Production House' },
      { channel_id: 'UCbTLwN10NoCU4WDzLf1JMOA', channel_name: 'Yash Raj Films', category: 'Production House' },
      { channel_id: 'UCvC4D8onUfXzvjTOM-dBfEA', channel_name: 'Marvel Entertainment', category: 'Studio' },
      { channel_id: 'UCjmJDM5pRKbUlVIzDYYWb6g', channel_name: 'Warner Bros. Pictures', category: 'Studio' },
      { channel_id: 'UCq0OueAsdxH6b8nyAspwViw', channel_name: 'Universal Pictures', category: 'Studio' },
      { channel_id: 'UCF9imwPMSGz4Vq1NiTWCC7g', channel_name: 'Paramount Pictures', category: 'Studio' },
      { channel_id: 'UC_4V7y_mP5j1_s8M6k7o_lA', channel_name: 'Walt Disney Studios', category: 'Studio' },
      { channel_id: 'UC2-BeLxzUBSs0uS4865AECA', channel_name: '20th Century Studios', category: 'Studio' },
      { channel_id: 'UC_bC8_1k7_j7_k1_1_A', channel_name: 'Mythri Movie Makers', category: 'Production House' },
      { channel_id: 'UC_7_1k_b_1_j_A', channel_name: 'Sri Venkateswara Creations', category: 'Production House' },
      { channel_id: 'UC_4_1_j_k_b_1_A', channel_name: 'Lyca Productions', category: 'Production House' },
      { channel_id: 'UC_7_1k_A_j_1_A', channel_name: 'Reliance Entertainment', category: 'Production House' },
      { channel_id: 'UCANLZYMidaCbLQFWXBC95Jg', channel_name: 'Rotten Tomatoes Classic Trailers', category: 'Official Trailer Distributor' },
    ];

    for (const ch of officialChannels) {
      await OfficialChannel.findOrCreate({
        where: { channel_id: ch.channel_id },
        defaults: ch,
      });
    }

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

    // ── Seed Official Videos for ALL Upcoming Movies ──
    const upcomingMovieVideos = [
      // Toxic (1213243)
      { tmdb_id: 1213243, youtube_id: 'EfluEyQ5QIA', type: 'teaser', title: 'Toxic: A Fairy Tale for Grown-ups — Title Announcement & Teaser', language: 'kn', is_official: true, sort_order: 0 },
      { tmdb_id: 1213243, youtube_id: 'EfluEyQ5QIA', type: 'trailer', title: 'Toxic — Official Trailer Presentation', language: 'kn', is_official: true, sort_order: 1 },

      // Avengers: Doomsday (1003596)
      { tmdb_id: 1003596, youtube_id: 'nxDMRvDr4AQ', type: 'teaser', title: 'Marvel Studios Avengers: Doomsday — Official Title Teaser', language: 'en', is_official: true, sort_order: 0 },
      { tmdb_id: 1003596, youtube_id: 'irVNGjRFZGk', type: 'trailer', title: 'Avengers: Doomsday — Official First Look Trailer', language: 'en', is_official: true, sort_order: 1 },
      { tmdb_id: 1003596, youtube_id: 'X1aFkAkFASk', type: 'clip', title: 'Avengers: Doomsday — Hall H Announcement Special', language: 'en', is_official: true, sort_order: 2 },

      // Ramayana (656908)
      { tmdb_id: 656908, youtube_id: '74nF-FWAS6M', type: 'teaser', title: 'Ramayana: Part One — Official First Glimpse & Teaser', language: 'hi', is_official: true, sort_order: 0 },
      { tmdb_id: 656908, youtube_id: '74nF-FWAS6M', type: 'trailer', title: 'Ramayana — Official Global Announcement Trailer', language: 'hi', is_official: true, sort_order: 1 },

      // Clayface (1400940)
      { tmdb_id: 1400940, youtube_id: '6IxPD-jNdwM', type: 'teaser', title: 'Clayface — Official Teaser Trailer | DC Studios', language: 'en', is_official: true, sort_order: 0 },
      { tmdb_id: 1400940, youtube_id: 'OGO4Mqvo3jI', type: 'trailer', title: 'Clayface — Official Theatrical Trailer', language: 'en', is_official: true, sort_order: 1 },

      // Jailer 2 (1234139)
      { tmdb_id: 1234139, youtube_id: 'Y5BeWdODPqo', type: 'teaser', title: 'Jailer 2 — Tiger Muthuvel Pandian Returns Theme Teaser', language: 'ta', is_official: true, sort_order: 0 },
      { tmdb_id: 1234139, youtube_id: 'Y5BeWdODPqo', type: 'trailer', title: 'Jailer 2 — Official Announcement Promo', language: 'ta', is_official: true, sort_order: 1 },

      // Spirit (881903)
      { tmdb_id: 881903, youtube_id: '_bB_W09hE_s', type: 'teaser', title: 'Spirit — Official Title Announcement Glimpse | Prabhas | Sandeep Reddy Vanga', language: 'te', is_official: true, sort_order: 0 },
      { tmdb_id: 881903, youtube_id: '_bB_W09hE_s', type: 'trailer', title: 'Spirit — Official Cop Action Teaser', language: 'te', is_official: true, sort_order: 1 },

      // Ranabaali (1389379)
      { tmdb_id: 1389379, youtube_id: '6Gf0F1z3fL4', type: 'teaser', title: 'Ranabaali — Official Glimpse & First Look Teaser', language: 'te', is_official: true, sort_order: 0 },
      { tmdb_id: 1389379, youtube_id: '6Gf0F1z3fL4', type: 'trailer', title: 'Ranabaali — Official Action Promo', language: 'te', is_official: true, sort_order: 1 },

      // Marriage Party (1782793)
      { tmdb_id: 1782793, youtube_id: 'xV_Bja2Gy04', type: 'teaser', title: 'Marriage Party — Official Kannada Motion Teaser', language: 'kn', is_official: true, sort_order: 0 },
      { tmdb_id: 1782793, youtube_id: 'xV_Bja2Gy04', type: 'trailer', title: 'Marriage Party — Official Comedy Promo', language: 'kn', is_official: true, sort_order: 1 },
    ];

    for (const v of upcomingMovieVideos) {
      const exists = await MovieVideo.findOne({
        where: { tmdb_id: v.tmdb_id, type: v.type, youtube_id: v.youtube_id }
      });
      if (!exists) {
        await MovieVideo.create(v);
      }
    }

    // Set has_trailer and has_teaser flags for upcoming movies
    await UpcomingMovie.update(
      { has_trailer: true, has_teaser: true },
      { where: { tmdb_id: [1213243, 1003596, 656908, 1400940, 1234139, 881903, 1389379, 1782793] } }
    );

    // Initial snapshot views for charts
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    for (const vid of upcomingMovieVideos) {
      const snapCount = await VideoStatsSnapshot.count({ where: { tmdb_id: vid.tmdb_id } });
      if (snapCount === 0) {
        const baseViews = vid.tmdb_id === 1003596 ? 5400000 : vid.tmdb_id === 656908 ? 3200000 : 1200000;
        await VideoStatsSnapshot.bulkCreate([
          { youtube_id: vid.youtube_id, tmdb_id: vid.tmdb_id, views: Math.floor(baseViews * 0.7), likes: 45000, comments: 2100, captured_at: new Date(now - 7 * day) },
          { youtube_id: vid.youtube_id, tmdb_id: vid.tmdb_id, views: Math.floor(baseViews * 0.8), likes: 52000, comments: 2400, captured_at: new Date(now - 4 * day) },
          { youtube_id: vid.youtube_id, tmdb_id: vid.tmdb_id, views: Math.floor(baseViews * 0.92), likes: 61000, comments: 2800, captured_at: new Date(now - 2 * day) },
          { youtube_id: vid.youtube_id, tmdb_id: vid.tmdb_id, views: baseViews, likes: 68000, comments: 3100, captured_at: new Date(now) },
        ]);
      }
    }

    // ── Seed Popular Movies in Movie table for direct detail playback ──
    const popularMovies = [
      { tmdb_id: 27205, title: 'Inception', year: 2010, director: 'Christopher Nolan', language: 'EN', age_rating: 'PG-13', trailer_youtube_id: 'YoHD9XEInc0' },
      { tmdb_id: 872585, title: 'K.G.F: Chapter 2', year: 2022, director: 'Prashanth Neel', language: 'KN', age_rating: 'UA', trailer_youtube_id: 'JKa05nyUmuQ' },
      { tmdb_id: 360814, title: 'Dangal', year: 2016, director: 'Nitesh Tiwari', language: 'HI', age_rating: 'U', trailer_youtube_id: 'x_7YlGv9u1g' },
      { tmdb_id: 157336, title: 'Interstellar', year: 2014, director: 'Christopher Nolan', language: 'EN', age_rating: 'PG-13', trailer_youtube_id: 'zSWdZVtXT7E' },
      { tmdb_id: 155, title: 'The Dark Knight', year: 2008, director: 'Christopher Nolan', language: 'EN', age_rating: 'PG-13', trailer_youtube_id: 'EXeTwQWrcwY' },
      { tmdb_id: 961323, title: 'Kantara', year: 2022, director: 'Rishab Shetty', language: 'KN', age_rating: 'UA', trailer_youtube_id: '6_oP_g8t1pI' },
    ];

    for (const pm of popularMovies) {
      await Movie.findOrCreate({
        where: { tmdb_id: pm.tmdb_id },
        defaults: pm,
      });
      const vExists = await MovieVideo.count({ where: { tmdb_id: pm.tmdb_id, youtube_id: pm.trailer_youtube_id } });
      if (vExists === 0) {
        await MovieVideo.create({
          tmdb_id: pm.tmdb_id,
          youtube_id: pm.trailer_youtube_id,
          type: 'trailer',
          title: `${pm.title} — Official Trailer`,
          language: pm.language.toLowerCase(),
          is_official: true,
          sort_order: 0,
        });
      }
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
  OfficialChannel,
  SourceLog,
  Series,
  Season,
  Episode,
  SeriesCast,
  SeriesVideo,
  Network,
  WatchProvider,
  ContentProvider,
  Person,
  PersonCredit,
  IngestionQueue,
  SearchIndex,
  SearchLog,
  seedDefaultMovies,
};
