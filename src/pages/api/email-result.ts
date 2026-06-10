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
 *   - Si está configurada RESEND_API_KEY, envía el resultado al USUARIO
 *     vía Resend y marca sent=1. Best-effort: si el send falla, la fila
 *     queda en sent=0 y se puede reintentar después con un batch.
 *   - Responde { ok: true, sent: boolean } — el frontend elige el mensaje
 *     de éxito según `sent`.
 */
import type { APIRoute } from 'astro';
import { json, isValidEmail, sanitizeText, getClientIP, hashIP, parseBody, getD1FromLocals, getEnv, escapeHtml, isValidCalcSlug, sendResendEmail } from '../../lib/api-utils';

export const prerender = false;

/** "/calculadora-sueldo-en-mano" → "Sueldo en mano" (para el asunto). */
function humanizeSlug(slug: string): string {
  const seg = slug.replace(/^\/+|\/+$/g, '').split('/').pop() || '';
  const base = seg
    .replace(/^(calculadora|calculator|calculadoras|simulador|conversor)-(de-)?/, '')
    .replace(/-/g, ' ')
    .trim();
  if (!base) return 'tu cálculo';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

export const POST: APIRoute = async ({ request, locals }) => {
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

  // ── Envío real vía Resend (gateado por RESEND_API_KEY) ──────────────
  // Configurar secret: npx wrangler secret put RESEND_API_KEY
  // Hasta que exista la key, las filas quedan en sent=0 (backlog enviable).
  let sent = false;
  const env = getEnv() as any;
  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.RESULT_EMAIL_FROM || 'resultados@hacecuentas.com';

  if (apiKey) {
    const calcName = humanizeSlug(slug);
    const calcUrl = `https://hacecuentas.com${slug}`;
    const subject = `Tu resultado de ${calcName} — Hacé Cuentas`;
    const htmlBody = `
        <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1f2937;">
          <h2 style="color: #2563eb; margin-bottom: 0.25em;">Hacé Cuentas</h2>
          <p style="margin-top: 0;">Tu resultado de <strong>${escapeHtml(calcName)}</strong>:</p>
          <p style="font-size: 1.6em; font-weight: 700; background: #f1f5f9; border-radius: 8px; padding: 16px 20px; text-align: center;">
            ${escapeHtml(result || '—')}
          </p>
          <p>
            <a href="${escapeHtml(calcUrl)}" style="color: #2563eb;">Volver a la calculadora</a>
            para ajustar los datos o probar otro escenario.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
          <p style="color: #888; font-size: 0.85em;">
            Recibiste esto porque lo pediste en hacecuentas.com.
          </p>
        </div>
      `;

    // Best-effort: si falla, la fila ya quedó en D1 con sent=0 (backlog enviable).
    sent = await sendResendEmail({
      apiKey,
      from: `Hacé Cuentas <${fromEmail}>`,
      to: [email],
      subject,
      html: htmlBody,
    });
    if (sent && rowId != null) {
      try {
        await db.prepare(`UPDATE email_results SET sent = 1 WHERE id = ?`).bind(rowId).run();
      } catch (err) {
        console.error('email-result sent-flag update failed:', err);
      }
    }
  }

  return json({ ok: true, sent });
};

export const ALL: APIRoute = () =>
  json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
