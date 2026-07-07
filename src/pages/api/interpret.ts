import type { APIRoute } from 'astro';
import { getEnv, json, parseBody, getClientIP, hashIP, enforceRateLimit } from '../../lib/api-utils';
import { interpret, type ChatMessage } from '../../lib/interpret';

// ─────────────────────────────────────────────────────────────────────────────
// INTÉRPRETE DE PROBLEMAS — POST /api/interpret
//
// Reemplaza conceptualmente al buscador: el usuario describe un problema en
// lenguaje natural y este endpoint detecta la intención, elige la/las
// calculadoras, pide los datos que falten y ejecuta el cálculo con el motor
// determinístico (runCompute). El modelo NUNCA calcula: solo orquesta.
//
// Motor HÍBRIDO: Workers AI (binding env.AI, gratis) primero; si degrada, cae a
// Anthropic Haiku (env.ANTHROPIC_API_KEY) solo en ese turno. Es la "única
// inteligencia de cálculo" compartida por todas las superficies (portada,
// buscador, WhatsApp, extensión, plugin WP). Stateless: el cliente manda el
// historial de texto; el server resuelve el turno.
//
// Si no hay NINGÚN motor (ni AI ni clave) devuelve 503 con {fallback:true} → el
// front cae al buscador por palabra clave.
// ─────────────────────────────────────────────────────────────────────────────
export const prerender = false;

const TURN_TIMEOUT_MS = 30_000; // tope de un turno completo (varias llamadas al modelo)

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const MAX_MESSAGES = 24; // tope de historial aceptado (anti-abuso)
const MAX_CHARS = 2000; // por mensaje

function sanitizeHistory(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMessage[] = [];
  for (const m of raw.slice(-MAX_MESSAGES)) {
    if (!m || typeof m !== 'object') continue;
    const role = (m as any).role;
    const content = (m as any).content;
    if ((role === 'user' || role === 'assistant') && typeof content === 'string') {
      const text = content.trim().slice(0, MAX_CHARS);
      if (text) out.push({ role, content: text });
    }
  }
  return out;
}

export const POST: APIRoute = async ({ request }) => {
  // Cada request gasta 1 embedding + hasta 4 llamadas a Workers AI (Neurons
  // facturables) y, degradado, un fetch pago a Anthropic. Sin tope es
  // cost-exhaustion. Límite por IP (429 con CORS para no romper cross-origin).
  const limited = await enforceRateLimit(request, 'interpret', 30, 3600);
  if (limited) {
    return json(
      { ok: false, error: 'Demasiadas consultas. Esperá un momento e intentá de nuevo.' },
      { status: 429, headers: { ...CORS, 'retry-after': '60' } },
    );
  }

  const env = getEnv();
  const ai = env.AI && typeof env.AI.run === 'function' ? env.AI : undefined;
  const anthropicKey = env.ANTHROPIC_API_KEY;
  if (!ai && !anthropicKey) {
    // Sin ningún motor (dev / no configurado) → el front usa el buscador clásico.
    return json(
      { ok: false, fallback: true, message: 'El asistente no está disponible ahora. Probá el buscador por nombre.' },
      { status: 503, headers: CORS },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await parseBody(request);
  } catch {
    return json({ ok: false, error: 'invalid_body' }, { status: 400, headers: CORS });
  }

  // Acepta { messages: [...] } o { message: "..." } (un solo turno).
  let history = sanitizeHistory(body.messages);
  if (!history.length && typeof body.message === 'string') {
    const text = body.message.trim().slice(0, MAX_CHARS);
    if (text) history = [{ role: 'user', content: text }];
  }
  if (!history.length) {
    return json({ ok: false, error: 'empty', message: 'Contame qué necesitás calcular.' }, { status: 400, headers: CORS });
  }

  // Timeout duro: el intérprete hace varias llamadas al modelo; no dejamos colgar
  // el Worker. Workers AI no toma AbortSignal → corremos contra un Promise.race.
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('turn_timeout')), TURN_TIMEOUT_MS);
  });
  try {
    const res = await Promise.race([
      interpret({
        ai,
        vectorize: env.VECTORIZE,
        anthropicKey,
        model: env.INTERPRET_MODEL || undefined,
        fallbackModel: env.INTERPRET_FALLBACK_MODEL || undefined,
        history,
      }),
      timeout,
    ]);
    return json(
      { ok: true, reply: res.reply, cards: res.cards },
      { status: 200, headers: { ...CORS, 'Cache-Control': 'no-store' } },
    );
  } catch (err: any) {
    // Hash de IP solo para correlacionar logs sin guardar PII.
    console.error('[interpret] failed', hashIP(getClientIP(request)), err?.message || err);
    const timedOut = err?.message === 'turn_timeout';
    return json(
      {
        ok: false,
        fallback: true,
        message: timedOut
          ? 'Tardé demasiado. Probá reformular más corto o usá el buscador por nombre.'
          : 'No pude procesarlo ahora. Probá el buscador por nombre.',
      },
      { status: timedOut ? 504 : 502, headers: CORS },
    );
  } finally {
    if (timer) clearTimeout(timer);
  }
};

export const OPTIONS: APIRoute = () =>
  new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });

export const GET: APIRoute = () =>
  json(
    {
      service: 'Hacé Cuentas — Intérprete de problemas',
      usage: 'POST { messages: [{role, content}] } o { message: "..." }. Devuelve { reply, cards }.',
      note: 'El cálculo lo ejecuta el motor determinístico (runCompute); la IA solo detecta intención, pide datos y elige fórmulas.',
    },
    { status: 405, headers: { ...CORS, Allow: 'POST, OPTIONS' } },
  );
