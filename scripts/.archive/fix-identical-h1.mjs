#!/usr/bin/env node
/**
 * fix-identical-h1.mjs
 *
 * Diferencia los 3 grupos de cannibalization con H1 idéntico.
 * Cambios hand-crafted para preservar significado + diferenciar keyword target.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src', 'content', 'calcs');
const WRITE = process.argv.includes('--write');

// Override por slug: new h1 + new title
const FIXES = {
  // Grupo 1: consumo de agua del hogar
  'calculadora-agua-consumo-hogar-ahorro': {
    h1: 'Calculadora de consumo de agua del hogar con ahorro estimado',
    title: 'Consumo Agua Hogar + Ahorro 2026 | Hacé Cuentas',
  },
  'calculadora-consumo-agua-hogar-mensual': {
    h1: 'Calculadora de consumo mensual de agua del hogar',
    title: 'Consumo de Agua Mensual Hogar 2026 | Hacé Cuentas',
  },

  // Grupo 2: superficie corporal — diferenciar por fórmula
  'calculadora-superficie-corporal-du-bois': {
    h1: 'Calculadora de superficie corporal (fórmula Du Bois)',
    title: 'Superficie Corporal — Fórmula Du Bois 2026 | Hacé Cuentas',
  },
  'calculadora-superficie-corporal-bsa-mosteller': {
    h1: 'Calculadora de superficie corporal (fórmula Mosteller)',
    title: 'Superficie Corporal — Fórmula Mosteller 2026 | Hacé Cuentas',
  },

  // Grupo 3: tarifa freelance — una es EN version
  'calculadora-freelance-hourly-rate': {
    h1: 'Freelance Hourly Rate Calculator (English)',
    title: 'Freelance Hourly Rate Calculator 2026 | Hacé Cuentas',
  },
  'calculadora-freelance-tarifa-hora': {
    h1: 'Calculadora de Tarifa Freelance por Hora (Argentina/LATAM)',
    title: 'Tarifa Freelance por Hora AR/LATAM 2026 | Hacé Cuentas',
  },
};

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
let changed = 0;
const samples = [];

for (const f of files) {
  const path = join(CALCS_DIR, f);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const fix = FIXES[data.slug];
  if (!fix) continue;

  const before = { h1: data.h1, title: data.title };
  data.h1 = fix.h1;
  data.title = fix.title;
  samples.push({ slug: data.slug, before, after: fix });
  changed++;
  if (WRITE) writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

console.log(`\nCalcs diferenciadas: ${changed}/${Object.keys(FIXES).length}`);
for (const s of samples) {
  console.log(`\n/${s.slug}`);
  console.log(`  h1:    "${s.before.h1}" → "${s.after.h1}"`);
  console.log(`  title: "${s.before.title}" → "${s.after.title}"`);
}

if (!WRITE) console.log('\n⚠️  DRY-RUN. --write para aplicar.');
else console.log('\n✅ Aplicado.');
