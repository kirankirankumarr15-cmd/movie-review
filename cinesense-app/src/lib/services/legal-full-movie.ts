import { dbService } from '@/lib/db';
import { LegalFullMovie, OfficialChannel } from '@/lib/db/types';

export interface FullMovieVerificationResult {
  isLegallyAvailable: boolean;
  legalMovie?: LegalFullMovie;
  rejectionReason?: string;
}

export class LegalFullMovieService {
  /**
   * Evaluates candidate video upload against the non-negotiable strict legal guidelines:
   * 1. Channel ID must exist in the whitelisted official rights holder channels
   * 2. Video duration must match TMDB runtime within ±10 minutes
   * 3. Video must have embed permission enabled
   */
  static async verifyCandidate(
    candidate: {
      youtube_id: string;
      channel_id: string;
      channel_name: string;
      video_duration_minutes: number;
      is_embeddable: boolean;
    },
    movieInfo: {
      tmdb_id: number;
      title: string;
      tmdb_runtime_minutes: number;
    }
  ): Promise<LegalFullMovie> {
    const whitelistedChannels = await dbService.getOfficialChannels();
    const matchedChannel = whitelistedChannels.find(
      c => c.channel_id === candidate.channel_id && c.is_whitelisted
    );

    let status: LegalFullMovie['verification_status'] = 'verified_approved';
    const reasons: string[] = [];

    // Check 1: Channel Whitelist
    if (!matchedChannel) {
      status = 'rejected_pirated_or_unverified';
      reasons.push(
        `Channel "${candidate.channel_name}" (ID: ${candidate.channel_id}) is not an authorized official rights holder in CineSense whitelist.`
      );
    }

    // Check 2: Embeddable Status
    if (!candidate.is_embeddable) {
      status = 'rejected_pirated_or_unverified';
      reasons.push('Video embedding is disabled or restricted by uploader.');
    }

    // Check 3: Runtime Validation (±10 minutes against canonical TMDB runtime)
    const runtimeDiff = Math.abs(candidate.video_duration_minutes - movieInfo.tmdb_runtime_minutes);
    if (movieInfo.tmdb_runtime_minutes > 0 && runtimeDiff > 10) {
      status = 'rejected_pirated_or_unverified';
      reasons.push(
        `Duration discrepancy: Video is ${candidate.video_duration_minutes}m but TMDB official runtime is ${movieInfo.tmdb_runtime_minutes}m (diff: ${runtimeDiff}m > ±10m tolerance). Potential clip, truncated rip, or bootleg.`
      );
    }

    const legalEntry: LegalFullMovie = {
      id: `full-${movieInfo.tmdb_id}-${candidate.youtube_id}`,
      tmdb_id: movieInfo.tmdb_id,
      movie_title: movieInfo.title,
      youtube_id: candidate.youtube_id,
      channel_id: candidate.channel_id,
      channel_name: matchedChannel?.channel_name || candidate.channel_name,
      video_duration_minutes: candidate.video_duration_minutes,
      tmdb_runtime_minutes: movieInfo.tmdb_runtime_minutes,
      is_embeddable: candidate.is_embeddable,
      verification_status: status,
      rejection_reason: reasons.length > 0 ? reasons.join(' ') : undefined,
      detected_at: new Date().toISOString()
    };

    await dbService.saveLegalFullMovie(legalEntry);
    return legalEntry;
  }

  /**
   * Search and verify legal full movie for a title
   */
  static async findVerifiedFullMovie(
    tmdbId: number,
    title: string,
    year: number,
    runtimeMinutes: number
  ): Promise<FullMovieVerificationResult> {
    // 1. First check if we already have a verified legal record in the database
    const existing = await dbService.getLegalFullMovie(tmdbId);
    if (existing && existing.verification_status === 'verified_approved') {
      return { isLegallyAvailable: true, legalMovie: existing };
    }

    // 2. Query YouTube Data API if configured
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (apiKey && !apiKey.includes('your_youtube')) {
      try {
        const query = encodeURIComponent(`${title} ${year} full movie`);
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&videoType=movie&videoEmbeddable=true&videoDuration=long&maxResults=5&key=${apiKey}`;
        
        const res = await fetch(url, { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];

          for (const item of items) {
            const videoId = item.id?.videoId;
            const channelId = item.snippet?.channelId;
            const channelTitle = item.snippet?.channelTitle;

            // Fetch video details for duration and embeddable status
            const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status&id=${videoId}&key=${apiKey}`;
            const detailsRes = await fetch(detailsUrl);
            if (detailsRes.ok) {
              const detailsData = await detailsRes.json();
              const videoDetails = detailsData.items?.[0];
              if (videoDetails) {
                const durationIso = videoDetails.contentDetails?.duration || '';
                const durationMin = parseIsoDuration(durationIso);
                const isEmbeddable = videoDetails.status?.embeddable ?? true;

                const verified = await this.verifyCandidate(
                  {
                    youtube_id: videoId,
                    channel_id: channelId,
                    channel_name: channelTitle,
                    video_duration_minutes: durationMin,
                    is_embeddable: isEmbeddable
                  },
                  {
                    tmdb_id: tmdbId,
                    title,
                    tmdb_runtime_minutes: runtimeMinutes
                  }
                );

                if (verified.verification_status === 'verified_approved') {
                  return { isLegallyAvailable: true, legalMovie: verified };
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error fetching YouTube API for full movie search:', err);
      }
    }

    // Check if an existing candidate was checked and rejected
    const all = await dbService.getAllLegalFullMovies();
    const candidate = all.find(m => m.tmdb_id === tmdbId);
    if (candidate && candidate.verification_status !== 'verified_approved') {
      return {
        isLegallyAvailable: false,
        rejectionReason: candidate.rejection_reason || 'No verified rights-holder upload found.'
      };
    }

    return {
      isLegallyAvailable: false,
      rejectionReason: 'No official rights holder upload detected. Empty is better than pirated content.'
    };
  }
}

// Helper to parse ISO-8601 duration (e.g., PT2H35M12S) to minutes
export function parseIsoDuration(duration: string): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 60 + minutes + Math.round(seconds / 60);
}
