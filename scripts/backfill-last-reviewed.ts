#!/usr/bin/env node --experimental-strip-types
/**
 * Backfill lastReviewed en calcs que no lo tienen.
 *
 * Estrategia honesta: usar el mtime del .json (cuando fue tocado por última
 * vez), no la fecha de hoy. Si seteo lastReviewed=hoy para 2216 calcs, le
 * estoy mintiendo a Google sobre la freshness y el sitemap movería todo
 * (viola la rule #3 de CLAUDE.md).
 *
 * El sitemap ya hace max(lastReviewed, dataUpdate.lastUpdated, mtime), así
 * que llenar lastReviewed=mtime no mueve nada del sitemap pero sí expone el
 * campo en el schema Article (donde Google lo lee como freshness signal).
 *
 * Uso:
 *   node --experimental-strip-types scripts/backfill-last-reviewed.ts
 *   node --experimental-strip-types scripts/backfill-last-reviewed.ts --dry-run
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(import.meta.dirname, '..', 'src', 'content', 'calcs');
const DRY_RUN = process.argv.includes('--dry-run');

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
let patched = 0;
let alreadyHas = 0;
let errors = 0;

for (const file of files) {
  const path = join(CALCS_DIR, file);
  try {
    const raw = readFileSync(path, 'utf8');
    const data = JSON.parse(raw);

    if (data.lastReviewed) {
      alreadyHas++;
      continue;
    }

    const mtime = statSync(path).mtime;
    const iso = mtime.toISOString().split('T')[0]; // YYYY-MM-DD

    if (DRY_RUN) {
      patched++;
      if (patched <= 5) console.log(`  [dry] ${file} → lastReviewed=${iso}`);
      continue;
    }

    // Insertar lastReviewed después de slug o al inicio si no hay slug —
    // preserva orden de keys razonable para diff-friendly.
    const newData: Record<string, unknown> = {};
    let inserted = false;
    for (const [k, v] of Object.entries(data)) {
      newData[k] = v;
      if (!inserted && (k === 'slug' || k === 'formulaId')) {
        newData.lastReviewed = iso;
        inserted = true;
      }
    }
    if (!inserted) newData.lastReviewed = iso;

    writeFileSync(path, JSON.stringify(newData, null, 2) + '\n');
    patched++;
  } catch (e) {
    errors++;
    console.error(`error en ${file}:`, (e as Error).message);
  }
}

console.log('');
console.log(`Total calcs: ${files.length}`);
console.log(`Ya tenían lastReviewed: ${alreadyHas}`);
console.log(`Patched${DRY_RUN ? ' (dry)' : ''}: ${patched}`);
console.log(`Errores: ${errors}`);
