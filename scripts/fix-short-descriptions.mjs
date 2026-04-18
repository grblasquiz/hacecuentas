#!/usr/bin/env node
/**
 * fix-short-descriptions.mjs
 *
 * Expande descriptions < 120 chars en src/content/calcs/*.json.
 * Estrategia:
 *   1. Toma la description actual
 *   2. Si hay espacio, agrega la primera oración limpia del keyTakeaway
 *   3. Si todavía falta, agrega un beneficio contextual
 *   4. Target: 140-160 chars
 *
 * No toca descriptions >= 120 chars. No genera contenido 100% sintético
 * — complementa lo existente.
 *
 * USAGE:
 *   node scripts/fix-short-descriptions.mjs         # dry-run
 *   node scripts/fix-short-descriptions.mjs --write # aplicar
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src', 'content', 'calcs');
const WRITE = process.argv.includes('--write');
const TARGET_MIN = 140;
const TARGET_MAX = 160;

/** Strip markdown básico: **bold**, *italic*, `code`, [link](url), bullets */
function stripMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^[\s-]*[•·*-]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Primera oración completa (hasta primer . ! ?) con length cap. Devuelve null si no cabe una oración completa. */
function firstSentence(text, maxLen) {
  if (!text) return null;
  const clean = stripMarkdown(text);
  // Buscar todas las oraciones completas
  const sentences = clean.match(/[^.!?]{15,}?[.!?]/g) || [];
  for (const s of sentences) {
    const trimmed = s.trim();
    if (trimmed.length <= maxLen && trimmed.length >= 15) return trimmed;
  }
  return null; // no fitting complete sentence
}

/** Fragmento corto para completar descripción (varios templates según data disponible) */
function complementSnippet(calc, remainingChars) {
  const snippets = [];
  const category = calc.category;

  // From keyTakeaway (primera oración completa si cabe)
  if (calc.keyTakeaway) {
    const kt = firstSentence(calc.keyTakeaway, remainingChars);
    if (kt) snippets.push(kt);
  }
  // From intro (primera oración si aún no tenemos contenido)
  if (calc.intro) {
    const intro = firstSentence(calc.intro, remainingChars);
    if (intro) snippets.push(intro);
  }

  // Category-based benefit
  const byCategory = {
    finanzas: 'Actualizado a escalas vigentes.',
    salud: 'Basado en fuentes oficiales.',
    negocios: 'Con fórmula y ejemplo.',
    marketing: 'Benchmarks y fórmula.',
    vida: 'Rápida y sin registro.',
    cocina: 'Con ajustes por porciones.',
    construccion: 'Con tabla de referencia.',
    deportes: 'Fórmula con ejemplo.',
    salud: 'Guía clínica de referencia.',
    viajes: 'Con ejemplos por país.',
    mascotas: 'Según peso y raza.',
    automotor: 'Con tabla de referencia.',
    matematica: 'Con pasos detallados.',
  };
  if (byCategory[category]) snippets.push(byCategory[category]);

  snippets.push('Gratis, sin registro.');
  snippets.push('Actualizado 2026.');

  // Pick the first snippet that fits
  for (const s of snippets) {
    if (s.length <= remainingChars) return s;
  }
  return null;
}

function expandDescription(calc) {
  let desc = calc.description || '';
  desc = desc.trim();
  if (desc.length >= TARGET_MIN) return desc; // no change

  // Ensure desc ends with period
  if (desc && !/[.!?]$/.test(desc)) desc += '.';

  // Reserve space for " " + snippet (snippet should be at most TARGET_MAX - current - 1)
  let remaining = TARGET_MAX - desc.length - 1;
  if (remaining < 15) return desc; // not enough room

  const snippet = complementSnippet(calc, remaining);
  if (!snippet) return desc;

  const expanded = desc ? `${desc} ${snippet}` : snippet;
  if (expanded.length > TARGET_MAX) return desc;
  return expanded;
}

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
let totalShort = 0;
let totalExpanded = 0;
const samples = [];

for (const f of files) {
  const path = join(CALCS_DIR, f);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const oldDesc = data.description || '';

  if (oldDesc.length >= 120) continue;
  totalShort++;

  const newDesc = expandDescription(data);
  if (newDesc === oldDesc || newDesc.length <= oldDesc.length) continue;

  if (samples.length < 8) {
    samples.push({ file: f, from: oldDesc, to: newDesc, fromLen: oldDesc.length, toLen: newDesc.length });
  }

  data.description = newDesc;
  totalExpanded++;

  if (WRITE) writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

console.log('\n=== RESUMEN ===');
console.log(`Descriptions < 120 chars: ${totalShort}`);
console.log(`Expandidas: ${totalExpanded}`);

console.log('\n=== MUESTRAS ===');
for (const s of samples) {
  console.log(`\n${s.file} (${s.fromLen}→${s.toLen})`);
  console.log(`  OLD: ${s.from}`);
  console.log(`  NEW: ${s.to}`);
}

if (!WRITE) console.log('\n⚠️  DRY-RUN. Corré con --write.');
else console.log('\n✅ Cambios aplicados.');
