/**
 * Lee todos los calcs JSON y devuelve los slugs que están vencidos según su
 * frequency declarada en dataUpdate. Se compara contra `lastUpdated` + margen
 * de gracia (ej: monthly = 31 días desde último update).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT_DIR = join(process.cwd(), 'src/content');

export type Frequency = 'never' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'yearly';

export interface CalcInfo {
  slug: string;
  file: string;
  formulaId: string;
  frequency: Frequency;
  updateType: 'manual' | 'auto-api' | 'auto-live' | 'auto-scrape' | 'auto-llm';
  source?: string | null;
  sourceUrl?: string | null;
  lastUpdated: string;
  notes?: string;
}

// Días de gracia por frequency: consideramos "vencida" cuando pasó ese intervalo.
const DAYS_BY_FREQ: Record<Frequency, number> = {
  never: Infinity,
  daily: 1,
  weekly: 7,
  monthly: 31,
  quarterly: 92,
  biannual: 183,
  yearly: 365,
};

export function listAllCalcs(): CalcInfo[] {
  const dirs = readdirSync(CONTENT_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^calcs(?:-|$)/.test(d.name))
    .map((d) => d.name);
  const out: CalcInfo[] = [];
  for (const dir of dirs) {
    const files = readdirSync(join(CONTENT_DIR, dir)).filter((f) => f.endsWith('.json'));
    for (const f of files) {
      const calc = JSON.parse(readFileSync(join(CONTENT_DIR, dir, f), 'utf8'));
      const du = calc.dataUpdate;
      if (!du) continue;
      out.push({
        slug: calc.slug,
        file: `${dir}/${f}`,
        formulaId: calc.formulaId,
        frequency: du.frequency,
        updateType: du.updateType,
        source: du.source,
        sourceUrl: du.sourceUrl,
        lastUpdated: du.lastUpdated,
        notes: du.notes,
      });
    }
  }
  return out;
}

export function isStale(calc: CalcInfo, now = new Date()): boolean {
  if (calc.frequency === 'never') return false;
  const last = new Date(calc.lastUpdated + 'T00:00:00Z');
  const ms = now.getTime() - last.getTime();
  const days = ms / (1000 * 60 * 60 * 24);
  return days >= DAYS_BY_FREQ[calc.frequency];
}

export function filterByFrequency(calcs: CalcInfo[], frequency: Frequency | 'all'): CalcInfo[] {
  if (frequency === 'all') return calcs;
  return calcs.filter((c) => c.frequency === frequency);
}
