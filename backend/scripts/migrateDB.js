const { sequelize } = require('../database');

async function migrate() {
  await sequelize.sync();
  const cols = [
    'published_at VARCHAR(255)',
    'embeddable BOOLEAN DEFAULT 1',
    'checked_at DATETIME',
    'source VARCHAR(50) DEFAULT "auto"',
    'status VARCHAR(50) DEFAULT "OK"',
    'channel_title VARCHAR(255)',
    'channel_id VARCHAR(255)',
    'score FLOAT',
    'diagnostic_reason TEXT',
  ];

  for (const col of cols) {
    try {
      await sequelize.query(`ALTER TABLE MovieVideos ADD COLUMN ${col};`);
      console.log(`Added column: ${col}`);
    } catch (e) {
      console.log(`Column ${col.split(' ')[0]} already exists (${e.message})`);
    }
  }

  console.log('Migration successfully completed.');
}

if (require.main === module) {
  migrate().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}

module.exports = { migrate };
