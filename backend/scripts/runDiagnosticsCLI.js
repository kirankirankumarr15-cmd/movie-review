const { runDiagnostics } = require('../services/trailerDiagnostics');

async function main() {
  console.log('=====================================================');
  console.log('   CineSense Trailer Diagnostics — BASELINE SCAN    ');
  console.log('=====================================================\n');

  console.log('Scanning all movies in DB across Movie and UpcomingMovie...');
  const t0 = Date.now();
  const report = await runDiagnostics({ useAdvancedTMDB: false });
  const duration = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`\nScan completed in ${duration}s. Analyzed ${report.total_movies} total movies.\n`);
  console.log('-----------------------------------------------------');
  console.log('   SUMMARY TABLE: COUNTS BY REASON (BASELINE)        ');
  console.log('-----------------------------------------------------');
  console.table(
    Object.entries(report.counts_by_reason).map(([reason, count]) => ({
      'Diagnostic Status / Reason': reason,
      'Movie Count': count,
      'Percentage': `${((count / report.total_movies) * 100).toFixed(1)}%`,
    }))
  );

  console.log('-----------------------------------------------------');
  console.log(`TOTAL MOVIES:        ${report.total_movies}`);
  console.log(`PLAYABLE TRAILERS:   ${report.playable_count} (${((report.playable_count / report.total_movies) * 100).toFixed(1)}%)`);
  console.log(`FAILING MOVIES:      ${report.failing_count} (${((report.failing_count / report.total_movies) * 100).toFixed(1)}%)`);
  console.log('-----------------------------------------------------\n');

  console.log('SAMPLE FAILING MOVIES & EXACT LOGGED REASONS:');
  const failingSamples = report.movies.filter(m => m.status !== 'OK').slice(0, 15);
  console.table(
    failingSamples.map(m => ({
      ID: m.movie_id,
      Title: m.title.substring(0, 24),
      Lang: m.language,
      Year: m.year,
      Status: m.status,
      'Exact Reason Logged': m.exact_reason.substring(0, 60),
    }))
  );

  // Write full raw report to json for reference
  const fs = require('fs');
  const path = require('path');
  fs.writeFileSync(
    path.join(__dirname, 'baseline_diagnostics_report.json'),
    JSON.stringify(report, null, 2)
  );
  console.log('\nFull baseline report saved to backend/scripts/baseline_diagnostics_report.json');
}

main().then(() => process.exit(0)).catch(e => {
  console.error('Diagnostic error:', e);
  process.exit(1);
});
