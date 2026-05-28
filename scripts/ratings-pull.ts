/**
 * Ratings pull desde D1 → db/ratings.json (consumed at build by [...slug].astro).
 *
 * Query: agrega votos por slug, filtra slugs con >= 5 votos (umbral schema.org
 * AggregateRating considerado significativo), calcula ratingValue lineal 1-5
 * según proporción ups/total.
 *
 *   value = 1 + 4 × (ups / (ups + downs))
 *
 * Resultado: 100% ups → 5.0; 50/50 → 3.0; 100% downs → 1.0.
 *
 * Output format:
 *   {
 *     "calculadora-x": { "value": 4.5, "count": 12, "ups": 11, "downs": 1 },
 *     ...
 *   }
 *
 * El [...slug].astro lee este archivo build-time y lo mergea con cualquier
 * `ratings` declarado en el propio JSON (override estático opcional).
 *
 * Uso:
 *   npx tsx scripts/ratings-pull.ts           # update db/ratings.json
 *   npx tsx scripts/ratings-pull.ts --dry     # mostrar sin escribir
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const OUTPUT = join(process.cwd(), 'db/ratings.json');
const THRESHOLD = 5;

interface VoteRow {
  slug: string;
  ups: number;
  downs: number;
  total: number;
}

interface RatingEntry {
  value: number;
  count: number;
  ups: number;
  downs: number;
}

function pullVotes(): VoteRow[] {
  const sql = `SELECT slug,
    SUM(CASE WHEN vote='up' THEN 1 ELSE 0 END) AS ups,
    SUM(CASE WHEN vote='down' THEN 1 ELSE 0 END) AS downs,
    COUNT(*) AS total
    FROM calc_votes GROUP BY slug HAVING total >= ${THRESHOLD}`;

  const out = execSync(
    `npx wrangler d1 execute hacecuentas-forms --remote --command "${sql}" --json`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] },
  );

  // Wrangler imprime JSON al final tras logs varios; tomar el primer '['
  const start = out.indexOf('[');
  if (start < 0) throw new Error('Wrangler no devolvió JSON');
  const parsed = JSON.parse(out.slice(start));
  const results = parsed?.[0]?.results || [];
  return results.map((r: any) => ({
    slug: String(r.slug || '').replace(/^\//, ''),
    ups: Number(r.ups || 0),
    downs: Number(r.downs || 0),
    total: Number(r.total || 0),
  }));
}

function buildRatings(rows: VoteRow[]): Record<string, RatingEntry> {
  const ratings: Record<string, RatingEntry> = {};
  for (const r of rows) {
    const total = r.ups + r.downs;
    if (total < THRESHOLD) continue;
    const value = 1 + 4 * (r.ups / total);
    ratings[r.slug] = {
      value: Math.round(value * 10) / 10,
      count: total,
      ups: r.ups,
      downs: r.downs,
    };
  }
  return ratings;
}

function main() {
  const dry = process.argv.includes('--dry');
  console.log(`[ratings-pull] query D1 con threshold >= ${THRESHOLD}...`);

  const rows = pullVotes();
  const ratings = buildRatings(rows);

  console.log(`[ratings-pull] slugs elegibles: ${Object.keys(ratings).length}`);
  for (const [slug, r] of Object.entries(ratings)) {
    console.log(`  ${slug}: value=${r.value} count=${r.count} (ups=${r.ups} downs=${r.downs})`);
  }

  if (dry) {
    console.log('[ratings-pull] --dry, skip write');
    return;
  }

  const dir = join(process.cwd(), 'db');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  let prev: Record<string, RatingEntry> = {};
  if (existsSync(OUTPUT)) {
    try { prev = JSON.parse(readFileSync(OUTPUT, 'utf-8')); } catch {}
  }
  const prevStr = JSON.stringify(prev);
  const nextStr = JSON.stringify(ratings, null, 2);
  if (prevStr === JSON.stringify(ratings)) {
    console.log('[ratings-pull] sin cambios, skip write');
    return;
  }

  writeFileSync(OUTPUT, nextStr + '\n', 'utf-8');
  console.log(`[ratings-pull] escrito ${OUTPUT}`);
}

main();
