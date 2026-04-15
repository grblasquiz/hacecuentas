/**
 * Inyecta un CACHE_VERSION único en public/sw.js en cada build.
 *
 * ¿Por qué? Si el sw.js no cambia byte a byte, el browser NO reinstala
 * el service worker → los caches viejos persisten → el usuario ve la
 * versión anterior. Al inyectar un timestamp en CACHE_VERSION, forzamos
 * reinstalación del SW en cada deploy → purga de caches → contenido fresco.
 *
 * Corre en prebuild antes de astro build.
 * Usage: npm run stamp-sw
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SW_PATH = join(process.cwd(), 'public/sw.js');
const buildId = `hc-${Date.now()}`;

const content = readFileSync(SW_PATH, 'utf8');
const stamped = content.replace(
  /const CACHE_VERSION = '[^']+'/,
  `const CACHE_VERSION = '${buildId}'`
);

writeFileSync(SW_PATH, stamped, 'utf8');
console.log(`✓ sw.js → CACHE_VERSION = '${buildId}'`);
