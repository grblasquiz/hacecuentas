/**
 * Toma la propuesta generada en scripts/data-updates-proposed.json y la aplica
 * a cada JSON en src/content/calcs/*.json agregando el campo `dataUpdate`.
 *
 * Uso:
 *   node --experimental-strip-types scripts/migrate-data-updates.ts          # aplica
 *   node --experimental-strip-types scripts/migrate-data-updates.ts --dry    # solo reporta
 *
 * Preserva formato: indent 2, ensure_ascii=false, salto de línea final.
 * Si una calc ya tiene dataUpdate, la skippea (no sobrescribe).
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src/content/calcs');
const PROPOSAL_FILE = join(process.cwd(), 'scripts/data-updates-proposed.json');
const DRY = process.argv.includes('--dry') || process.argv.includes('--dry-run');

interface ProposalEntry {
  frequency: 'never' | 'daily' | 'weekly' | 'monthly' | 'biannual' | 'yearly';
  lastUpdated: string;
  source: string | null;
  sourceUrl: string | null;
  updateType: 'manual' | 'auto-api' | 'auto-scrape' | 'auto-llm';
  notes?: string;
  confidence?: 'high' | 'medium' | 'low';
}

function main() {
  if (!existsSync(PROPOSAL_FILE)) {
    console.error(`[migrate] ❌ Falta ${PROPOSAL_FILE}. Corré primero el agente de clasificación.`);
    process.exit(1);
  }
  const proposal: Record<string, ProposalEntry> = JSON.parse(readFileSync(PROPOSAL_FILE, 'utf8'));

  const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
  const stats = { updated: 0, skipped: 0, missing: 0, noProposal: [] as string[], already: [] as string[] };

  for (const f of files) {
    const fullPath = join(CALCS_DIR, f);
    const calc = JSON.parse(readFileSync(fullPath, 'utf8'));
    // El agente clasificó por slug interno (URL pública), no por filename.
    // Los filenames muchas veces difieren del slug (ej: vacaciones.json → slug: calculadora-vacaciones-argentina).
    const slug = calc.slug || f.replace(/\.json$/, '');

    if (calc.dataUpdate) {
      stats.already.push(slug);
      stats.skipped++;
      continue;
    }

    const p = proposal[slug];
    if (!p) {
      stats.noProposal.push(slug);
      stats.missing++;
      continue;
    }

    // Construir bloque limpio, sin confidence (eso es metadato del agente)
    const dataUpdate: any = {
      frequency: p.frequency,
      lastUpdated: p.lastUpdated,
      source: p.source ?? null,
      sourceUrl: p.sourceUrl ?? null,
      updateType: p.updateType,
    };
    if (p.notes) dataUpdate.notes = p.notes;

    // Insertar dataUpdate justo antes de outputs (ubicación natural en el schema)
    const merged: Record<string, any> = {};
    for (const [k, v] of Object.entries(calc)) {
      if (k === 'outputs') merged.dataUpdate = dataUpdate;
      merged[k] = v;
    }
    if (!('outputs' in calc)) merged.dataUpdate = dataUpdate;

    if (!DRY) {
      writeFileSync(fullPath, JSON.stringify(merged, null, 2) + '\n', 'utf8');
    }
    stats.updated++;
  }

  console.log(`\n[migrate-data-updates] ${DRY ? 'DRY-RUN · ' : ''}resultado:`);
  console.log(`  ✓ actualizadas: ${stats.updated}`);
  console.log(`  · ya tenían dataUpdate: ${stats.skipped}`);
  console.log(`  ✗ sin propuesta en data-updates-proposed.json: ${stats.missing}`);
  if (stats.noProposal.length > 0) {
    console.log(`\nSin propuesta (probablemente agregadas después del scan):`);
    for (const s of stats.noProposal) console.log(`    - ${s}`);
  }
  console.log('');
}

main();
