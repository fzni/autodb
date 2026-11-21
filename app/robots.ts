import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/vehicles/', '/brands', '/compare', '/about', '/u/'],
        disallow: ['/studio', '/api/', '/_next/'],
      },
    ],
    sitemap: 'https://autodb.tech/sitemap.xml',
    host: 'https://autodb.tech',
  };
}
