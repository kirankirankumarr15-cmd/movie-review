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

// Relationships
User.hasMany(Review, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'user_id' });

module.exports = { sequelize, User, Review };
