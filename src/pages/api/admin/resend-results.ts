/**
 * POST /api/admin/resend-results?k=<ADMIN_PASSCODE|BACKFILL_KEY>&limit=25
 *
 * Drena el backlog de email_results con sent=0: envía cada resultado pendiente
 * vía Cloudflare Email Sending (binding EMAIL, el hosting) y marca sent=1.
 *
 * Diseño:
 *   - Dedupe: si el mismo (email, slug, result) quedó insertado N veces
 *     (doble click, reintentos), se envía UN solo mail y se marcan todas las
 *     filas gemelas como sent=1.
 *   - Best-effort por fila: un send fallido deja su fila en sent=0 (reintentable
 *     en la próxima corrida) y no corta el batch. Filas con slug inválido se
 *     marcan sent=-1 (descartadas) para que no traben el drain.
 *   - `limit` acota los envíos por invocación (default 25, máx 50) para no
 *     acercarse a los límites de subrequests del Worker. Repetir la llamada
 *     hasta que `remaining` sea 0.
 */
import type { APIRoute } from 'astro';
import { json, getEnv, getD1FromLocals, isValidCalcSlug, sendHostingEmail, buildResultEmail, isAdminAuthed } from '../../../lib/api-utils';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv();
  const url = new URL(request.url);
  // Preferí el header X-Admin-Key (no queda en logs/Referer); ?k= sigue válido.
  // Comparación en tiempo constante.
  if (!isAdminAuthed(request, [env.ADMIN_PASSCODE, env.BACKFILL_KEY])) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  const db = getD1FromLocals(locals);
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });
  if (!env.EMAIL) return json({ error: 'Binding EMAIL no disponible (dev?)' }, { status: 503 });

  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '25', 10) || 25, 1), 50);
  const fromEmail = env.RESULT_EMAIL_FROM || 'resultados@hacecuentas.com';

  // Un pendiente por combinación única (dedupe de doble-submits).
  const { results: pending } = await db.prepare(
    `SELECT email, slug, result, COUNT(*) AS dupes
     FROM email_results WHERE sent = 0
     GROUP BY email, slug, result
     ORDER BY MIN(id) LIMIT ?`,
  ).bind(limit).all<{ email: string; slug: string; result: string; dupes: number }>();

  let sentCount = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of pending) {
    // Filas viejas pre-validación o con slug raro: no interpolar en el href.
    // sent=-1 = descartada, para que no re-entre al batch en cada corrida.
    if (!isValidCalcSlug(row.slug)) {
      skipped++;
      try {
        await db.prepare(
          `UPDATE email_results SET sent = -1 WHERE sent = 0 AND email = ? AND slug = ? AND result = ?`,
        ).bind(row.email, row.slug, row.result).run();
      } catch (err) {
        console.error('resend-results skip-flag update failed:', err);
      }
      continue;
    }
    const { subject, html } = buildResultEmail(row.slug, row.result);
    const ok = await sendHostingEmail({
      from: `Hacé Cuentas <${fromEmail}>`,
      to: row.email,
      subject,
      html,
    });
    if (!ok) {
      failed++;
      continue;
    }
    sentCount++;
    try {
      await db.prepare(
        `UPDATE email_results SET sent = 1 WHERE sent = 0 AND email = ? AND slug = ? AND result = ?`,
      ).bind(row.email, row.slug, row.result).run();
    } catch (err) {
      console.error('resend-results sent-flag update failed:', err);
    }
  }

  const remaining = await db.prepare(`SELECT COUNT(*) AS n FROM email_results WHERE sent = 0`).first<{ n: number }>();

  return json({ ok: true, sent: sentCount, failed, skipped, remaining: remaining?.n ?? null });
};

export const ALL: APIRoute = () =>
  json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
