/**
 * POST /api/coop/revoke
 * Body: { token }  (revoke_token devuelto al aportar, guardado en localStorage)
 *
 * Salvaguarda "posibilidad de revocar el aporte". Como el aporte es anónimo (no
 * hay email ni user_id), la revocación se hace con un token opaco atado al
 * DISPOSITIVO (vive en localStorage 'hc_coop'), nunca a la identidad. Borra la
 * fila. Idempotente: si ya no existe, devuelve removed:0.
 */
import type { APIRoute } from 'astro';
import { json, sanitizeText, parseBody, getEnv } from '../../../lib/api-utils';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const token = sanitizeText(body.token, 200);
  if (!token || token.length < 16) return json({ error: 'Token inválido' }, { status: 400 });

  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  const res = await db.prepare('DELETE FROM coop_contributions WHERE revoke_token = ?').bind(token).run();
  const removed = (res as any)?.meta?.changes ?? 0;
  return json({ ok: true, removed });
};

export const ALL: APIRoute = () => json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
