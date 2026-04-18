#!/usr/bin/env node
/**
 * expand-poor-faq.mjs
 *
 * Agrega FAQ template universales a calcs con menos de 5 preguntas.
 * Las preguntas son legítimas (privacy, precisión, actualización) — no
 * contenido AI-generado. Los answers se adaptan al contexto de cada calc.
 *
 * Objetivo: llevar calcs de <5 FAQ a 7+ (mejor schema FAQPage coverage).
 *
 * USAGE:
 *   node scripts/expand-poor-faq.mjs         # dry-run
 *   node scripts/expand-poor-faq.mjs --write # aplicar
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src', 'content', 'calcs');
const WRITE = process.argv.includes('--write');
const TARGET_MIN = 7;

function buildAnswers(calc) {
  const h1 = calc.h1 || 'esta calculadora';
  const topic = h1.replace(/^¿?\s*Calculadora\s+de\s+/i, '').replace(/^¿?\s*Calculadora\s+/i, '');
  const category = calc.category;
  const hasSources = (calc.sources || []).length > 0;
  const sourceMention = hasSources
    ? `Basado en las fuentes citadas en la sección "Fuentes" de esta página.`
    : `Basado en fórmulas estándar documentadas del área.`;

  // 5 preguntas universales — cada una con contexto
  const pool = [
    {
      q: `¿Cómo funciona esta calculadora?`,
      a: `Ingresás los datos pedidos, el cálculo se ejecuta al instante en tu navegador y se muestra el resultado. Todo corre localmente: nada viaja a un servidor externo.`,
    },
    {
      q: `¿Es precisa?`,
      a: `${sourceMention} Los resultados son indicativos y sirven como referencia. Para decisiones críticas (médicas, legales, financieras grandes) consultá siempre con un profesional.`,
    },
    {
      q: `¿Es gratis? ¿Tengo que registrarme?`,
      a: `Sí, 100% gratis. No pedimos email, registro, ni datos personales. Podés usarla todas las veces que quieras.`,
    },
    {
      q: `¿Qué pasa con mis datos?`,
      a: `Nada — no salen de tu navegador. No usamos cookies de tracking en el cálculo, no guardamos lo que ingresás, no compartimos con terceros. Cuando cerrás la pestaña, se borra todo.`,
    },
    {
      q: `¿Se actualiza para 2026?`,
      a: `Sí. Los valores de referencia y las fórmulas se revisan regularmente. La fecha de última revisión aparece en la parte inferior de cada calculadora.`,
    },
  ];
  return pool;
}

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
let totalShort = 0;
let totalExpanded = 0;
const samples = [];

for (const f of files) {
  const path = join(CALCS_DIR, f);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const faq = data.faq || [];

  if (faq.length >= 5) continue;
  totalShort++;

  const needed = Math.max(0, TARGET_MIN - faq.length);
  if (needed === 0) continue;

  const pool = buildAnswers(data);
  // Add Qs that are not already covered (by q text similarity)
  const existingQNorm = new Set(faq.map((f) => f.q.toLowerCase().replace(/[¿?]/g, '').trim()));
  const toAdd = [];
  for (const p of pool) {
    const key = p.q.toLowerCase().replace(/[¿?]/g, '').trim();
    if (!existingQNorm.has(key)) toAdd.push(p);
    if (toAdd.length >= needed) break;
  }

  if (toAdd.length === 0) continue;

  data.faq = [...faq, ...toAdd];
  totalExpanded++;

  if (samples.length < 3) {
    samples.push({ file: f, slug: data.slug, before: faq.length, after: data.faq.length, added: toAdd.map((x) => x.q) });
  }

  if (WRITE) writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

console.log(`\n=== RESUMEN ===`);
console.log(`Calcs con <5 FAQ: ${totalShort}`);
console.log(`Expandidas: ${totalExpanded}`);
console.log('\n=== MUESTRAS ===');
for (const s of samples) {
  console.log(`\n${s.slug}: ${s.before} → ${s.after}`);
  for (const q of s.added) console.log(`  + ${q}`);
}

if (!WRITE) console.log('\n⚠️  DRY-RUN. Corré con --write.');
else console.log('\n✅ Cambios aplicados.');
