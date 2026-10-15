import { NextResponse } from 'next/server';
import { env } from '@/lib/env';

const startTime = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  return NextResponse.json({
    status: 'ok',
    service: 'CineSense Web App (Next.js 16)',
    timestamp: new Date().toISOString(),
    uptime: `${uptimeSeconds}s`,
    environment: env.NODE_ENV,
    features: {
      tmdb_connected: env.hasTMDB,
      supabase_connected: env.hasSupabase,
      youtube_api_connected: env.hasYouTube,
      sentiment_analysis_ai: env.hasHuggingFace ? 'cloud_huggingface' : 'local_vader_sentiment',
      database_mode: env.hasSupabase ? 'supabase_postgres' : 'embedded_json_store',
    },
  });
}
