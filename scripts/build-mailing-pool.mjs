#!/usr/bin/env node
/**
 * build-mailing-pool.mjs — genera el pool curado de calcs para el mailing 2×/semana.
 *
 * Qué hace:
 *   1. Corre scripts/ga4-top-pages.py (top por pageviews, 90 días) → ranking real de tráfico.
 *   2. Mapea cada pagePath a su JSON de calc AR (src/content/calcs/, por el campo `slug`).
 *      Esto descarta home, /guias, y las calcs de otros locales (/cl, /co, ...) solas.
 *   3. Toma las top POOL_SIZE calcs con answerSnippet no vacío.
 *   4. Emite:
 *        db/mailing-pool.sql   → DELETE + INSERT OR REPLACE para seedear D1
 *        db/mailing-pool.json  → mismo pool legible, para inspección/versionado
 *
 * Uso:
 *   node scripts/build-mailing-pool.mjs            # default 200 calcs, 90 días
 *   node scripts/build-mailing-pool.mjs --size 250 --days 120
 *
 * Después seedear D1:
 *   npx wrangler d1 execute hacecuentas-forms --remote --file=db/mailing-pool.sql
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CALCS_DIR = path.join(ROOT, 'src/content/calcs');
const args = process.argv.slice(2);
const argVal = (flag, def) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : def);
const POOL_SIZE = parseInt(argVal('--size', '200'), 10);
const DAYS = parseInt(argVal('--days', '90'), 10);

/** Limpia markdown/HTML inline a texto plano para el email. */
function cleanText(s) {
  return String(s || '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')   // [texto](url) → texto
    .replace(/\*\*([^*]+)\*\*/g, '$1')          // **bold** → bold
    .replace(/\*([^*]+)\*/g, '$1')              // *it* → it
    .replace(/`([^`]+)`/g, '$1')                // `code` → code
    .replace(/<[^>]+>/g, '')                    // tags sueltos
    .replace(/\s+/g, ' ')
    .trim();
}

/** Corta a maxLen sin partir palabras, agrega … si recortó. */
function truncate(s, maxLen = 320) {
  if (s.length <= maxLen) return s;
  const cut = s.slice(0, maxLen);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:\s]+$/, '') + '…';
}

const sqlStr = (s) => `'${String(s).replace(/'/g, "''")}'`;

// ── 1. Ranking GA4 ────────────────────────────────────────────────────────
console.error(`[pool] corriendo GA4 top pages (${DAYS}d)…`);
let ga4out;
try {
  ga4out = execFileSync('python3', [
    path.join(ROOT, 'scripts/ga4-top-pages.py'),
    '--days', String(DAYS), '--top', '700',
  ], { encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
} catch (e) {
  console.error('[pool] ERROR corriendo GA4:', e.message);
  process.exit(1);
}

// Líneas tipo:  "   8,805  /calculadora-imc"
const ranked = [];
for (const line of ga4out.split('\n')) {
  const m = line.match(/^\s*([\d,]+)\s+(\/\S*)\s*$/);
  if (!m) continue;
  const pv = parseInt(m[1].replace(/,/g, ''), 10);
  const slug = m[2].replace(/^\/+|\/+$/g, '');   // '/calculadora-imc' → 'calculadora-imc'
  if (slug) ranked.push({ slug, pv });
}
console.error(`[pool] GA4 devolvió ${ranked.length} paths`);

// ── 2. Índice de calcs AR por slug ────────────────────────────────────────
const bySlug = new Map();
for (const f of fs.readdirSync(CALCS_DIR).filter((x) => x.endsWith('.json'))) {
  try {
    const j = JSON.parse(fs.readFileSync(path.join(CALCS_DIR, f), 'utf8'));
    const s = String(j.slug || '').replace(/^\/+|\/+$/g, '');
    if (s) bySlug.set(s, j);
  } catch { /* ignore */ }
}

// ── 3. Match ranking → calcs AR con answerSnippet ─────────────────────────
const pool = [];
const seen = new Set();
for (const { slug } of ranked) {
  if (pool.length >= POOL_SIZE) break;
  if (seen.has(slug)) continue;
  const j = bySlug.get(slug);                    // solo AR (las locale no están en este dir)
  if (!j) continue;
  const snippet = cleanText(j.answerSnippet || j.intro);
  if (!snippet) continue;
  seen.add(slug);
  pool.push({
    slug,
    title: cleanText(j.h1 || j.title),
    answer_snippet: truncate(snippet, 320),
    category: j.category || '',
    url: `https://hacecuentas.com/${slug}`,
    rank: pool.length + 1,
  });
}

if (pool.length < 10) {
  console.error(`[pool] muy pocos matches (${pool.length}) — algo anda mal, abortando.`);
  process.exit(1);
}

// ── 4. Emitir SQL + JSON ──────────────────────────────────────────────────
const sqlLines = [
  '-- AUTOGENERADO por scripts/build-mailing-pool.mjs — NO editar a mano.',
  `-- ${pool.length} calcs, top por pageviews GA4 (${DAYS}d). Re-seedeá corriendo el script.`,
  'DELETE FROM mailing_pool;',
];
for (const c of pool) {
  sqlLines.push(
    `INSERT OR REPLACE INTO mailing_pool (slug, title, answer_snippet, category, url, rank) VALUES (` +
    `${sqlStr(c.slug)}, ${sqlStr(c.title)}, ${sqlStr(c.answer_snippet)}, ${sqlStr(c.category)}, ${sqlStr(c.url)}, ${c.rank});`,
  );
}
fs.writeFileSync(path.join(ROOT, 'db/mailing-pool.sql'), sqlLines.join('\n') + '\n');
fs.writeFileSync(path.join(ROOT, 'db/mailing-pool.json'), JSON.stringify(pool, null, 2) + '\n');

console.error(`[pool] OK — ${pool.length} calcs → db/mailing-pool.sql + db/mailing-pool.json`);
console.error('[pool] top 5:');
for (const c of pool.slice(0, 5)) console.error(`  #${c.rank} ${c.title}  (${c.url})`);
