import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Sentiment } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSentimentColor(sentiment: Sentiment): string {
  const map: Record<Sentiment, string> = {
    positive: '#22c55e',
    neutral: '#f59e0b',
    negative: '#ef4444',
  };
  return map[sentiment];
}

export function getSentimentEmoji(sentiment: Sentiment): string {
  const map: Record<Sentiment, string> = {
    positive: '😊',
    neutral: '😐',
    negative: '😞',
  };
  return map[sentiment];
}

export function getSentimentLabel(sentiment: Sentiment): string {
  return sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
}

export function formatScore(score: number): string {
  const sign = score >= 0 ? '+' : '';
  return `${sign}${score.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function truncateText(text: string, maxLen: number = 120): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '…';
}

export function getSentimentExplanation(sentiment: Sentiment, compound: number): string {
  const abs = Math.abs(compound);
  let strength = 'slightly';
  if (abs >= 0.5) strength = 'strongly';
  else if (abs >= 0.2) strength = 'moderately';

  const map: Record<Sentiment, string> = {
    positive: `This review contains mostly positive language, so the overall sentiment is ${strength} positive.`,
    neutral: `This review contains a balanced mix of positive and negative language, resulting in a neutral overall sentiment.`,
    negative: `This review contains mostly negative language, so the overall sentiment is ${strength} negative.`,
  };
  return map[sentiment];
}
