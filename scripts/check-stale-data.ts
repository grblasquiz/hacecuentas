/**
 * check-stale-data.ts
 *
 * Recorre todos los calcs en src/content/calcs/, lee su `dataUpdate.frequency`
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

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src/content/calcs');

type Frequency = 'never' | 'daily' | 'weekly' | 'monthly' | 'biannual' | 'yearly';

// Días de gracia por frequency. Más permisivos que freshness.ts del pipeline
// porque acá el objetivo es alertar sólo cuando realmente se atrasó (no en
// el límite exacto). Ej: monthly real-world = 45 días sin update.
const STALE_THRESHOLD_DAYS: Record<Frequency, number> = {
  never: Infinity,
  daily: 3, // tolerancia de 3 días por feriados / fines de semana
  weekly: 14,
  monthly: 45, // ~6 semanas
  biannual: 200, // ~6.5 meses
  yearly: 400, // ~13 meses
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

function loadCalcs(): CalcInfo[] {
  const now = new Date();
  const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
  const out: CalcInfo[] = [];
  for (const file of files) {
    let raw: any;
    try {
      raw = JSON.parse(readFileSync(join(CALCS_DIR, file), 'utf8'));
    } catch (err) {
      console.error(`[check-stale-data] ✗ ${file}: JSON inválido — ${(err as Error).message}`);
      continue;
    }
    const du = raw?.dataUpdate;
    if (!du || !du.frequency || !du.lastUpdated) continue;
    const freq = du.frequency as Frequency;
    if (freq === 'never') continue;
    const lastUpdated = du.lastUpdated as string;
    const last = new Date(`${lastUpdated}T00:00:00Z`);
    if (Number.isNaN(last.getTime())) continue;
    const daysSince = daysBetween(now, last);
    const threshold = STALE_THRESHOLD_DAYS[freq];
    if (daysSince <= threshold) continue;
    out.push({
      slug: raw.slug,
      file,
      category: raw.category ?? 'sin-categoria',
      frequency: freq,
      updateType: du.updateType ?? 'manual',
      lastUpdated,
      daysSinceUpdate: daysSince,
      thresholdDays: threshold,
      source: du.source,
      sourceUrl: du.sourceUrl,
      notes: du.notes,
    });
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

function main() {
  const opts = parseArgs();
  const stale = loadCalcs();

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
  console.log(`STALE_SUMMARY::${JSON.stringify({ count: stale.length, threshold: opts.threshold })}`);

  // Exit codes: 0 normal, 2 = "stale > threshold, abrir issue", 1 = error fatal
  if (stale.length > opts.threshold) process.exit(2);
}

try {
  main();
} catch (err) {
  console.error(err);
  process.exit(1);
}
