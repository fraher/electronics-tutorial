import type { MetadataRoute } from 'next';
import { CHAPTERS } from '@/lib/chapters';
import { getAllBriefs } from '@/lib/briefs';

// Local-only project — base URL is the relative root. Static export emits
// this as /sitemap.xml at build time. URLs are root-relative so the file
// works regardless of how the operator serves the /out tree.
const BASE = '';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
  ];
  for (const c of CHAPTERS) {
    entries.push({
      url: `${BASE}/chapter/${c.id}/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    });
  }
  for (const b of getAllBriefs()) {
    entries.push({
      url: `${BASE}/chapter/${b.chapter}/experiment/${b.number}/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }
  return entries;
}
