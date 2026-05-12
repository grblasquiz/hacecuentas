/**
 * bump-lastmod.ts — toca `lastReviewed` (y opcionalmente `dataUpdate.lastUpdated`)
 * de uno o más calcs sin abrir el JSON a mano.
 *
 * Para qué sirve: cuando hiciste una mejora de contenido user-facing en un calc
 * (mejor copy, FAQ extendido, fix de un nro, schema nuevo) y querés que Google
 * lo vea como cambio fresco en el próximo sitemap, sin tener que recordar la
 * sintaxis exacta de `dataUpdate` o abrir el JSON.
 *
 * Uso:
 *   npm run bump-lastmod -- calc-slug                         # bumpea lastReviewed = hoy
 *   npm run bump-lastmod -- slug-a slug-b slug-c              # múltiples
 *   npm run bump-lastmod -- --data slug                       # también bumpea dataUpdate.lastUpdated
 *   npm run bump-lastmod -- --date=2026-05-10 slug            # fecha explícita
 *   npm run bump-lastmod -- --glob="calculadora-uva*"         # glob match contra slugs
 *   npm run bump-lastmod -- --dry slug                        # no escribe, solo reporta
 *
 * Reglas SEO:
 *   - Solo úsalo cuando REALMENTE cambió algo user-facing. Bumpear sin cambio
 *     real envenena la confianza del sitemap (Google detecta el patrón).
 *   - Si tocaste solo el .ts de la fórmula, también ejecutá esto sobre el slug
 *     del calc — el JSON tiene que moverse para que el sitemap lo refleje.
 *   - Para data refrescada por el pipeline (BCRA/IPC/dolar), NO uses esto —
 *     ese pipeline ya bumpea `dataUpdate.lastUpdated` con `touchLastUpdated`.
 *
 * Salida: lista de calcs tocados con la fecha previa y nueva.
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src/content/calcs');
const DATE_RX = /^\d{4}-\d{2}-\d{2}$/;

interface Opts {
  slugs: string[];
  date: string;
  alsoData: boolean;
  glob: string | null;
  dry: boolean;
}

function parseArgs(): Opts {
  const args = process.argv.slice(2);
  const today = new Date().toISOString().slice(0, 10);
  const opts: Opts = {
    slugs: [],
    date: today,
    alsoData: false,
    glob: null,
    dry: false,
  };
  for (const a of args) {
    if (a === '--data') opts.alsoData = true;
    else if (a === '--dry' || a === '--dry-run') opts.dry = true;
    else if (a.startsWith('--date=')) opts.date = a.split('=')[1] ?? today;
    else if (a.startsWith('--glob=')) opts.glob = a.split('=')[1] ?? null;
    else if (a.startsWith('--')) {
      console.error(`flag desconocido: ${a}`);
      process.exit(1);
    } else {
      opts.slugs.push(a);
    }
  }
  if (!DATE_RX.test(opts.date)) {
    console.error(`fecha inválida (esperado YYYY-MM-DD): ${opts.date}`);
    process.exit(1);
  }
  const today2 = new Date().toISOString().slice(0, 10);
  if (opts.date > today2) {
    console.error(`fecha futura no permitida (sería clampeada a today por el sitemap): ${opts.date}`);
    process.exit(1);
  }
  return opts;
}

/** Mapea slug → archivo (cache única scan del directorio). */
function buildSlugIndex(): Map<string, string> {
  const idx = new Map<string, string>();
  for (const f of readdirSync(CALCS_DIR).filter((x) => x.endsWith('.json'))) {
    try {
      const c = JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8'));
      if (c.slug) idx.set(c.slug, f);
    } catch {}
  }
  return idx;
}

function globMatch(pattern: string, slug: string): boolean {
  const rx = new RegExp(
    '^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$',
  );
  return rx.test(slug);
}

function bumpOne(file: string, date: string, alsoData: boolean, dry: boolean): { changed: boolean; prev: string | undefined; prevDu: string | undefined } {
  const full = join(CALCS_DIR, file);
  const calc = JSON.parse(readFileSync(full, 'utf8'));
  const prev = calc.lastReviewed;
  const prevDu = calc?.dataUpdate?.lastUpdated;
  let changed = false;

  if (prev !== date) {
    calc.lastReviewed = date;
    changed = true;
  }
  if (alsoData) {
    if (!calc.dataUpdate) calc.dataUpdate = {};
    if (calc.dataUpdate.lastUpdated !== date) {
      calc.dataUpdate.lastUpdated = date;
      changed = true;
    }
  }

  if (changed && !dry) {
    writeFileSync(full, JSON.stringify(calc, null, 2) + '\n', 'utf8');
  }
  return { changed, prev, prevDu };
}

function main() {
  const opts = parseArgs();
  const index = buildSlugIndex();
  const targets = new Set<string>(opts.slugs);

  if (opts.glob) {
    for (const slug of index.keys()) {
      if (globMatch(opts.glob, slug)) targets.add(slug);
    }
  }

  if (targets.size === 0) {
    console.error('sin targets. Pasá slug(s) o --glob=<pattern>.');
    process.exit(1);
  }

  let bumped = 0;
  let missing = 0;
  let unchanged = 0;
  const action = opts.dry ? 'WOULD BUMP' : 'BUMPED';

  for (const slug of [...targets].sort()) {
    const file = index.get(slug);
    if (!file) {
      console.error(`  MISS  ${slug} — slug no encontrado`);
      missing++;
      continue;
    }
    const r = bumpOne(file, opts.date, opts.alsoData, opts.dry);
    if (!r.changed) {
      console.log(`  SKIP  ${slug} — ya estaba en ${opts.date}`);
      unchanged++;
      continue;
    }
    const dataStr = opts.alsoData ? ` data:${r.prevDu ?? '∅'}→${opts.date}` : '';
    console.log(`  ${action}  ${slug}  lr:${r.prev ?? '∅'}→${opts.date}${dataStr}`);
    bumped++;
  }

  console.log('');
  console.log(`Resumen: ${bumped} bump · ${unchanged} skip · ${missing} miss · date=${opts.date}${opts.alsoData ? ' · also data' : ''}${opts.dry ? ' · DRY' : ''}`);

  if (missing > 0 && targets.size === missing) process.exit(2);
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
