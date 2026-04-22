/**
 * POST /api/vote
 * Body: { slug: string, vote: 'up' | 'down' }
 */
import type { APIRoute } from 'astro';
import { json, sanitizeText, getClientIP, hashIP, parseBody, getD1FromLocals } from '../../lib/api-utils';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const slug = sanitizeText(body.slug, 200);
  const vote = String(body.vote || '').toLowerCase();

  if (!slug || !slug.startsWith('/')) {
    return json({ error: 'Slug inválido' }, { status: 400 });
  }
  if (vote !== 'up' && vote !== 'down') {
    return json({ error: 'Vote debe ser "up" o "down"' }, { status: 400 });
  }

  const db = getD1FromLocals(locals);
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  const ipH = hashIP(getClientIP(request));
  const ua = (request.headers.get('user-agent') || '').slice(0, 200);

  try {
    await db.prepare(
      `INSERT INTO calc_votes (slug, vote, created_at, user_agent, ip_hash)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(slug, vote, Date.now(), ua, ipH).run();
    return json({ ok: true });
  } catch (err) {
    console.error('vote insert failed:', err);
    return json({ error: 'No se pudo registrar el voto.' }, { status: 500 });
  }
};

export const ALL: APIRoute = () =>
  json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
