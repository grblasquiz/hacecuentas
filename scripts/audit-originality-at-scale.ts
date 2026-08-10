/**
 * Gate editorial de originalidad a escala.
 *
 * No intenta adivinar si un texto es "bueno" por cantidad de palabras. Comprueba
 * que cada superficie publicada tenga una función editorial reconocible,
 * evidencia mínima de trabajo humano y una URL canónica sin duplicados obvios.
 * Es un reporte de control, no un generador de contenido.
 *
 * Uso:
 *   npm run audit:originality
 *   npm run audit:originality:gate
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = resolve(import.meta.dirname, '..');
const REPORTS = join(ROOT, 'reports');
const PUBLIC = join(ROOT, 'public');
const TODAY = new Date().toISOString().slice(0, 10);
const GATE = process.argv.includes('--gate');
// La plantilla del blog emite siempre el bloque de transparencia editorial,
// el enlace a metodología y el CTA de continuidad. No exigimos que cada post
// invente un relacionado en JSON para considerar que tiene siguiente paso.
const BLOG_TEMPLATE_PROVIDES_NEXT_STEP = true;

type Surface = 'hub' | 'blog' | 'content' | 'route';
type Row = {
  surface: Surface;
  url: string;
  title: string;
  h1: string;
  words: number;
  sources: number;
  internalLinks: number;
  lastReviewed: string;
  blocks: string[];
  warnings: string[];
  fingerprint: string;
};

const rows: Row[] = [];
const hardFailures: string[] = [];
const strip = (value: unknown): string => String(value || '')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&[a-z0-9#]+;/gi, ' ')
  .replace(/[#*_`>\-|()[\]{}]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const words = (value: unknown): number => strip(value).split(/\s+/).filter(Boolean).length;
const normalize = (value: unknown): string => strip(value)
  .toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim();
const fingerprint = (value: unknown): string => createHash('sha1').update(normalize(value)).digest('hex').slice(0, 12);
const internalLinkCount = (value: unknown): number =>
  (String(value || '').match(/href=["']\/(?!\/)[^"']+/gi) || []).length;
const externalLinkCount = (value: unknown): number =>
  (String(value || '').match(/href=["']https?:\/\//gi) || []).length;
const csv = (value: unknown): string => `"${String(value ?? '').replace(/"/g, '""')}"`;

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const result: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else result.push(full);
  }
  return result;
}

function addRow(row: Row): void {
  rows.push(row);
  for (const block of row.blocks) hardFailures.push(`${row.surface}:${row.url}:${block}`);
}

function sourceCount(value: any): number {
  const sources = Array.isArray(value?.sources) ? value.sources : [];
  const fromData = value?.dataUpdate?.sourceUrl ? 1 : 0;
  return Math.max(sources.length, fromData);
}

// ─── Hubs de decisión ───────────────────────────────────────────────────────
const hubFiles = walk(join(ROOT, 'src/lib/hubs'))
  .filter((file) => file.endsWith('.ts') && !file.endsWith('/types.ts') && !file.endsWith('/registry.ts'));
const hubErrors: string[] = [];
for (const file of hubFiles) {
  try {
    const mod: any = await import(pathToFileURL(file).href);
    const hub = mod.hub;
    if (!hub?.slug) continue;
    const faq = Array.isArray(hub.faq) ? hub.faq : [];
    const sources = Array.isArray(hub.sources) ? hub.sources : [];
    const cases = Array.isArray(hub.cases?.items) ? hub.cases.items : [];
    const decisionText = [hub.answer?.copy, hub.answer?.plazo, ...cases.map((item: any) => `${item.answer} ${item.plazo}`)].join(' ');
    const body = [
      hub.eyebrow, hub.h1, hub.lede, hub.inputsIntro, hub.fineprint,
      hub.breakdownIntro, hub.answer?.copy, ...cases.flatMap((item: any) => [item.label, item.hint, item.answer, item.plazo, ...item.yes, ...item.warn]),
      ...faq.flatMap((item: any) => [item.q, item.a]), ...sources.map((item: any) => `${item.name} ${item.publisher || ''}`),
    ].join(' ');
    const blocks: string[] = [];
    const warnings: string[] = [];
    if (!String(hub.title || '').trim()) blocks.push('P0:title-vacio');
    if (!String(hub.h1 || '').trim()) blocks.push('P0:h1-vacio');
    if (!String(hub.lede || '').trim()) blocks.push('P0:lede-vacio');
    if (!String(hub.inputsIntro || '').trim()) blocks.push('P0:inputsIntro-vacio');
    if (!String(hub.breakdownIntro || '').trim()) blocks.push('P0:breakdownIntro-vacio');
    if (!faq.length || faq.length < 7) blocks.push('P0:faq-menor-a-7');
    if (!sources.length) blocks.push('P0:sin-fuentes');
    if (!hub.chart?.caption) blocks.push('P0:sin-lectura-de-grafico');
    if (!hub.lastReviewed) blocks.push('P0:sin-fecha-de-revision');
    if (!hub.answer && !cases.length) blocks.push('P0:sin-decision-o-casos');
    if (words(body) < 280) warnings.push('P1:contexto-corto');
    if (sources.length < 2) warnings.push('P1:menos-de-2-fuentes');
    if (!decisionText.trim()) warnings.push('P1:sin-respuesta-accionable');
    addRow({
      surface: 'hub', url: `/${hub.slug}`, title: hub.title || '', h1: hub.h1 || '',
      words: words(body), sources: sources.length, internalLinks: 0,
      lastReviewed: hub.lastReviewed || '', blocks, warnings,
      fingerprint: fingerprint([hub.lede, hub.inputsIntro, hub.breakdownIntro, ...faq.map((item: any) => `${item.q} ${item.a}`)].join(' ')),
    });
  } catch (error) {
    hubErrors.push(`${relative(ROOT, file)}: ${String(error)}`);
  }
}

// ─── Blog ────────────────────────────────────────────────────────────────────
const blogDir = join(ROOT, 'src/content/blog');
for (const file of walk(blogDir).filter((item) => item.endsWith('.json'))) {
  let post: any;
  try { post = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
  const content = String(post.content || '');
  const body = [post.title, post.description, post.answerSnippet, content, ...(post.faq || []).flatMap((item: any) => [item.q, item.a])].join(' ');
  const blocks: string[] = [];
  const warnings: string[] = [];
  const count = words(content);
  if (!String(post.title || '').trim()) blocks.push('P0:title-vacio');
  if (!String(post.description || '').trim()) blocks.push('P0:description-vacia');
  if (count < 150) blocks.push('P0:menos-de-150-palabras');
  if (count < 300) warnings.push('P1:menos-de-300-palabras');
  if (!post.date) warnings.push('P1:sin-fecha');
  if (!post.author) warnings.push('P1:sin-autor-declarado');
  if (!sourceCount(post) && !externalLinkCount(content)) warnings.push('P1:sin-fuente-visible');
  if (!BLOG_TEMPLATE_PROVIDES_NEXT_STEP && !internalLinkCount(content) && !(post.relatedCalcs || []).length) {
    warnings.push('P1:sin-siguiente-paso');
  }
  addRow({
    surface: 'blog', url: `/blog/${post.slug || relative(blogDir, file).replace(/\.json$/, '')}`,
    title: post.title || '', h1: post.title || '', words: count,
    sources: sourceCount(post) || externalLinkCount(content),
    internalLinks: internalLinkCount(content) + (post.relatedCalcs || []).length,
    lastReviewed: post.updatedDate || post.lastReviewed || post.date || '', blocks, warnings,
    fingerprint: fingerprint(content),
  });
}

// ─── Otras colecciones editoriales ───────────────────────────────────────────
const contentDir = join(ROOT, 'src/content');
const contentFiles = walk(contentDir).filter((file) => file.endsWith('.json') && !file.includes('/blog/'));
for (const file of contentFiles) {
  let item: any;
  try { item = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
  if (!item || Array.isArray(item) || !item.slug) continue;
  const rel = relative(contentDir, file).split('/');
  const collection = rel[0] || 'unknown';
  const isCalc = collection.startsWith('calcs');
  const body = [item.h1, item.title, item.description, item.intro, item.keyTakeaway, item.answerSnippet, item.explanation, item.content,
    ...(item.faq || []).flatMap((faq: any) => [faq.q, faq.a]), ...(item.useCases || []), ...(item.sources || []).map((source: any) => source.name)].join(' ');
  const blocks: string[] = [];
  const warnings: string[] = [];
  if (!String(item.title || '').trim()) blocks.push('P0:title-vacio');
  if (isCalc && !String(item.h1 || '').trim()) blocks.push('P0:h1-vacio');
  if (isCalc && !String(item.description || '').trim()) blocks.push('P0:description-vacia');
  if (isCalc && !sourceCount(item)) warnings.push('P1:sin-fuentes');
  if (isCalc && !item.example && !item.solvedExample && !(item.solvedExamples || []).length) warnings.push('P1:sin-ejemplo');
  if (words(body) < 180) warnings.push('P1:contenido-corto');
  addRow({
    surface: 'content', url: `/${item.slug}`, title: item.title || '', h1: item.h1 || '', words: words(body),
    sources: sourceCount(item), internalLinks: internalLinkCount(JSON.stringify(item)),
    lastReviewed: item.lastReviewed || item.updatedDate || item.dataUpdate?.lastUpdated || '', blocks, warnings,
    fingerprint: fingerprint(body),
  });
}

// ─── Rutas Astro ─────────────────────────────────────────────────────────────
const routeFiles = walk(join(ROOT, 'src/pages')).filter((file) => file.endsWith('.astro'));
const routeRows = routeFiles.map((file) => {
  const source = readFileSync(file, 'utf8');
  return {
    surface: 'route' as Surface,
    url: `/${relative(join(ROOT, 'src/pages'), file).replace(/\\/g, '/').replace(/\.astro$/, '').replace(/\/index$/, '')}`.replace('/[...slug]', '/*'),
    title: '', h1: '', words: words(source), sources: externalLinkCount(source), internalLinks: internalLinkCount(source),
    lastReviewed: '', blocks: source.includes('<Layout') ? [] : ['P1:sin-layout-compartido'], warnings: [], fingerprint: fingerprint(source),
  };
});

// ─── Duplicados editoriales ──────────────────────────────────────────────────
function markDuplicate(field: keyof Row, label: string, surfaces: Surface[]): number {
  const groups = new Map<string, Row[]>();
  for (const row of rows.filter((item) => surfaces.includes(item.surface))) {
    const value = normalize(row[field]);
    if (value.length < 24) continue;
    const group = groups.get(value) || [];
    group.push(row); groups.set(value, group);
  }
  let duplicateCount = 0;
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    duplicateCount += group.length - 1;
    for (const row of group) row.warnings.push(`P1:${label}-duplicado:${group.length}`);
  }
  return duplicateCount;
}
const duplicateTitles = markDuplicate('title', 'title', ['hub', 'blog', 'content']);
const duplicateH1s = markDuplicate('h1', 'h1', ['hub', 'content']);
const duplicateFingerprints = markDuplicate('fingerprint', 'cuerpo', ['hub', 'blog', 'content']);

// ─── Sitemap ─────────────────────────────────────────────────────────────────
const sitemapIndex = existsSync(join(PUBLIC, 'sitemap.xml')) ? readFileSync(join(PUBLIC, 'sitemap.xml'), 'utf8') : '';
const childNames = [...sitemapIndex.matchAll(/<loc>[^<]*\/(sitemap-[^<]+\.xml)<\/loc>/g)].map((match) => match[1]);
const sitemapMap = new Map<string, string[]>();
for (const name of childNames) {
  // News y recovery son cohortes operativas que intencionalmente pueden
  // repetir una URL del sitemap editorial: News aporta metadatos de noticia y
  // recovery sirve para un reenvío puntual de Search Console. No los contamos
  // como duplicados del índice canónico de páginas.
  if (name === 'sitemap-images.xml' || name === 'sitemap-news.xml' || name === 'sitemap-hubs-recovery.xml') continue;
  const file = join(PUBLIC, name);
  if (!existsSync(file)) continue;
  const xml = readFileSync(file, 'utf8');
  for (const match of xml.matchAll(/<loc>(https?:\/\/[^<]+)<\/loc>/g)) {
    const url = match[1].replace(/\/$/, '') || match[1];
    const list = sitemapMap.get(url) || [];
    list.push(name); sitemapMap.set(url, list);
  }
}
const duplicatedSitemapUrls = [...sitemapMap.entries()]
  .filter(([, maps]) => new Set(maps).size > 1)
  .map(([url, maps]) => ({ url, maps: [...new Set(maps)] }));

// ─── Resumen y artefactos ────────────────────────────────────────────────────
const hardBlockRows = rows.filter((row) => row.blocks.length);
const warningCount = rows.reduce((total, row) => total + row.warnings.length, 0);
const summary = {
  generatedAt: new Date().toISOString(),
  score: Math.max(0, 10 - Math.min(4, hardBlockRows.length / 25) - Math.min(2, duplicatedSitemapUrls.length / 100)),
  surfaces: {
    hubs: rows.filter((row) => row.surface === 'hub').length,
    blog: rows.filter((row) => row.surface === 'blog').length,
    content: rows.filter((row) => row.surface === 'content').length,
    astroRoutes: routeRows.length,
  },
  hubFiles: hubFiles.length,
  hubImportErrors: hubErrors.length,
  hardBlocks: hardFailures.length + duplicatedSitemapUrls.length,
  warningCount,
  duplicateTitles,
  duplicateH1s,
  duplicateFingerprints,
  sitemapChildrenInIndex: childNames.length,
  sitemapDuplicateUrls: duplicatedSitemapUrls.length,
  sitemapDuplicateSamples: duplicatedSitemapUrls.slice(0, 20),
  blogUnder300: rows.filter((row) => row.surface === 'blog' && row.words < 300).length,
};

if (!existsSync(REPORTS)) mkdirSync(REPORTS, { recursive: true });
writeFileSync(join(REPORTS, 'originality-at-scale.json'), JSON.stringify({ summary, rows, routeRows, hubErrors }, null, 2) + '\n');
writeFileSync(join(REPORTS, 'originality-at-scale.csv'), [
  'surface,url,title,h1,words,sources,internalLinks,lastReviewed,blocks,warnings,fingerprint',
  ...[...rows, ...routeRows].map((row) => [row.surface, row.url, row.title, row.h1, row.words, row.sources, row.internalLinks, row.lastReviewed, row.blocks.join('|'), row.warnings.join('|'), row.fingerprint].map(csv).join(',')),
].join('\n') + '\n');
const topWarnings = [...rows].filter((row) => row.warnings.length || row.blocks.length).sort((a, b) => (b.blocks.length + b.warnings.length) - (a.blocks.length + a.warnings.length)).slice(0, 80);
writeFileSync(join(REPORTS, 'originality-at-scale.md'), [
  `# Originalidad a escala — ${TODAY}`,
  '',
  `Score heurístico: **${summary.score.toFixed(1)}/10**`,
  '',
  `Superficies: ${summary.surfaces.hubs} hubs, ${summary.surfaces.blog} posts, ${summary.surfaces.content} JSON editoriales y ${summary.surfaces.astroRoutes} rutas Astro.`,
  `Bloqueos: ${summary.hardBlocks} · advertencias: ${summary.warningCount} · URLs duplicadas en sitemaps indexables: ${summary.sitemapDuplicateUrls}.`,
  '',
  '## Primeras acciones',
  '',
  ...topWarnings.map((row) => `- ${row.surface} ${row.url}: ${[...row.blocks, ...row.warnings].join(', ')}`),
  '',
].join('\n'));

console.log(JSON.stringify(summary, null, 2));
if (GATE && (summary.hardBlocks > 0 || hubErrors.length > 0)) {
  for (const failure of hardFailures.slice(0, 80)) console.error(failure);
  for (const duplicate of duplicatedSitemapUrls.slice(0, 20)) console.error(`sitemap:duplicada:${duplicate.url}:${duplicate.maps.join('|')}`);
  for (const error of hubErrors) console.error(`hub:import:${error}`);
  process.exit(1);
}
console.log(GATE ? '[originality] ✓ gate OK' : '[originality] reporte generado');
