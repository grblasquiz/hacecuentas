/**
 * POST /api/newsletter
 * Body: { email: string, source?: string }
 */
import { Env, json, isValidEmail, sanitizeText, getClientIP, hashIP, parseBody } from '../_utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let body: Record<string, unknown>;
  try { body = await parseBody(context.request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const email = sanitizeText(body.email, 254).toLowerCase();
  const source = sanitizeText(body.source, 40) || 'newsletter';

  if (!isValidEmail(email)) {
    return json({ error: 'Email inválido' }, { status: 400 });
  }

  const ua = (context.request.headers.get('user-agent') || '').slice(0, 200);
  const ref = (context.request.headers.get('referer') || '').slice(0, 200);
  const ipH = hashIP(getClientIP(context.request));

  try {
    await context.env.DB
      .prepare(
        `INSERT OR IGNORE INTO newsletter_subs
         (email, created_at, user_agent, referer, ip_hash, source)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(email, Date.now(), ua, ref, ipH, source)
      .run();
    return json({ ok: true });
  } catch (err) {
    console.error('newsletter insert failed:', err);
    return json({ error: 'No se pudo guardar, intentá en un rato.' }, { status: 500 });
  }
};

// Responder 405 a otros métodos
export const onRequest: PagesFunction<Env> = async () => {
  return json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
};
