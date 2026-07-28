import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pending = [];
for (const file of fs.readdirSync(path.join(root, 'work/hubs-pendientes')).filter((f) => /^sueltas-.*\.tsv$/.test(f))) {
  for (const line of fs.readFileSync(path.join(root, 'work/hubs-pendientes', file), 'utf8').trim().split('\n')) {
    const [url] = line.split('\t');
    pending.push(url);
  }
}
if (pending.length !== 166 || new Set(pending).size !== 166) throw new Error(`Expected 166 unique pending URLs, got ${pending.length}/${new Set(pending).size}`);

const redirects = new Map();
for (const rel of fs.readdirSync(path.join(root, 'src/lib/hubs'), { recursive: true })) {
  if (!String(rel).endsWith('.ts')) continue;
  const text = fs.readFileSync(path.join(root, 'src/lib/hubs', String(rel)), 'utf8');
  const slug = text.match(/^\s{2}slug: '([^']+)'/m)?.[1];
  if (!slug) continue;
  const block = text.match(/\n\s{2}replaces:\s*\[([\s\S]*?)\n\s{2}\],/)?.[1] || '';
  for (const old of block.matchAll(/['"]([^'"]+)['"]/g)) {
    if (redirects.has(old[1]) && redirects.get(old[1]) !== `/${slug}`) throw new Error(`Collision ${old[1]}`);
    redirects.set(old[1], `/${slug}`);
  }
}

const missing = pending.filter((url) => !redirects.has(url));
if (missing.length) throw new Error(`Unclaimed pending URLs:\n${missing.join('\n')}`);
const lines = [
  '# Cierre migración hubs de decisión — 166 calculadoras sueltas',
  '# URL_vieja\\tURL_nueva\\t301',
  ...pending.sort().map((old) => `${old}\t${redirects.get(old)}\t301`),
  '',
];
const out = path.join(root, 'scripts/pruning-batches/z8-2026-07-28-cierre-hubs-166.tsv');
fs.writeFileSync(out, lines.join('\n'));

const jsonPaths = [];
for (const old of pending) {
  const [, locale, slug] = old.split('/');
  const dir = path.join(root, `src/content/calcs-${locale}`);
  const matches = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => path.join(dir, f)).filter((file) => {
    try { return JSON.parse(fs.readFileSync(file, 'utf8')).slug === slug; } catch { return false; }
  });
  if (matches.length > 1) throw new Error(`Expected at most one JSON for ${old}, found ${matches.length}`);
  if (matches.length === 1) jsonPaths.push(matches[0]);
}
fs.writeFileSync(path.join(root, 'work/hubs-prune-json-paths.txt'), jsonPaths.sort().join('\n') + '\n');
console.log(JSON.stringify({redirects: pending.length, destinations: new Set(pending.map((u) => redirects.get(u))).size, jsonsRemaining: jsonPaths.length, alreadyPruned: pending.length-jsonPaths.length, out: path.relative(root, out)}, null, 2));
