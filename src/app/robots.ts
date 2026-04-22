import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/landing',
          '/home-feed',
          '/short-videos',
          '/video-live-feed',
          '/search-engine',
          '/marketplace',
          '/ai-assistant',
          '/hn-ai',
          '/voice-rooms',
          '/games-hub',
          '/crypto-trading',
          '/pages-groups',
          '/geo-content',
          '/invite',
          '/sign-up-login',
          '/privacy-policy',
          '/terms-of-service',
        ],
        disallow: [
          '/admin',
          '/admin/',
          '/api/',
          '/user-settings',
          '/preferences',
          '/onboarding',
          '/monitoring',
          '/email-dashboard',
          '/growth-analytics',
          '/push-strategy',
          '/ads-manager',
          '/ads-promo',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://hnchat.net/sitemap.xml',
    host: 'https://hnchat.net',
  };
}
