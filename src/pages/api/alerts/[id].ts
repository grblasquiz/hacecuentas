/**
 * DELETE /api/alerts/:id — borra una alerta del usuario logueado. Solo si la
 * alerta le pertenece (user_id o email coincide con la sesión).
 */
import type { APIRoute } from 'astro';
import { json, getEnv } from '../../../lib/api-utils';
import { getSessionUser } from '../../../lib/auth';

export const prerender = false;

export const DELETE: APIRoute = async ({ request, params }) => {
  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });
  const user = await getSessionUser(request, db);
  if (!user) return json({ error: 'No autenticado' }, { status: 401 });

  const id = Number(params.id);
  if (!Number.isInteger(id) || id <= 0) return json({ error: 'ID inválido' }, { status: 400 });

  const res = await db
    .prepare('DELETE FROM result_alerts WHERE id = ? AND (user_id = ? OR email = ?)')
    .bind(id, user.id, user.email)
    .run();

  const changes = (res as any).meta?.changes ?? 0;
  if (!changes) return json({ error: 'No encontramos esa alerta.' }, { status: 404 });
  return json({ ok: true, deleted: id });
};

export const ALL: APIRoute = () => json({ error: 'Usar DELETE' }, { status: 405, headers: { allow: 'DELETE' } });
