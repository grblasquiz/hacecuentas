import {
  searchCalcs,
  describeCalc,
  runCompute,
  buildMeta,
  calcUrl,
  SITE,
  type SlimEntry,
} from './calc-compute';

// ─────────────────────────────────────────────────────────────────────────────
// INTÉRPRETE DE PROBLEMAS — la "única inteligencia de cálculo" de Hacé Cuentas.
//
// El usuario no siempre sabe qué calculadora necesita; llega con un problema en
// lenguaje natural ("me ofrecen 3 millones brutos y voy 3 veces a la oficina").
// El modelo SOLO: detecta intención, extrae variables, pide los datos que faltan
// y elige las fórmulas. El cálculo final NUNCA lo hace la IA: lo ejecuta el motor
// determinístico (runCompute) vía la tool `calcular`.
//
// Reutilizable por todas las superficies (web /api/interpret, WhatsApp, etc.):
// son las MISMAS tres tools que ya expone el servidor MCP (search/describe/
// compute), envueltas en un loop agéntico server-side. Stateless: el caller pasa
// el historial de mensajes (texto), el loop resuelve el turno actual.
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
export const DEFAULT_MODEL = 'claude-haiku-4-5-20251001';

// Tope de iteraciones del loop de tools en UN turno (anti-bucle / anti-costo).
const MAX_STEPS = 6;
// Tope de tokens de salida por llamada al modelo.
const MAX_TOKENS = 1024;

// ── Tipos públicos ───────────────────────────────────────────────────────────

/** Mensaje de la conversación tal como lo guarda el front (solo texto visible). */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Tarjeta de resultado: un cómputo determinístico listo para renderizar. */
export interface ResultCard {
  type: 'result';
  slug: string;
  name: string;
  url: string; // URL pública de la calc (con valores precargados en el query)
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
}

/** Sugerencia de calculadora (cuando el modelo lista candidatas sin computar). */
export interface SuggestionCard {
  type: 'suggestion';
  slug: string;
  name: string;
  url: string;
  category?: string;
}

export type Card = ResultCard | SuggestionCard;

export interface InterpretResult {
  reply: string;
  cards: Card[];
}

// ── Tools (formato Anthropic Messages API) ───────────────────────────────────

const TOOLS = [
  {
    name: 'buscar_calculadoras',
    description:
      'Busca calculadoras de Hacé Cuentas por palabras clave (ej. "sueldo neto", "plazo fijo", "indemnización despido", "metros pintura"). Devuelve slugs para usar con ver_calculadora o calcular. Usala primero para descubrir qué fórmulas existen para el problema del usuario.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'palabras clave a buscar' },
        category: {
          type: 'string',
          description: 'filtro opcional de categoría (finanzas, salud, impuestos, hogar, etc.)',
        },
        limit: { type: 'integer', description: 'máximo de resultados (default 8)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'ver_calculadora',
    description:
      'Devuelve la ficha de una calculadora por slug: qué inputs toma (id, tipo, si es obligatorio, valores válidos, default). Usala antes de calcular para saber exactamente qué datos pedirle al usuario.',
    input_schema: {
      type: 'object',
      properties: { slug: { type: 'string', description: 'slug de la calc (ej. sueldo-neto-argentina)' } },
      required: ['slug'],
    },
  },
  {
    name: 'calcular',
    description:
      'Ejecuta el cálculo determinístico de una calculadora. Pasá el slug y un objeto inputs con los campos (ver ver_calculadora). Devuelve el resultado real. ESTE es el único modo válido de obtener un número: nunca calcules vos. Si faltan campos obligatorios, la tool te lo dice en missingFields.',
    input_schema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'slug de la calc' },
        inputs: {
          type: 'object',
          additionalProperties: true,
          description: 'pares campo→valor, ej. {"sueldoBruto":2800000,"hijos":2}',
        },
      },
      required: ['slug', 'inputs'],
    },
  },
];

