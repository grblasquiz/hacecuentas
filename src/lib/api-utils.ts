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
  /**
   * Cloudflare Email Sending — binding send_email. Mismo mecanismo que el
   * newsletter (workers/mailing-cron). Manda el OTP de login y TODOS los
   * emails transaccionales (email-result, feedback, lead) vía
   * sendHostingEmail(). En dev (astro dev) no existe → los sends devuelven
   * false y request-code cae al fallback con devCode.
   */
  EMAIL?: { send: (msg: { from: string; to: string; subject: string; html: string }) => Promise<unknown> };
  /** Remitente de los emails de login/cuenta. Default 'cuenta@hacecuentas.com'. */
  AUTH_EMAIL_FROM?: string;
  /**
   * Client ID público de Google OAuth (Google Identity Services). Si está
   * seteado, /mi-hacecuentas muestra el botón "Iniciá sesión con Google". Es
   * público (va en el cliente); no hay client secret en el flujo de ID token.
   */
  GOOGLE_CLIENT_ID?: string;
  /** Remitente del email "tu resultado". Default 'resultados@hacecuentas.com'. */
  RESULT_EMAIL_FROM?: string;
  /** Destino/remitente de notificaciones internas (feedback, leads). */
  FEEDBACK_EMAIL_TO?: string;
  FEEDBACK_EMAIL_FROM?: string;
  /** Key alternativa para endpoints admin de mantenimiento (backfills). */
  BACKFILL_KEY?: string;
  /**
   * Cloudflare Workers AI — binding `AI`. Motor primario (gratis) del "intérprete
   * de problemas" (/api/interpret): traduce lenguaje natural → calc + inputs y
   * orquesta el cómputo determinístico. Se declara en wrangler.jsonc:
   * "ai": { "binding": "AI" }.
   */
  AI?: { run: (model: string, inputs: Record<string, unknown>, options?: Record<string, unknown>) => Promise<unknown> };
  /**
   * Vectorize — índice semántico de calculadoras (`hacecuentas-calcs`) para el
   * retrieval del intérprete. Se puebla con `npm run embeddings`. Si falta, el
   * intérprete cae a la búsqueda por palabras clave.
   */
  VECTORIZE?: {
    query: (
      vector: number[],
      opts?: { topK?: number; returnMetadata?: boolean | 'all' | 'indexed' | 'none'; returnValues?: boolean },
    ) => Promise<{ matches: Array<{ id: string; score: number; metadata?: Record<string, unknown> }> }>;
    upsert: (vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>) => Promise<unknown>;
  };
  /**
   * Anthropic API key — FALLBACK del intérprete. Cuando Workers AI degrada (no
   * logra calcular, se estanca o tarda demasiado), ese turno se reintenta con
   * Haiku. Opcional: sin clave, el intérprete corre 100% en Workers AI. Setup:
   *   npx wrangler secret put ANTHROPIC_API_KEY
   * Si no hay NI binding AI NI clave, el endpoint devuelve 503 → buscador por nombre.
   */
  ANTHROPIC_API_KEY?: string;
  /**
   * Modelo primario del intérprete (Workers AI). Default
   * '@cf/meta/llama-3.3-70b-instruct-fp8-fast'.
   */
  INTERPRET_MODEL?: string;
  /** Modelo de fallback (Anthropic). Default 'claude-haiku-4-5-20251001'. */
  INTERPRET_FALLBACK_MODEL?: string;
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

