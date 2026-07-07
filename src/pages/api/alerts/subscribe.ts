/**
 * POST /api/alerts/subscribe
 * Body: { slug, inputs, email? }
 *
 * Crea una alerta "avisame cuando este resultado cambie". Reejecuta el cálculo
 * server-side para guardar el snapshot autoritativo del resultado; un cron lo
 * recompara y avisa por mail cuando un cambio normativo lo modifica.
 *
 * Híbrido: si hay sesión usa ese email (+ user_id); si no, pide email en el body.
 */
import type { APIRoute } from 'astro';
import { json, isValidEmail, sanitizeText, parseBody, getEnv, enforceRateLimit } from '../../../lib/api-utils';
import { getSessionUser, sha256Hex, generateSessionToken } from '../../../lib/auth';
import { getAlertConfig } from '../../../lib/alerts/eligible';
import { runCompute } from '../../../lib/calc-compute';

export const prerender = false;

/** Valor headline mostrable desde el result + la clave configurada. */
function headlineOf(result: Record<string, unknown>, field: string): string {
  const v = result?.[field];
  if (v === undefined || v === null) return '';
  return typeof v === 'number' ? String(v) : String(v);
}

export const POST: APIRoute = async ({ request }) => {
  // Path anónimo: acepta email de tercero sin verificar, y el cron le manda
  // mails cuando cambia la normativa. runCompute (CPU) + INSERT por request.
  // Límite por IP para cortar el spam por email de víctima y el DB-fill.
  const limited = await enforceRateLimit(request, 'alerts-subscribe', 15, 3600);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const slug = sanitizeText(body.slug, 80);
  const cfg = getAlertConfig(slug);
  if (!cfg) return json({ error: 'Esta calculadora todavía no admite alertas.' }, { status: 400 });

  const inputs = body.inputs;
  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) {
    return json({ error: 'Faltan los datos del cálculo.' }, { status: 400 });
  }

  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  // Identidad híbrida: sesión > email del body.
  const user = await getSessionUser(request, db);
  let email = user?.email || '';
  if (!email) {
    email = sanitizeText(body.email, 254).toLowerCase();
    if (!isValidEmail(email)) return json({ error: 'Necesitamos un email válido para avisarte.' }, { status: 400 });
  }

  // Snapshot autoritativo: reejecutamos el cálculo en el server.
  const r = await runCompute(slug, inputs as Record<string, unknown>);
  if (!r.ok) {
    return json(
      { error: r.message || 'No pudimos calcular el resultado.', missingFields: (r as any).missingFields },
      { status: r.status === 400 ? 422 : r.status },
    );
  }
  const result = r.result as Record<string, unknown>;
  const coercedInputs = (r as any).inputs ?? inputs; // inputs coercidos (estables)
  const headline = headlineOf(result, cfg.headlineField);

  const inputsJson = JSON.stringify(coercedInputs);
  const sig = await sha256Hex(`${email}|${slug}|${inputsJson}`);
  const token = generateSessionToken();
  const now = Date.now();

  await db
    .prepare(
      `INSERT INTO result_alerts
         (email, user_id, slug, inputs, headline_field, headline_label, last_result, last_headline, sig, unsub_token, created_at, last_checked_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
       ON CONFLICT(sig) DO UPDATE SET
         user_id = COALESCE(excluded.user_id, result_alerts.user_id),
         last_result = excluded.last_result,
         last_headline = excluded.last_headline,
         last_checked_at = excluded.last_checked_at,
         status = 'active'`,
    )
    .bind(
      email, user?.id ?? null, slug, inputsJson, cfg.headlineField, cfg.headlineLabel,
      JSON.stringify(result), headline, sig, token, now, now,
    )
    .run();

  return json({ ok: true, email, headline, label: cfg.headlineLabel, authed: !!user });
};

export const ALL: APIRoute = () => json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
