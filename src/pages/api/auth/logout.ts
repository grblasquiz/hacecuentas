/**
 * POST /api/auth/logout — borra la sesión actual y limpia las cookies.
 */
import type { APIRoute } from 'astro';
import { json, getEnv } from '../../../lib/api-utils';
import { readCookie, clearAuthCookies, COOKIE_NAME } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const db = getEnv().DB;
  const token = readCookie(request, COOKIE_NAME);
  if (db && token) {
    await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }
  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  for (const c of clearAuthCookies(request)) headers.append('Set-Cookie', c);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};

export const ALL: APIRoute = () => json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
