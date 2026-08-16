/**
 * CI guard: valida cada JSON de los catálogos `src/content/calcs*`.
 * `dataUpdate` bien formado. Corre en prebuild antes de astro build. Si falta
 * o es inválido, corta el build con exit 1 y lista las calcs fallidas.
 *
 * Evita que nuevas calcs lleguen a producción sin declarar su frecuencia de
 * actualización de datos.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT_DIR = join(process.cwd(), 'src/content');
const CALCS_DIRS = readdirSync(CONTENT_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^calcs(?:-|$)/.test(entry.name))
  .map((entry) => ({ name: entry.name, path: join(CONTENT_DIR, entry.name) }));

const VALID_FREQUENCIES = new Set(['never', 'daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'yearly', 'annual']);
const VALID_UPDATE_TYPES = new Set(['manual', 'auto-api', 'auto-scrape', 'auto-llm', 'auto-live']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

interface Issue {
  slug: string;
  reason: string;
}

function validate(calc: any, slug: string): Issue[] {
  const issues: Issue[] = [];
  const du = calc.dataUpdate;
  if (!du) {
    return [{ slug, reason: 'falta el campo dataUpdate' }];
  }
  if (!du.frequency || !VALID_FREQUENCIES.has(du.frequency)) {
    issues.push({ slug, reason: `frequency inválido: ${du.frequency} (debe ser ${[...VALID_FREQUENCIES].join(' | ')})` });
  }
  if (!du.updateType || !VALID_UPDATE_TYPES.has(du.updateType)) {
    issues.push({ slug, reason: `updateType inválido: ${du.updateType} (debe ser ${[...VALID_UPDATE_TYPES].join(' | ')})` });
  }
  if (!du.lastUpdated || !DATE_RE.test(du.lastUpdated)) {
    issues.push({ slug, reason: `lastUpdated debe ser YYYY-MM-DD, recibido: ${du.lastUpdated}` });
  }
  // Si frequency != never, exigir source + sourceUrl (trazabilidad)
  if (du.frequency && du.frequency !== 'never') {
    if (!du.source) issues.push({ slug, reason: 'source requerido cuando frequency != never' });
    if (!du.sourceUrl) issues.push({ slug, reason: 'sourceUrl requerido cuando frequency != never' });
  }
  if (du.updateType === 'auto-live' && (!du.liveSource || typeof du.liveSource !== 'string')) {
    issues.push({ slug, reason: 'liveSource requerido cuando updateType = auto-live' });
  }
  return issues;
}

function main() {
  const files = CALCS_DIRS.flatMap((dir) =>
    readdirSync(dir.path)
      .filter((file) => file.endsWith('.json'))
      .map((file) => ({ ...dir, file }))
  );
  const allIssues: Issue[] = [];
  for (const { name, path, file } of files) {
    const slug = file.replace(/\.json$/, '');
    try {
      const calc = JSON.parse(readFileSync(join(path, file), 'utf8'));
      allIssues.push(...validate(calc, slug));
    } catch (err) {
      allIssues.push({ slug, reason: `JSON inválido en ${name}/${file}: ${(err as Error).message}` });
    }
  }

  if (allIssues.length > 0) {
    console.error(`\n[validate-data-updates] ❌ ${allIssues.length} problemas en ${new Set(allIssues.map((i) => i.slug)).size} calcs:\n`);
    for (const { slug, reason } of allIssues) {
      console.error(`  • ${slug}: ${reason}`);
    }
    console.error(`\nCada JSON en src/content/calcs/ debe tener un bloque dataUpdate así:\n`);
    console.error(`  "dataUpdate": {`);
    console.error(`    "frequency": "never | daily | weekly | monthly | biannual | yearly",`);
    console.error(`    "lastUpdated": "${new Date().toISOString().slice(0, 10)}",`);
    console.error(`    "source": null,             // requerido si frequency != never`);
    console.error(`    "sourceUrl": null,          // requerido si frequency != never`);
    console.error(`    "updateType": "manual | auto-api | auto-scrape | auto-llm | auto-live",`);
    console.error(`    "notes": "opcional"`);
    console.error(`  }\n`);
    process.exit(1);
  }

  console.log(`[validate-data-updates] ✓ ${files.length} calcs OK en ${CALCS_DIRS.length} catálogos`);

  // Warning (non-blocking): calcs con <7 FAQs. La regla de producto (CLAUDE.md)
  // pide mínimo 7 FAQs por calc para cobertura SEO decente. No rompemos el
  // build con las legacy; listamos para que el editor vea el backlog.
  const FAQ_MIN = 7;
  const lowFaq: Array<{ slug: string; count: number }> = [];
  for (const { path, file } of files) {
    const slug = file.replace(/\.json$/, '');
    try {
      const calc = JSON.parse(readFileSync(join(path, file), 'utf8'));
      const raw = calc.faqs ?? calc.faq;
      const arr = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? Object.values(raw) : [];
      if (arr.length < FAQ_MIN) lowFaq.push({ slug, count: arr.length });
    } catch {
      // ya reportado arriba como JSON inválido.
    }
  }

  if (lowFaq.length > 0) {
    const byCount = new Map<number, number>();
    for (const { count } of lowFaq) byCount.set(count, (byCount.get(count) ?? 0) + 1);
    const dist = [...byCount.entries()].sort((a, b) => a[0] - b[0]).map(([c, n]) => `${n}×${c}`).join(', ');
    console.warn(`[validate-data-updates] ⚠ ${lowFaq.length} calcs con <${FAQ_MIN} FAQs (distribución: ${dist}). Top 10:`);
    for (const { slug, count } of lowFaq.sort((a, b) => a.count - b.count).slice(0, 10)) {
      console.warn(`    ${count} FAQs → ${slug}`);
    }
  }
}

main();