const SYSTEM_PROMPT = `Sos el asistente de Hacé Cuentas (hacecuentas.com), calculadoras para Argentina y LATAM, datos 2026.

El usuario te cuenta un PROBLEMA en lenguaje natural; casi nunca sabe qué calculadora necesita. Tu trabajo es:
1. Detectar la intención (qué quiere saber o decidir).
2. Extraer las variables que ya te dio (montos, fechas, cantidades).
3. Elegir la o las calculadoras adecuadas (usá buscar_calculadoras y ver_calculadora).
4. Pedir SOLO los datos que falten para poder calcular.
5. Ejecutar el cálculo con la tool calcular.

REGLAS DURAS:
- NUNCA hagas aritmética vos. Todo número final sale de la tool calcular. Si calculás mentalmente, estás mal.
- Antes de calcular, mirá los inputs con ver_calculadora. Mapeá lo que dijo el usuario a los ids de campo exactos.
- Si faltan datos obligatorios, hacé UNA pregunta corta y agrupá todo lo que falte (no preguntes de a uno). No vuelvas a pedir lo que el usuario ya dijo.
- Para decisiones ("¿me conviene A o B?", "¿esta oferta o la otra?"), corré varias calculadoras y compará los resultados explícitamente.
- Si no hay ninguna calculadora adecuada, decilo con honestidad y ofrecé la más cercana. No inventes calculadoras.

ESTILO:
- Español rioplatense, de vos, directo y breve. Nada de relleno ni de repetir lo que el usuario ya dijo.
- Cuando entregues un resultado, decí el número clave en una frase y, si comparás opciones, cuál conviene y por qué. La tarjeta con el detalle y el link a la calculadora la muestra la interfaz: no pegues URLs ni tablas largas, escribí la conclusión.
- Si pedís datos, terminá con la pregunta. Si ya calculaste, terminá con la conclusión.`;

// ── Llamada cruda a la Messages API (sin SDK: Worker bundle liviano) ──────────

interface AnthropicBlock {
  type: string;
  text?: string;
  id?: string;
  name?: string;
  input?: any;
  // tool_result
  tool_use_id?: string;
  content?: any;
}
interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicBlock[];
}

async function callAnthropic(opts: {
  apiKey: string;
  model: string;
  messages: AnthropicMessage[];
  signal?: AbortSignal;
}): Promise<{ content: AnthropicBlock[]; stop_reason: string }> {
  const resp = await fetch(API_URL, {
    method: 'POST',
    signal: opts.signal,
    headers: {
      'content-type': 'application/json',
      'x-api-key': opts.apiKey,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages: opts.messages,
    }),
  });
  if (!resp.ok) {
    const detail = await resp.text().catch(() => '');
    throw new Error(`anthropic_${resp.status}: ${detail.slice(0, 300)}`);
  }
  const data: any = await resp.json();
  return { content: data.content || [], stop_reason: data.stop_reason || 'end_turn' };
}

// ── Ejecución de tools → motor determinístico ────────────────────────────────

function suggestionFromHit(h: ReturnType<typeof searchCalcs>[number]): SuggestionCard {
  return { type: 'suggestion', slug: h.slug, name: h.name, url: h.url, category: h.category };
}

/** URL pública de la calc con los valores precargados en el query string. */
function prefillUrl(slug: string, inputs: Record<string, unknown>): string {
  const base = calcUrl(slug);
  const qs = Object.entries(inputs)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `${base}?${qs}` : base;
}

