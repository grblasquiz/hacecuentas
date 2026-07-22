/**
 * check-stale-data.ts
 *
 * Recorre todos los calcs en src/content/calcs* (el dir base + un dir por
 * vertical país: calcs-cl, calcs-co, calcs-mx, …), lee su `dataUpdate.frequency`
 * + `dataUpdate.lastUpdated` y detecta cuáles están vencidos (excedieron la
 * frequency esperada con cierto margen de gracia).
 *
 * Uso:
 *   node --experimental-strip-types scripts/check-stale-data.ts
 *   node --experimental-strip-types scripts/check-stale-data.ts --json     # output JSON crudo
 *   node --experimental-strip-types scripts/check-stale-data.ts --threshold=5  # exit 1 si stale > N
 *
 * Output por defecto: markdown agrupado por categoría, listo para pegar en
 * un issue de GitHub o un mensaje de Slack.
 *
 * Diseñado para correr en GH Action (.github/workflows/check-stale-data.yml).
 * Si stale > threshold, sale con código 2 (señal de "abrir issue") — código 0
 * normal, código 1 sólo si hay error fatal.
 */

import { readFileSync, readdirSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Dir de snapshots "live" refrescados por el cron de datos (fetch-*.mjs → 1x/día).
const LIVE_DIR = join(process.cwd(), 'src/data/live');

/**
 * updateType `auto-live`: el dato real del calc NO vive en su JSON de contenido
 * sino en un snapshot de src/data/live/<liveSource>.json que un cron refresca a
 * diario y el build re-bundlea. Para estos calcs `dataUpdate.lastUpdated` es
 * irrelevante para la frescura: lo que importa es qué tan fresco está el live file.
 * `liveSource` acepta varios nombres separados por coma (ej. "venezuela,colombia");
 * se evalúa el MÁS VIEJO de todos.
 * Devuelve la fecha efectiva de frescura (ISO YYYY-MM-DD) o null si no se pudo
 * resolver ningún source (en ese caso se cae al lastUpdated del calc).
 */
function resolveLiveFreshness(liveSource: string): { date: string; oldest: string } | null {
  let oldestMs = Infinity;
  let oldestName = '';
  for (const name of liveSource.split(',').map((s) => s.trim()).filter(Boolean)) {
    const file = join(LIVE_DIR, `${name}.json`);
    if (!existsSync(file)) continue;
    let ms = statSync(file).mtimeMs;
    try {
      const fetchedAt = JSON.parse(readFileSync(file, 'utf8'))?._meta?.fetchedAt;
      if (fetchedAt) {
        const t = new Date(fetchedAt).getTime();
        if (!Number.isNaN(t)) ms = t;
      }
    } catch {
      /* mtime como fallback */
    }
    if (ms < oldestMs) {
      oldestMs = ms;
      oldestName = name;
    }
  }
  if (!Number.isFinite(oldestMs)) return null;
  return { date: new Date(oldestMs).toISOString().slice(0, 10), oldest: oldestName };
}

const CONTENT_DIR = join(process.cwd(), 'src/content');
// El catálogo vive en varios directorios: el base `calcs/` + un dir por vertical
// país (`calcs-cl`, `calcs-co`, `calcs-mx`, …). Se recorren TODOS. Antes miraba
// sólo `calcs/` y era ciego al ~53% del catálogo (los verticales país, justo
// donde viven los datos que cambian a mitad de año: salarios mínimos, tarifas).
// Lazy: sólo se toca el filesystem en modo local; el modo --from-url no lo llama.
function calcsDirs(): string[] {
  return readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^calcs(-|$)/.test(d.name))
    .map((d) => join(CONTENT_DIR, d.name));
}

type Frequency =
  | 'never'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'biannual'
  | 'yearly'
  | 'annual';

// Días de gracia por frequency. Más permisivos que freshness.ts del pipeline
// porque acá el objetivo es alertar sólo cuando realmente se atrasó (no en
// el límite exacto). Ej: monthly real-world = 45 días sin update.
// `annual` es alias de `yearly` y `quarterly` = trimestral: ambos se usan en las
// calcs país; sin ellos el umbral daba undefined → overdue NaN + falsos positivos.
const STALE_THRESHOLD_DAYS: Record<Frequency, number> = {
  never: Infinity,
  daily: 3, // tolerancia de 3 días por feriados / fines de semana
  weekly: 14,
  monthly: 45, // ~6 semanas
  quarterly: 120, // trimestral (~4 meses de gracia)
  biannual: 200, // ~6.5 meses
  yearly: 400, // ~13 meses
  annual: 400, // alias de yearly
};

