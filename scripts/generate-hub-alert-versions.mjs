import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

const ROOT = process.cwd();
const PAGES = join(ROOT, 'src/pages');
const SKIP = new Set(['Layout.astro', 'Header.astro', 'Footer.astro']);
const CALCULATOR_MARKER = /<form[^>]+class=["'][^"']*(?:calc|calculator|lab)[^"']*["']|data-calculator/;
const IMPORT_PATTERN = /(?:import|export)\s+(?:[^'"]*?\sfrom\s*)?['"]([^'"]+)['"]/g;

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? files(full) : [full];
  });
}

function resolveImport(from, spec) {
  if (!spec.startsWith('.')) return null;
  const base = resolve(dirname(from), spec);
  for (const candidate of [base, `${base}.ts`, `${base}.js`, `${base}.mjs`, `${base}.json`, `${base}.astro`, join(base, 'index.ts')]) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

function graph(file, seen = new Set()) {
  if (seen.has(file) || SKIP.has(file.split('/').pop())) return seen;
  seen.add(file);
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(IMPORT_PATTERN)) {
    const dep = resolveImport(file, match[1]);
    if (dep) graph(dep, seen);
  }
  return seen;
}

function routeFor(file) {
  let route = '/' + relative(PAGES, file).replace(/\.astro$/, '').replaceAll('\\', '/');
  route = route.replace(/\/index$/, '');
  return route || '/';
}

const out = {};
for (const page of files(PAGES).filter((f) => extname(f) === '.astro' && !f.includes('/api/'))) {
  const source = readFileSync(page, 'utf8');
  const directDeps = [...source.matchAll(IMPORT_PATTERN)]
    .map((match) => resolveImport(page, match[1]))
    .filter(Boolean);
  const componentGraphs = directDeps
    .filter((dep) => extname(dep) === '.astro' && !SKIP.has(dep.split('/').pop()))
    .map((component) => graph(component))
    .filter((deps) => [...deps].some((dep) => extname(dep) === '.astro' && CALCULATOR_MARKER.test(readFileSync(dep, 'utf8'))));
  if (!componentGraphs.length) continue;

  // The version represents calculator logic and imported data, not editorial or SEO copy.
  const deps = new Set();
  for (const componentGraph of componentGraphs) {
    for (const dep of componentGraph) deps.add(dep);
  }
  for (const dep of directDeps.filter((file) => extname(file) !== '.astro')) {
    graph(dep, deps);
  }
  const payload = [...deps].sort().map((f) => `${relative(ROOT, f)}\n${readFileSync(f, 'utf8')}`).join('\n');
  const rawTitle =
    source.match(/(?:const\s+title\s*=|title=)\s*["'`]([^"'`]+)["'`]/)?.[1] ||
    routeFor(page).split('/').pop().replaceAll('-', ' ');
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
  out[routeFor(page)] = {
    version: createHash('sha256').update(payload).digest('hex').slice(0, 24),
    title,
  };
}

const json = JSON.stringify(out, null, 2) + '\n';
writeFileSync(join(ROOT, 'src/lib/alerts/hub-versions.json'), json);
writeFileSync(join(ROOT, 'public/api/hub-alert-versions.json'), json);
console.log(`✓ hub alert versions: ${Object.keys(out).length} hubs`);
