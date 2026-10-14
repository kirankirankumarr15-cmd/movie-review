require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

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

// movie_videos: one movie → many typed clips (teaser, trailer, clip, song)
const MovieVideo = sequelize.define('MovieVideo', {
  tmdb_id: { type: DataTypes.INTEGER, allowNull: false },
  youtube_id: { type: DataTypes.STRING, allowNull: false },
  // teaser | trailer | clip | song
  type: { type: DataTypes.STRING, allowNull: false, defaultValue: 'trailer' },
  title: { type: DataTypes.STRING, allowNull: true },
  language: { type: DataTypes.STRING, allowNull: true },
  is_official: { type: DataTypes.BOOLEAN, defaultValue: true },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
});

// Seed initial movies (e.g. Toxic 2026)
async function seedDefaultMovies() {
  try {
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
      console.log('Successfully seeded Toxic with trailer_youtube_id: EfluEyQ5QIA');
    }
  } catch (err) {
    console.warn('Seed movie check/create notice:', err.message);
  }

  // Seed Toxic movie_videos (verified KVN Productions uploads)
  // Teaser: EfluEyQ5QIA (official KVN teaser, uploaded by KVN Productions)
  // Trailer: EfluEyQ5QIA (same video serves as official trailer for Toxic 2026)
  // Note: Only EfluEyQ5QIA has been verified as embeddable KVN official upload.
  try {
    const toxicTmdbId = 1213243;
    const existingVideos = await MovieVideo.count({ where: { tmdb_id: toxicTmdbId } });
    if (existingVideos === 0) {
      await MovieVideo.bulkCreate([
        {
          tmdb_id: toxicTmdbId,
          youtube_id: 'EfluEyQ5QIA',
          type: 'teaser',
          title: 'Toxic — Official Teaser',
          language: 'KN',
          is_official: true,
          sort_order: 0,
        },
        {
          tmdb_id: toxicTmdbId,
          youtube_id: 'EfluEyQ5QIA',
          type: 'trailer',
          title: 'Toxic — Official Trailer',
          language: 'KN',
          is_official: true,
          sort_order: 1,
        },
      ]);
      console.log('Seeded Toxic movie_videos (teaser + trailer)');
    }
  } catch (err) {
    console.warn('Seed movie_videos notice:', err.message);
  }
}

// Relationships
User.hasMany(Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, User, Review, Movie, MovieVideo, seedDefaultMovies };

