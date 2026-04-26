/**
 * POST /api/suggestions/:id/vote
 * Incrementa vote_count en calc_suggestions, idempotente por IP.
 *
 * Estrategia:
 *   1. INSERT OR IGNORE en suggestion_votes (UNIQUE en suggestion_id+ip_hash).
 *   2. Solo si meta.changes === 1 (voto nuevo) hacemos UPDATE +1 en vote_count.
 *   3. Si ya había votado devolvemos { ok: true, already: true } para que el
 *      cliente no muestre error ni doble incremento.
 *
 * No requiere login. Anti-doble-voto solo por IP hash — suficiente para signal,
 * no para algo crítico como elecciones.
 */
import type { APIRoute } from 'astro';
import { json, getClientIP, hashIP, getEnv } from '../../../../lib/api-utils';

export const prerender = false;

export const POST: APIRoute = async ({ params, request }) => {
  const idRaw = String(params.id || '');
  const id = parseInt(idRaw, 10);
  if (!Number.isFinite(id) || id <= 0 || String(id) !== idRaw) {
    return json({ error: 'ID inválido' }, { status: 400 });
  }

  const env = getEnv();
  const db = env.DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  const ipH = hashIP(getClientIP(request));
  const now = Date.now();

  try {
    // Verificamos que la sugerencia exista y esté visible (approved|pending).
    // Si no, no permitimos votar (rejected/built no se votan).
    const row = await db
      .prepare(`SELECT status FROM calc_suggestions WHERE id = ?`)
      .bind(id)
      .first<{ status: string }>();
    if (!row) return json({ error: 'Sugerencia inexistente.' }, { status: 404 });
    if (row.status !== 'approved' && row.status !== 'pending') {
      return json({ error: 'Esta sugerencia ya no acepta votos.' }, { status: 409 });
    }

    // Insert idempotente por (suggestion_id, ip_hash).
    const ins = await db
      .prepare(
        `INSERT OR IGNORE INTO suggestion_votes (suggestion_id, ip_hash, created_at)
         VALUES (?, ?, ?)`,
      )
      .bind(id, ipH, now)
      .run();

    const wasNew = (ins.meta?.changes ?? 0) === 1;
    if (!wasNew) {
      // Ya había votado — devolvemos OK pero no incrementamos.
      const cur = await db
        .prepare(`SELECT vote_count FROM calc_suggestions WHERE id = ?`)
        .bind(id)
        .first<{ vote_count: number }>();
      return json({ ok: true, already: true, vote_count: cur?.vote_count ?? 0 });
    }

    // Voto nuevo: +1 en vote_count + updated_at.
    await db
      .prepare(`UPDATE calc_suggestions SET vote_count = vote_count + 1, updated_at = ? WHERE id = ?`)
      .bind(now, id)
      .run();

    const cur = await db
      .prepare(`SELECT vote_count FROM calc_suggestions WHERE id = ?`)
      .bind(id)
      .first<{ vote_count: number }>();

    return json({ ok: true, already: false, vote_count: cur?.vote_count ?? 1 });
  } catch (err) {
    console.error('suggestion vote failed:', err);
    return json({ error: 'No se pudo registrar el voto.' }, { status: 500 });
  }
};

export const ALL: APIRoute = () =>
  json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
