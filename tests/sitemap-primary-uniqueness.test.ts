import { describe, expect, it } from 'vitest';
import { basename, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const PUBLIC = resolve(process.cwd(), 'public');
const locs = (xml: string) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

describe('unicidad de sitemaps primarios', () => {
  it('no repite URLs fuera de News e Images, que son extensiones deliberadas', () => {
    const index = readFileSync(resolve(PUBLIC, 'sitemap.xml'), 'utf8');
    const files = locs(index)
      .map((url) => basename(new URL(url).pathname))
      .filter((file) => !['sitemap-news.xml', 'sitemap-images.xml'].includes(file));
    const owners = new Map<string, string[]>();
    for (const file of files) {
      const xml = readFileSync(resolve(PUBLIC, file), 'utf8');
      for (const url of locs(xml)) owners.set(url, [...(owners.get(url) ?? []), file]);
    }
    const duplicates = [...owners.entries()].filter(([, sitemapFiles]) => sitemapFiles.length > 1);
    expect(duplicates, JSON.stringify(duplicates.slice(0, 20), null, 2)).toEqual([]);
  });
});
