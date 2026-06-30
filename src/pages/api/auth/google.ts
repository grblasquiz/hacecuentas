/**
 * POST /api/auth/google
 * Body: { credential, newsletter }
 *
 * Login con Google. `credential` es el ID token (JWT) que devuelve Google
 * Identity Services en el cliente. Lo verificamos contra el JWKS de Google
 * (firma RS256 + claims iss/aud/exp), creamos/actualizamos el usuario
 * (auth_provider='google'), abrimos sesión y devolvemos el perfil server-side.
 *
 * Mismo modelo de sesión/perfil que /api/auth/verify (OTP). No hay password ni
 * client secret: el flujo de ID token sólo usa el Client ID público.
 */
import type { APIRoute } from 'astro';
import { json, sanitizeText, parseBody, getEnv } from '../../../lib/api-utils';
import {
  verifyGoogleIdToken, generateSessionToken, sessionCookie, authedHintCookie,
  SESSION_TTL_MS,
} from '../../../lib/auth';

export const prerender = false;

function truthy(v: unknown): boolean {
  return v === true || v === 1 || v === '1' || v === 'true' || v === 'on';
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown>;
  try { body = await parseBody(request); }
  catch { return json({ error: 'Body inválido' }, { status: 400 }); }

  const credential = sanitizeText(body.credential, 4096);
  const newsletter = truthy(body.newsletter) ? 1 : 0;
  if (!credential) return json({ error: 'Falta el token de Google' }, { status: 400 });

  const env = getEnv();
  const db = env.DB;
  if (!db) return json({ error: 'DB no disponible' }, { status: 500 });
  const clientId = env.GOOGLE_CLIENT_ID;
  if (!clientId) return json({ error: 'Google login no está configurado' }, { status: 503 });

  const identity = await verifyGoogleIdToken(credential, clientId);
  if (!identity) return json({ error: 'No pudimos validar tu cuenta de Google.' }, { status: 401 });
  if (!identity.emailVerified) return json({ error: 'Tu email de Google no está verificado.' }, { status: 403 });

  const email = identity.email;
  const now = Date.now();

  // Crear/actualizar usuario. Si ya existía por OTP, lo dejamos como estaba
  // (no degradamos auth_provider); el mail viene verificado por Google igual.
  await db
    .prepare(
      `INSERT INTO users (email, created_at, last_login_at, newsletter_optin, auth_provider, email_verified)
       VALUES (?, ?, ?, ?, 'google', 1)
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
