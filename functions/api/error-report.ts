/**
 * POST /api/error-report
 * Body: { slug: string, message: string, email?: string }
 */
import { Env, json, sanitizeText, isValidEmail, getClientIP, hashIP, parseBody } from '../_utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let body: Record<string, unknown>;
  try { body = await parseBody(context.request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const slug = sanitizeText(body.slug, 200);
  const message = sanitizeText(body.message, 2000);
  const email = sanitizeText(body.email, 254).toLowerCase();

  if (!slug || !slug.startsWith('/')) {
    return json({ error: 'Slug inválido' }, { status: 400 });
  }
  if (!message || message.length < 5) {
    return json({ error: 'Contanos un poco más qué está mal (mín 5 caracteres).' }, { status: 400 });
  }
  if (email && !isValidEmail(email)) {
    return json({ error: 'Email inválido (dejalo vacío si no querés dar mail).' }, { status: 400 });
  }

  const ipH = hashIP(getClientIP(context.request));
  const ua = (context.request.headers.get('user-agent') || '').slice(0, 200);

  try {
    await context.env.DB
      .prepare(
        `INSERT INTO error_reports
         (slug, message, email, created_at, user_agent, ip_hash)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(slug, message, email || null, Date.now(), ua, ipH)
      .run();
    return json({ ok: true });
  } catch (err) {
    console.error('error-report insert failed:', err);
    return json({ error: 'No se pudo enviar el reporte, intentá en un rato.' }, { status: 500 });
  }
};

export const onRequest: PagesFunction<Env> = async () => {
  return json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
};