/** Escapa HTML para interpolar texto de usuario en emails (texto y atributos). */
export function escapeHtml(s: string): string {
  return s.replace(/[<>&"]/g, (c) =>
    c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : '&quot;'
  );
}

/**
 * Slug de calc válido: empieza con "/", sólo lowercase/dígitos/guiones/barras.
 * Sin puntos, dos puntos ni comillas → no se puede inyectar un host ajeno
 * ni romper el atributo href de los emails (anti phishing-relay).
 */
export function isValidCalcSlug(slug: string): boolean {
  return /^\/[a-z0-9\-\/]{1,190}$/.test(slug);
}

/**
 * Envía un email vía Cloudflare Email Sending (binding EMAIL, wrangler.jsonc
 * `send_email`) — el hosting, mismo mecanismo que el newsletter
 * (workers/mailing-cron) y el OTP de login. Sin terceros ni API keys.
 * Best-effort: loguea y devuelve false ante cualquier error o si el binding
 * no existe (astro dev) — NUNCA tira.
 */
export async function sendHostingEmail(opts: {
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const env = getEnv();
  if (!env.EMAIL) {
    console.log(`[email] sin binding EMAIL (dev): "${opts.subject}" → ${opts.to} NO enviado`);
    return false;
  }
  try {
    await env.EMAIL.send(opts);
    return true;
  } catch (err) {
    console.error('hosting email send failed:', err);
    return false;
  }
}

/** "/calculadora-sueldo-en-mano" → "Sueldo en mano" (para asuntos de email). */
export function humanizeSlug(slug: string): string {
  const seg = slug.replace(/^\/+|\/+$/g, '').split('/').pop() || '';
  const base = seg
    .replace(/^(calculadora|calculator|calculadoras|simulador|conversor)-(de-)?/, '')
    .replace(/-/g, ' ')
    .trim();
  if (!base) return 'tu cálculo';
  return base.charAt(0).toUpperCase() + base.slice(1);
}

/**
 * Arma subject+html del email "tu resultado" de las calcs. Compartido entre
 * /api/email-result (envío en caliente) y /api/admin/resend-results (backlog).
 * `slug` tiene que venir validado con isValidCalcSlug (se interpola en href).
 */
export function buildResultEmail(slug: string, result: string): { subject: string; html: string } {
  const calcName = humanizeSlug(slug);
  const calcUrl = `https://hacecuentas.com${slug}`;
  return {
    subject: `Tu resultado de ${calcName} — Hacé Cuentas`,
    html: `
      <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #1f2937;">
        <h2 style="color: #2563eb; margin-bottom: 0.25em;">Hacé Cuentas</h2>
        <p style="margin-top: 0;">Tu resultado de <strong>${escapeHtml(calcName)}</strong>:</p>
        <p style="font-size: 1.6em; font-weight: 700; background: #f1f5f9; border-radius: 8px; padding: 16px 20px; text-align: center;">
          ${escapeHtml(result || '—')}
        </p>
        <p>
          <a href="${escapeHtml(calcUrl)}" style="color: #2563eb;">Volver a la calculadora</a>
          para ajustar los datos o probar otro escenario.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
        <p style="color: #888; font-size: 0.85em;">
          Recibiste esto porque lo pediste en hacecuentas.com.
        </p>
      </div>
    `,
  };
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

/** Comparación de strings en tiempo constante (evita timing oracle sobre secretos). */
export function constantTimeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * ¿La request trae una clave de admin válida? Preferí el header `X-Admin-Key`
 * (NO queda en access-logs de Cloudflare, historial del browser ni Referer);
 * `?k=` sigue soportado por compatibilidad con la página /admin (se carga por
 * GET y no puede mandar headers). Compara en tiempo constante contra cualquiera
 * de las claves válidas (ADMIN_PASSCODE / BACKFILL_KEY).
 */
export function isAdminAuthed(request: Request, validKeys: Array<string | undefined>): boolean {
  let provided = request.headers.get('x-admin-key') || '';
  if (!provided) {
    try { provided = new URL(request.url).searchParams.get('k') || ''; } catch { /* no-op */ }
  }
  if (!provided) return false;
  return validKeys.some((k) => !!k && constantTimeEqual(provided, k));
}

/**
 * Rate-limit por ip_hash usando el KV SESSION (ventana fija). Anti-abuso para
 * endpoints públicos de escritura/envío: frena scripts que bombardean sin
 * autenticación (email-bombing, DB-fill, quema de cuota de AI/EMAIL).
 *
 * Devuelve una Response 429 si se superó el límite, o `null` si la request
 * puede seguir. Uso en un handler:
 *
 *     const limited = await enforceRateLimit(request, 'feedback', 10, 3600);
 *     if (limited) return limited;
 *
 * FAIL-OPEN por diseño: si no hay binding SESSION (dev) o KV falla, deja pasar
 * la request. Un problema de infra NUNCA debe bloquear a usuarios reales — el
 * objetivo es cortar el abuso sostenido, no ser un contador exacto. Por la
 * consistencia eventual de KV, un burst muy concurrente puede colar unas pocas
 * de más; aceptable para anti-abuso.
 *
 * `bucket` separa los contadores por endpoint. `limit` = requests permitidas en
 * `windowSec` segundos (mínimo efectivo 60s por el TTL mínimo de KV).
 */
export async function enforceRateLimit(
  request: Request,
  bucket: string,
  limit: number,
  windowSec: number,
): Promise<Response | null> {
  const kv = getEnv().SESSION;
  if (!kv) return null; // sin binding (astro dev) → fail-open
  const key = `rl:${bucket}:${hashIP(getClientIP(request))}`;
  const now = Date.now();
  try {
    let count = 0;
    let resetAt = now + windowSec * 1000;
    const raw = await kv.get(key);
    if (raw) {
      try {
        const p = JSON.parse(raw) as { count?: number; resetAt?: number };
        if (p && typeof p.resetAt === 'number' && p.resetAt > now) {
          count = p.count || 0;
          resetAt = p.resetAt;
        }
      } catch { /* valor corrupto → arrancar ventana nueva */ }
    }
    if (count >= limit) {
      const retryAfter = Math.max(1, Math.ceil((resetAt - now) / 1000));
      return json(
        { error: 'Demasiadas solicitudes. Esperá un momento e intentá de nuevo.' },
        { status: 429, headers: { 'retry-after': String(retryAfter) } },
      );
    }
    const ttl = Math.max(60, Math.ceil((resetAt - now) / 1000));
    await kv.put(key, JSON.stringify({ count: count + 1, resetAt }), { expirationTtl: ttl });
    return null;
  } catch (err) {
    console.error(`rate-limit fail-open (${bucket}):`, err);
    return null;
  }
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
