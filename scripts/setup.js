#!/usr/bin/env node

/**
 * CineSense One-Command Reproducible Setup Script
 * Usage: node scripts/setup.js or npm run setup
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('🎬 =========================================================');
console.log('   CineSense — Fully Automated Environment & Database Setup');
console.log('============================================================\n');

// 1. Node.js Version Check
const currentVersion = process.version;
const majorVersion = parseInt(currentVersion.replace('v', '').split('.')[0], 10);
if (majorVersion < 20) {
  console.error(`❌ Node.js version ${currentVersion} detected.`);
  console.error('   CineSense requires Node.js >= 20.0.0. Please upgrade or use: nvm use\n');
  process.exit(1);
}
console.log(`✓ Node.js runtime verified: ${currentVersion} (>= 20.0.0 requirement met)`);

// 2. Ensure .env files exist from .env.example
const envConfigs = [
  {
    name: 'Root workspace',
    example: path.join(ROOT_DIR, '.env.example'),
    target: path.join(ROOT_DIR, '.env'),
  },
  {
    name: 'cinesense-app (Next.js 16)',
    example: path.join(ROOT_DIR, 'cinesense-app', '.env.example'),
    target: path.join(ROOT_DIR, 'cinesense-app', '.env.local'),
  },
  {
    name: 'backend (Node/Express API)',
    example: path.join(ROOT_DIR, 'backend', '.env.example'),
    target: path.join(ROOT_DIR, 'backend', '.env'),
  },
  {
    name: 'frontend (Vite React Client)',
    example: path.join(ROOT_DIR, 'frontend', '.env.example'),
    target: path.join(ROOT_DIR, 'frontend', '.env'),
  },
];

for (const cfg of envConfigs) {
  if (!fs.existsSync(cfg.target)) {
    if (fs.existsSync(cfg.example)) {
      fs.copyFileSync(cfg.example, cfg.target);
      console.log(`✓ Created ${cfg.name} environment from .env.example`);
    } else {
      console.warn(`⚠ Example file missing: ${cfg.example}`);
    }
  } else {
    console.log(`✓ ${cfg.name} environment already present (${path.basename(cfg.target)})`);
  }
}

// 3. Verify Local JSON Database for Next.js App
const cinesenseDbPath = path.join(ROOT_DIR, 'cinesense-app', 'data', 'cinesense_db.json');
if (fs.existsSync(cinesenseDbPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(cinesenseDbPath, 'utf8'));
    console.log(`✓ Next.js offline store loaded: ${data.movies?.length || 0} movies, ${data.movie_videos?.length || 0} verified trailers`);
  } catch (err) {
    console.warn('⚠ Could not parse cinesense_db.json:', err.message);
  }
}

// 4. Initialize & Seed Backend Database (SQLite or Postgres)
async function setupBackendDb() {
  try {
    console.log('\n📦 Initializing Backend Database & Running Migrations...');
    const { sequelize, seedDefaultMovies } = require('../backend/database');
    await sequelize.sync();
    console.log('✓ Database schema synced successfully');
    
    // Run column migration script
    const { migrate } = require('../backend/scripts/migrateDB');
    await migrate();

    // Seed default movies and trailers
    await seedDefaultMovies();
    console.log('✓ Database seed data verified');
  } catch (err) {
    console.error('❌ Database setup encountered an error:', err.message);
    process.exit(1);
  }
}

setupBackendDb().then(() => {
  console.log('\n✨ =========================================================');
  console.log('   Setup Complete! CineSense is ready to run.');
  console.log('============================================================');
  console.log('   Run Next.js Web App:  npm run dev   (http://localhost:3000)');
  console.log('   Run Express Backend:  npm run dev:backend');
  console.log('   Run Vite Frontend:    npm run dev:frontend');
  console.log('   Run Test Suite:       npm test');
  console.log('============================================================\n');
  process.exit(0);
});
