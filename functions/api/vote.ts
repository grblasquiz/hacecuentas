/**
 * POST /api/vote
 * Body: { slug: string, vote: 'up' | 'down' }
 */
import { Env, json, sanitizeText, getClientIP, hashIP, parseBody } from '../_utils';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let body: Record<string, unknown>;
  try { body = await parseBody(context.request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const slug = sanitizeText(body.slug, 200);
  const vote = String(body.vote || '').toLowerCase();

  if (!slug || !slug.startsWith('/')) {
    return json({ error: 'Slug inválido' }, { status: 400 });
  }
  if (vote !== 'up' && vote !== 'down') {
    return json({ error: 'Vote debe ser "up" o "down"' }, { status: 400 });
  }

  const ipH = hashIP(getClientIP(context.request));
  const ua = (context.request.headers.get('user-agent') || '').slice(0, 200);

  try {
    await context.env.DB
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

export const onRequest: PagesFunction<Env> = async () => {
  return json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
};
