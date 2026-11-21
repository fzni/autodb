import { MetadataRoute } from 'next';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://autodb.tech';
  const now = new Date();

  // 1. Core Platform Pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/brands`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // 2. Auto-Index ALL Vehicle Pages dynamically from SQLite database
  try {
    const db = getDb();
    const vehicles = db
      .prepare('SELECT slug, updated_at, created_at FROM vehicles ORDER BY created_at DESC')
      .all() as {
      slug: string;
      updated_at?: string;
      created_at?: string;
    }[];

    for (const v of vehicles) {
      if (v.slug) {
        routes.push({
          url: `${baseUrl}/vehicles/${v.slug}`,
          lastModified: new Date(v.updated_at || v.created_at || now),
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      }
    }
  } catch (err) {
    console.error('Error auto-indexing vehicles in sitemap:', err);
  }

  // 3. Contributor Public User Profile routes
  try {
    const db = getDb();
    const users = db.prepare('SELECT handle, created_at FROM users').all() as {
      handle: string;
      created_at?: string;
    }[];

    for (const u of users) {
      if (u.handle) {
        const cleanHandle = String(u.handle).replace(/^@/, '');
        routes.push({
          url: `${baseUrl}/u/${cleanHandle}`,
          lastModified: new Date(u.created_at || now),
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }
  } catch (err) {
    console.error('Error auto-indexing contributor profiles in sitemap:', err);
  }

  return routes;
}
