/**
 * POST /api/feedback
 * Body: { slug: string, vote: 'up' | 'down', feedback_text: string }
 *
 * Guarda feedback abierto del usuario en D1 (tabla calc_feedback).
 * Si está configurada RESEND_API_KEY, también envía email a editorial.
 *
 * Diseño:
 *   - El vote en sí ya se registra en /api/vote (tabla calc_votes).
 *   - Acá guardamos solo el TEXTO de seguimiento (que es opcional).
 *   - Si feedback_text está vacío, no insertamos (no hay info útil que guardar).
 */
import type { APIRoute } from 'astro';
import { json, sanitizeText, getClientIP, hashIP, parseBody, getD1FromLocals, getEnv } from '../../lib/api-utils';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
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

  // Email forward via Resend (best-effort, no rompe el flow si falla)
  // Configurar secret: npx wrangler secret put RESEND_API_KEY
  // Free tier Resend: 100 emails/día.
  const env = getEnv() as any;
  const apiKey = env.RESEND_API_KEY;
  const toEmail = env.FEEDBACK_EMAIL_TO || 'rodriguezb.martin@gmail.com';
  const fromEmail = env.FEEDBACK_EMAIL_FROM || 'feedback@hacecuentas.com';

  if (apiKey) {
    try {
      const voteEmoji = vote === 'up' ? '👍' : '👎';
      const escapedText = feedbackText.replace(/[<>&]/g, (c) =>
        c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'
      );
      const subject = `${voteEmoji} Feedback en ${slug}`;
      const htmlBody = `
        <h2>Nuevo feedback en hacecuentas.com</h2>
        <p><strong>Calc:</strong> <a href="https://hacecuentas.com${slug}">${slug}</a></p>
        <p><strong>Vote:</strong> ${voteEmoji} ${vote}</p>
        <p><strong>Texto:</strong></p>
        <blockquote style="border-left: 3px solid #ccc; padding-left: 1em; color: #555;">
          ${escapedText.replace(/\n/g, '<br>')}
        </blockquote>
        <hr>
        <p style="color: #888; font-size: 0.85em;">
          User agent: ${ua}<br>
          Recibido: ${new Date().toISOString()}
        </p>
      `;

      // Usamos fetch (no SDK) para no agregar dependency al Worker bundle
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `Hacé Cuentas Feedback <${fromEmail}>`,
          to: [toEmail],
          subject,
          html: htmlBody,
        }),
      });
      if (!resp.ok) {
        const errText = await resp.text().catch(() => '');
        console.error('resend send failed:', resp.status, errText.slice(0, 200));
      }
    } catch (err) {
      // No interrumpimos la respuesta al user si falla el email — el
      // feedback ya está guardado en D1.
      console.error('email forward failed:', err);
    }
  }

  return json({ ok: true });
};

export const ALL: APIRoute = () =>
  json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
