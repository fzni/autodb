import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/vehicles/', '/brands', '/compare', '/about', '/u/', '/llms.txt'],
        disallow: ['/studio', '/api/', '/_next/'],
      },
      // Explicitly invite AI search & answer engines (Perplexity, ChatGPT, Gemini, Claude, Applebot)
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Google-Extended',
          'Applebot-Extended',
          'cohere-ai',
        ],
        allow: ['/', '/vehicles/', '/brands', '/compare', '/about', '/u/', '/llms.txt'],
        disallow: ['/studio', '/api/'],
      },
    ],
    sitemap: 'https://autodb.tech/sitemap.xml',
    host: 'https://autodb.tech',
  };
}
