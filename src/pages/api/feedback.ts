/**
 * POST /api/feedback
 * Body: { slug: string, vote: 'up' | 'down', feedback_text: string }
 *
 * Guarda feedback abierto del usuario en D1 (tabla calc_feedback) y lo
 * reenvía por email a editorial vía Cloudflare Email Sending (el hosting).
 *
 * Diseño:
 *   - El vote en sí ya se registra en /api/vote (tabla calc_votes).
 *   - Acá guardamos solo el TEXTO de seguimiento (que es opcional).
 *   - Si feedback_text está vacío, no insertamos (no hay info útil que guardar).
 */
import type { APIRoute } from 'astro';
import { json, sanitizeText, getClientIP, hashIP, parseBody, getD1FromLocals, getEnv, escapeHtml, sendHostingEmail, enforceRateLimit } from '../../lib/api-utils';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  // Cada feedback válido dispara 1 mail al inbox personal de Martin → sin tope
  // es inbox-flooding. Límite por IP.
  const limited = await enforceRateLimit(request, 'feedback', 15, 3600);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const slug = sanitizeText(body.slug, 200);
  const vote = String(body.vote || '').toLowerCase();
  const feedbackText = sanitizeText(body.feedback_text, 500);

  if (!slug || !slug.startsWith('/')) {
    return json({ error: 'Slug inválido' }, { status: 400 });
  }
  if (vote !== 'up' && vote !== 'down') {
    return json({ error: 'Vote debe ser "up" o "down"' }, { status: 400 });
  }
  // Sin texto = no hay info útil, lo descartamos silenciosamente
  // (el frontend ya registra el vote vía /api/vote separadamente).
  if (!feedbackText || feedbackText.length < 1) {
    return json({ ok: true, skipped: 'empty' });
  }

  const db = getD1FromLocals(locals);
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  const ipH = hashIP(getClientIP(request));
  const ua = (request.headers.get('user-agent') || '').slice(0, 200);

  try {
    await db.prepare(
      `INSERT INTO calc_feedback (slug, vote, feedback_text, created_at, user_agent, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(slug, vote, feedbackText, Date.now(), ua, ipH).run();
  } catch (err) {
    console.error('feedback insert failed:', err);
    return json({ error: 'No se pudo guardar el feedback.' }, { status: 500 });
  }

  // Email forward vía Cloudflare Email Sending (best-effort, no rompe el
  // flow si falla; en dev no hay binding y no envía).
  const env = getEnv();
  const toEmail = env.FEEDBACK_EMAIL_TO || 'rodriguezb.martin@gmail.com';
  const fromEmail = env.FEEDBACK_EMAIL_FROM || 'feedback@hacecuentas.com';

  const voteEmoji = vote === 'up' ? '👍' : '👎';
  const subject = `${voteEmoji} Feedback en ${slug}`;
  const htmlBody = `
      <h2>Nuevo feedback en hacecuentas.com</h2>
      <p><strong>Calc:</strong> <a href="https://hacecuentas.com${escapeHtml(slug)}">${escapeHtml(slug)}</a></p>
      <p><strong>Vote:</strong> ${voteEmoji} ${vote}</p>
      <p><strong>Texto:</strong></p>
      <blockquote style="border-left: 3px solid #ccc; padding-left: 1em; color: #555;">
        ${escapeHtml(feedbackText).replace(/\n/g, '<br>')}
      </blockquote>
      <hr>
      <p style="color: #888; font-size: 0.85em;">
        User agent: ${escapeHtml(ua)}<br>
        Recibido: ${new Date().toISOString()}
      </p>
    `;

  // Best-effort (sendHostingEmail nunca tira) — el feedback ya está en D1.
  await sendHostingEmail({
    from: `Hacé Cuentas Feedback <${fromEmail}>`,
    to: toEmail,
    subject,
    html: htmlBody,
  });

  return json({ ok: true });
};

export const ALL: APIRoute = () =>
  json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
