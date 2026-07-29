import { readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'parse5';
import tools from '../src/lib/current-tools-index.json' with { type: 'json' };

const CHECK = process.argv.includes('--check');
const ROOT = process.cwd();
const DIST = join(ROOT, 'dist', 'client');
const OUT = join(ROOT, 'reports', 'internal-linking');
mkdirSync(OUT, { recursive: true });

const normalize = (value, base = 'https://hacecuentas.com') => {
  try {
    const url = new URL(value, base);
    if (url.origin !== 'https://hacecuentas.com') return null;
    return url.pathname === '/' ? '/' : url.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  } catch {
    return null;
  }
};
const attrs = (node) => Object.fromEntries((node.attrs || []).map((attr) => [attr.name, attr.value]));
const walk = (node, fn, inMain = false) => {
  const inside = inMain || node.tagName === 'main';
  fn(node, inside);
  for (const child of node.childNodes || []) walk(child, fn, inside);
  if (node.content) walk(node.content, fn, inside);
};
const files = [];
const collect = (dir) => {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) collect(full);
    else if (name.endsWith('.html')) files.push(full);
  }
};
collect(DIST);

const pages = new Map();
for (const file of files) {
  const doc = parse(readFileSync(file, 'utf8'));
  let canonical;
  const links = new Set();
  walk(doc, (node, inMain) => {
    const a = attrs(node);
    if (node.tagName === 'link' && a.rel === 'canonical') canonical = normalize(a.href);
    if (inMain && node.tagName === 'a') {
      const target = normalize(a.href, `https://hacecuentas.com${canonical || '/'}`);
      if (target) links.add(target);
    }
  });
  if (!canonical) {
    const rel = relative(DIST, file).replaceAll('\\', '/');
    canonical = normalize('/' + rel.replace(/(?:\/index)?\.html$/, ''));
  }
  if (canonical) pages.set(canonical, links);
}

const hubs = tools.map((tool) => normalize(tool.url || `/${tool.slug}`)).filter(Boolean);
const hubSet = new Set(hubs);
const inbound = new Map(hubs.map((hub) => [hub, new Set()]));
const hubInbound = new Map(hubs.map((hub) => [hub, new Set()]));
for (const [source, links] of pages) {
  for (const target of links) {
    if (!hubSet.has(target) || source === target) continue;
    inbound.get(target).add(source);
    if (hubSet.has(source)) hubInbound.get(target).add(source);
  }
}

const seeds = ['/', '/buscar', '/populares', '/global', '/es', '/mx', '/co', '/cl', '/pe', '/ec', '/ve', '/py', '/uy', '/do', '/pt', '/pt-pt', '/en'].filter((path) => pages.has(path));
const depth = new Map(seeds.map((seed) => [seed, 0]));
const queue = [...seeds];
for (let i = 0; i < queue.length; i++) {
  const source = queue[i];
  for (const target of pages.get(source) || []) {
    if (!pages.has(target) || depth.has(target)) continue;
    depth.set(target, depth.get(source) + 1);
    queue.push(target);
  }
}

const rows = hubs.map((hub) => ({
  hub,
  inbound: inbound.get(hub).size,
  hubInbound: hubInbound.get(hub).size,
  depth: depth.get(hub) ?? null,
}));
const failures = rows.filter((row) => row.inbound < 3 || row.hubInbound < 1 || row.depth == null || row.depth > 3);
const report = {
  generatedAt: new Date().toISOString(),
  pages: pages.size,
  hubs: hubs.length,
  orphan: rows.filter((row) => row.inbound === 0).length,
  under3: rows.filter((row) => row.inbound < 3).length,
  withoutHubInbound: rows.filter((row) => row.hubInbound === 0).length,
  unreachable: rows.filter((row) => row.depth == null).length,
  overDepth3: rows.filter((row) => row.depth != null && row.depth > 3).length,
  failures,
};
writeFileSync(join(OUT, 'hub-gate.json'), JSON.stringify(report, null, 2));
console.log(`[hub-interlinking] ${pages.size} páginas · ${hubs.length} hubs`);
console.log(`[hub-interlinking] orphan=${report.orphan} under3=${report.under3} noHubInlink=${report.withoutHubInbound} unreachable=${report.unreachable} depth>3=${report.overDepth3}`);
if (CHECK && failures.length) {
  console.error(`[hub-interlinking] gate falló: ${failures.length} hubs fuera de objetivo`);
  for (const row of failures.slice(0, 25)) console.error(`  ${row.hub} in=${row.inbound} hubIn=${row.hubInbound} depth=${row.depth}`);
  process.exit(1);
}
if (CHECK) console.log('[hub-interlinking] ✓ gate OK');
