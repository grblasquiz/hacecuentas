#!/usr/bin/env node
/**
 * fix-long-titles.mjs
 *
 * Reescribe titles > 65 chars en src/content/calcs/*.json usando h1 como base.
 * Target: <= 65 chars (óptimo para SERP), respetando keywords primarios + año.
 *
 * USAGE:
 *   node scripts/fix-long-titles.mjs           # dry-run
 *   node scripts/fix-long-titles.mjs --write   # aplicar
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src', 'content', 'calcs');
const WRITE = process.argv.includes('--write');
const VERBOSE = process.argv.includes('--verbose');
const TARGET_MAX = 65;
const HARD_MAX = 68;
const BRAND_SUFFIX = ' | Hacé Cuentas';
const BRAND_LEN = BRAND_SUFFIX.length; // 15

function rewriteTitle(oldTitle, h1) {
  // Si h1 ya tiene año (2024|2025|2026|2027), no agregar
  const h1HasYear = /20\d{2}/.test(h1);
  const oldHasYear = /2026/.test(oldTitle);

  // Estrategia 1: h1 + " 2026 | Hacé Cuentas"
  if (!h1HasYear && oldHasYear) {
    const candidate = `${h1} 2026${BRAND_SUFFIX}`;
    if (candidate.length <= TARGET_MAX) return candidate;
  }

  // Estrategia 2: h1 + "| Hacé Cuentas"
  const basic = `${h1}${BRAND_SUFFIX}`;
  if (basic.length <= TARGET_MAX) return basic;

  // Estrategia 3: h1 solo (no es ideal pero mejor que el actual)
  if (h1.length <= HARD_MAX) {
    // Intentar inyectar año si cabe con brand
    if (!h1HasYear && oldHasYear && `${h1} 2026${BRAND_SUFFIX}`.length <= HARD_MAX) {
      return `${h1} 2026${BRAND_SUFFIX}`;
    }
    if (`${h1}${BRAND_SUFFIX}`.length <= HARD_MAX) {
      return `${h1}${BRAND_SUFFIX}`;
    }
    return h1; // sin brand, el h1 solo
  }

  // Estrategia 4: truncar h1 en un corte semántico
  // Buscar posición de corte antes del HARD_MAX
  const maxH1 = HARD_MAX - BRAND_LEN; // cuánto puede medir h1
  let truncated = h1;
  // Primero tratar cortar en separador semántico (—, :, ()
  const separators = [' — ', ' – ', ' - ', ': ', ' (', ', '];
  for (const sep of separators) {
    const parts = h1.split(sep);
    if (parts.length > 1) {
      const first = parts[0];
      if (first.length <= maxH1 && first.length >= 20) {
        truncated = first;
        break;
      }
    }
  }
  // Si sigue largo, cortar por palabra
  if (truncated.length > maxH1) {
    const words = truncated.split(' ');
    const acc = [];
    for (const w of words) {
      if ([...acc, w].join(' ').length > maxH1) break;
      acc.push(w);
    }
    truncated = acc.join(' ');
  }

  return `${truncated}${BRAND_SUFFIX}`;
}

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
let totalLong = 0;
let totalFixed = 0;
let stillLong = 0;
const samples = [];

for (const f of files) {
  const path = join(CALCS_DIR, f);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const oldTitle = data.title || '';
  const h1 = data.h1 || '';

  if (oldTitle.length <= TARGET_MAX) continue;
  totalLong++;

  if (!h1) {
    if (VERBOSE) console.log(`⚠️  ${f}: no h1, skipping`);
    continue;
  }

  const newTitle = rewriteTitle(oldTitle, h1);

  if (newTitle === oldTitle || newTitle.length >= oldTitle.length) {
    stillLong++;
    if (VERBOSE) console.log(`⚠️  ${f}: rewrite no mejora (${oldTitle.length} → ${newTitle.length})`);
    continue;
  }

  if (newTitle.length > HARD_MAX) {
    stillLong++;
    if (VERBOSE) console.log(`⚠️  ${f}: still > ${HARD_MAX} (${newTitle.length})`);
  }

  data.title = newTitle;
  totalFixed++;
  if (samples.length < 10) {
    samples.push({ file: f, from: oldTitle, to: newTitle, fromLen: oldTitle.length, toLen: newTitle.length });
  }

  if (WRITE) {
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  }
}

console.log('\n=== RESUMEN ===');
console.log(`Total titles > ${TARGET_MAX} chars: ${totalLong}`);
console.log(`Reescritos: ${totalFixed}`);
console.log(`Aún largos post-rewrite: ${stillLong}`);
console.log('\n=== MUESTRAS ===');
for (const s of samples) {
  console.log(`\n${s.file} (${s.fromLen}→${s.toLen})`);
  console.log(`  OLD: ${s.from}`);
  console.log(`  NEW: ${s.to}`);
}
if (!WRITE) console.log('\n⚠️  DRY-RUN. Corré con --write.');
else console.log('\n✅ Cambios aplicados.');
