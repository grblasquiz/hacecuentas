/**
 * Utils compartidos para las API routes Astro.
 * Los endpoints con `prerender: false` corren como SSR en el Worker
 * generado por el adapter @astrojs/cloudflare cuando el astro.config
 * tiene `output: 'server'`.
 */

/** Acceso tipado al D1 binding desde el context Astro + CF runtime. */
export function getD1FromLocals(locals: any): D1Database | null {
  const env = locals?.runtime?.env;
  return env?.DB || null;
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
