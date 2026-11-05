import snapshot from '../data/live/colombia.json';

export interface TrmObservation { valor: number; vigenciaDesde: string }

/** Keep the source's Colombian calendar date; never substitute a fetch date. */
export function validTrm(data: any, now = new Date()): TrmObservation | null {
  const row = data?.trm;
  const date = typeof row?.vigenciaDesde === 'string' ? row.vigenciaDesde.slice(0, 10) : '';
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(now);
  const parsed = new Date(date + 'T00:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) return null;
  if (typeof row.valor !== 'number' || !Number.isFinite(row.valor) || row.valor <= 0) return null;
  if (date > today || date < snapshot.trm.vigenciaDesde.slice(0, 10)) return null;
  return { valor: row.valor, vigenciaDesde: date };
}

async function fetchTrm(): Promise<unknown> {
  const response = await fetch('/api/trm.json', { signal: AbortSignal.timeout(1500) });
  if (!response.ok) throw new Error('TRM unavailable');
  return response.json();
}

/** Only trusted loaders add these internal fields; callers cannot supply them. */
export async function prepareTrmInputs(inputs: Record<string, any>, load = fetchTrm): Promise<Record<string, any>> {
  const { __trmValue, __trmDate, __trmLookup, ...clean } = inputs;
  if (Number.isFinite(Number(clean.trm)) && Number(clean.trm) > 0) return clean;
  try {
    const observation = validTrm(await load());
    if (observation) return { ...clean, __trmValue: observation.valor, __trmDate: observation.vigenciaDesde, __trmLookup: 'live' };
  } catch { /* Preserve the dated build snapshot when live data cannot be used. */ }
  return { ...clean, __trmLookup: 'snapshot' };
}

export const TRM_COMPUTE_CACHE = 'public, max-age=120, must-revalidate';
