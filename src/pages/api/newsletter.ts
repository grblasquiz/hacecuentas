/**
 * POST /api/newsletter
 * Guarda un email en la tabla newsletter_subs.
 *
 * Body (JSON o form-urlencoded):
 *   { email: string, source?: string }
 *
 * Respuestas:
 *   200 { ok: true } — guardado (o ya existía)
 *   400 { error } — email inválido
 *   500 { error } — fallo DB
 */
import type { APIRoute } from 'astro';
import { getD1, getClientIP, hashIP, json, isValidEmail, sanitizeText } from '../../lib/api-utils';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  let body: Record<string, unknown> = {};
  try {
    const ct = context.request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      body = await context.request.json();
    } else {
      const fd = await context.request.formData();
      fd.forEach((v, k) => { body[k] = v; });
    }
  } catch {
    return json({ error: 'Body inválido' }, { status: 400 });
  }

  const email = sanitizeText(body.email, 254).toLowerCase();
  const source = sanitizeText(body.source, 40) || 'newsletter';

  if (!isValidEmail(email)) {
    return json({ error: 'Email inválido' }, { status: 400 });
  }

  const db = getD1(context);
  const ip = getClientIP(context.request);
  const ipH = hashIP(ip);
  const ua = (context.request.headers.get('user-agent') || '').slice(0, 200);
  const ref = (context.request.headers.get('referer') || '').slice(0, 200);
  const now = Date.now();

  try {
    // INSERT OR IGNORE: si ya existe, no falla (email es UNIQUE).
    await db
      .prepare(
        `INSERT OR IGNORE INTO newsletter_subs
         (email, created_at, user_agent, referer, ip_hash, source)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .bind(email, now, ua, ref, ipH, source)
      .run();
    return json({ ok: true });
  } catch (err) {
    console.error('newsletter insert failed:', err);
    return json({ error: 'No se pudo guardar, intentá en un rato.' }, { status: 500 });
  }
};
