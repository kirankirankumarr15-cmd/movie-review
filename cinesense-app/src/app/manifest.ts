import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CineSense — Movie Review Sentiment Platform',
    short_name: 'CineSense',
    description: 'Understand what audiences really feel with authentic multi-source sentiment analysis for cinema.',
    start_url: '/',
    display: 'standalone',
    background_color: '#08080d',
    theme_color: '#7c3aed',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
