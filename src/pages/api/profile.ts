/**
 * /api/profile — perfil numérico server-side de "Mi Hacé Cuentas". Requiere sesión.
 *   GET            → { profile: { "<key>": {value, at, src} } }
 *   POST {key,value,src}  → upsert (value vacío => borra esa clave)
 *   DELETE {key?}  → borra una clave, o todo el perfil si no se pasa key
 */
import type { APIRoute } from 'astro';
import { json, getEnv, sanitizeText, parseBody } from '../../lib/api-utils';
import { getSessionUser } from '../../lib/auth';
import { isProfileKey } from '../../lib/profile/schema';

export const prerender = false;

async function loadProfile(db: D1Database, userId: number) {
  const rows = await db
    .prepare('SELECT key, value, updated_at, src FROM user_profile WHERE user_id = ?')
    .bind(userId)
    .all<{ key: string; value: string; updated_at: number; src: string | null }>();
  const profile: Record<string, { value: string; at: string; src: string }> = {};
  for (const r of rows.results || []) {
    profile[r.key] = { value: r.value, at: new Date(r.updated_at).toISOString(), src: r.src || 'profile' };
  }
  return profile;
}

export const GET: APIRoute = async ({ request }) => {
  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });
  const user = await getSessionUser(request, db);
  if (!user) return json({ error: 'No autenticado' }, { status: 401 });
  return json({ profile: await loadProfile(db, user.id) });
};

export const POST: APIRoute = async ({ request }) => {
  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });
  const user = await getSessionUser(request, db);
  if (!user) return json({ error: 'No autenticado' }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const key = sanitizeText(body.key, 60);
  if (!isProfileKey(key)) return json({ error: 'Clave de perfil inválida' }, { status: 400 });

  const rawValue = body.value;
  const value = typeof rawValue === 'number' ? String(rawValue) : sanitizeText(rawValue, 200);
  const src = sanitizeText(body.src, 80) || 'profile';
  const now = Date.now();

  if (value === '') {
    await db.prepare('DELETE FROM user_profile WHERE user_id = ? AND key = ?').bind(user.id, key).run();
    return json({ ok: true, deleted: key });
  }

  await db
    .prepare(
      `INSERT INTO user_profile (user_id, key, value, updated_at, src)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, src = excluded.src`,
    )
    .bind(user.id, key, value, now, src)
    .run();
  return json({ ok: true, key });
};

export const DELETE: APIRoute = async ({ request }) => {
  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });
  const user = await getSessionUser(request, db);
  if (!user) return json({ error: 'No autenticado' }, { status: 401 });

  let body: Record<string, unknown> = {};
  try { body = await parseBody(request); } catch { /* sin body = borrar todo */ }
  const key = sanitizeText(body.key, 60);

  if (key) {
    await db.prepare('DELETE FROM user_profile WHERE user_id = ? AND key = ?').bind(user.id, key).run();
    return json({ ok: true, deleted: key });
  }
  await db.prepare('DELETE FROM user_profile WHERE user_id = ?').bind(user.id).run();
  return json({ ok: true, deleted: 'all' });
};
