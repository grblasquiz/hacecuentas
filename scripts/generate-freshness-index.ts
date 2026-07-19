/**
 * generate-freshness-index.ts
 *
 * Genera `public/api/freshness.json`: la metadata de frescura (frequency +
 * lastUpdated + updateType + fuente) de TODAS las calcs con datos que caducan
 * (frequency ≠ never), de los 14 directorios de contenido (calcs* + verticales
 * país). Se publica a prod en cada deploy.
 *
 * Por qué existe: el validador de frescura (check-stale-data) debe poder correr
 * en GitHub Actions SIN depender del checkout de origin/main (que está forkeado
 * ~1300 commits y tiene el catálogo viejo/incompleto). En vez de leer el
 * filesystem del checkout, el workflow fetchea este JSON de PRODUCCIÓN — que
 * siempre refleja el deploy local más reciente (la fuente de verdad real).
 *
 * Corre en el prebuild (fase 1). fs-only y rápido.
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT_DIR = join(process.cwd(), 'src/content');
const OUT = join(process.cwd(), 'public/api/freshness.json');

const CALCS_DIRS = readdirSync(CONTENT_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^calcs(-|$)/.test(d.name))
  .map((d) => d.name);

interface FreshnessEntry {
  slug: string;
  locale: string;
  category: string;
  frequency: string;
  lastUpdated: string;
  updateType: string;
  source?: string;
  sourceUrl?: string;
}

function main() {
  const calcs: FreshnessEntry[] = [];
  for (const dirName of CALCS_DIRS) {
    // locale = sufijo del dir (`calcs-cl` → `cl`, `calcs` → `es`).
    const locale = dirName === 'calcs' ? 'es' : dirName.replace(/^calcs-/, '');
    const dir = join(CONTENT_DIR, dirName);
    for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      let raw: any;
      try {
        raw = JSON.parse(readFileSync(join(dir, file), 'utf8'));
      } catch {
        continue;
      }
      const du = raw?.dataUpdate;
      // Sólo las que declaran una cadencia real (las never no vencen nunca).
      if (!du || !du.frequency || !du.lastUpdated || du.frequency === 'never') continue;
      calcs.push({
        slug: raw.slug ?? file.replace(/\.json$/, ''),
        locale,
        category: raw.category ?? 'sin-categoria',
        frequency: du.frequency,
        lastUpdated: du.lastUpdated,
        updateType: du.updateType ?? 'manual',
        source: du.source,
        sourceUrl: du.sourceUrl,
      });
    }
  }
  calcs.sort((a, b) => a.slug.localeCompare(b.slug));
  const out = {
    generated: new Date().toISOString().slice(0, 10),
    count: calcs.length,
    calcs,
  };
  mkdirSync(join(process.cwd(), 'public/api'), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out));
  console.log(`[freshness-index] ${calcs.length} calcs con cadencia → public/api/freshness.json`);
}

main();
