/**
 * POST /api/vote
 * Guarda un voto 👍/👎 por calculadora.
 *
 * Body: { slug: string, vote: 'up' | 'down' }
 */
import type { APIRoute } from 'astro';
import { getD1, getClientIP, hashIP, json, sanitizeText } from '../../lib/api-utils';

export const prerender = false;

export const POST: APIRoute = async (context) => {
  let body: Record<string, unknown> = {};
  try {
    body = await context.request.json();
  } catch {
    return json({ error: 'Body inválido' }, { status: 400 });
  }

  const slug = sanitizeText(body.slug, 200);
  const vote = String(body.vote || '').toLowerCase();

  if (!slug || !slug.startsWith('/')) {
    return json({ error: 'Slug inválido' }, { status: 400 });
  }
  if (vote !== 'up' && vote !== 'down') {
    return json({ error: 'Vote debe ser "up" o "down"' }, { status: 400 });
  }

  const db = getD1(context);
  const ipH = hashIP(getClientIP(context.request));
  const ua = (context.request.headers.get('user-agent') || '').slice(0, 200);

  try {
    await db
      .prepare(
        `INSERT INTO calc_votes (slug, vote, created_at, user_agent, ip_hash)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(slug, vote, Date.now(), ua, ipH)
      .run();
    return json({ ok: true });
  } catch (err) {
    console.error('vote insert failed:', err);
    return json({ error: 'No se pudo registrar el voto.' }, { status: 500 });
  }
};
