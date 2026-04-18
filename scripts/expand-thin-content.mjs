#!/usr/bin/env node
/**
 * expand-thin-content.mjs
 * Expande 5 calcs genuinely thin con content hand-crafted de thin-content-expansions.json
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src', 'content', 'calcs');
const WRITE = process.argv.includes('--write');

const EXPANSIONS = JSON.parse(readFileSync(join(process.cwd(), 'scripts', 'thin-content-expansions.json'), 'utf8'));

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
const samples = [];
let expanded = 0;

for (const f of files) {
  const path = join(CALCS_DIR, f);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const slug = data.slug;
  if (!EXPANSIONS[slug]) continue;

  const before = (data.explanation || '').length;
  data.explanation = (data.explanation || '').trimEnd() + EXPANSIONS[slug];
  expanded++;
  samples.push({ slug, before, after: data.explanation.length });

  if (WRITE) writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

console.log(`\nCalcs expandidas: ${expanded} / ${Object.keys(EXPANSIONS).length}`);
for (const s of samples) console.log(`  /${s.slug}: ${s.before} → ${s.after} chars (+${s.after - s.before})`);
if (!WRITE) console.log('\n⚠️  DRY-RUN. --write para aplicar.');
else console.log('\n✅ Aplicado.');
