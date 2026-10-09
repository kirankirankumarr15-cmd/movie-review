require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./database');

const authRouter = require('./routes/auth').router;
const analyzeRouter = require('./routes/analyze');
const reviewsRouter = require('./routes/reviews');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CineSense API (Node.js)' });
});

app.use('/api/auth', authRouter);
app.use('/api', analyzeRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api', statsRouter);

// Error handlers
app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'An internal server error occurred.' });
});

// Keep process alive — prevent silent exits
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

// Heartbeat to prevent event loop from going empty
const keepAlive = setInterval(() => {}, 1000 * 60 * 60);

sequelize.sync().then(() => {
  console.log('Database synced');
  const server = app.listen(PORT, () => {
    console.log(`CineSense backend running on http://localhost:${PORT}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please close the other process and retry.`);
      clearInterval(keepAlive);
      process.exit(1);
    } else {
      console.error('Server error:', err);
    }
  });
}).catch(err => {
  console.error('Failed to sync database:', err);
  clearInterval(keepAlive);
  process.exit(1);
});
