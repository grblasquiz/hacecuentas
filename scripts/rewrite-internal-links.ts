/**
 * Canonicaliza href internos en el HTML compilado. Las fuentes editoriales y
 * mapas relacionados pueden conservar slugs históricos, pero el artefacto que
 * publicamos nunca debe enlazar un 301/410 propio.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { GONE_410_URLS } from '../src/lib/gone-410.ts';
import { PRUNING_REDIRECTS } from '../src/lib/pruning-redirects.ts';

const ROOT = resolve(import.meta.dirname, '..');
const DIST = join(ROOT, 'dist/client');
const redirects = new Map<string, string>(Object.entries(PRUNING_REDIRECTS));

for (const line of readFileSync(join(ROOT, 'public/_redirects'), 'utf8').split(/\r?\n/)) {
  const parts = line.trim().split(/\s+/);
  if (parts.length >= 3 && /^30[1278]$/.test(parts.at(-1) || '')) redirects.set(parts[0], parts[1]);
}

function files(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...files(path));
    else if (entry.name.endsWith('.html')) out.push(path);
  }
  return out;
}

function canonicalTarget(path: string): string {
  const seen = new Set<string>();
  let current = path;
  while (!seen.has(current)) {
    seen.add(current);
    if (GONE_410_URLS.has(current)) return '/calculadoras';
    const next = redirects.get(current);
    if (!next || !next.startsWith('/')) return next || current;
    current = next;
  }
  return '/calculadoras';
}

let changedFiles = 0;
let rewritten = 0;
for (const file of files(DIST)) {
  const before = readFileSync(file, 'utf8');
  const after = before.replace(/href=(["'])(\/[^"'?#\s]*)([^"']*)\1/g, (full, quote, path, suffix) => {
    const target = canonicalTarget(path);
    if (!target || target === path) return full;
    rewritten++;
    return `href=${quote}${target}${suffix}${quote}`;
  });
  if (after !== before) {
    writeFileSync(file, after);
    changedFiles++;
  }
}

console.log(`[rewrite-links] ${rewritten} href canonicalizados en ${changedFiles} HTML`);
