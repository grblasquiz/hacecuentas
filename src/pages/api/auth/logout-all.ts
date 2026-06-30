/**
 * POST /api/auth/logout-all — cierra la sesión en TODOS los dispositivos.
 * Borra todas las filas de sessions del usuario y limpia las cookies de este.
 */
import type { APIRoute } from 'astro';
import { json, getEnv } from '../../../lib/api-utils';
import { getSessionUser, clearAuthCookies } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });
  const user = await getSessionUser(request, db);
  if (!user) return json({ error: 'No autenticado' }, { status: 401 });

  await db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(user.id).run();

  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  for (const c of clearAuthCookies(request)) headers.append('Set-Cookie', c);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};

export const ALL: APIRoute = () => json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
