#!/usr/bin/env node
/**
 * add-default-sources.mjs
 *
 * Agrega sources default (2-3) a calcs sin campo `sources`, basándose en categoría.
 * Solo se aplica a categorías con sources universalmente relevantes —
 * las categorías "vagas" (vida, entretenimiento, cocina) quedan para review manual.
 *
 * USAGE:
 *   node scripts/add-default-sources.mjs         # dry-run
 *   node scripts/add-default-sources.mjs --write # aplicar
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src', 'content', 'calcs');
const WRITE = process.argv.includes('--write');

// Sources default por categoría — solo donde la fuente aplica universalmente
const DEFAULT_SOURCES = {
  finanzas: [
    { name: 'BCRA — Banco Central de la República Argentina', url: 'https://www.bcra.gob.ar' },
    { name: 'AFIP/ARCA — Administración Federal de Ingresos Públicos', url: 'https://www.afip.gob.ar' },
    { name: 'INDEC — Instituto Nacional de Estadística y Censos', url: 'https://www.indec.gob.ar' },
  ],
  salud: [
    { name: 'OMS — Organización Mundial de la Salud', url: 'https://www.who.int/es' },
    { name: 'Ministerio de Salud Argentina', url: 'https://www.argentina.gob.ar/salud' },
    { name: 'MedlinePlus (NIH)', url: 'https://medlineplus.gov/spanish/' },
  ],
  deportes: [
    { name: 'ACSM — American College of Sports Medicine', url: 'https://www.acsm.org' },
    { name: 'Compendium of Physical Activities (Ainsworth)', url: 'https://pacompendium.com' },
  ],
  ciencia: [
    { name: 'NIST — National Institute of Standards and Technology', url: 'https://www.nist.gov' },
    { name: 'Khan Academy — Ciencia', url: 'https://es.khanacademy.org/science' },
  ],
  matematica: [
    { name: 'Wolfram MathWorld', url: 'https://mathworld.wolfram.com' },
    { name: 'Khan Academy — Matemática', url: 'https://es.khanacademy.org/math' },
  ],
  construccion: [
    { name: 'CIRSOC — Reglamentos de seguridad estructural', url: 'https://www.inti.gob.ar/cirsoc' },
    { name: 'IRAM — Normas argentinas', url: 'https://www.iram.org.ar' },
  ],
  educacion: [
    { name: 'Ministerio de Educación Argentina', url: 'https://www.argentina.gob.ar/educacion' },
    { name: 'UNESCO — Educación', url: 'https://es.unesco.org/themes/educacion' },
  ],
  jardineria: [
    { name: 'INTA — Instituto Nacional de Tecnología Agropecuaria', url: 'https://www.inta.gob.ar' },
    { name: 'Royal Horticultural Society (RHS)', url: 'https://www.rhs.org.uk' },
  ],
  auto: [
    { name: 'DNRPA — Dirección Nacional de Registros del Automotor', url: 'https://www.dnrpa.gov.ar' },
    { name: 'ANSV — Agencia Nacional de Seguridad Vial', url: 'https://www.argentina.gob.ar/seguridadvial' },
  ],
  tecnologia: [
    { name: 'W3C — World Wide Web Consortium', url: 'https://www.w3.org' },
    { name: 'IEEE — Institute of Electrical and Electronics Engineers', url: 'https://www.ieee.org' },
  ],
};

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
let totalMissing = 0;
let totalAdded = 0;
const byCategoryAdded = {};
const skippedCats = {};

for (const f of files) {
  const path = join(CALCS_DIR, f);
  const data = JSON.parse(readFileSync(path, 'utf8'));

  if (data.sources && data.sources.length > 0) continue;
  totalMissing++;

  const cat = data.category;
  const defaults = DEFAULT_SOURCES[cat];
  if (!defaults) {
    skippedCats[cat] = (skippedCats[cat] || 0) + 1;
    continue;
  }

  data.sources = defaults;
  totalAdded++;
  byCategoryAdded[cat] = (byCategoryAdded[cat] || 0) + 1;

  if (WRITE) writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

console.log('\n=== RESUMEN ===');
console.log(`Calcs sin sources: ${totalMissing}`);
console.log(`Sources agregadas (categorías seguras): ${totalAdded}`);
console.log(`Skipped (categoría sin default): ${totalMissing - totalAdded}`);

console.log('\n=== POR CATEGORÍA ADDED ===');
for (const [cat, n] of Object.entries(byCategoryAdded).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${n}`);
}

console.log('\n=== SKIPPED (requieren review manual) ===');
for (const [cat, n] of Object.entries(skippedCats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${n}`);
}

if (!WRITE) console.log('\n⚠️  DRY-RUN. Corré con --write.');
else console.log('\n✅ Cambios aplicados.');
