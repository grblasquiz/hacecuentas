/**
 * Gate de confianza editorial y YMYL.
 *
 * Comprueba el contrato que queda visible en todas las páginas que usan
 * Layout. No inventa credenciales ni convierte un test automatizado en una
 * revisión profesional. Los avisos son deuda editorial; los bloqueos son
 * contradicciones que no deberían llegar al build.
 *
 * Uso:
 *   npm run audit:editorial-trust
 *   npm run audit:editorial-trust:gate
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import {
  hasValidHumanEditorialReview,
  hasValidProfessionalReviewer,
  isNoindexCalc,
  isRestrictedCalc,
} from '../src/lib/content-policy.ts';

const ROOT = resolve(import.meta.dirname, '..');
const CONTENT = join(ROOT, 'src/content');
const REPORTS = join(ROOT, 'reports');
const GATE = process.argv.includes('--gate');
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type Finding = {
  area: 'sitewide' | 'calculator' | 'blog' | 'hub' | 'route';
  file: string;
  url: string;
  risk: string;
  indexable: boolean;
  status: string;
  blocks: string[];
  warnings: string[];
};

const findings: Finding[] = [];
const walk = (dir: string): string[] => {
  if (!existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(file));
    else files.push(file);
  }
  return files;
};
const nonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const validDate = (value: unknown): boolean => typeof value === 'string' && DATE_RE.test(value);
const sourceCount = (item: any): number => {
  const declared = Array.isArray(item?.sources) ? item.sources.filter((source: any) => nonEmpty(source?.url)).length : 0;
  return Math.max(declared, nonEmpty(item?.dataUpdate?.sourceUrl) ? 1 : 0);
};
const add = (finding: Finding): void => findings.push(finding);

// ─── Contrato sitewide ──────────────────────────────────────────────────────
const layout = readFileSync(join(ROOT, 'src/layouts/Layout.astro'), 'utf8');
const trustLayer = existsSync(join(ROOT, 'src/components/EditorialTrustLayer.astro'));
const corrections = existsSync(join(ROOT, 'src/pages/correcciones.astro'));
const policy = existsSync(join(ROOT, 'src/pages/politica-editorial.astro'));
const methodology = existsSync(join(ROOT, 'src/pages/metodologia.astro'));
const author = existsSync(join(ROOT, 'src/pages/autores/martin-rodriguez.astro'));
const sitewideBlocks: string[] = [];
const sitewideWarnings: string[] = [];
if (!trustLayer || !layout.includes('EditorialTrustLayer')) sitewideBlocks.push('missing-sitewide-trust-layer');
if (!layout.includes('meta name="author"')) sitewideBlocks.push('missing-global-author-meta');
if (!corrections) sitewideBlocks.push('missing-corrections-page');
if (!policy) sitewideBlocks.push('missing-editorial-policy');
if (!methodology) sitewideWarnings.push('missing-methodology-page');
if (!author) sitewideBlocks.push('missing-author-page');
add({
  area: 'sitewide', file: 'src/layouts/Layout.astro', url: '/', risk: 'all', indexable: true,
  status: sitewideBlocks.length ? 'incomplete' : 'ready', blocks: sitewideBlocks, warnings: sitewideWarnings,
});

// ─── Calculadoras ───────────────────────────────────────────────────────────
const calcFiles = walk(CONTENT).filter((file) => {
  const rel = relative(CONTENT, file).split('/');
  return file.endsWith('.json') && rel[0]?.startsWith('calcs');
});
for (const file of calcFiles) {
  let calc: any;
  try { calc = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
  if (!calc || typeof calc !== 'object' || Array.isArray(calc)) continue;
  const risk = String(calc.ymylRisk || 'unknown');
  const restricted = isRestrictedCalc(calc);
  const indexable = !isNoindexCalc(calc);
  const blocks: string[] = [];
  const warnings: string[] = [];
  const reviewer = calc.professionalReviewer;
  const hasReviewerObject = reviewer && typeof reviewer === 'object';
  if (hasReviewerObject && !hasValidProfessionalReviewer(calc)) blocks.push('partial-or-invalid-professional-reviewer');
  if (hasReviewerObject && /mart[ií]n\s+rodr[ií]guez/i.test(String(reviewer.name || ''))) {
    blocks.push('editor-listed-as-professional-reviewer');
  }
  if (calc.editorialReview === 'approved' && !hasValidHumanEditorialReview(calc)) {
    blocks.push('approved-without-auditable-human-review');
  }
  if (risk === 'high' && indexable && !hasValidProfessionalReviewer(calc)) {
    blocks.push('high-risk-indexable-without-professional-reviewer');
  }
  if (indexable && risk !== 'low' && sourceCount(calc) === 0) warnings.push('ymyl-page-without-specific-source');
  if (indexable && risk !== 'low' && !validDate(calc.lastReviewed || calc.editorialReviewedAt || calc.dataUpdate?.lastUpdated)) {
    warnings.push('ymyl-page-without-review-date');
  }
  if (restricted && calc.noindex !== true && calc.status !== 'draft' && calc.distribution !== 'restricted') {
    warnings.push('restriction-derived-by-policy');
  }
  const rel = relative(ROOT, file);
  const collection = relative(CONTENT, file).split('/')[0] || 'calcs';
  const locale = collection === 'calcs' ? '' : `/${collection.replace(/^calcs-?/, '')}`;
  add({
    area: 'calculator', file: rel, url: `${locale}/${calc.slug || file.split('/').pop()?.replace(/\.json$/, '')}`.replace(/\/+/g, '/'),
    risk, indexable,
    status: restricted ? 'restricted' : hasValidProfessionalReviewer(calc) ? 'professional-reviewed' : indexable ? 'indexable' : 'noindex',
    blocks, warnings,
  });
}

// ─── Blog YMYL ──────────────────────────────────────────────────────────────
for (const file of walk(join(CONTENT, 'blog')).filter((item) => item.endsWith('.json'))) {
  let post: any;
  try { post = JSON.parse(readFileSync(file, 'utf8')); } catch { continue; }
  const risk = ['finanzas', 'negocios', 'salud', 'familia'].includes(String(post.category)) ? 'medium' : 'low';
  const indexable = post.noindex !== true;
  const blocks: string[] = [];
  const warnings: string[] = [];
  const reviewer = post.professionalReviewer;
  if (reviewer && !hasValidProfessionalReviewer({ professionalReviewer: reviewer })) blocks.push('partial-or-invalid-professional-reviewer');
  if (reviewer && /mart[ií]n\s+rodr[ií]guez/i.test(String(reviewer.name || ''))) blocks.push('editor-listed-as-professional-reviewer');
  if (indexable && risk !== 'low' && sourceCount(post) === 0 && !/https?:\/\//i.test(String(post.content || ''))) {
    warnings.push('ymyl-post-without-specific-source');
  }
  if (indexable && !validDate(post.updatedDate || post.lastReviewed || post.date)) warnings.push('post-without-review-date');
  add({
    area: 'blog', file: relative(ROOT, file), url: `/blog/${post.slug || file.split('/').pop()?.replace(/\.json$/, '')}`,
    risk, indexable, status: indexable ? 'indexable' : 'noindex', blocks, warnings,
  });
}

// ─── Hubs ───────────────────────────────────────────────────────────────────
const hubFiles = walk(join(ROOT, 'src/lib/hubs'))
  .filter((file) => file.endsWith('.ts') && !file.endsWith('/types.ts') && !file.endsWith('/registry.ts'));
for (const file of hubFiles) {
  try {
    const mod: any = await import(new URL(`file://${file}`).href);
    const hub = mod.hub;
    if (!hub?.slug) continue;
    const blocks: string[] = [];
    const warnings: string[] = [];
    if (!Array.isArray(hub.sources) || hub.sources.length === 0) blocks.push('hub-without-sources');
    if (!validDate(hub.lastReviewed)) blocks.push('hub-without-review-date');
    if (!Array.isArray(hub.faq) || hub.faq.length < 7) blocks.push('hub-faq-under-7');
    if (hub.professionalReviewer && !hasValidProfessionalReviewer({ professionalReviewer: hub.professionalReviewer })) {
      blocks.push('partial-or-invalid-professional-reviewer');
    }
    if (Array.isArray(hub.sources) && hub.sources.length < 2) warnings.push('hub-with-fewer-than-2-sources');
    add({ area: 'hub', file: relative(ROOT, file), url: `/${hub.slug}`, risk: String(hub.ymylRisk || 'unknown'), indexable: true,
      status: blocks.length ? 'incomplete' : 'ready', blocks, warnings });
  } catch (error) {
    add({ area: 'hub', file: relative(ROOT, file), url: '', risk: 'unknown', indexable: true, status: 'error',
      blocks: [`hub-import-error:${String(error)}`], warnings: [] });
  }
}

// ─── Plantillas ─────────────────────────────────────────────────────────────
for (const file of walk(join(ROOT, 'src/pages')).filter((item) => item.endsWith('.astro'))) {
  const source = readFileSync(file, 'utf8');
  if (!source.includes('<Layout')) continue;
  const blocks: string[] = [];
  const warnings: string[] = [];
  add({ area: 'route', file: relative(ROOT, file), url: '', risk: 'all', indexable: true, status: blocks.length ? 'incomplete' : 'ready', blocks, warnings });
}

const allBlocks = findings.flatMap((item) => item.blocks.map((block) => `${item.area}:${item.file}:${block}`));
const allWarnings = findings.flatMap((item) => item.warnings.map((warning) => `${item.area}:${item.file}:${warning}`));
const summary = {
  generatedAt: new Date().toISOString(),
  score: allBlocks.length === 0 ? 10 : Math.max(0, 10 - Math.min(10, allBlocks.length / 5)),
  totalFindings: findings.length,
  byArea: Object.fromEntries(['sitewide', 'calculator', 'blog', 'hub', 'route'].map((area) => [area, findings.filter((item) => item.area === area).length])),
  blocks: allBlocks.length,
  warnings: allWarnings.length,
  indexableCalculators: findings.filter((item) => item.area === 'calculator' && item.indexable).length,
  restrictedCalculators: findings.filter((item) => item.area === 'calculator' && item.status === 'restricted').length,
  professionalReviewers: findings.filter((item) => item.area === 'calculator' && item.status === 'professional-reviewed').length,
};

mkdirSync(REPORTS, { recursive: true });
writeFileSync(join(REPORTS, 'editorial-trust.json'), JSON.stringify({ summary, findings }, null, 2) + '\n');
writeFileSync(join(REPORTS, 'editorial-trust.csv'), [
  'area,file,url,risk,indexable,status,blocks,warnings',
  ...findings.map((item) => [item.area, item.file, item.url, item.risk, item.indexable, item.status, item.blocks.join('|'), item.warnings.join('|')]
    .map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')),
].join('\n') + '\n');
writeFileSync(join(REPORTS, 'editorial-trust.md'), [
  '# Confianza editorial y YMYL', '',
  `Score contractual: **${summary.score.toFixed(1)}/10**`, '',
  `Bloqueos: ${summary.blocks} · avisos: ${summary.warnings} · páginas indexables: ${summary.indexableCalculators} calculadoras`, '',
  'Los avisos no inventan evidencia: señalan páginas que todavía pueden mejorar fuentes o trazabilidad. Un revisor profesional sólo cuenta cuando sus credenciales, perfil y fecha son verificables.', '',
  ...allBlocks.slice(0, 100).map((item) => `- BLOQUEO: ${item}`),
  ...allWarnings.slice(0, 100).map((item) => `- Aviso: ${item}`),
  '',
].join('\n'));

console.log(JSON.stringify(summary, null, 2));
if (GATE && allBlocks.length > 0) {
  for (const block of allBlocks) console.error(block);
  process.exit(1);
}
console.log(GATE ? '[editorial-trust] ✓ gate OK' : '[editorial-trust] reporte generado');
