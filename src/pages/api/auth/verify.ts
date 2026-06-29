/**
 * POST /api/auth/verify
 * Body: { email, code, newsletter }
 *
 * Valida el OTP, crea/actualiza el usuario (+ opt-in newsletter), abre sesión
 * (cookie httpOnly) y devuelve el perfil server-side.
 */
import type { APIRoute } from 'astro';
import { json, isValidEmail, sanitizeText, parseBody, getEnv } from '../../../lib/api-utils';
import {
  sha256Hex, generateSessionToken, sessionCookie, authedHintCookie,
  SESSION_TTL_MS, MAX_CODE_ATTEMPTS,
} from '../../../lib/auth';

export const prerender = false;

function truthy(v: unknown): boolean {
  return v === true || v === 1 || v === '1' || v === 'true' || v === 'on';
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const email = sanitizeText(body.email, 254).toLowerCase();
  const code = sanitizeText(body.code, 6);
  const newsletter = truthy(body.newsletter) ? 1 : 0;
  if (!isValidEmail(email)) return json({ error: 'Email inválido' }, { status: 400 });
  if (!/^\d{6}$/.test(code)) return json({ error: 'Código inválido' }, { status: 400 });

  const db = getEnv().DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });

  const now = Date.now();
  const row = await db
    .prepare('SELECT id, code_hash, expires_at, attempts FROM auth_codes WHERE email = ? AND consumed = 0 ORDER BY created_at DESC LIMIT 1')
    .bind(email)
    .first<{ id: number; code_hash: string; expires_at: number; attempts: number }>();

  if (!row) return json({ error: 'Pedí un código nuevo.' }, { status: 400 });
  if (row.expires_at < now) {
    await db.prepare('UPDATE auth_codes SET consumed = 1 WHERE id = ?').bind(row.id).run();
    return json({ error: 'El código venció. Pedí uno nuevo.' }, { status: 400 });
  }
  if (row.attempts >= MAX_CODE_ATTEMPTS) {
    await db.prepare('UPDATE auth_codes SET consumed = 1 WHERE id = ?').bind(row.id).run();
    return json({ error: 'Demasiados intentos. Pedí un código nuevo.' }, { status: 429 });
  }

  const codeHash = await sha256Hex(code);
  if (codeHash !== row.code_hash) {
    await db.prepare('UPDATE auth_codes SET attempts = attempts + 1 WHERE id = ?').bind(row.id).run();
    return json({ error: 'Código incorrecto.' }, { status: 400 });
  }

  // Código OK → consumir y crear/actualizar usuario.
  await db.prepare('UPDATE auth_codes SET consumed = 1 WHERE id = ?').bind(row.id).run();
  await db
    .prepare(
      `INSERT INTO users (email, created_at, last_login_at, newsletter_optin, auth_provider, email_verified)
       VALUES (?, ?, ?, ?, 'otp', 1)
       ON CONFLICT(email) DO UPDATE SET
         last_login_at = excluded.last_login_at,
         email_verified = 1,
         newsletter_optin = MAX(users.newsletter_optin, excluded.newsletter_optin)`,
    )
    .bind(email, now, now, newsletter)
    .run();
  const user = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first<{ id: number }>();
  if (!user) return json({ error: 'No pudimos crear la cuenta.' }, { status: 500 });

  // Alta en newsletter si tildó la casilla.
  if (newsletter) {
    await db
      .prepare(`INSERT OR IGNORE INTO newsletter_subs (email, created_at, source) VALUES (?, ?, 'cuenta')`)
      .bind(email, now)
      .run();
  }

  // Sesión.
  const token = generateSessionToken();
  await db
    .prepare('INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
    .bind(token, user.id, now, now + SESSION_TTL_MS)
    .run();

  // Perfil server-side.
  const profileRows = await db
    .prepare('SELECT key, value, updated_at, src FROM user_profile WHERE user_id = ?')
    .bind(user.id)
    .all<{ key: string; value: string; updated_at: number; src: string | null }>();
  const profile: Record<string, { value: string; at: string; src: string }> = {};
  for (const r of profileRows.results || []) {
    profile[r.key] = { value: r.value, at: new Date(r.updated_at).toISOString(), src: r.src || 'profile' };
  }

  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  headers.append('Set-Cookie', sessionCookie(request, token));
  headers.append('Set-Cookie', authedHintCookie(request, true));
  return new Response(JSON.stringify({ ok: true, email, profile }), { status: 200, headers });
};

export const ALL: APIRoute = () => json({ error: 'Usar POST' }, { status: 405, headers: { allow: 'POST' } });
