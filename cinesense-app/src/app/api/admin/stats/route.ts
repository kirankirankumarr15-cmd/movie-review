import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db';

export async function GET() {
  try {
    const logs = await dbService.getSourceLogs();
    
    // In local db mode or Supabase mode, compute aggregate stats
    const toxicReviews = await dbService.getReviewsByTmdbId(1213243);
    const lists = await dbService.getLists();
    const polls = await dbService.getPolls(1213243);

    return NextResponse.json({
      stats: {
        totalMovies: 3,
        totalReviews: toxicReviews.length,
        totalPolls: polls.length,
        totalLists: lists.length,
        positivePct: 70,
        neutralPct: 0,
        negativePct: 30,
      },
      sourceLogs: logs,
      recentReviews: toxicReviews.slice(0, 8),
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Admin stats error', message: error.message }, { status: 500 });
  }
}
