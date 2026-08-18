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
const rows: any[] = [];
const errors: string[] = [];

for (const file of files) {
  try {
    const mod: any = await import(`${pathToFileURL(file).href}?research=${Date.now()}`);
    const hub = mod.hub;
    if (!hub?.slug) continue;
    const scenarios = Math.max(1, hub.cases?.items?.length || 0);
    const variables = hub.fields?.length || 0;
    const sources = hub.sources?.length || 0;
    const publishers = new Set((hub.sources || []).map(publisher).filter(Boolean)).size;
    const faq = hub.faq?.length || 0;
    const routes = Math.max(1, hub.replaces?.length || 0);
    // Ponderación pública y estable: una rama de decisión requiere más modelado
    // que un campo; fuentes y rutas suman evidencia/cobertura, FAQ suma contexto.
    const depthScore = variables + scenarios * 2 + sources * 2 + routes + Math.min(faq, 10);
    rows.push({
      slug: hub.slug, locale: hub.locale || 'ar', silo: hub.silo,
      title: hub.h1, scenarios, variables, sources, publishers, faq, routes,
      depthScore, lastReviewed: hub.lastReviewed,
    });
  } catch (error) {
    errors.push(`${relative(ROOT, file)}: ${String(error)}`);
  }
}

if (errors.length) throw new Error(`No se pudo generar research de hubs:\n${errors.join('\n')}`);

const groups = new Map<string, any[]>();
for (const row of rows) {
  const key = `${row.locale}::${row.silo}`;
  groups.set(key, [...(groups.get(key) || []), row]);
}

for (const row of rows) {
  const peers = groups.get(`${row.locale}::${row.silo}`) || [row];
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
    description: 'Análisis reproducible del corpus editorial de hubs de Hacé Cuentas; no usa tráfico ni datos personales.',
    depthScore: 'variables + (escenarios × 2) + (fuentes × 2) + rutas consolidadas + min(FAQ, 10)',
    percentile: 'Porcentaje de hubs del mismo locale y silo con puntaje de profundidad menor o igual.',
  },
  hubs: bySlug,
};

for (const file of [GENERATED, PUBLIC_JSON, PUBLIC_CSV]) mkdirSync(dirname(file), { recursive: true });
writeFileSync(GENERATED, `${JSON.stringify(payload, null, 2)}\n`);
writeFileSync(PUBLIC_JSON, `${JSON.stringify(payload, null, 2)}\n`);
const headers = ['slug','locale','silo','title','scenarios','variables','sources','publishers','faq','routes','depthScore','depthPercentile','peerHubs','lastReviewed'];
writeFileSync(PUBLIC_CSV, `${headers.join(',')}\n${rows.map((row) => headers.map((key) => csv(row[key])).join(',')).join('\n')}\n`);
console.log(`[hub-research] ${rows.length} hubs → ${relative(ROOT, PUBLIC_CSV)} + JSON`);