interface CalcInfo {
  slug: string;
  file: string;
  category: string;
  frequency: Frequency;
  updateType: string;
  lastUpdated: string;
  daysSinceUpdate: number;
  thresholdDays: number;
  source?: string;
  sourceUrl?: string;
  notes?: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    json: args.includes('--json'),
    // En modo strict, el exit code para "stale > threshold" es 1 (rompe el
    // build) en lugar del 2 informativo. Usar en prebuild si querés bloquear
    // deploys cuando hay datos muy desactualizados.
    strict: args.includes('--strict'),
    // Fuente remota: en vez de leer el filesystem local, fetchea el índice de
    // frescura publicado en prod (public/api/freshness.json). Lo usa el workflow
    // de GitHub Actions para no depender del checkout de origin (forkeado) ni de
    // la máquina de Martin. Ej: --from-url=https://hacecuentas.com/api/freshness.json
    fromUrl: (() => {
      const arg = args.find((a) => a.startsWith('--from-url='));
      return arg ? arg.split('=').slice(1).join('=') : null;
    })(),
    threshold: (() => {
      const arg = args.find((a) => a.startsWith('--threshold='));
      return arg ? Number.parseInt(arg.split('=')[1] ?? '5', 10) : 5;
    })(),
    outFile: (() => {
      const arg = args.find((a) => a.startsWith('--out='));
      return arg ? arg.split('=')[1] : null;
    })(),
  };
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

/** Evalúa una calc (frequency + lastUpdated) contra su umbral de gracia.
 *  Devuelve el CalcInfo si está vencida, o null si está fresca / sin cadencia. */
function evaluate(
  f: {
    slug: string; file: string; category?: string; frequency?: string;
    lastUpdated?: string; updateType?: string; source?: string; sourceUrl?: string; notes?: string;
  },
  now: Date
): CalcInfo | null {
  if (!f.frequency || !f.lastUpdated) return null;
  const freq = f.frequency as Frequency;
  if (freq === 'never') return null;
  const last = new Date(`${f.lastUpdated}T00:00:00Z`);
  if (Number.isNaN(last.getTime())) return null;
  const daysSince = daysBetween(now, last);
  const threshold = STALE_THRESHOLD_DAYS[freq];
  if (threshold === undefined || daysSince <= threshold) return null;
  return {
    slug: f.slug,
    file: f.file,
    category: f.category ?? 'sin-categoria',
    frequency: freq,
    updateType: f.updateType ?? 'manual',
    lastUpdated: f.lastUpdated,
    daysSinceUpdate: daysSince,
    thresholdDays: threshold,
    source: f.source,
    sourceUrl: f.sourceUrl,
    notes: f.notes,
  };
}

/** Slugs podados (301 en pruning-redirects.ts): sin URL viva, no cuentan como stale. */
function prunedSlugs(): Set<string> {
  const out = new Set<string>();
  const file = join(process.cwd(), 'src/lib/pruning-redirects.ts');
  if (!existsSync(file)) return out;
  for (const m of readFileSync(file, 'utf8').matchAll(/'\/(?:[a-z-]+\/)?([^'/]+)':/g)) out.add(m[1]);
  return out;
}

/** Lee el catálogo del filesystem local (todos los dirs calcs*). */
function loadCalcsFromFs(): CalcInfo[] {
  const now = new Date();
  const out: CalcInfo[] = [];
  const pruned = prunedSlugs();
  for (const dir of calcsDirs()) {
    const dirName = dir.split('/').pop() ?? 'calcs';
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      let raw: any;
      try {
        raw = JSON.parse(readFileSync(join(dir, file), 'utf8'));
      } catch (err) {
        console.error(`[check-stale-data] ✗ ${dirName}/${file}: JSON inválido — ${(err as Error).message}`);
        continue;
      }
      const du = raw?.dataUpdate;
      if (!du) continue;
      if (pruned.has(raw?.slug) || pruned.has(file.replace(/\.json$/, ''))) continue; // podada → 301, sin URL viva
      // auto-live: la frescura se mide contra el snapshot del cron, no contra
      // el lastUpdated del calc JSON (que solo marca la última edición editorial).
      let effectiveLastUpdated: string | undefined = du.lastUpdated;
      let liveNote: string | undefined;
      if (du.updateType === 'auto-live' && typeof du.liveSource === 'string') {
        const live = resolveLiveFreshness(du.liveSource);
        if (live) {
          effectiveLastUpdated = live.date;
          liveNote = `live source stale: src/data/live/${live.oldest}.json (fetchedAt/mtime ${live.date})`;
        }
      }
      const info = evaluate(
        { slug: raw.slug, file: `${dirName}/${file}`, category: raw.category, frequency: du.frequency,
          lastUpdated: effectiveLastUpdated, updateType: du.updateType, source: du.source, sourceUrl: du.sourceUrl,
          notes: liveNote ?? du.notes },
        now
      );
      if (info) out.push(info);
    }
  }
  return out;
}

