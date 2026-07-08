/**
 * POST /api/push/unsubscribe
 * Body: { endpoint, topic? }
 *
 * Baja de un topic (queda suscripto al resto) o de toda la suscripción si no
 * se pasa topic o no le quedan topics. Idempotente: si el endpoint no existe,
 * responde ok igual (el browser ya la desuscribió localmente).
 */
import type { APIRoute } from 'astro';
import { json, parseBody, getEnv, enforceRateLimit } from '../../../lib/api-utils';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const limited = await enforceRateLimit(request, 'push-unsubscribe', 20, 3600);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const endpoint = typeof body.endpoint === 'string' ? body.endpoint : '';
  if (!endpoint || endpoint.length > 1024) return json({ error: 'Endpoint inválido' }, { status: 400 });
  const topic = typeof body.topic === 'string' ? body.topic : '';

  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  if (topic) {
    const row = await db.prepare('SELECT topics FROM push_subscriptions WHERE endpoint = ?')
      .bind(endpoint).first<{ topics: string }>();
    const rest = (row?.topics || '').split(',').filter((t) => t && t !== topic);
    if (rest.length) {
      await db.prepare('UPDATE push_subscriptions SET topics = ? WHERE endpoint = ?')
        .bind(rest.sort().join(','), endpoint).run();
      return json({ ok: true, topics: rest.sort() });
    }
  }
  await db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(endpoint).run();
  return json({ ok: true, topics: [] });
};

export const ALL: APIRoute = () => json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
