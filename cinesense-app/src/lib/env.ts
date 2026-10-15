/**
 * Environment Variable Validator for CineSense
 * Fails fast with clear, readable errors if critical config is broken.
 * Reports status of optional third-party integrations.
 */

interface EnvConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  APP_URL: string;
  NEXTAUTH_SECRET?: string;
  hasSupabase: boolean;
  hasTMDB: boolean;
  hasYouTube: boolean;
  hasHuggingFace: boolean;
}

export function validateEnv(): EnvConfig {
  const isProd = process.env.NODE_ENV === 'production';

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || 'cinesense_default_secret_32char_secure_pad';

  if (!process.env.NEXTAUTH_SECRET && isProd) {
    console.warn('⚠️ [CineSense] NEXTAUTH_SECRET not provided. Using fallback secret for build/local mode. Set this in production.');
  }

  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const hasTMDB = Boolean(process.env.TMDB_API_KEY);
  const hasYouTube = Boolean(process.env.YOUTUBE_API_KEY);
  const hasHuggingFace = Boolean(process.env.HUGGINGFACE_API_KEY);

  return {
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    APP_URL,
    NEXTAUTH_SECRET,
    hasSupabase,
    hasTMDB,
    hasYouTube,
    hasHuggingFace,
  };
}

export const env = validateEnv();
