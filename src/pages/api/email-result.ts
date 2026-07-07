/**
 * POST /api/email-result
 * Body: { email: string, slug: string, result: string }
 *
 * "Recibí este resultado por email" de las calcs.
 *
 * Diseño:
 *   - Guarda SIEMPRE el pedido en D1 (tabla email_results, sent=0).
 *   - Suma el email a newsletter_subs con source='result' (INSERT OR IGNORE)
 *     para que la lista crezca en un solo lugar.
 *   - Envía el resultado al USUARIO vía Cloudflare Email Sending (binding
 *     EMAIL, el hosting) y marca sent=1. Best-effort: si el send falla (o en
 *     dev, donde no hay binding), la fila queda en sent=0 y se puede
 *     reintentar después con /api/admin/resend-results.
 *   - Responde { ok: true, sent: boolean } — el frontend elige el mensaje
 *     de éxito según `sent`.
 */
import type { APIRoute } from 'astro';
import { json, isValidEmail, sanitizeText, getClientIP, hashIP, parseBody, getD1FromLocals, getEnv, isValidCalcSlug, sendHostingEmail, buildResultEmail, enforceRateLimit } from '../../lib/api-utils';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // El destinatario lo elige quien llama (body.email) → sin tope esto es un
  // relay de email-bombing a terceros. Límite estricto por IP.
  const limited = await enforceRateLimit(request, 'email-result', 8, 3600);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const email = sanitizeText(body.email, 254).toLowerCase();
  const slug = sanitizeText(body.slug, 200);
  const result = sanitizeText(body.result, 500);

  if (!isValidEmail(email)) {
    return json({ error: 'Email inválido' }, { status: 400 });
  }
  // Regex estricta (lowercase/dígitos/guiones/barras, sin puntos ni ":" ni
  // comillas): este slug termina interpolado en el href de un email que va
  // a un destinatario arbitrario → sin esto el endpoint es un relay de phishing.
  if (!isValidCalcSlug(slug)) {
    return json({ error: 'Slug inválido' }, { status: 400 });
  }

  const db = getD1FromLocals(locals);
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  const ua = (request.headers.get('user-agent') || '').slice(0, 200);
  const ipH = hashIP(getClientIP(request));
  const now = Date.now();

  // Los dos INSERT en un solo round-trip a D1 (batch atómico).
  // La lista de emails crece en un solo lugar: newsletter_subs (OR IGNORE).
  let rowId: number | null = null;
  try {
    const results = await db.batch([
      db.prepare(
        `INSERT INTO email_results (email, slug, result, created_at, user_agent, ip_hash, sent)
         VALUES (?, ?, ?, ?, ?, ?, 0)`,
      ).bind(email, slug, result, now, ua, ipH),
      db.prepare(
        `INSERT OR IGNORE INTO newsletter_subs
         (email, created_at, user_agent, referer, ip_hash, source)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).bind(email, now, ua, (request.headers.get('referer') || '').slice(0, 200), ipH, 'result'),
    ]);
    rowId = (results[0] as any)?.meta?.last_row_id ?? null;
  } catch (err) {
    console.error('email-result insert failed:', err);
    return json({ error: 'No se pudo guardar, intentá en un rato.' }, { status: 500 });
  }

  // ── Envío real vía Cloudflare Email Sending (binding EMAIL, el hosting) ──
  // Best-effort: si falla (o en dev, sin binding), la fila ya quedó en D1 con
  // sent=0 → backlog reenviable con /api/admin/resend-results.
  const env = getEnv();
  const fromEmail = env.RESULT_EMAIL_FROM || 'resultados@hacecuentas.com';
  const { subject, html } = buildResultEmail(slug, result);
  const sent = await sendHostingEmail({
    from: `Hacé Cuentas <${fromEmail}>`,
    to: email,
    subject,
    html,
  });
  if (sent && rowId != null) {
    try {
      await db.prepare(`UPDATE email_results SET sent = 1 WHERE id = ?`).bind(rowId).run();
    } catch (err) {
      console.error('email-result sent-flag update failed:', err);
    }
  }

  return json({ ok: true, sent });
};

export const ALL: APIRoute = () =>
  json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
