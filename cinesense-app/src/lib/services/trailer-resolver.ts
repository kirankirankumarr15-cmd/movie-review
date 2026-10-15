import { dbService } from '@/lib/db';
import { MovieVideo } from '@/lib/db/types';

// Curated high-confidence verified trailer mapping for iconic Indian & catalog movies
// Indexed by both TMDB ID and normalized Title for instant zero-latency playback
export const VERIFIED_TRAILER_SEEDS: Record<string, { youtube_id: string; type: 'trailer' | 'teaser' | 'clip' | 'song'; title: string }[]> = {
  // Eradu Nakshatragalu (1983)
  '307896': [
    { youtube_id: 'CJ2Zak1IjjM', type: 'teaser', title: 'Eradu Nakshatragalu Official Star Suvarna Promo' },
    { youtube_id: 'mJzdwi7Awu0', type: 'song', title: 'Nanna Udupu Ninnadu (HD Video) — Eradu Nakshatragalu' },
    { youtube_id: '4TrANiVnmiA', type: 'song', title: 'Eke Malli Hange (HD Video) — Eradu Nakshatragalu' }
  ],
  // Toxic (2026)
  '1213243': [
    { youtube_id: 'EfluEyQ5QIA', type: 'teaser', title: 'Toxic — Official Title Announcement Teaser' }
  ],
  // The Greatest of All Time (GOAT)
  '1022789': [
    { youtube_id: 'B5GAjuSnNuQ', type: 'trailer', title: 'The Greatest of All Time | Official Trailer (Netflix India)' }
  ],
  // Leo
  '1075794': [
    { youtube_id: 'Po3jStA673E', type: 'trailer', title: 'LEO — Official Trailer (Sun TV)' }
  ],
  // Varisu
  '842945': [
    { youtube_id: '9fux9swQ5AQ', type: 'trailer', title: 'Varisu — Official Trailer (Sun TV)' }
  ],
  // Beast
  '818397': [
    { youtube_id: '0E1kVRRi6lk', type: 'trailer', title: 'Beast — Official Trailer (Sun TV)' }
  ],
  // Master
  '624860': [
    { youtube_id: 'UTiXQcrLlv4', type: 'teaser', title: 'Master — Official Teaser (Sun TV)' }
  ],
  // Bigil
  '576784': [
    { youtube_id: 'GR-Ui8-V2M0', type: 'trailer', title: 'Bigil — Official Trailer (Sony Music)' }
  ],
  // Sarkar
  '506072': [
    { youtube_id: 'VkkyaodksT4', type: 'teaser', title: 'Sarkar — Official Teaser (Sun TV)' }
  ],
  // Mersal
  '455839': [
    { youtube_id: 'gQDo5QuZTaw', type: 'teaser', title: 'Mersal — Official Tamil Teaser (Sony Music)' }
  ],
  // Bairavaa
  '419478': [
    { youtube_id: 'bhTN4PDm6fc', type: 'trailer', title: 'Bairavaa — Official Trailer (Lahari Music)' }
  ],
  // Theri
  '366141': [
    { youtube_id: 'ZK4uGLpkAKk', type: 'trailer', title: 'Theri — Official Trailer (Think Music India)' }
  ],
  // Puli
  '291870': [
    { youtube_id: 'U9kCY9psgOc', type: 'trailer', title: 'Puli — Official Trailer (Sony Music)' }
  ],
  // Kaththi
  '257065': [
    { youtube_id: 'b9n5_73Y-0Q', type: 'trailer', title: 'Kaththi — Official Trailer (Lyca Productions)' }
  ],
  // Thuppakki
  '124067': [
    { youtube_id: 'G4036aE108Q', type: 'trailer', title: 'Thuppakki — Official Trailer (Gemini Film Circuit)' }
  ],
  // Jana Nayagan (Thalapathy 69)
  '1360170': [
    { youtube_id: 'fJaAYcERf3Y', type: 'trailer', title: 'Jana Nayagan — Official Announcement (KVN)' }
  ],
  // Kantara
  '1014590': [
    { youtube_id: '8mrVmf239GU', type: 'trailer', title: 'Kantara — Official Trailer (Hombale Films)' }
  ],
  // KGF Chapter 2
  '585245': [
    { youtube_id: 'JKa05nyUmuQ', type: 'trailer', title: 'K.G.F: Chapter 2 — Official Trailer (Hombale Films)' }
  ],
  // KGF Chapter 1
  '490132': [
    { youtube_id: '-KfsY-qw908', type: 'trailer', title: 'K.G.F: Chapter 1 — Official Trailer (Hombale Films)' }
  ],
  // 777 Charlie
  '805327': [
    { youtube_id: 'RN9nS23fX2Q', type: 'trailer', title: '777 Charlie — Official Trailer (Paramvah Studios)' }
  ]
};

