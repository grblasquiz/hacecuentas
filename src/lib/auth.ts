/**
 * Auth de "Mi Hacé Cuentas" — sesiones + OTP por mail.
 *
 * Corre en el Worker SSR (rutas /api/auth/* con prerender:false). Usa Web Crypto
 * (disponible en Workers): getRandomValues, subtle.digest. Sin dependencias.
 *
 * Modelo:
 *  - Login por código de un solo uso (OTP) al mail. Guardamos el HASH del código,
 *    nunca el plano. Expiry 10 min, máx 5 intentos.
 *  - Sesión = token opaco aleatorio (256-bit) guardado en D1 (tabla sessions) y
 *    en cookie httpOnly+Secure+SameSite=Lax. El cliente NUNCA ve el token en JS.
 *  - Los calcs siguen públicos; sólo el perfil pide sesión.
 */

export const COOKIE_NAME = 'hc_sess';
/** Pista NO sensible para que el cliente sepa si hay sesión sin un fetch. */
export const AUTHED_HINT_COOKIE = 'hc_authed';
export const CODE_TTL_MS = 10 * 60 * 1000; // 10 min
export const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 días
export const MAX_CODE_ATTEMPTS = 5;
/** Anti-spam: no reenviar código si ya hay uno fresco de hace menos de esto. */
export const RESEND_COOLDOWN_MS = 45 * 1000;

/** Código OTP de 6 dígitos, criptográficamente aleatorio. */
export function generateCode(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(buf[0] % 1_000_000).padStart(6, '0');
}

/** SHA-256 → hex. Para guardar el hash del código (y comparar sin el plano). */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Token de sesión opaco: 32 bytes aleatorios en base64url. */
export function generateSessionToken(): string {
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  let bin = '';
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Lee una cookie del header Cookie de la request. */
export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return null;
}

/** ¿La request llegó por https? (define el flag Secure de la cookie.) */
function isSecure(request: Request): boolean {
  if (request.headers.get('x-forwarded-proto') === 'https') return true;
  try {
    return new URL(request.url).protocol === 'https:';
  } catch {
    return true; // ante la duda, Secure
  }
}

/** Set-Cookie de sesión (httpOnly, no accesible por JS). */
export function sessionCookie(request: Request, token: string, maxAgeMs = SESSION_TTL_MS): string {
  const secure = isSecure(request) ? '; Secure' : '';
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=${Math.floor(maxAgeMs / 1000)}`;
}

/** Set-Cookie de la PISTA de auth (legible por JS, sin valor sensible). */
export function authedHintCookie(request: Request, on: boolean): string {
  const secure = isSecure(request) ? '; Secure' : '';
  const maxAge = on ? Math.floor(SESSION_TTL_MS / 1000) : 0;
  return `${AUTHED_HINT_COOKIE}=${on ? '1' : ''}; Path=/${secure}; SameSite=Lax; Max-Age=${maxAge}`;
}

/** Cookies para cerrar sesión (vacían ambas). */
export function clearAuthCookies(request: Request): string[] {
  const secure = isSecure(request) ? '; Secure' : '';
  return [
    `${COOKIE_NAME}=; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=0`,
    `${AUTHED_HINT_COOKIE}=; Path=/${secure}; SameSite=Lax; Max-Age=0`,
  ];
}

export interface SessionUser {
  id: number;
  email: string;
}

/**
 * Valida la sesión de la request contra D1. Devuelve el usuario o null.
 * Borra perezosamente la sesión si está vencida.
 */
export async function getSessionUser(
  request: Request,
  db: D1Database,
): Promise<SessionUser | null> {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return null;
  const row = await db
    .prepare(
      `SELECT s.token, s.expires_at, u.id AS user_id, u.email
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`,
    )
    .bind(token)
    .first<{ token: string; expires_at: number; user_id: number; email: string }>();
  if (!row) return null;
  if (row.expires_at < Date.now()) {
    await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
    return null;
  }
  return { id: row.user_id, email: row.email };
}
