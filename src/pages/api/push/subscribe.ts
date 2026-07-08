/**
 * POST /api/push/subscribe
 * Body: { subscription: { endpoint, keys: { p256dh, auth } }, topics?: string[], oldEndpoint?: string }
 *
 * Alta/actualización de una suscripción Web Push. Sin email ni identidad: el
 * endpoint del push service es la clave. Topics acumulativos (CSV en D1): si el
 * mismo browser activa 'valores' y después 'mundial', queda con los dos.
 *
 * `oldEndpoint` lo manda el SW en `pushsubscriptionchange` (el push service
 * rotó la suscripción): migramos los topics de la fila vieja y la borramos.
 */
import type { APIRoute } from 'astro';
import { json, parseBody, getEnv, enforceRateLimit } from '../../../lib/api-utils';

export const prerender = false;

const VALID_TOPICS = new Set(['valores', 'mundial']);

export const POST: APIRoute = async ({ request }) => {
  const limited = await enforceRateLimit(request, 'push-subscribe', 20, 3600);
  if (limited) return limited;

  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const sub = body.subscription as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } } | undefined;
  const endpoint = typeof sub?.endpoint === 'string' ? sub.endpoint : '';
  const p256dh = typeof sub?.keys?.p256dh === 'string' ? sub.keys.p256dh : '';
  const auth = typeof sub?.keys?.auth === 'string' ? sub.keys.auth : '';

  let origin: URL | null = null;
  try { origin = new URL(endpoint); } catch { /* inválido */ }
  const validKeys = /^[A-Za-z0-9_-]{80,120}$/.test(p256dh) && /^[A-Za-z0-9_-]{16,48}$/.test(auth);
  if (!origin || origin.protocol !== 'https:' || endpoint.length > 1024 || !validKeys) {
    return json({ error: 'Suscripción inválida' }, { status: 400 });
  }

  const requested = Array.isArray(body.topics)
    ? (body.topics as unknown[]).filter((t): t is string => typeof t === 'string' && VALID_TOPICS.has(t))
    : [];
  const oldEndpoint = typeof body.oldEndpoint === 'string' && body.oldEndpoint.length <= 1024 ? body.oldEndpoint : '';
  if (!requested.length && !oldEndpoint) return json({ error: 'Falta el tema del aviso' }, { status: 400 });

  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  // Merge de topics: los ya guardados (mismo endpoint) + los de la fila vieja
  // (si el push service rotó el endpoint) + los pedidos ahora.
  const topics = new Set<string>(requested);
  const existing = await db.prepare('SELECT topics FROM push_subscriptions WHERE endpoint = ?')
    .bind(endpoint).first<{ topics: string }>();
  for (const t of (existing?.topics || '').split(',')) if (VALID_TOPICS.has(t)) topics.add(t);
  if (oldEndpoint && oldEndpoint !== endpoint) {
    const old = await db.prepare('SELECT topics FROM push_subscriptions WHERE endpoint = ?')
      .bind(oldEndpoint).first<{ topics: string }>();
    for (const t of (old?.topics || '').split(',')) if (VALID_TOPICS.has(t)) topics.add(t);
    await db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(oldEndpoint).run();
  }
  if (!topics.size) return json({ error: 'Falta el tema del aviso' }, { status: 400 });

  await db.prepare(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth, topics, created_at, status)
     VALUES (?, ?, ?, ?, ?, 'active')
     ON CONFLICT(endpoint) DO UPDATE SET
       p256dh = excluded.p256dh,
       auth = excluded.auth,
       topics = excluded.topics,
       fail_count = 0,
       status = 'active'`,
  ).bind(endpoint, p256dh, auth, [...topics].sort().join(','), Date.now()).run();

  return json({ ok: true, topics: [...topics].sort() });
};

export const ALL: APIRoute = () => json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
