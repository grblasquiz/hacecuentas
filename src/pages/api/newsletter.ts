/**
 * POST /api/newsletter
 * Body: { email: string, source?: string }
 */
import type { APIRoute } from 'astro';
import { json, isValidEmail, sanitizeText, getClientIP, hashIP, parseBody, getD1FromLocals } from '../../lib/api-utils';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const email = sanitizeText(body.email, 254).toLowerCase();
  const source = sanitizeText(body.source, 40) || 'newsletter';

  if (!isValidEmail(email)) {
    return json({ error: 'Email inválido' }, { status: 400 });
  }

  const db = getD1FromLocals(locals);
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  const ua = (request.headers.get('user-agent') || '').slice(0, 200);
  const ref = (request.headers.get('referer') || '').slice(0, 200);
  const ipH = hashIP(getClientIP(request));

  try {
    await db.prepare(
      `INSERT OR IGNORE INTO newsletter_subs
       (email, created_at, user_agent, referer, ip_hash, source)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(email, Date.now(), ua, ref, ipH, source).run();
    return json({ ok: true });
  } catch (err) {
    console.error('newsletter insert failed:', err);
    return json({ error: 'No se pudo guardar, intentá en un rato.' }, { status: 500 });
  }
};

export const ALL: APIRoute = () =>
  json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
