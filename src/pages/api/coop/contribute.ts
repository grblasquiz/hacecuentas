/**
 * POST /api/coop/contribute
 * Body: { slug, inputs, extra?, consent: true }
 *
 * Cooperativa de datos anónimos. Tras un resultado, el usuario decide APORTAR
 * (consentimiento explícito, granular) un dato numérico anónimo. Reejecutamos el
 * cálculo server-side para tener el valor autoritativo, lo guardamos SIN email ni
 * user_id, y devolvemos el percentil del usuario dentro de su segmento — sólo si
 * el segmento llegó a MIN_OBS observaciones (k-anonymity).
 *
 * PRIVACIDAD: este endpoint NO lee la sesión. El aporte es anónimo por diseño;
 * jamás se asocia a la identidad del usuario. Ver db/schema.sql (coop_*).
 */
import type { APIRoute } from 'astro';
import { json, sanitizeText, parseBody, getEnv, getClientIP, hashIP } from '../../../lib/api-utils';
import { sha256Hex, generateSessionToken } from '../../../lib/auth';
import { runCompute } from '../../../lib/calc-compute';
import {
  getCoopSource, getDataset, coopSegmentKey, coopSegmentLabel, coopNum, MIN_OBS,
  type CoopDataset,
} from '../../../lib/coop/datasets';

export const prerender = false;

const yyyymm = (ms: number): string => {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
};

/** Stats de un segmento: n, cuántos ≤ value (incluido el propio), y mediana. */
async function segmentStats(
  db: D1Database,
  dataset: string,
  segmentKey: string | null, // null => todo el dataset
  value: number,
): Promise<{ n: number; percentile: number; median: number } | null> {
  const where = segmentKey
    ? 'dataset = ? AND segment_key = ? AND value IS NOT NULL'
    : 'dataset = ? AND value IS NOT NULL';
  const bind = segmentKey ? [dataset, segmentKey] : [dataset];

  const agg = await db
    .prepare(`SELECT COUNT(*) AS n, SUM(CASE WHEN value <= ? THEN 1 ELSE 0 END) AS leq FROM coop_contributions WHERE ${where}`)
    .bind(value, ...bind)
    .first<{ n: number; leq: number }>();
  const n = agg?.n ?? 0;
  if (n <= 0) return null;

  const offset = Math.floor(n / 2);
  const med = await db
    .prepare(`SELECT value FROM coop_contributions WHERE ${where} ORDER BY value LIMIT 1 OFFSET ?`)
    .bind(...bind, offset)
    .first<{ value: number }>();

  const percentile = Math.max(1, Math.min(100, Math.round(((agg?.leq ?? 1) / n) * 100)));
  return { n, percentile, median: med?.value ?? value };
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  // Consentimiento EXPLÍCITO obligatorio — nada se guarda sin esto.
  if (body.consent !== true && body.consent !== 'true' && body.consent !== 'on') {
    return json({ error: 'Necesitamos tu consentimiento explícito para registrar el aporte.' }, { status: 400 });
  }

  const slug = sanitizeText(body.slug, 90);
  const src = getCoopSource(slug);
  if (!src) return json({ error: 'Esta calculadora todavía no participa de la cooperativa.' }, { status: 400 });
  const ds = getDataset(src.dataset) as CoopDataset;

  const inputs = body.inputs;
  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) {
    return json({ error: 'Faltan los datos del cálculo.' }, { status: 400 });
  }

  // Campos extra (segmentación / valores) declarados por la fuente.
  const rawExtra = (body.extra && typeof body.extra === 'object' && !Array.isArray(body.extra))
    ? (body.extra as Record<string, unknown>) : {};
  const extra: Record<string, string> = {};
  for (const f of src.ask) {
    const v = sanitizeText(rawExtra[f.id], 80);
    if (f.required && !v) {
      return json({ error: `Falta un dato para el aporte: ${f.label}.` }, { status: 400 });
    }
    extra[f.id] = v;
  }

  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  // Valor autoritativo: reejecutamos el cálculo en el server (igual que alertas).
  const r = await runCompute(slug, inputs as Record<string, unknown>);
  if (!r.ok) {
    return json(
      { error: r.message || 'No pudimos calcular el resultado.', missingFields: (r as any).missingFields },
      { status: r.status === 400 ? 422 : r.status },
    );
  }
  const result = r.result as Record<string, unknown>;
  const coercedInputs = (r as any).inputs ?? inputs;

  const value = src.derive({ result, inputs: coercedInputs, extra });
  if (value === null || !Number.isFinite(value)) {
    return json({ error: 'No pudimos leer un dato válido para aportar desde este cálculo.' }, { status: 422 });
  }

  const dims = src.dims({ inputs: coercedInputs, extra });
  const segmentKey = coopSegmentKey(src.dataset, dims);
  const segmentLabel = coopSegmentLabel(dims);
  const now = Date.now();
  const period = yyyymm(now);
  const ipHash = hashIP(getClientIP(request));
  // 1 punto por dispositivo, por segmento, por mes (anti-skew, sin identificar).
  const dedupSig = await sha256Hex(`${ipHash}|${src.dataset}|${segmentKey}|${period}`);
  const revokeToken = generateSessionToken();
  const bucket = ds.bucket(value);

  await db
    .prepare(
      `INSERT INTO coop_contributions
         (dataset, slug, segment_key, value, value_bucket, unit, period, segments, ip_hash, dedup_sig, revoke_token, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(dedup_sig) DO UPDATE SET
         value = excluded.value,
         value_bucket = excluded.value_bucket,
         segments = excluded.segments,
         revoke_token = excluded.revoke_token,
         created_at = excluded.created_at`,
    )
    .bind(
      src.dataset, slug, segmentKey, value, bucket, ds.unit, period,
      JSON.stringify(dims), ipHash, dedupSig, revokeToken, now,
    )
    .run();

  // Feedback inmediato: percentil en el segmento exacto; si no llegó a MIN_OBS,
  // caemos al dataset completo. Si tampoco, decimos cuántas faltan.
  let stats = await segmentStats(db, src.dataset, segmentKey, value);
  let scope: 'segment' | 'dataset' = 'segment';
  let scopeLabel = segmentLabel;
  if (!stats || stats.n < ds.minObs) {
    const overall = await segmentStats(db, src.dataset, null, value);
    if (overall && overall.n >= ds.minObs) {
      stats = overall; scope = 'dataset'; scopeLabel = 'todos los aportes';
    } else {
      const have = stats?.n ?? overall?.n ?? 1;
      return json({
        ok: true, contributed: true, revokeToken,
        pending: { n: have, needed: ds.minObs },
        message: `¡Gracias! Tu aporte quedó registrado. Todavía estamos juntando datos de ${segmentLabel} (${have} de ${ds.minObs}). Cuando lleguemos a ${ds.minObs} vas a poder ver tu percentil.`,
      });
    }
  }

  const text = ds.feedback({
    percentile: stats.percentile, n: stats.n, median: stats.median, value, segmentLabel: scopeLabel,
  });

  return json({
    ok: true, contributed: true, revokeToken,
    feedback: {
      text, scope, percentile: stats.percentile, n: stats.n, median: stats.median, unit: ds.unit,
    },
  });
};

export const ALL: APIRoute = () => json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
