#!/usr/bin/env node
/**
 * add-subtopic-sources.mjs
 *
 * Para calcs en vida/entretenimiento/cocina sin sources, clasifica por
 * keywords del slug y aplica sources relevantes al subtema. Solo donde
 * el subtema tiene fuentes universalmente aplicables.
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src', 'content', 'calcs');
const WRITE = process.argv.includes('--write');

// Classification rules — keyword-based
const SUBTOPIC_RULES = [
  {
    match: /(audio|bpm|delay|mezcla|reverb|headroom|musica|cancion|karaoke|nota|afinacion|metronomo)/,
    sources: [
      { name: 'AES — Audio Engineering Society', url: 'https://www.aes.org' },
      { name: 'Sound on Sound — Technical articles', url: 'https://www.soundonsound.com' },
    ],
    tag: 'audio',
  },
  {
    match: /(fotograf|camara|lente|exposicion|focal|obturacion|diafragma|iso|nd|filtro)/,
    sources: [
      { name: 'Cambridge in Colour — Photography tutorials', url: 'https://www.cambridgeincolour.com' },
      { name: 'B&H Photo — Learning', url: 'https://www.bhphotovideo.com/explora/photography' },
    ],
    tag: 'foto',
  },
  {
    match: /(gaming|ping|latencia|fps|pc-gaming|monitor|hz|twitch)/,
    sources: [
      { name: 'Digital Foundry — Technical game reviews', url: 'https://www.eurogamer.net/digitalfoundry' },
      { name: 'Tom\'s Hardware — PC benchmarks', url: 'https://www.tomshardware.com' },
    ],
    tag: 'gaming',
  },
  {
    match: /(social|hashtag|instagram|tiktok|youtube|twitter|reels|publicar|alcance)/,
    sources: [
      { name: 'Hootsuite Social Media Research', url: 'https://blog.hootsuite.com' },
      { name: 'Sprout Social — Insights Index', url: 'https://sproutsocial.com/insights/' },
    ],
    tag: 'social',
  },
  {
    match: /(energia|consumo|electric|kwh|watts|led|iluminacion|factura|ahorro-(led|termo|aire))/,
    sources: [
      { name: 'Secretaría de Energía Argentina', url: 'https://www.argentina.gob.ar/economia/energia' },
      { name: 'INTI — Eficiencia energética', url: 'https://www.inti.gob.ar' },
    ],
    tag: 'energia',
  },
  {
    match: /(agua|riego|hogar-mensual|consumo-agua)/,
    sources: [
      { name: 'ERAS — Ente Regulador de Agua y Saneamiento', url: 'https://www.eras.gov.ar' },
      { name: 'AySA — Aguas y Saneamientos Argentinos', url: 'https://www.aysa.com.ar' },
    ],
    tag: 'agua',
  },
  {
    match: /(cocina|receta|coccion|horno|ingredientes|taza|gramos-ml|sustituci)/,
    sources: [
      { name: 'USDA FoodData Central', url: 'https://fdc.nal.usda.gov' },
      { name: 'BBC Good Food — Conversions', url: 'https://www.bbcgoodfood.com/howto' },
    ],
    tag: 'cocina',
  },
  {
    match: /(libro|lectura|leer|palabras|paginas)/,
    sources: [
      { name: 'Reading Rockets — Research on reading', url: 'https://www.readingrockets.org' },
      { name: 'International Literacy Association', url: 'https://www.literacyworldwide.org' },
    ],
    tag: 'lectura',
  },
];

// Categorías a procesar
const TARGET_CATEGORIES = new Set(['vida', 'entretenimiento', 'cocina']);

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
let totalMissing = 0;
let totalMatched = 0;
let totalSkipped = 0;
const byTag = {};
const skippedSlugs = [];

for (const f of files) {
  const path = join(CALCS_DIR, f);
  const data = JSON.parse(readFileSync(path, 'utf8'));

  if (!TARGET_CATEGORIES.has(data.category)) continue;
  if (data.sources && data.sources.length > 0) continue;

  totalMissing++;

  // Try each rule
  const slug = data.slug.toLowerCase();
  let matched = null;
  for (const rule of SUBTOPIC_RULES) {
    if (rule.match.test(slug)) {
      matched = rule;
      break;
    }
  }

  if (!matched) {
    totalSkipped++;
    skippedSlugs.push(slug);
    continue;
  }

  data.sources = matched.sources;
  totalMatched++;
  byTag[matched.tag] = (byTag[matched.tag] || 0) + 1;

  if (WRITE) writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

console.log(`\n=== RESUMEN ===`);
console.log(`Calcs sin sources en vida/entretenimiento/cocina: ${totalMissing}`);
console.log(`Matched con subtema: ${totalMatched}`);
console.log(`Sin match (skip, no hay subtema aplicable): ${totalSkipped}`);

console.log('\n=== POR SUBTEMA ===');
for (const [tag, n] of Object.entries(byTag).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${tag}: ${n}`);
}

console.log('\n=== SKIPPED (sample, no aplica subtema) ===');
for (const s of skippedSlugs.slice(0, 15)) console.log(`  ${s}`);

if (!WRITE) console.log('\n⚠️  DRY-RUN. Corré con --write.');
else console.log('\n✅ Cambios aplicados.');
