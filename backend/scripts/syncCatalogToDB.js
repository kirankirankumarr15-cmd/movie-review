const fs = require('fs');
const path = require('path');
const { sequelize, Movie } = require('../database');

async function syncCatalogToDB() {
  await sequelize.sync();
  const catalogPath = path.join(__dirname, '../../frontend/src/data/catalog.ts');
  const content = fs.readFileSync(catalogPath, 'utf8');
  const match = content.match(/export const CATALOG: CatalogItem\[\] = (\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error('Failed to parse catalog.ts');
  }
  const catalog = JSON.parse(match[1]);
  console.log(`Loaded ${catalog.length} movies from catalog.ts`);

  let added = 0;
  let existing = 0;

  for (const item of catalog) {
    const tmdbId = item.tmdbId;
    const year = parseInt(item.release?.substring(0, 4), 10) || null;
    const langMap = {
      'Kannada': 'kn',
      'Hindi': 'hi',
      'English': 'en',
      'Tamil': 'ta',
      'Telugu': 'te',
      'Malayalam': 'ml',
    };
    const lang = langMap[item.language] || item.language?.toLowerCase() || 'en';

    const [movie, created] = await Movie.findOrCreate({
      where: { tmdb_id: tmdbId },
      defaults: {
        title: item.title,
        year,
        director: null,
        language: lang.toUpperCase(),
        age_rating: 'UA',
        trailer_youtube_id: null,
        tmdb_id: tmdbId,
      },
    });

    if (created) {
      added++;
    } else {
      existing++;
    }
  }

  console.log(`Sync complete: ${added} added, ${existing} already in DB. Total Movie records: ${await Movie.count()}`);
}

if (require.main === module) {
  syncCatalogToDB().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}

module.exports = { syncCatalogToDB };
