import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cinesense.app';

  const routes = [
    '',
    '/explore',
    '/compare',
    '/calendar',
    '/analyze-review',
    '/community',
    '/hub/kn',
    '/hub/hi',
    '/hub/te',
    '/hub/ta',
    '/hub/ml',
    '/hub/en',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // Key canonical movies
  const movieRoutes = [1213243, 1112426, 872585].map((id) => ({
    url: `${baseUrl}/movie/${id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  }));

  return [...routes, ...movieRoutes];
}
