import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hnchat.net';
  const now = new Date();

  const staticRoutes = [
    { url: baseUrl, priority: 1.0, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/landing`, priority: 1.0, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/sign-up-login`, priority: 0.95, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/home-feed`, priority: 0.9, changeFrequency: 'always' as const },
    { url: `${baseUrl}/short-videos`, priority: 0.9, changeFrequency: 'always' as const },
    { url: `${baseUrl}/video-live-feed`, priority: 0.9, changeFrequency: 'always' as const },
    { url: `${baseUrl}/search-engine`, priority: 0.85, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/marketplace`, priority: 0.85, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/ecommerce`, priority: 0.85, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/ai-assistant`, priority: 0.85, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/hn-ai`, priority: 0.85, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/subscription`, priority: 0.85, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/chats-messaging`, priority: 0.8, changeFrequency: 'always' as const },
    { url: `${baseUrl}/voice-rooms`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/live-stream`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/games-hub`, priority: 0.8, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/crypto-trading`, priority: 0.8, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/pages-groups`, priority: 0.75, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/geo-content`, priority: 0.7, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/invite`, priority: 0.75, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/points-rewards`, priority: 0.75, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/stories-editor`, priority: 0.7, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/app-store`, priority: 0.65, changeFrequency: 'weekly' as const },
    { url: `${baseUrl}/profile`, priority: 0.7, changeFrequency: 'daily' as const },
    { url: `${baseUrl}/privacy-policy`, priority: 0.5, changeFrequency: 'monthly' as const },
    { url: `${baseUrl}/terms-of-service`, priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  return staticRoutes.map(route => ({
    url: route.url,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
