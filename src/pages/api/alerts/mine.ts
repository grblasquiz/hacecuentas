/**
 * GET /api/alerts/mine — lista las alertas del usuario logueado (por user_id o
 * por su email, para incluir las creadas antes de iniciar sesión). Requiere sesión.
 */
import type { APIRoute } from 'astro';
import { json, getEnv } from '../../../lib/api-utils';
import { getSessionUser } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });
  const user = await getSessionUser(request, db);
  if (!user) return json({ authed: false, alerts: [] }, { status: 401 });

  const rows = await db
    .prepare(
      `SELECT id, slug, headline_label, last_headline, created_at, last_changed_at, status
       FROM result_alerts
       WHERE status = 'active' AND (user_id = ? OR email = ?)
       ORDER BY created_at DESC`,
    )
    .bind(user.id, user.email)
    .all<{ id: number; slug: string; headline_label: string; last_headline: string; created_at: number; last_changed_at: number | null; status: string }>();

  return json({ authed: true, alerts: rows.results || [] });
};
