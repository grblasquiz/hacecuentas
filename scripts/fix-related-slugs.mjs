#!/usr/bin/env node
/**
 * fix-related-slugs.mjs
 *
 * Audita y arregla relatedSlugs rotos en /src/content/calcs/*.json.
 * Para cada slug roto, busca el slug válido más parecido usando matching por tokens.
 *
 * USAGE:
 *   node scripts/fix-related-slugs.mjs           # dry-run (reporta sin escribir)
 *   node scripts/fix-related-slugs.mjs --write   # aplica los fixes
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src', 'content', 'calcs');
const WRITE = process.argv.includes('--write');
const VERBOSE = process.argv.includes('--verbose');

// Load all calcs
const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
const calcs = files.map((f) => {
  const path = join(CALCS_DIR, f);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  return { file: f, path, data };
});

const validSlugs = new Set(calcs.map((c) => c.data.slug));

// Manual overrides — for slugs where the concept exists but token matching fails
const MANUAL_OVERRIDES = {
  'calculadora-marketing-ctr': 'calculadora-ctr-click-through-rate',
  'calculadora-marketing-cpc': 'calculadora-cpc-costo-por-click',
  'calculadora-marketing-roas': 'calculadora-roas-retorno-inversion-publicitaria',
  'calculadora-marketing-cac': 'calculadora-cac-costo-adquisicion-sales-funnel',
  'marketing-cac': 'calculadora-cac-costo-adquisicion-sales-funnel',
  'calculadora-conversor-unidades': 'conversor-unidades-longitud-peso-volumen-temperatura',
  'calculadora-aumento-inflacion': 'calculadora-inflacion-poder-compra',
  'calculadora-grasa-corporal-marina-jackson-pollock': 'calculadora-porcentaje-grasa-corporal',
  'calculadora-tdee-gasto-calorico': 'calculadora-calorias-diarias-tdee',
  'marketing-conversion': 'calculadora-tasa-de-conversion',
  'calculadora-iva-21': 'calculadora-iva-agregar-discriminar',
  'calculadora-iva-precio-neto-bruto': 'calculadora-iva-agregar-discriminar',
  'precio-iva': 'calculadora-iva-agregar-discriminar',
  'calculadora-dias-habiles': 'calculadora-dias-laborables-habiles-entre-fechas',
  'calculadora-aguinaldo-argentina': 'calculadora-aguinaldo-sac',
  'calculadora-ltv-valor-vida-cliente': 'calculadora-cac-ltv-costo-adquisicion-cliente',
  'calculadora-cpa-costo-por-accion': 'calculadora-cpa-cac-ltv',
  'calculadora-ritmo-ciclismo': 'calculadora-calorias-ciclismo-intensidad',
  'calculadora-jet-lag-por-husos-horarios': 'calculadora-jet-lag-recuperacion',
  'estimador-uber-taxi': 'calculadora-estimador-costo-viaje-taxi-remis',
  'calculadora-equipaje-permitido-aerolinea-peso': 'calculadora-equipaje-extra-costo-aerolinea',
  'media-ponderada': 'calculadora-promedio-ponderado-notas-materias',
  'calculadora-promedio-ponderado': 'calculadora-promedio-ponderado-notas-materias',
  'calculadora-millas-avion': 'calculadora-valor-millas-viajero-frecuente',
  'calculadora-km-a-millas': 'conversor-unidades-longitud-peso-volumen-temperatura',
  'calculadora-esperanza-de-vida-argentina': 'calculadora-expectativa-vida',
};

// Token-based similarity: shared tokens / total unique tokens (Jaccard)
function tokenize(slug) {
  return new Set(
    slug
      .replace(/^(calculadora|conversor)-/, '')
      .split('-')
      .filter(Boolean)
      .filter((t) => t.length > 2) // skip tiny tokens like "de", "el"
  );
}

function jaccard(a, b) {
  const setA = tokenize(a);
  const setB = tokenize(b);
  const inter = [...setA].filter((x) => setB.has(x)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

// Also check if the broken slug is a substring match or close prefix
function substringScore(broken, valid) {
  const b = broken.replace(/^(calculadora|conversor)-/, '');
  const v = valid.replace(/^(calculadora|conversor)-/, '');
  if (v.startsWith(b) || b.startsWith(v)) return 0.8;
  if (v.includes(b) || b.includes(v)) return 0.6;
  return 0;
}

function findBestMatch(brokenSlug, sameCategory = null) {
  let best = { slug: null, score: 0 };
  for (const c of calcs) {
    const candidate = c.data.slug;
    if (candidate === brokenSlug) continue;
    let score = jaccard(brokenSlug, candidate);
    // Boost if same category
    if (sameCategory && c.data.category === sameCategory) {
      score += 0.1;
    }
    // Substring boost
    score = Math.max(score, substringScore(brokenSlug, candidate));
    if (score > best.score) {
      best = { slug: candidate, score };
    }
  }
  return best;
}

// Audit + fix
let totalBroken = 0;
let totalFixed = 0;
let unfixable = [];
const changes = []; // { file, broken, fixed }

for (const c of calcs) {
  const related = c.data.relatedSlugs || [];
  if (related.length === 0) continue;
  const category = c.data.category;
  const newRelated = [];
  let changed = false;

  for (const rel of related) {
    if (validSlugs.has(rel)) {
      newRelated.push(rel);
      continue;
    }
    // Broken!
    totalBroken++;
    // Manual override first
    if (MANUAL_OVERRIDES[rel] && validSlugs.has(MANUAL_OVERRIDES[rel])) {
      const fixed = MANUAL_OVERRIDES[rel];
      if (!newRelated.includes(fixed)) newRelated.push(fixed);
      changed = true;
      totalFixed++;
      changes.push({ file: c.file, broken: rel, fixed, score: 'manual' });
      if (VERBOSE) console.log(`  ${c.file}: ${rel} → ${fixed} (manual)`);
      continue;
    }
    const match = findBestMatch(rel, category);
    if (match.score >= 0.45) {
      // Confident match — replace
      if (!newRelated.includes(match.slug)) newRelated.push(match.slug);
      changed = true;
      totalFixed++;
      changes.push({ file: c.file, broken: rel, fixed: match.slug, score: match.score.toFixed(2) });
      if (VERBOSE) console.log(`  ${c.file}: ${rel} → ${match.slug} (score ${match.score.toFixed(2)})`);
    } else {
      // No confident match — drop
      changed = true;
      unfixable.push({ file: c.file, slug: rel, bestMatch: match.slug, score: match.score.toFixed(2) });
      if (VERBOSE) console.log(`  ${c.file}: ${rel} → DROPPED (best ${match.slug} score ${match.score.toFixed(2)})`);
    }
  }

  if (changed) {
    c.data.relatedSlugs = newRelated;
    if (WRITE) {
      writeFileSync(c.path, JSON.stringify(c.data, null, 2) + '\n');
    }
  }
}

// Report
console.log('\n=== RESUMEN ===');
console.log(`Total calcs analizados: ${calcs.length}`);
console.log(`relatedSlugs rotos encontrados: ${totalBroken}`);
console.log(`Fixeados por auto-match (score >= 0.45): ${totalFixed}`);
console.log(`Dropeados (sin match confiable): ${unfixable.length}`);
console.log(`Archivos afectados: ${new Set(changes.map((c) => c.file)).size}`);

if (unfixable.length > 0) {
  console.log('\n=== DROPPED (revisar manualmente si crees que hay otro match) ===');
  const grouped = {};
  for (const u of unfixable) {
    grouped[u.slug] = grouped[u.slug] || [];
    grouped[u.slug].push(u);
  }
  for (const [slug, items] of Object.entries(grouped).slice(0, 20)) {
    console.log(`  ${slug} (${items.length} refs) — best: ${items[0].bestMatch} (${items[0].score})`);
  }
  if (Object.keys(grouped).length > 20) {
    console.log(`  ... y ${Object.keys(grouped).length - 20} más`);
  }
}

if (!WRITE) {
  console.log('\n⚠️  DRY-RUN. Corré con --write para aplicar cambios.');
} else {
  console.log('\n✅ Cambios aplicados.');
}
