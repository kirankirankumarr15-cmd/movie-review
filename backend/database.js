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
}

// Relationships
User.hasMany(Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, User, Review, Movie, seedDefaultMovies };

