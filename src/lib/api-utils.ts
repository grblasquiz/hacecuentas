/**
 * Helpers para las API routes de hacecuentas.com.
 *
 * - hashIP: hash truncado de la IP del request. Útil para dedupe suave sin
 *   guardar la IP real (compliance con Ley 25.326 AR y GDPR).
 * - jsonResponse: helper para devolver JSON con CORS + cache headers correctos.
 * - getD1: tipado seguro para acceder al binding DB desde el context CF.
 * - rateLimitKey: para futura implementación de rate limit; por ahora solo
 *   arma una key estable ip_hash:endpoint.
 */

import type { APIContext } from 'astro';

export interface CloudflareEnv {
  DB?: D1Database;
  ADMIN_PASSCODE?: string;
  NOTIFY_EMAIL_WEBHOOK?: string;
}

/** Extrae el binding DB del context de Astro + CF. Tira error si no existe. */
export function getD1(context: APIContext): D1Database {
  const env = (context.locals as any).runtime?.env as CloudflareEnv | undefined;
  if (!env?.DB) {
    throw new Error(
      'D1 binding "DB" no encontrado. Verificar wrangler.jsonc y que la DB haya sido creada.',
    );
  }
  return env.DB;
}

/** Hash rápido (FNV-1a) de 32-bit, truncado a 10 chars hex. */
export function hashIP(ip: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < ip.length; i++) {
    h ^= ip.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 10);
}

/** Obtiene la IP del request (CF pone la real en cf-connecting-ip). */
export function getClientIP(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** JSON response con headers seguros. */
export function json(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
      ...(init.headers || {}),
    },
  });
}

/** Validador simple de email. No intenta ser RFC-complete, sólo razonable. */
export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/** Sanea un string de texto libre (mensaje de error report). Trim + cap. */
export function sanitizeText(input: unknown, maxLen = 2000): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLen);
}
