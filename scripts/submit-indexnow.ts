/**
 * Submit all site URLs to IndexNow (Bing, Yandex, Seznam, Naver).
 * IndexNow accepts up to 10,000 URLs per request.
 *
 * Usage: npx tsx scripts/submit-indexnow.ts
 */

import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const SITEMAP = join(ROOT, 'public', 'sitemap.xml');

const KEY = '00e48c587b06495db41032c4797d9d39';
const HOST = 'hacecuentas.com';

// Extract all <loc> URLs from sitemap
const xml = readFileSync(SITEMAP, 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

console.log(`📡 IndexNow: submitting ${urls.length} URLs...`);

const engines = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

for (const engine of engines) {
  try {
    const res = await fetch(engine, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList: urls,
      }),
    });
    console.log(`  ✓ ${engine} → ${res.status} ${res.statusText}`);
  } catch (err: any) {
    console.log(`  ✗ ${engine} → ${err.message}`);
  }
}

console.log('✅ Done!');
