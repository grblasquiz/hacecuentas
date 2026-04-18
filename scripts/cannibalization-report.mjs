#!/usr/bin/env node
/**
 * cannibalization-report.mjs
 *
 * Detecta calcs con H1 casi idéntico (misma query target en SERP).
 * Para cada grupo, recomienda qué calc es la "canónica" basándose en:
 *   - explanation length (contenido más rico = ganar)
 *   - slug cleanliness (slug sin duplicación de tokens)
 *   - FAQ count
 *   - sources presence
 *
 * Output: docs/cannibalization-report.md
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src', 'content', 'calcs');
const OUT = join(process.cwd(), 'docs', 'cannibalization-report.md');

const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
const calcs = files.map((f) => ({
  file: f,
  data: JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8')),
}));

function tokens(h1) {
  const stop = new Set(['para', 'como', 'hace', 'cuentas', 'calculadora', 'conversor', 'online', 'gratis', 'vida', 'mejor', 'tu', 'tus', 'una', 'con', 'por', 'los', 'las']);
  return new Set(
    (h1 || '')
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stop.has(w))
  );
}

function jaccard(a, b) {
  const inter = [...a].filter((x) => b.has(x)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : inter / union;
}

// Group calcs by H1 similarity (>= 0.7 Jaccard = highly duplicated)
const groups = [];
const used = new Set();
for (let i = 0; i < calcs.length; i++) {
  if (used.has(i)) continue;
  const t1 = tokens(calcs[i].data.h1);
  if (t1.size < 2) continue;
  const group = [calcs[i]];
  used.add(i);
  for (let j = i + 1; j < calcs.length; j++) {
    if (used.has(j)) continue;
    const t2 = tokens(calcs[j].data.h1);
    if (jaccard(t1, t2) >= 0.7) {
      group.push(calcs[j]);
      used.add(j);
    }
  }
  if (group.length > 1) groups.push(group);
}

function scoreCalc(c) {
  let s = 0;
  s += (c.data.explanation || '').length / 1000;
  s += (c.data.faq || []).length * 0.5;
  s += (c.data.sources || []).length * 0.3;
  s += (c.data.relatedSlugs || []).length * 0.1;
  // slug cleanliness: shorter is better, less duplicate tokens
  const slugTokens = c.data.slug.split('-');
  const uniqueSlugTokens = new Set(slugTokens).size;
  s += (uniqueSlugTokens / slugTokens.length) * 2;
  // Prefer shorter slug
  s -= slugTokens.length * 0.1;
  return s;
}

// Generate report
const lines = [];
lines.push('# Cannibalization Report\n');
lines.push(`Generado: ${new Date().toISOString().split('T')[0]}\n`);
lines.push(`**${groups.length} grupos** de calcs con H1 altamente similar (Jaccard >= 0.7).\n`);
lines.push('## Recomendaciones\n');
lines.push('Para cada grupo: la calc con mayor **score** (contenido más rico) es la sugerida como canónica. Las demás deberían:');
lines.push('- **Redirect 301** a la canónica, O');
lines.push('- **Diferenciar H1** para apuntar a keyword distinto, O');
lines.push('- **Merge** del mejor contenido en la canónica + redirect.\n');
lines.push('---\n');

for (let gi = 0; gi < groups.length; gi++) {
  const group = groups[gi];
  const scored = group.map((c) => ({ ...c, score: scoreCalc(c) })).sort((a, b) => b.score - a.score);
  const winner = scored[0];
  lines.push(`\n## Grupo ${gi + 1}\n`);
  lines.push(`**H1 común:** ${winner.data.h1}\n`);
  lines.push('\n| Slug | Score | Explanation | FAQ | Sources | Decisión |');
  lines.push('|---|---|---|---|---|---|');
  for (const c of scored) {
    const explLen = (c.data.explanation || '').length;
    const faqLen = (c.data.faq || []).length;
    const srcLen = (c.data.sources || []).length;
    const decision = c === winner ? '**✅ KEEP (canónica)**' : '301 → winner, o differentiar H1';
    lines.push(`| /${c.data.slug} | ${c.score.toFixed(1)} | ${explLen} | ${faqLen} | ${srcLen} | ${decision} |`);
  }
  // Diff H1s for clarity
  if (new Set(group.map(g => g.data.h1)).size === 1) {
    lines.push('\n⚠️ H1 IDÉNTICO entre todas. Duplicación obvia.');
  }
}

lines.push('\n---\n');
lines.push('## Próximos pasos\n');
lines.push('1. **Revisá cada grupo** y decidí: merge, 301, o differentiate');
lines.push('2. Para 301: agregar regla en Cloudflare Redirect Rules (similar al www → apex)');
lines.push('3. Para differentiate: editar H1/title/slug de la duplicada para apuntar a otro ángulo');
lines.push('4. Para merge: mover mejor content a la canónica, luego 301 de la duplicada');

writeFileSync(OUT, lines.join('\n'));
console.log(`\nReport generado: ${OUT}`);
console.log(`Grupos detectados: ${groups.length}`);
console.log(`Total calcs involucradas: ${groups.reduce((sum, g) => sum + g.length, 0)}`);
