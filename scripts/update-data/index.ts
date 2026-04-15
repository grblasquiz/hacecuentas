/**
 * Orchestrator del pipeline de actualización.
 *
 * Uso:
 *   node --experimental-strip-types scripts/update-data/index.ts                  # corre todos los fetchers
 *   node --experimental-strip-types scripts/update-data/index.ts --frequency=daily
 *   node --experimental-strip-types scripts/update-data/index.ts --frequency=monthly
 *   node --experimental-strip-types scripts/update-data/index.ts --dry            # sin escribir
 *   node --experimental-strip-types scripts/update-data/index.ts --fetcher=dolar  # uno solo
 *   node --experimental-strip-types scripts/update-data/index.ts --report         # solo reporta cobertura
 *
 * Diseñado para correr en GitHub Actions. Al terminar:
 *   - Sale con código 0 siempre (aún sin cambios) para no romper el workflow
 *   - Imprime un resumen machine-readable en la última línea: SUMMARY::{json}
 *   - El workflow usa git diff para detectar si hay cambios y abrir PR
 */

import { REGISTRY, IMPLEMENTED_SLUGS } from './registry.ts';
import { listAllCalcs, filterByFrequency, isStale, type Frequency } from './utils/freshness.ts';
import { createLogger } from './utils/logger.ts';

const log = createLogger('update-data');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    frequency: 'all' as Frequency | 'all',
    fetcher: null as string | null,
    dry: false,
    report: false,
  };
  for (const a of args) {
    if (a.startsWith('--frequency=')) opts.frequency = a.split('=')[1] as any;
    else if (a.startsWith('--fetcher=')) opts.fetcher = a.split('=')[1];
    else if (a === '--dry' || a === '--dry-run') opts.dry = true;
    else if (a === '--report') opts.report = true;
  }
  return opts;
}

function printCoverageReport() {
  const calcs = listAllCalcs();
  const needsUpdate = calcs.filter((c) => c.frequency !== 'never');
  const implemented = needsUpdate.filter((c) => IMPLEMENTED_SLUGS.has(c.slug));
  const notImplemented = needsUpdate.filter((c) => !IMPLEMENTED_SLUGS.has(c.slug));

  console.log(`\n=== Cobertura del pipeline ===`);
  console.log(`Total calcs: ${calcs.length}`);
  console.log(`Requieren update: ${needsUpdate.length}`);
  console.log(`  ✓ con fetcher: ${implemented.length}`);
  console.log(`  ✗ pendientes: ${notImplemented.length}\n`);

  const byType = new Map<string, typeof notImplemented>();
  for (const c of notImplemented) {
    const arr = byType.get(c.updateType) || [];
    arr.push(c);
    byType.set(c.updateType, arr);
  }
  for (const [ut, cs] of byType) {
    console.log(`  [${ut}] (${cs.length})`);
    for (const c of cs) {
      console.log(`    · ${c.slug} — ${c.source || 'sin fuente'}  (${c.frequency})`);
    }
  }
  console.log('');
}

async function runFetcher(entry: typeof REGISTRY[number], dry: boolean): Promise<{ name: string; changed: boolean; error?: string }> {
  try {
    const changed = await entry.run({ dry });
    return { name: entry.name, changed };
  } catch (err) {
    const msg = (err as Error).message;
    log.error(`${entry.name}: ${msg}`);
    return { name: entry.name, changed: false, error: msg };
  }
}

async function main() {
  const opts = parseArgs();

  if (opts.report) {
    printCoverageReport();
    return;
  }

  log.info(`frequency=${opts.frequency} fetcher=${opts.fetcher || 'all'} dry=${opts.dry}`);

  let toRun = REGISTRY;
  if (opts.fetcher) {
    toRun = toRun.filter((e) => e.name === opts.fetcher);
    if (toRun.length === 0) {
      log.error(`fetcher "${opts.fetcher}" no existe. Disponibles: ${REGISTRY.map((e) => e.name).join(', ')}`);
      process.exit(1);
    }
  }
  if (opts.frequency !== 'all') {
    toRun = toRun.filter((e) => e.frequency === opts.frequency);
  }

  if (toRun.length === 0) {
    log.info('nada para correr');
    console.log(`SUMMARY::${JSON.stringify({ ran: 0, changed: 0, errors: 0 })}`);
    return;
  }

  log.info(`corriendo ${toRun.length} fetchers`);
  const results = [];
  for (const entry of toRun) {
    results.push(await runFetcher(entry, opts.dry));
  }

  const changed = results.filter((r) => r.changed).length;
  const errors = results.filter((r) => r.error).length;
  log.info(`terminado · ${changed}/${results.length} con cambios · ${errors} errores`);

  // Summary machine-readable para que el workflow lo parsee
  const summary = {
    ran: results.length,
    changed,
    errors,
    dry: opts.dry,
    details: results.map((r) => ({ name: r.name, changed: r.changed, error: r.error ?? null })),
  };
  console.log(`SUMMARY::${JSON.stringify(summary)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
