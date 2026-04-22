/**
 * Utils compartidos para las API routes Astro.
 * Los endpoints con `prerender: false` corren como SSR en el Worker
 * generado por el adapter @astrojs/cloudflare cuando el astro.config
 * tiene `output: 'server'`.
 */

// Astro v6 removió `Astro.locals.runtime.env`. Ahora los bindings se
// leen via `import { env } from "cloudflare:workers"` — módulo virtual
// que Cloudflare provee en runtime del Worker.
import { env as cfEnv } from 'cloudflare:workers';

/**
 * Env tipado con los bindings de wrangler.jsonc.
 * Si agregás un binding nuevo, extendé esta interface.
 */
export interface CfEnv {
  DB: D1Database;
  ASSETS: Fetcher;
  SESSION?: KVNamespace;
  IMAGES?: unknown;
  ADMIN_PASSCODE?: string;
}

/** Acceso tipado al env del Worker (D1, KV, secrets). */
export function getEnv(): CfEnv {
  return cfEnv as unknown as CfEnv;
}

/**
 * @deprecated Astro v6: usar `getEnv().DB`.
 * Se mantiene la firma para no romper call-sites existentes.
 */
export function getD1FromLocals(_locals?: unknown): D1Database | null {
  const db = (cfEnv as any)?.DB as D1Database | undefined;
  return db || null;
}

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

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function sanitizeText(input: unknown, maxLen = 2000): string {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, maxLen);
}

export function getClientIP(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/** FNV-1a hash → 10 chars hex (dedupe sin guardar IP real). */
export function hashIP(ip: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < ip.length; i++) {
    h ^= ip.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0').slice(0, 10);
}

/** Parsea body JSON o form-urlencoded. */
export async function parseBody(request: Request): Promise<Record<string, unknown>> {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    return (await request.json()) as Record<string, unknown>;
  }
  const fd = await request.formData();
  const out: Record<string, unknown> = {};
  fd.forEach((v, k) => { out[k] = v; });
  return out;
}