const DISQUALIFIED_KEYWORDS = [
  'fan made',
  'fanmade',
  'fan-made',
  'reaction',
  'review',
  'concept',
  'ai trailer',
  'parody',
  'spoof',
  'status',
  'whatsapp',
  'roast',
  'bgm edit'
];

interface YouTubeCandidate {
  id: string;
  title: string;
  channel: string;
  duration?: string;
  durationSeconds?: number;
}

export class TrailerResolverService {
  /**
   * Resolves official videos for any movie dynamically.
   * Checks:
   * 1. Verified Seeds by TMDB ID & Title
   * 2. Local Database Cache
   * 3. Live YouTube Smart Resolver with oEmbed Verification & Auto-caching
   */
  static async resolveVideosForMovie(movie: {
    id: number;
    title: string;
    release_date?: string;
    original_language?: string;
  }): Promise<MovieVideo[]> {
    const tmdbId = movie.id;
    const movieIdStr = String(tmdbId);
    const normalizedTitle = movie.title.toLowerCase().trim();

    // 1. Check Verified Seeds by TMDB ID
    if (VERIFIED_TRAILER_SEEDS[movieIdStr]) {
      return VERIFIED_TRAILER_SEEDS[movieIdStr].map((v, i) => ({
        id: `vid-seed-${tmdbId}-${i}`,
        tmdb_id: tmdbId,
        youtube_id: v.youtube_id,
        type: v.type,
        title: v.title,
        language: movie.original_language || 'en',
        is_official: true,
        embeddable: true,
      }));
    }

    // Check by normalized title match in seeds
    for (const [sId, seedList] of Object.entries(VERIFIED_TRAILER_SEEDS)) {
      const match = seedList.find(s => s.title.toLowerCase().includes(normalizedTitle) || normalizedTitle.includes(s.title.toLowerCase().split('—')[0].trim()));
      if (match) {
        return seedList.map((v, i) => ({
          id: `vid-seed-${tmdbId}-${i}`,
          tmdb_id: tmdbId,
          youtube_id: v.youtube_id,
          type: v.type,
          title: v.title,
          language: movie.original_language || 'en',
          is_official: true,
          embeddable: true,
        }));
      }
    }

    // 2. Check Database Cache
    try {
      const cached = await dbService.getMovieVideos(tmdbId);
      if (cached && cached.length > 0) {
        return cached;
      }
    } catch {
      // Continue to live search
    }

    // 3. Fallback: Search YouTube Dynamically
    const year = movie.release_date ? movie.release_date.slice(0, 4) : '';
    const langMap: Record<string, string> = {
      kn: 'Kannada',
      te: 'Telugu',
      ta: 'Tamil',
      ml: 'Malayalam',
      hi: 'Hindi',
      en: 'English'
    };
    const langName = langMap[movie.original_language || ''] || '';

    const queries = [
      `"${movie.title}" ${year} official trailer`,
      `"${movie.title}" ${langName} movie trailer`,
      `"${movie.title}" official teaser`,
      `"${movie.title}" ${langName} official promo`,
      `"${movie.title}" movie song`
    ].filter(Boolean);

    for (const q of queries) {
      try {
        const candidates = await this.searchYouTube(q);
        const scored = candidates
          .map(c => this.scoreCandidate(c, movie.title, year))
          .filter(sc => sc.accepted && sc.candidate.id)
          .sort((a, b) => b.score - a.score);

        if (scored.length > 0) {
          // Check embeddability on the top candidate
          const top = scored[0].candidate;
          const isEmbeddable = await this.verifyEmbeddability(top.id);
          if (isEmbeddable) {
            const vidType: 'trailer' | 'teaser' | 'clip' | 'song' =
              top.title.toLowerCase().includes('teaser') ? 'teaser' :
              top.title.toLowerCase().includes('song') ? 'song' :
              top.title.toLowerCase().includes('promo') || top.title.toLowerCase().includes('glimpse') ? 'clip' :
              'trailer';

            const newVideo: MovieVideo = {
              id: `vid-yt-${tmdbId}-${top.id}`,
              tmdb_id: tmdbId,
              youtube_id: top.id,
              type: vidType,
              title: top.title,
              language: movie.original_language || 'en',
              is_official: true,
              embeddable: true,
            };

            // Cache it in the database
            try {
              await dbService.addMovieVideo(newVideo);
            } catch {}

            return [newVideo];
          }
        }
      } catch (err) {
        // Continue to next query if network fails
      }
    }

    return [];
  }