/** Fetchea el índice de frescura publicado en prod (public/api/freshness.json).
 *  Modo usado por el workflow de GitHub Actions — no depende del filesystem ni
 *  del checkout de origin (forkeado): la verdad vive en prod (deploy local). */
async function loadCalcsFromUrl(url: string): Promise<CalcInfo[]> {
  const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
  if (!res.ok) throw new Error(`fetch ${url} → HTTP ${res.status}`);
  const data: any = await res.json();
  const entries: any[] = Array.isArray(data) ? data : (data.calcs ?? []);
  const now = new Date();
  const out: CalcInfo[] = [];
  for (const e of entries) {
    const info = evaluate(
      { slug: e.slug, file: `${e.locale ?? '?'}/${e.slug}`, category: e.category, frequency: e.frequency,
        lastUpdated: e.lastUpdated, updateType: e.updateType, source: e.source, sourceUrl: e.sourceUrl, notes: e.notes },
      now
    );
    if (info) out.push(info);
  }
  return out;
}

function renderMarkdown(stale: CalcInfo[]): string {
  if (stale.length === 0) {
    return '# Datos vencidos\n\nNo hay calcs con datos vencidos.\n';
  }
  // Sort within group by daysSinceUpdate desc (más viejos primero)
  const byCat = new Map<string, CalcInfo[]>();
  for (const c of stale) {
    const arr = byCat.get(c.category) ?? [];
    arr.push(c);
    byCat.set(c.category, arr);
  }

  const lines: string[] = [];
  lines.push(`# Datos vencidos — ${stale.length} calc${stale.length === 1 ? '' : 's'}`);
  lines.push('');
  lines.push(`Detección automática contra \`dataUpdate.frequency\` + \`dataUpdate.lastUpdated\`.`);
  lines.push('Una calc se considera vencida cuando `lastUpdated` quedó por encima del umbral de su frequency:');
  lines.push('');
  lines.push('| Frequency | Umbral (días) |');
  lines.push('| --- | --- |');
  for (const [k, v] of Object.entries(STALE_THRESHOLD_DAYS)) {
    if (k === 'never') continue;
    lines.push(`| \`${k}\` | ${v} |`);
  }
  lines.push('');

  const cats = [...byCat.keys()].sort();
  for (const cat of cats) {
    const arr = byCat.get(cat)!.sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate);
    lines.push(`## ${cat} (${arr.length})`);
    lines.push('');
    lines.push('| Calc | Frequency | Última actualización | Días vencido | Update type | Fuente |');
    lines.push('| --- | --- | --- | --- | --- | --- |');
    for (const c of arr) {
      const overdue = c.daysSinceUpdate - c.thresholdDays;
      const sourceCell = c.sourceUrl ? `[${c.source ?? 'link'}](${c.sourceUrl})` : (c.source ?? '—');
      lines.push(
        `| \`${c.slug}\` | ${c.frequency} | ${c.lastUpdated} | ${c.daysSinceUpdate} (+${overdue}) | ${c.updateType} | ${sourceCell} |`
      );
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('Ejecutar `npm run validate:data` o el pipeline `scripts/update-data/index.ts` para refrescar los que tengan fetcher implementado.');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const opts = parseArgs();
  const stale = opts.fromUrl ? await loadCalcsFromUrl(opts.fromUrl) : loadCalcsFromFs();

  if (opts.json) {
    const out = JSON.stringify({ count: stale.length, threshold: opts.threshold, items: stale }, null, 2);
    if (opts.outFile) writeFileSync(opts.outFile, out);
    else console.log(out);
  } else {
    const md = renderMarkdown(stale);
    if (opts.outFile) writeFileSync(opts.outFile, md);
    else console.log(md);
  }

  // Resumen machine-readable que el workflow puede grepear
  console.log(`STALE_SUMMARY::${JSON.stringify({ count: stale.length, threshold: opts.threshold, strict: opts.strict })}`);

  // Exit codes:
  //   0 = OK (stale ≤ threshold)
  //   1 = error fatal (siempre)
  //   2 = stale > threshold, modo informativo (abrir issue, no rompe build)
  //   En --strict, "stale > threshold" sale con 1 para romper builds.
  if (stale.length > opts.threshold) process.exit(opts.strict ? 1 : 2);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
