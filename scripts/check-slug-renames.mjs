#!/usr/bin/env node
/**
 * Check de pre-commit: detecta calcs cuyo `slug` cambió respecto a la version
 * anterior (HEAD) y exige que haya un redirect 301 en public/_redirects desde
 * el slug viejo al nuevo. Si falta, falla y sugiere la línea exacta.
 *
 * Por qué: cada URL indexada vale link equity. Borrar/renombrar sin 301 = 404
 * y pérdida de tráfico orgánico. Esto es regla #1 del CLAUDE.md de hacecuentas.
 *
 * Uso: corre solo via .githooks/pre-commit. Manual: `node scripts/check-slug-renames.mjs`.
 * Bypass de emergencia: `SKIP_SLUG_CHECK=1 git commit ...`
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

if (process.env.SKIP_SLUG_CHECK === '1') {
  console.log('[slug-rename] SKIP_SLUG_CHECK=1 → bypass.');
  process.exit(0);
}

function git(args) {
  try { return execSync(`git ${args}`, { encoding: 'utf8' }); }
  catch { return ''; }
}

// Archivos staged que cambiaron en src/content/calcs/
const stagedRaw = git('diff --cached --name-only --diff-filter=AMR -- src/content/calcs/');
const staged = stagedRaw.split('\n').filter((f) => f.endsWith('.json'));
if (staged.length === 0) process.exit(0);

const redirects = existsSync('public/_redirects')
  ? readFileSync('public/_redirects', 'utf8')
  : '';

const missing = [];
for (const file of staged) {
  // Extract slug del HEAD (versión anterior) y del staged (nueva)
  let oldSlug = null;
  let newSlug = null;
  try {
    const oldContent = git(`show HEAD:${file}`);
    if (oldContent) oldSlug = JSON.parse(oldContent).slug || null;
  } catch {}
  try {
    const newContent = readFileSync(file, 'utf8');
    newSlug = JSON.parse(newContent).slug || null;
  } catch {}

  if (oldSlug && newSlug && oldSlug !== newSlug) {
    // Necesitamos un redirect /<oldSlug> -> /<newSlug>
    const re = new RegExp(`^/${oldSlug.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\\\b`, 'm');
    if (!re.test(redirects)) {
      missing.push({ file, oldSlug, newSlug });
    }
  }
}

if (missing.length === 0) process.exit(0);

console.error('\n❌ Slug renames sin redirect 301. Agregá estas líneas a public/_redirects:\n');
for (const m of missing) {
  const pad = Math.max(40, m.oldSlug.length + 2);
  console.error(`  /${m.oldSlug.padEnd(pad)} /${m.newSlug.padEnd(pad)} 301   # rename de ${m.file}`);
}
console.error('\nRegla #1 de CLAUDE.md: cada URL indexada tiene autoridad acumulada — borrar sin 301 = perder link equity.\n');
console.error('Bypass de emergencia: SKIP_SLUG_CHECK=1 git commit ...\n');
process.exit(1);
