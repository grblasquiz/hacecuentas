import type { APIRoute } from 'astro';
import { getEnv, json, parseBody, getClientIP, hashIP } from '../../lib/api-utils';
import { interpret, DEFAULT_MODEL, type ChatMessage } from '../../lib/interpret';

// ─────────────────────────────────────────────────────────────────────────────
// INTÉRPRETE DE PROBLEMAS — POST /api/interpret
//
// Reemplaza conceptualmente al buscador: el usuario describe un problema en
// lenguaje natural y este endpoint detecta la intención, elige la/las
// calculadoras, pide los datos que falten y ejecuta el cálculo con el motor
// determinístico (runCompute). El modelo NUNCA calcula: solo orquesta.
//
// Es la "única inteligencia de cálculo" compartida por todas las superficies
// (portada, buscador, WhatsApp, extensión, plugin WP). Stateless: el cliente
// manda el historial de texto; el server resuelve el turno.
//
// Si no hay ANTHROPIC_API_KEY (ej. dev sin secret) devuelve 503 con
// {fallback:true} → el front cae al buscador por palabra clave.
// ─────────────────────────────────────────────────────────────────────────────
export const prerender = false;

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
  const env = getEnv();
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Sin clave (dev / no configurado) → el front usa el buscador clásico.
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

  // Timeout duro: el intérprete hace varias llamadas; no dejamos colgar el Worker.
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 25_000);
  try {
    const res = await interpret({
      apiKey,
      model: env.INTERPRET_MODEL || DEFAULT_MODEL,
      history,
      signal: ctrl.signal,
    });
    return json(
      { ok: true, reply: res.reply, cards: res.cards },
      { status: 200, headers: { ...CORS, 'Cache-Control': 'no-store' } },
    );
  } catch (err: any) {
    // Hash de IP solo para correlacionar logs sin guardar PII.
    console.error('[interpret] failed', hashIP(getClientIP(request)), err?.message || err);
    const aborted = err?.name === 'AbortError';
    return json(
      {
        ok: false,
        fallback: true,
        message: aborted
          ? 'Tardé demasiado. Probá reformular más corto o usá el buscador por nombre.'
          : 'No pude procesarlo ahora. Probá el buscador por nombre.',
      },
      { status: aborted ? 504 : 502, headers: CORS },
    );
  } finally {
    clearTimeout(timer);
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
