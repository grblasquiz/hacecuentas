/**
 * GET /api/coop/stats              → resumen de todos los datasets (n total, # segmentos publicados)
 * GET /api/coop/stats?dataset=ID   → segmentos publicados (n ≥ minObs) de ese índice
 *
 * Lectura PÚBLICA de los índices propios (datos originales → backlinks). Sólo
 * expone agregados de segmentos con n ≥ minObs — nunca filas individuales ni
 * segmentos chicos. La fuente es coop_aggregates, materializada por el worker.
 */
import type { APIRoute } from 'astro';
import { json, sanitizeText, getEnv } from '../../../lib/api-utils';
import { COOP_DATASETS, getDataset } from '../../../lib/coop/datasets';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const db = getEnv().DB;
  if (!db) {
    // Dev / sin DB: catálogo vacío pero la página puede renderizar el roadmap.
    return json({ ok: true, datasets: COOP_DATASETS.map((d) => ({ id: d.id, indexName: d.indexName, status: d.status, n: 0, publishedSegments: 0 })), segments: [] });
  }

  const url = new URL(request.url);
  const datasetId = sanitizeText(url.searchParams.get('dataset') || '', 60);

  if (datasetId) {
    const ds = getDataset(datasetId);
    if (!ds) return json({ error: 'Dataset desconocido' }, { status: 404 });
    const rows = (await db
      .prepare(
        `SELECT segment_key, n, p10, p25, p50, p75, p90, mean, min, max, unit, segments
         FROM coop_aggregates
         WHERE dataset = ? AND period = 'all' AND n >= ?
         ORDER BY (segment_key = '__all__') DESC, n DESC`,
      )
      .bind(datasetId, ds.minObs)
      .all()).results || [];
    const segments = rows.map((r: any) => ({
      segmentKey: r.segment_key,
      isOverall: r.segment_key === '__all__',
      segments: safeParse(r.segments),
      n: r.n,
      p10: r.p10, p25: r.p25, p50: r.p50, p75: r.p75, p90: r.p90,
      mean: r.mean, min: r.min, max: r.max, unit: r.unit,
    }));
    return json({
      ok: true,
      dataset: { id: ds.id, indexName: ds.indexName, label: ds.label, unit: ds.unit, blurb: ds.blurb, minObs: ds.minObs },
      segments,
    });
  }

  // Resumen global: por dataset, total de aportes y # de segmentos publicados.
  const totals = (await db
    .prepare(
      `SELECT dataset, n FROM coop_aggregates WHERE period = 'all' AND segment_key = '__all__'`,
    )
    .all()).results || [];
  const totalByDs = new Map<string, number>();
  for (const t of totals as any[]) totalByDs.set(t.dataset, t.n);

  const pub = (await db
    .prepare(`SELECT dataset, COUNT(*) AS c FROM coop_aggregates WHERE period = 'all' AND segment_key != '__all__' AND n >= 30 GROUP BY dataset`)
    .all()).results || [];
  const pubByDs = new Map<string, number>();
  for (const p of pub as any[]) pubByDs.set(p.dataset, p.c);

  const datasets = COOP_DATASETS.map((d) => ({
    id: d.id,
    indexName: d.indexName,
    label: d.label,
    unit: d.unit,
    status: d.status,
    blurb: d.blurb,
    n: totalByDs.get(d.id) || 0,
    publishedSegments: pubByDs.get(d.id) || 0,
  }));
  return json({ ok: true, datasets });
};

function safeParse(s: unknown): Record<string, string> {
  if (typeof s !== 'string') return {};
  try { return JSON.parse(s); } catch { return {}; }
}