  /**
   * Searches YouTube HTML without requiring an API key.
   */
  private static async searchYouTube(query: string): Promise<YouTubeCandidate[]> {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) return [];

      const html = await res.text();
      const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
      if (!match) return [];

      const parsed = JSON.parse(match[1]);
      const contents =
        parsed.contents?.twoColumnSearchResultsRenderer?.primaryContents
          ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];

      const results: YouTubeCandidate[] = [];
      for (const item of contents) {
        const v = item.videoRenderer;
        if (v && v.videoId) {
          let durationSeconds = 0;
          const lenStr = v.lengthText?.simpleText || '';
          if (lenStr) {
            const parts = lenStr.split(':').map(Number);
            if (parts.length === 2) durationSeconds = parts[0] * 60 + parts[1];
            else if (parts.length === 3) durationSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
          }

          results.push({
            id: v.videoId,
            title: v.title?.runs?.[0]?.text || '',
            channel: v.ownerText?.runs?.[0]?.text || '',
            duration: lenStr,
            durationSeconds,
          });
        }
      }
      return results;
    } catch {
      clearTimeout(timeout);
      return [];
    }
  }

  /**
   * Scores candidate video to ensure it's not a fan-made, review, or fake upload.
   */
  private static scoreCandidate(
    candidate: YouTubeCandidate,
    movieTitle: string,
    movieYear?: string
  ): { score: number; accepted: boolean; candidate: YouTubeCandidate } {
    const title = candidate.title.toLowerCase();
    const channel = candidate.channel.toLowerCase();
    const cleanMovieTitle = movieTitle.toLowerCase().replace(/[^a-z0-9 ]/gi, '').trim();
    const cleanCandidateTitle = title.replace(/[^a-z0-9 ]/gi, '').trim();

    // 1. Negative Filter
    for (const kw of DISQUALIFIED_KEYWORDS) {
      if (title.includes(kw)) {
        return { score: -100, accepted: false, candidate };
      }
    }

    let score = 0;

    // 2. Title matching
    if (cleanCandidateTitle.includes(cleanMovieTitle)) {
      score += 40;
    } else {
      const words = cleanMovieTitle.split(/\s+/).filter(w => w.length > 2);
      const matched = words.filter(w => cleanCandidateTitle.includes(w));
      if (matched.length === words.length && words.length > 0) {
        score += 35;
      } else if (matched.length > 0) {
        score += 15;
      }
    }

    // 3. Official Keywords
    if (
      title.includes('official trailer') ||
      title.includes('official teaser') ||
      title.includes('glimpse') ||
      title.includes('promo') ||
      title.includes('official song') ||
      title.includes('video song')
    ) {
      score += 25;
    }

    // 4. Known channels
    const officialNetworks = [
      'sun tv', 'sony music', 't-series', 'lahari', 'anand audio', 'sgv', 'think music',
      'netflix', 'prime video', 'zeemusic', 'saregama', 'aditya music', 'starsuvarna',
      'yrf', 'dharma', 'hombale', 'mythri', 'geetha arts', 'kvn productions'
    ];
    if (officialNetworks.some(net => channel.includes(net))) {
      score += 25;
    }

    // 5. Year matching
    if (movieYear && title.includes(movieYear)) {
      score += 10;
    }

    // 6. Duration suitability (30s to 5m is typical for trailer/song)
    if (candidate.durationSeconds) {
      if (candidate.durationSeconds >= 20 && candidate.durationSeconds <= 360) {
        score += 15;
      }
    }

    return {
      score,
      accepted: score >= 35,
      candidate,
    };
  }

  /**
   * Verifies that the video can be embedded in an external webpage.
   */
  private static async verifyEmbeddability(videoId: string): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    try {
      const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      return res.status === 200;
    } catch {
      clearTimeout(timeout);
      return false;
    }
  }
}
