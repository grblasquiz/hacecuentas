import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pagesRoot = path.join(root, 'src/pages');
const hubsRoot = path.join(root, 'src/lib/hubs');

function walk(dir, ext) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full, ext) : entry.name.endsWith(ext) ? [full] : [];
  });
}

function routeForPage(file) {
  const rel = path.relative(pagesRoot, file).replaceAll(path.sep, '/').replace(/\.astro$/, '');
  return rel.endsWith('/index') ? rel.slice(0, -6) : rel;
}

const hubBySlug = new Map();
for (const file of walk(hubsRoot, '.ts')) {
  if (file.endsWith('/types.ts')) continue;
  const source = fs.readFileSync(file, 'utf8');
  const slug = source.match(/\bslug:\s*['"`]([^'"`]+)['"`]/)?.[1];
  if (slug && /export const hub\b/.test(source)) hubBySlug.set(slug, file);
}

const changed = [];
const unmatched = [];
for (const page of walk(pagesRoot, '.astro')) {
  let source = fs.readFileSync(page, 'utf8');
  if (!source.includes('Herramienta clara, gratuita y actualizada')) continue;
  const route = routeForPage(page);
  const hubFile = hubBySlug.get(route);
  if (!hubFile) {
    unmatched.push(route);
    continue;
  }

  const importPathRaw = path.relative(path.dirname(page), hubFile).replaceAll(path.sep, '/').replace(/\.ts$/, '');
  const importPath = importPathRaw.startsWith('.') ? importPathRaw : `./${importPathRaw}`;
  if (!/import\s+\{\s*hub\s*\}/.test(source)) {
    const lastImport = [...source.matchAll(/^import .*;$/gm)].at(-1);
    if (!lastImport) throw new Error(`Sin imports en ${page}`);
    const at = lastImport.index + lastImport[0].length;
    source = source.slice(0, at) + `\nimport { hub } from '${importPath}';` + source.slice(at);
  }

  source = source.replace(/name:("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/, 'name:hub.title');
  source = source.replace(
    /<Layout title=("(?:[^"\\]|\\.)*") description=("(?:[^"\\]|\\.)*Herramienta clara, gratuita y actualizada\.")/,
    '<Layout title={hub.title} description={hub.description}',
  );

  if (source.includes('Herramienta clara, gratuita y actualizada')) {
    throw new Error(`No se pudo reemplazar metadata genérica en ${page}`);
  }
  fs.writeFileSync(page, source);
  changed.push(route);
}

console.log(`Metadata específica aplicada: ${changed.length}`);
console.log(`Sin HubData equivalente: ${unmatched.length}`);
for (const route of unmatched) console.log(`  - ${route}`);

