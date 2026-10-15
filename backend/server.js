require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize, seedDefaultMovies } = require('./database');

const authRouter = require('./routes/auth').router;
const analyzeRouter = require('./routes/analyze');
const reviewsRouter = require('./routes/reviews');
const statsRouter = require('./routes/stats');
const moviesRouter = require('./routes/movies');
const upcomingRouter = require('./routes/upcoming');
const adminDiagnosticsRouter = require('./routes/adminDiagnostics');
const { syncUpcomingFromTMDB } = require('./services/tmdbSync');
const { runNightlyValidation } = require('./services/nightlyValidator');

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
app.use('/api/movies', moviesRouter);
app.use('/api/upcoming', upcomingRouter);
app.use('/api/admin/trailer-diagnostics', adminDiagnosticsRouter);
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

sequelize.sync().then(async () => {
  console.log('Database synced');
  await seedDefaultMovies();

  // Set up 12-hour recurring background sync for TMDB upcoming & snapshots
  setInterval(() => {
    const models = require('./database');
    syncUpcomingFromTMDB(models).catch(e => console.warn('Scheduled sync notice:', e.message));
  }, 12 * 60 * 60 * 1000);

  // Set up 24-hour nightly job to re-validate stored videos and fill missing ones
  setInterval(() => {
    runNightlyValidation().catch(e => console.warn('Scheduled nightly validation notice:', e.message));
  }, 24 * 60 * 60 * 1000);

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
