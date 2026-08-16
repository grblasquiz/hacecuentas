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

import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
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
  editorialLastUpdated?: string;
  updateType: string;
  source?: string;
  sourceUrl?: string;
  riskLevel: 'A' | 'B' | 'C';
  freshnessRequired: boolean;
  status: 'fresh' | 'stale' | 'stable';
}

const HIGH_RISK_CATEGORIES = new Set(['trabajo', 'impuestos', 'salud', 'jubilacion']);
const MEDIUM_RISK_CATEGORIES = new Set(['finanzas', 'inversiones', 'alquiler', 'vivienda', 'negocios']);
const THRESHOLDS: Record<string, number> = {
  daily: 3, weekly: 14, monthly: 45, quarterly: 120,
  biannual: 200, yearly: 400, annual: 400,
};

function classify(raw: any): 'A' | 'B' | 'C' {
  const category = String(raw.category ?? '');
  const text = `${raw.slug ?? ''} ${raw.title ?? ''} ${raw.h1 ?? ''}`.toLowerCase();
  if (HIGH_RISK_CATEGORIES.has(category) || /indemniz|impuesto|salario|sueldo|jubil|medic|salud|embarazo/.test(text)) return 'A';
  if (MEDIUM_RISK_CATEGORIES.has(category) || /inflaci|tasa|d[oó]lar|cr[eé]dito|pr[eé]stamo|alquiler/.test(text)) return 'B';
  return 'C';
}

function effectiveLastUpdated(du: any): string {
  if (du.updateType !== 'auto-live' || typeof du.liveSource !== 'string') return du.lastUpdated;
  const dates: string[] = [];
  for (const source of du.liveSource.split(',').map((value: string) => value.trim()).filter(Boolean)) {
    const file = join(CONTENT_DIR, '..', 'data', 'live', `${source}.json`);
    if (!existsSync(file)) continue;
    let date = new Date(statSync(file).mtimeMs).toISOString().slice(0, 10);
    try {
      const fetchedAt = JSON.parse(readFileSync(file, 'utf8'))?._meta?.fetchedAt;
      if (fetchedAt && !Number.isNaN(Date.parse(fetchedAt))) date = String(fetchedAt).slice(0, 10);
    } catch { /* mtime como fallback */ }
    dates.push(date);
  }
  return dates.sort()[0] ?? du.lastUpdated;
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
      if (!du || !du.frequency || !du.lastUpdated) continue;
      const riskLevel = classify(raw);
      const freshnessRequired = du.frequency !== 'never';
      const threshold = THRESHOLDS[du.frequency];
      const effectiveDate = effectiveLastUpdated(du);
      const ageDays = Math.floor((Date.now() - Date.parse(`${effectiveDate}T00:00:00Z`)) / 86_400_000);
      calcs.push({
        slug: raw.slug ?? file.replace(/\.json$/, ''),
        locale,
        category: raw.category ?? 'sin-categoria',
        frequency: du.frequency,
        lastUpdated: effectiveDate,
        editorialLastUpdated: effectiveDate !== du.lastUpdated ? du.lastUpdated : undefined,
        updateType: du.updateType ?? 'manual',
        source: du.source,
        sourceUrl: du.sourceUrl,
        riskLevel,
        freshnessRequired,
        status: !freshnessRequired ? 'stable' : threshold != null && ageDays > threshold ? 'stale' : 'fresh',
      });
    }
  }
  calcs.sort((a, b) => a.slug.localeCompare(b.slug));
  const out = {
    generated: new Date().toISOString().slice(0, 10),
    count: calcs.length,
    dynamicCount: calcs.filter((calc) => calc.freshnessRequired).length,
    riskSummary: {
      A: calcs.filter((calc) => calc.riskLevel === 'A').length,
      B: calcs.filter((calc) => calc.riskLevel === 'B').length,
      C: calcs.filter((calc) => calc.riskLevel === 'C').length,
      stale: calcs.filter((calc) => calc.status === 'stale').length,
    },
    calcs,
  };
  mkdirSync(join(process.cwd(), 'public/api'), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out));
  console.log(`[freshness-index] ${calcs.length} calcs cubiertas (${out.dynamicCount} dinámicas, ${out.riskSummary.stale} vencidas) → public/api/freshness.json`);
}

main();
