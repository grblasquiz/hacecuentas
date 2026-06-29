/**
 * GET /api/auth/me
 * Devuelve { authed:false } o { authed:true, email, profile } según la sesión.
 */
import type { APIRoute } from 'astro';
import { json, getEnv } from '../../../lib/api-utils';
import { getSessionUser } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const db = getEnv().DB;
  if (!db) return json({ authed: false });

  const user = await getSessionUser(request, db);
  if (!user) return json({ authed: false });

  const rows = await db
    .prepare('SELECT key, value, updated_at, src FROM user_profile WHERE user_id = ?')
    .bind(user.id)
    .all<{ key: string; value: string; updated_at: number; src: string | null }>();
  const profile: Record<string, { value: string; at: string; src: string }> = {};
  for (const r of rows.results || []) {
    profile[r.key] = { value: r.value, at: new Date(r.updated_at).toISOString(), src: r.src || 'profile' };
  }

  return json({ authed: true, email: user.email, profile });
};
