#!/usr/bin/env node
/**
 * autopopulate-related.mjs
 *
 * Para cada calc con < 4 relatedSlugs, agrega los mejores matches basándose en:
 *  1) Misma categoría (preferidos)
 *  2) Similitud Jaccard de tokens en el slug
 *  3) Keyword overlap en title/description
 *
 * No pisa relatedSlugs existentes — solo agrega los que faltan.
 * Target: min 4 relatedSlugs por calc.
 *
 * USAGE:
 *   node scripts/autopopulate-related.mjs            # dry-run
 *   node scripts/autopopulate-related.mjs --write    # aplicar
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src', 'content', 'calcs');
const WRITE = process.argv.includes('--write');
const TARGET_MIN = 4;

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
const calcs = files.map((f) => {
  const path = join(CALCS_DIR, f);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return { file: f, path, data };
});

function tokenize(str) {
  return new Set(
    (str || '')
      .toLowerCase()
      .replace(/^(calculadora|conversor)-/, '')
      .replace(/[^a-záéíóúñ0-9 -]/g, ' ')
      .split(/[-\s]+/)
      .filter((t) => t.length > 2 && !['para','con','los','las','del','que','una','por','como','tus','esta','este'].includes(t))
  );
}

function jaccard(a, b) {
  const setA = a instanceof Set ? a : tokenize(a);
  const setB = b instanceof Set ? b : tokenize(b);
  const inter = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

function findRelated(calc, count) {
  const existingRelated = new Set(calc.data.relatedSlugs || []);
  const category = calc.data.category;
  const mySlug = calc.data.slug;
  const myTokens = tokenize(mySlug + ' ' + (calc.data.h1 || '') + ' ' + (calc.data.title || ''));

  // Score every other calc
  const candidates = [];
  for (const other of calcs) {
    const otherSlug = other.data.slug;
    if (otherSlug === mySlug) continue;
    if (existingRelated.has(otherSlug)) continue;

    // Slug similarity
    const slugScore = jaccard(mySlug, otherSlug);
    // Title + keywords similarity
    const otherTokens = tokenize(otherSlug + ' ' + (other.data.h1 || '') + ' ' + (other.data.title || ''));
    const kwScore = jaccard(myTokens, otherTokens);
    // Same category bonus
    const catBonus = category && other.data.category === category ? 0.15 : 0;

    const score = Math.max(slugScore, kwScore) + catBonus;
    // Threshold más estricto: matches sólidos o mismo tema
    if (score >= 0.3) {
      candidates.push({ slug: otherSlug, score, sameCategory: other.data.category === category });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  // Prefer diversity: at most 1 very-similar slug, then spread.
  // Take top N, preferring same-category candidates
  const picked = [];
  for (const c of candidates) {
    if (picked.length >= count) break;
    picked.push(c.slug);
  }
  return picked;
}

let totalUnderLimit = 0;
let totalAdded = 0;
let skipped = 0;
const samples = [];

for (const c of calcs) {
  const existing = c.data.relatedSlugs || [];
  if (existing.length >= TARGET_MIN) continue;

  totalUnderLimit++;
  const needed = TARGET_MIN - existing.length;
  const newOnes = findRelated(c, needed);

  if (newOnes.length === 0) {
    skipped++;
    continue;
  }

  const updated = [...existing, ...newOnes];
  c.data.relatedSlugs = updated;
  totalAdded += newOnes.length;

  if (samples.length < 8) {
    samples.push({
      file: c.file,
      slug: c.data.slug,
      before: existing,
      added: newOnes,
    });
  }

  if (WRITE) {
    writeFileSync(c.path, JSON.stringify(c.data, null, 2) + '\n');
  }
}

console.log('\n=== RESUMEN ===');
console.log(`Calcs con < ${TARGET_MIN} relatedSlugs: ${totalUnderLimit}`);
console.log(`Total relatedSlugs agregados: ${totalAdded}`);
console.log(`Calcs sin candidatos encontrados: ${skipped}`);

console.log('\n=== MUESTRAS ===');
for (const s of samples) {
  console.log(`\n${s.slug}`);
  console.log(`  before: ${JSON.stringify(s.before)}`);
  console.log(`  added:  ${JSON.stringify(s.added)}`);
}

if (!WRITE) console.log('\n⚠️  DRY-RUN. Corré con --write.');
else console.log('\n✅ Cambios aplicados.');
