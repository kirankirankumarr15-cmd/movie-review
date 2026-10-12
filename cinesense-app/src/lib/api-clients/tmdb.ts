/**
 * TMDB API Client
 * Used to fetch movie details, search results, and upcoming movies.
 */

const TMDB_BASE_URL = 'https://api.tmdb.org/3';

// Accessing the TMDB API key server-side or proxying via our API route
const getAuthHeaders = () => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB_API_KEY is missing in environment variables.');
  }
  return {
    Authorization: `Bearer ${apiKey}`,
    accept: 'application/json',
  };
};

export interface MovieSearchResult {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  original_language: string;
  vote_average: number;
  overview: string;
}

/**
 * Searches for movies via TMDB.
 * @param query Search string
 * @param language Optional language filter (e.g., 'en', 'hi', 'kn')
 */
export async function searchMovies(query: string, language?: string): Promise<MovieSearchResult[]> {
  const url = new URL(`${TMDB_BASE_URL}/search/movie`);
  url.searchParams.append('query', query);
  url.searchParams.append('include_adult', 'false');
  url.searchParams.append('page', '1');
  
  if (language && language !== 'all') {
    url.searchParams.append('with_original_language', language);
  }

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: getAuthHeaders(),
    next: { revalidate: 3600 } // Cache for 1 hour
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch from TMDB: ${res.statusText}`);
  }

  const data = await res.json();
  
  // Note: TMDB search endpoint doesn't strictly filter by with_original_language effectively, 
  // we may need to filter post-fetch if it's not perfect.
  let results: MovieSearchResult[] = data.results || [];
  
  if (language && language !== 'all') {
     results = results.filter((m) => m.original_language === language);
  }
  
  return results;
}

/**
 * Fetches specific movie details.
 */
export async function getMovieDetails(movieId: string) {
  const url = new URL(`${TMDB_BASE_URL}/movie/${movieId}`);
  url.searchParams.append('append_to_response', 'credits,videos,release_dates');

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: getAuthHeaders(),
    next: { revalidate: 86400 } // Cache for 24 hours
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch movie details for ID ${movieId}`);
  }

  return res.json();
}
