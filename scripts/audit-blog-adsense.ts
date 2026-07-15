/** Audita el punto ciego del blog en el gate de AdSense. No modifica contenido. */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const DIR = join(ROOT, 'src/content/blog');
const REPORTS = join(ROOT, 'reports');
const GATE = process.argv.includes('--gate');
const strip = (value: unknown) => String(value || '')
  .replace(/<[^>]+>/g, ' ').replace(/&[a-z0-9#]+;/gi, ' ').replace(/\s+/g, ' ').trim();

const rows = readdirSync(DIR).filter((f) => f.endsWith('.json')).map((file) => {
  const post = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
  const body = strip(post.content);
  const words = body ? body.split(/\s+/).length : 0;
  const related = Array.isArray(post.relatedCalcs) ? post.relatedCalcs.filter(Boolean) : [];
  const duplicateRelated = related.filter((slug: string, i: number) => related.indexOf(slug) !== i);
  const externalSources = (String(post.content || '').match(/href=["']https?:\/\//g) || []).length;
  const blocks: string[] = [];
  const warnings: string[] = [];
  if (!String(post.title || '').trim()) blocks.push('P0:title-vacio');
  if (!String(post.description || '').trim()) blocks.push('P0:description-vacia');
  if (words < 150) blocks.push('P0:menos-de-150-palabras');
  if (duplicateRelated.length) blocks.push('P0:relatedCalcs-duplicados');
  if (words < 300) warnings.push('P1:menos-de-300-palabras');
  if (String(post.title || '').length > 66) warnings.push('P1:title-mayor-66');
  if (!related.length) warnings.push('P1:sin-relatedCalcs');
  if (!externalSources) warnings.push('P1:sin-fuente-externa-en-contenido');
  return { file: `src/content/blog/${file}`, slug: post.slug || file.replace(/\.json$/, ''), words,
    chars: body.length, titleChars: String(post.title || '').length, related: related.length,
    externalSources, blocks, warnings };
});

const blocked = rows.filter((row) => row.blocks.length);
const summary = {
  total: rows.length,
  blocked: blocked.length,
  under150: rows.filter((r) => r.words < 150).length,
  under300: rows.filter((r) => r.words < 300).length,
  titleOver66: rows.filter((r) => r.titleChars > 66).length,
  missingRelated: rows.filter((r) => r.related === 0).length,
  missingExternalSource: rows.filter((r) => r.externalSources === 0).length,
  duplicateRelated: rows.filter((r) => r.blocks.includes('P0:relatedCalcs-duplicados')).length,
};
if (!existsSync(REPORTS)) mkdirSync(REPORTS, { recursive: true });
writeFileSync(join(REPORTS, 'blog-adsense-audit.json'), JSON.stringify({ generatedAt: new Date().toISOString(), summary, rows }, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
if (GATE && blocked.length) {
  blocked.forEach((row) => console.error(`${row.slug}: ${row.blocks.join(', ')}`));
  process.exit(1);
}
console.log(GATE ? '[blog-adsense] ✓ gate OK' : '[blog-adsense] reporte generado');
