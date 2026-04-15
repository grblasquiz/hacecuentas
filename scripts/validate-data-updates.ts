/**
 * CI guard: valida que cada calc en src/content/calcs/*.json tenga un campo
 * `dataUpdate` bien formado. Corre en prebuild antes de astro build. Si falta
 * o es inválido, corta el build con exit 1 y lista las calcs fallidas.
 *
 * Evita que nuevas calcs lleguen a producción sin declarar su frecuencia de
 * actualización de datos.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src/content/calcs');

const VALID_FREQUENCIES = new Set(['never', 'daily', 'weekly', 'monthly', 'biannual', 'yearly']);
const VALID_UPDATE_TYPES = new Set(['manual', 'auto-api', 'auto-scrape', 'auto-llm']);
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
  return issues;
}

function main() {
  const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
  const allIssues: Issue[] = [];
  for (const f of files) {
    const slug = f.replace(/\.json$/, '');
    try {
      const calc = JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8'));
      allIssues.push(...validate(calc, slug));
    } catch (err) {
      allIssues.push({ slug, reason: `JSON inválido: ${(err as Error).message}` });
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
    console.error(`    "updateType": "manual | auto-api | auto-scrape | auto-llm",`);
    console.error(`    "notes": "opcional"`);
    console.error(`  }\n`);
    process.exit(1);
  }

  console.log(`[validate-data-updates] ✓ ${files.length} calcs OK`);
}

main();
