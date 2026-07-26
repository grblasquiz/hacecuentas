import { readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { FRESH_MARKET_PREFIXES } from '../src/pages/sitemap-fresh.xml';

const ROOT = resolve(import.meta.dirname, '..');
const PUBLIC = resolve(ROOT, 'public');
const SITE = 'https://hacecuentas.com';
const LOC_RX = /<loc>([^<]+)<\/loc>/g;

function locs(xml: string): string[] {
  return [...xml.matchAll(LOC_RX)].map((match) => match[1]);
}

function publicFile(name: string): string {
  return readFileSync(resolve(PUBLIC, name), 'utf8');
}

describe('descubrimiento por sitemap', () => {
  it('publica sitemap-priority desde el índice principal', () => {
    const referenced = locs(publicFile('sitemap.xml')).map((url) => basename(new URL(url).pathname));
    expect(referenced).toContain('sitemap-priority.xml');
  });

  it('agrupa OG e infografía bajo un único bloque URL', () => {
    const xml = publicFile('sitemap-images.xml');
    const pageLocs = locs(xml);
    expect(new Set(pageLocs).size).toBe(pageLocs.length);
    expect((xml.match(/<image:image>/g) || []).length).toBeGreaterThanOrEqual(pageLocs.length);
  });

  it('etiqueta cada mercado nuevo en el page feed', () => {
    const rows = publicFile('google-page-feed.csv').trim().split('\n').slice(1);
    for (const market of ['pe', 'ec', 've', 'py', 'uy', 'do', 'pt-pt']) {
      const marketRows = rows.filter((row) => {
        const url = row.slice(0, row.lastIndexOf(','));
        return new URL(url).pathname.split('/').filter(Boolean)[0] === market;
      });
      expect(marketRows.length, `sin URLs del mercado ${market}`).toBeGreaterThan(0);
      expect(marketRows.every((row) => row.endsWith(`,${market}`))).toBe(true);
    }
  });

  it('incluye los siete mercados adicionales en sitemap-fresh', () => {
    for (const market of ['pe', 'ec', 've', 'py', 'uy', 'do', 'pt-pt']) {
      expect(FRESH_MARKET_PREFIXES).toContain(`/${market}/`);
    }
  });
});
