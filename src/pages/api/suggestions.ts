/**
 * /api/suggestions
 *
 * GET  → lista sugerencias visibles (status approved + pending) ordenadas
 *        por vote_count DESC. Soporta ?category=... y ?status=...
 *        (status solo si admin pasa ?k=PASSCODE).
 * POST → crea sugerencia nueva (status='pending' hasta aprobación admin).
 *        Body: { title, description, category, email?, hp_field? }
 *        hp_field es honeypot — debe venir vacío.
 *
 * Voting va en /api/suggestions/[id]/vote (archivo aparte para el dynamic route).
 */
import type { APIRoute } from 'astro';
import {
  json,
  isValidEmail,
  sanitizeText,
  getClientIP,
  hashIP,
  parseBody,
  getEnv,
} from '../../lib/api-utils';

export const prerender = false;

// Mismas categorías que usa el contenido de calcs (src/content/calcs/*.json).
// Mantenelo sincronizado si agregás categorías nuevas.
const VALID_CATEGORIES = new Set([
  'finanzas',
  'salud',
  'deportes',
  'familia',
  'cocina',
  'construccion',
  'automotor',
  'mascotas',
  'matematicas',
  'ciencia',
  'idiomas',
  'entretenimiento',
  'vida',
  'negocios',
  'tecnologia',
  'otros',
]);

// Limites razonables para que no nos llenen la DB con basura.
const TITLE_MIN = 6;
const TITLE_MAX = 120;
const DESC_MIN = 20;
const DESC_MAX = 1000;

// ─────────────────────────────────────────────────────────────────────────────
// GET — listado público
// ─────────────────────────────────────────────────────────────────────────────
export const GET: APIRoute = async ({ request }) => {
  const env = getEnv();
  const db = env.DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  const url = new URL(request.url);
  const category = sanitizeText(url.searchParams.get('category'), 30);
  const adminKey = url.searchParams.get('k') || '';
  const isAdmin = !!env.ADMIN_PASSCODE && adminKey === env.ADMIN_PASSCODE;

  // Por defecto solo mostramos approved + pending (UGC visible).
  // Admin puede pedir 'rejected' o 'built' con ?status=...
  const reqStatus = sanitizeText(url.searchParams.get('status'), 20);
  const statusList = isAdmin && reqStatus
    ? [reqStatus]
    : ['approved', 'pending'];

  // Construimos el WHERE con bindings — sin string interpolation (anti SQL inj).
  const placeholders = statusList.map(() => '?').join(',');
  const params: any[] = [...statusList];
  let where = `status IN (${placeholders})`;
  if (category && VALID_CATEGORIES.has(category)) {
    where += ' AND category = ?';
    params.push(category);
  }

  try {
    const res = await db
      .prepare(
        `SELECT id, title, description, category, status, vote_count, created_at
         FROM calc_suggestions
         WHERE ${where}
         ORDER BY vote_count DESC, created_at DESC
         LIMIT 200`,
      )
      .bind(...params)
      .all();
    return json({ ok: true, suggestions: res.results || [] });
  } catch (err) {
    console.error('suggestions GET failed:', err);
    return json({ error: 'No se pudo listar sugerencias.' }, { status: 500 });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST — crear sugerencia
// ─────────────────────────────────────────────────────────────────────────────
export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try {
    body = await parseBody(request);
  } catch {
    return json({ error: 'Body inválido' }, { status: 400 });
  }

  // Honeypot — bots llenan todos los inputs, humanos no ven el oculto.
  // Si viene con valor, fingimos éxito (200) para no señalar el campo.
  const hp = sanitizeText(body.website, 200);
  if (hp) return json({ ok: true });

  const title = sanitizeText(body.title, TITLE_MAX);
  const description = sanitizeText(body.description, DESC_MAX);
  const category = sanitizeText(body.category, 30).toLowerCase();
  const emailRaw = sanitizeText(body.email, 254).toLowerCase();

  if (title.length < TITLE_MIN) {
    return json({ error: `Título demasiado corto (mínimo ${TITLE_MIN}).` }, { status: 400 });
  }
  if (description.length < DESC_MIN) {
    return json({ error: `Descripción demasiado corta (mínimo ${DESC_MIN}).` }, { status: 400 });
  }
  if (!VALID_CATEGORIES.has(category)) {
    return json({ error: 'Categoría inválida.' }, { status: 400 });
  }
  if (emailRaw && !isValidEmail(emailRaw)) {
    return json({ error: 'Email inválido.' }, { status: 400 });
  }

  const env = getEnv();
  const db = env.DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  const ipH = hashIP(getClientIP(request));
  const now = Date.now();

  try {
    const res = await db
      .prepare(
        `INSERT INTO calc_suggestions
         (title, description, category, email_optional, status, vote_count, ip_hash, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'pending', 0, ?, ?, ?)`,
      )
      .bind(title, description, category, emailRaw || null, ipH, now, now)
      .run();
    return json({ ok: true, id: res.meta?.last_row_id });
  } catch (err) {
    console.error('suggestions POST failed:', err);
    return json({ error: 'No se pudo guardar la sugerencia.' }, { status: 500 });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH — admin moderation (cambiar status). Requiere ?k=PASSCODE.
// Body: { id, status }   donde status ∈ 'approved'|'rejected'|'built'|'pending'
// ─────────────────────────────────────────────────────────────────────────────
export const PATCH: APIRoute = async ({ request }) => {
  const env = getEnv();
  const url = new URL(request.url);
  const adminKey = url.searchParams.get('k') || '';
  if (!env.ADMIN_PASSCODE || adminKey !== env.ADMIN_PASSCODE) {
    return json({ error: 'No autorizado' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const id = parseInt(String(body.id || ''), 10);
  const status = sanitizeText(body.status, 20);
  if (!Number.isFinite(id) || id <= 0) {
    return json({ error: 'ID inválido' }, { status: 400 });
  }
  if (!['approved', 'rejected', 'built', 'pending'].includes(status)) {
    return json({ error: 'Status inválido' }, { status: 400 });
  }

  const db = env.DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  try {
    await db
      .prepare(`UPDATE calc_suggestions SET status = ?, updated_at = ? WHERE id = ?`)
      .bind(status, Date.now(), id)
      .run();
    return json({ ok: true });
  } catch (err) {
    console.error('suggestions PATCH failed:', err);
    return json({ error: 'No se pudo actualizar.' }, { status: 500 });
  }
};

export const ALL: APIRoute = () =>
  json({ error: 'Usar GET, POST o PATCH' }, { status: 405, headers: { allow: 'GET, POST, PATCH' } });
