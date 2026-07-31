import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hubsRoot = path.join(root, 'src/lib/hubs');
const output = path.join(root, 'src/data/seo/hub-keywords.json');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.name.endsWith('.ts') ? [full] : [];
  });
}

function field(source, name) {
  return source.match(new RegExp(`\\b${name}:\\s*(['\"\\x60])([\\s\\S]*?)\\1`))?.[2]
    ?.replace(/\\n/g, ' ')
    .replace(/\\s+/g, ' ')
    .trim() || '';
}

function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/\b(202[4-9]|calculadora|calcular|simulador|comparador|guia|tabla|hace cuentas)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

function primaryFrom(title, h1, slug) {
  const base = title || h1 || slug.replaceAll('/', ' ').replaceAll('-', ' ');
  return base
    .replace(/[¿?]/g, '')
    .replace(/\s+[—|]\s+.*$/, '')
    .replace(/\s+202[4-9]\b/g, '')
    .trim();
}

const entries = [];
for (const file of walk(hubsRoot).sort()) {
  if (file.endsWith('/types.ts')) continue;
  const source = fs.readFileSync(file, 'utf8');
  if (!/export const hub\b/.test(source)) continue;
  const slug = field(source, 'slug');
  const title = field(source, 'title');
  const h1 = field(source, 'h1');
  const description = field(source, 'description');
  if (!slug || !title || !h1 || !description) continue;
  const primary = primaryFrom(title, h1, slug);
  const secondary = [...new Set([
    h1.replace(/[¿?]/g, '').trim(),
    slug.split('/').at(-1).replaceAll('-', ' '),
  ].filter((value) => normalize(value) !== normalize(primary)))];
  entries.push({ slug: `/${slug}`, primary, secondary, title, h1, description, source: path.relative(root, file) });
}

const collisions = new Map();
for (const entry of entries) {
  const key = normalize(entry.primary);
  if (!key) continue;
  collisions.set(key, [...(collisions.get(key) || []), entry.slug]);
}
const duplicated = [...collisions.entries()].filter(([, slugs]) => slugs.length > 1);

const payload = {
  generatedAt: new Date().toISOString(),
  strategy: 'Una intención principal por hub canónico; variantes secundarias en H1, introducción y FAQ.',
  total: entries.length,
  duplicatePrimaryCount: duplicated.length,
  duplicatePrimaries: Object.fromEntries(duplicated),
  hubs: entries,
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(payload, null, 2) + '\n');
console.log(`Mapa SEO: ${entries.length} hubs → ${path.relative(root, output)}`);
console.log(`Colisiones de keyword principal: ${duplicated.length}`);
for (const [keyword, slugs] of duplicated) console.log(`  ${keyword}: ${slugs.join(', ')}`);
if (duplicated.length) process.exitCode = 2;

