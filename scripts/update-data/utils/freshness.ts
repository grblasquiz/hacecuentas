/**
 * Lee todos los calcs JSON y devuelve los slugs que están vencidos según su
 * frequency declarada en dataUpdate. Se compara contra `lastUpdated` + margen
 * de gracia (ej: monthly = 31 días desde último update).
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src/content/calcs');

export type Frequency = 'never' | 'daily' | 'weekly' | 'monthly' | 'biannual' | 'yearly';

export interface CalcInfo {
  slug: string;
  file: string;
  formulaId: string;
  frequency: Frequency;
  updateType: 'manual' | 'auto-api' | 'auto-scrape' | 'auto-llm';
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
  biannual: 183,
  yearly: 365,
};

export function listAllCalcs(): CalcInfo[] {
  const files = readdirSync(CALCS_DIR).filter((f) => f.endsWith('.json'));
  const out: CalcInfo[] = [];
  for (const f of files) {
    const calc = JSON.parse(readFileSync(join(CALCS_DIR, f), 'utf8'));
    const du = calc.dataUpdate;
    if (!du) continue; // calc sin dataUpdate (no debería pasar, pero por las dudas)
    out.push({
      slug: calc.slug,
      file: f,
      formulaId: calc.formulaId,
      frequency: du.frequency,
      updateType: du.updateType,
      source: du.source,
      sourceUrl: du.sourceUrl,
      lastUpdated: du.lastUpdated,
      notes: du.notes,
    });
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
