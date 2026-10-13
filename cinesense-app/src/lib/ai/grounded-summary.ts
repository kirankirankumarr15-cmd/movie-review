import { Review, SentimentSummary } from '../db/types';

export interface GroundedSummaryResult {
  summaryText: string;
  sampleSize: number;
  sourcesCited: string[];
  keyHighlights: string[];
  keyCritiques: string[];
}

/**
 * Generates an objective "What People Are Saying" summary
 * Strictly grounded in real fetched reviews — NEVER invents claims absent from the data.
 * Cites the sample size.
 */
export function generateGroundedSummary(
  movieTitle: string,
  reviews: Review[],
  summary: SentimentSummary
): GroundedSummaryResult | null {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  const sampleSize = reviews.length;
  const sourcesCited = Object.keys(summary.sources_breakdown);

  // Group verified snippets
  const positiveSnippets = reviews
    .filter((r) => r.sentiment === 'positive')
    .map((r) => ({ author: r.author, source: r.source, text: r.text.slice(0, 150) }));

  const negativeSnippets = reviews
    .filter((r) => r.sentiment === 'negative')
    .map((r) => ({ author: r.author, source: r.source, text: r.text.slice(0, 150) }));

  // Formulate grounded overview citing exact percentages and sample size
  let summaryText = `Based on an analysis of ${sampleSize} verified reviews from ${sourcesCited.join(
    ', '
  )}, audience and critic consensus for "${movieTitle}" is predominantly ${
    summary.positive_pct >= 60
      ? 'favorable'
      : summary.negative_pct >= 50
      ? 'critical'
      : 'mixed'
  } (${summary.positive_pct}% positive, ${summary.neutral_pct}% neutral, ${summary.negative_pct}% negative).`;

  if (summary.top_positive_themes.length > 0) {
    summaryText += ` Frequent praises highlight ${summary.top_positive_themes.slice(0, 3).join(', ')}.`;
  }

  if (summary.top_negative_themes.length > 0) {
    summaryText += ` Points of critique or debate center around ${summary.top_negative_themes.slice(0, 2).join(', ')}.`;
  }

  const keyHighlights = positiveSnippets.slice(0, 3).map(
    (s) => `"${s.text}..." — ${s.author} (${s.source})`
  );

  const keyCritiques = negativeSnippets.slice(0, 2).map(
    (s) => `"${s.text}..." — ${s.author} (${s.source})`
  );

  return {
    summaryText,
    sampleSize,
    sourcesCited,
    keyHighlights,
    keyCritiques,
  };
}
