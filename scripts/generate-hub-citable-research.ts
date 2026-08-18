/**
 * Dataset reproducible de profundidad editorial de los hubs.
 *
 * No usa tráfico ni inputs de usuarios. Analiza únicamente el corpus publicado:
 * variables, escenarios, fuentes, FAQ y rutas consolidadas. Así cada cifra es
 * auditable y se puede regenerar en cada build sin exponer datos personales.
 */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import currentTools from '../src/lib/current-tools-index.json' with { type: 'json' };

const ROOT = resolve(import.meta.dirname, '..');
const GENERATED = join(ROOT, 'src/lib/hubs/citable-research.json');
const PUBLIC_JSON = join(ROOT, 'public/datasets/hub-citable-research.json');
const PUBLIC_CSV = join(ROOT, 'public/datasets/hub-citable-research.csv');
const generatedAt = new Date().toISOString().slice(0, 10);

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function publisher(source: any): string {
  if (source?.publisher) return String(source.publisher).trim();
  try { return new URL(String(source?.url || '')).hostname.replace(/^www\./, ''); }
  catch { return String(source?.name || '').trim(); }
}

function csv(value: unknown): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

const files = walk(join(ROOT, 'src/lib/hubs'))
  .filter((file) => file.endsWith('.ts') && !file.endsWith('/types.ts') && !file.endsWith('/registry.ts'));
const hubData = new Map<string, any>();
const errors: string[] = [];

const cleanPath = (value: string): string => {
  const pathname = new URL(value, 'https://hacecuentas.com').pathname;
  return pathname === '/' ? '/' : pathname.replace(/\.html$/, '').replace(/\/$/, '');
};

for (const file of files) {
  try {
    const mod: any = await import(`${pathToFileURL(file).href}?research=${Date.now()}`);
    const hub = mod.hub;
    if (!hub?.slug) continue;
    hubData.set(cleanPath(`/${hub.slug}`), hub);
  } catch (error) {
    errors.push(`${relative(ROOT, file)}: ${String(error)}`);
  }
}

if (errors.length) throw new Error(`No se pudo generar research de hubs:\n${errors.join('\n')}`);

const inventory = currentTools.map((tool: any) => ({
  ...tool,
  path: cleanPath(tool.url || `/${tool.slug}`),
}));

const rows: any[] = inventory.map((tool: any) => {
  const hub = hubData.get(tool.path);
  const descendants = inventory.filter((candidate: any) => candidate.path.startsWith(`${tool.path}/`));
  const childHubs = descendants.map((candidate: any) => hubData.get(candidate.path)).filter(Boolean);
  const isCollection = !hub;
  const sourceItems = isCollection ? childHubs.flatMap((item: any) => item.sources || []) : (hub.sources || []);
  const scenarios = isCollection
    ? childHubs.reduce((sum: number, item: any) => sum + Math.max(1, item.cases?.items?.length || 0), 0)
    : Math.max(1, hub.cases?.items?.length || 0);
  const variables = isCollection
    ? childHubs.reduce((sum: number, item: any) => sum + (item.fields?.length || 0), 0)
    : (hub.fields?.length || 0);
  const sources = sourceItems.length;
  const publishers = new Set(sourceItems.map(publisher).filter(Boolean)).size;
  const faq = isCollection
    ? childHubs.reduce((sum: number, item: any) => sum + (item.faq?.length || 0), 0)
    : (hub.faq?.length || 0);
  const routes = isCollection ? descendants.length : Math.max(1, hub.replaces?.length || 0);
  const depthScore = variables + scenarios * 2 + sources * 2 + routes + Math.min(faq, 10);
  return {
    slug: tool.path.replace(/^\//, ''), locale: tool.locale || hub?.locale || 'ar',
    silo: tool.category || hub?.silo || tool.path.split('/').filter(Boolean).at(-1) || 'global',
    title: tool.h1 || tool.title || hub?.h1, pageType: isCollection ? 'collection' : 'decision',
    scenarios, variables, sources, publishers, faq, routes, depthScore,
    lastReviewed: hub?.lastReviewed || generatedAt,
  };
});

const groups = new Map<string, any[]>();
for (const row of rows) {
  const key = `${row.locale}::${row.pageType}`;
  groups.set(key, [...(groups.get(key) || []), row]);
}

for (const row of rows) {
  const peers = groups.get(`${row.locale}::${row.pageType}`) || [row];
  const atOrBelow = peers.filter((peer) => peer.depthScore <= row.depthScore).length;
  row.depthPercentile = Math.round((atOrBelow / peers.length) * 100);
  row.peerHubs = peers.length;
}

rows.sort((a, b) => a.slug.localeCompare(b.slug));
const bySlug = Object.fromEntries(rows.map((row) => [row.slug, row]));
const payload = {
  methodology: {
    generatedAt,
    corpusHubs: rows.length,
    decisionHubs: rows.filter((row) => row.pageType === 'decision').length,
    collectionHubs: rows.filter((row) => row.pageType === 'collection').length,
    description: 'Análisis reproducible del inventario oficial de hubs de Hacé Cuentas; no usa tráfico ni datos personales.',
    depthScore: 'variables + (escenarios × 2) + (fuentes × 2) + rutas consolidadas + min(FAQ, 10)',
    percentile: 'Porcentaje de hubs del mismo locale y tipo de página con puntaje de profundidad menor o igual.',
  },
  hubs: bySlug,
};

for (const file of [GENERATED, PUBLIC_JSON, PUBLIC_CSV]) mkdirSync(dirname(file), { recursive: true });
writeFileSync(GENERATED, `${JSON.stringify(payload, null, 2)}\n`);
writeFileSync(PUBLIC_JSON, `${JSON.stringify(payload, null, 2)}\n`);
const headers = ['slug','locale','silo','title','scenarios','variables','sources','publishers','faq','routes','depthScore','depthPercentile','peerHubs','lastReviewed'];
writeFileSync(PUBLIC_CSV, `${headers.join(',')}\n${rows.map((row) => headers.map((key) => csv(row[key])).join(',')).join('\n')}\n`);
console.log(`[hub-research] ${rows.length} hubs → ${relative(ROOT, PUBLIC_CSV)} + JSON`);
