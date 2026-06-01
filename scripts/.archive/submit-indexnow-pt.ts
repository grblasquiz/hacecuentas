/**
 * Submit solo las URLs PT a IndexNow (Bing/Yandex/etc).
 *
 * Usage: node --experimental-strip-types scripts/submit-indexnow-pt.ts
 *
 * Por qué: las calcs PT son nuevas (publicadas abril 2026) y no tienen aún
 * autoridad. IndexNow acelera el crawl de Bing; los crawls de Bing a veces
 * gatillan re-crawls de Google (aunque no garantizado).
 */

import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SITEMAP = join(ROOT, 'public', 'sitemap-pt.xml');
const KEY = '00e48c587b06495db41032c4797d9d39';
const HOST = 'hacecuentas.com';

const xml = readFileSync(SITEMAP, 'utf8');
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

console.log(`📡 IndexNow PT: ${urls.length} URLs`);

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
    console.log(`  ${engine} → ${res.status} ${res.statusText}`);
  } catch (err: any) {
    console.log(`  ✗ ${engine} → ${err.message}`);
  }
}
