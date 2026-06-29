/**
 * DELETE /api/auth/account — borra la cuenta y todos sus datos (derecho de
 * supresión). El ON DELETE CASCADE limpia user_profile y sessions.
 */
import type { APIRoute } from 'astro';
import { json, getEnv } from '../../../lib/api-utils';
import { getSessionUser, clearAuthCookies } from '../../../lib/auth';

export const prerender = false;

export const DELETE: APIRoute = async ({ request }) => {
  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });
  const user = await getSessionUser(request, db);
  if (!user) return json({ error: 'No autenticado' }, { status: 401 });

  await db.prepare('DELETE FROM users WHERE id = ?').bind(user.id).run();

  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  for (const c of clearAuthCookies(request)) headers.append('Set-Cookie', c);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};

export const ALL: APIRoute = () => json({ error: 'Usar DELETE' }, { status: 405, headers: { allow: 'DELETE' } });