async function execTool(
  name: string,
  input: any,
): Promise<{ content: string; card?: Card; suggestions?: SuggestionCard[] }> {
  input = input && typeof input === 'object' ? input : {};

  if (name === 'buscar_calculadoras') {
    const hits = searchCalcs(String(input.query ?? ''), {
      category: typeof input.category === 'string' ? input.category : undefined,
      limit: Number.isFinite(input.limit) ? Number(input.limit) : 8,
    });
    return {
      content: JSON.stringify({
        count: hits.length,
        results: hits.map((h) => ({ slug: h.slug, name: h.name, category: h.category, audience: h.audience })),
      }),
      suggestions: hits.map(suggestionFromHit),
    };
  }

  if (name === 'ver_calculadora') {
    const spec = describeCalc(String(input.slug ?? ''));
    if (!spec) {
      return { content: JSON.stringify({ error: 'not_found', message: 'No existe ese slug. Usá buscar_calculadoras.' }) };
    }
    return { content: JSON.stringify(spec) };
  }

  if (name === 'calcular') {
    const slug = String(input.slug ?? '');
    const inputs = input.inputs && typeof input.inputs === 'object' ? input.inputs : {};
    const r = await runCompute(slug, inputs);
    if (!r.ok) {
      return {
        content: JSON.stringify({
          ok: false,
          error: r.error,
          message: r.message,
          ...(r.missingFields ? { missingFields: r.missingFields } : {}),
        }),
      };
    }
    const card: ResultCard = {
      type: 'result',
      slug: r.slug,
      name: r.h1 || r.slug,
      url: prefillUrl(r.slug, r.inputs),
      inputs: r.inputs,
      result: r.result,
    };
    return {
      content: JSON.stringify({ ok: true, slug: r.slug, inputs: r.inputs, result: r.result }),
      card,
    };
  }

  return { content: JSON.stringify({ error: 'unknown_tool', name }) };
}

// ── Loop principal ───────────────────────────────────────────────────────────

/**
 * Resuelve un turno del intérprete. `history` es el texto visible de la
 * conversación (sin bloques de tool: se re-derivan en cada turno). Devuelve el
 * texto de respuesta + las tarjetas (resultados computados y/o sugerencias).
 */
export async function interpret(opts: {
  apiKey: string;
  model?: string;
  history: ChatMessage[];
  signal?: AbortSignal;
}): Promise<InterpretResult> {
  const model = opts.model || DEFAULT_MODEL;
  const messages: AnthropicMessage[] = opts.history
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content }));

  if (!messages.length || messages[0].role !== 'user') {
    return { reply: 'Contame qué necesitás calcular.', cards: [] };
  }

  const resultCards: ResultCard[] = [];
  let lastSuggestions: SuggestionCard[] = [];

  for (let step = 0; step < MAX_STEPS; step++) {
    const { content, stop_reason } = await callAnthropic({ apiKey: opts.apiKey, model, messages, signal: opts.signal });
    messages.push({ role: 'assistant', content });

    const toolUses = content.filter((b) => b.type === 'tool_use');
    if (stop_reason !== 'tool_use' || !toolUses.length) {
      const reply = content
        .filter((b) => b.type === 'text')
        .map((b) => b.text || '')
        .join('\n')
        .trim();
      // Si hubo cómputos, mostramos esas tarjetas; si no, las sugerencias de la
      // última búsqueda (para que el usuario tenga a dónde ir igual).
      const cards: Card[] = resultCards.length ? resultCards : lastSuggestions.slice(0, 4);
      return { reply: reply || 'Listo.', cards };
    }

    const toolResults: AnthropicBlock[] = [];
    for (const tu of toolUses) {
      const out = await execTool(tu.name || '', tu.input);
      if (out.card && out.card.type === 'result') resultCards.push(out.card);
      if (out.suggestions) lastSuggestions = out.suggestions;
      toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: out.content });
    }
    messages.push({ role: 'user', content: toolResults });
  }

  // Se acabaron los pasos sin respuesta final.
  return {
    reply: 'Necesito un par de datos más para cerrar el cálculo. ¿Me los pasás?',
    cards: resultCards.length ? resultCards : lastSuggestions.slice(0, 4),
  };
}

export { SITE, buildMeta };
