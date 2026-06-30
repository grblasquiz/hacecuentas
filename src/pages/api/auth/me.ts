/**
 * GET /api/auth/me
 * Devuelve { authed:false } o { authed:true, email, profile } según la sesión.
 */
import type { APIRoute } from 'astro';
import { json, getEnv } from '../../../lib/api-utils';
import { getSessionUser } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const env = getEnv();
  const db = env.DB;
  // Client ID público de Google: el cliente lo necesita para renderizar el
  // botón. Se manda esté o no logueado el usuario.
  const googleClientId = env.GOOGLE_CLIENT_ID || null;
  if (!db) return json({ authed: false, googleClientId });

  const user = await getSessionUser(request, db);
  if (!user) return json({ authed: false, googleClientId });

  const rows = await db
    .prepare('SELECT key, value, updated_at, src FROM user_profile WHERE user_id = ?')
    .bind(user.id)
    .all<{ key: string; value: string; updated_at: number; src: string | null }>();
  const profile: Record<string, { value: string; at: string; src: string }> = {};
  for (const r of rows.results || []) {
    profile[r.key] = { value: r.value, at: new Date(r.updated_at).toISOString(), src: r.src || 'profile' };
  }

  return json({
    authed: true,
    email: user.email,
    authProvider: user.authProvider,
    createdAt: user.createdAt,
    profile,
    googleClientId,
  });
};
