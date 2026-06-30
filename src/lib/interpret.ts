import { searchCalcs, describeCalc, runCompute, calcUrl } from './calc-compute';

// ─────────────────────────────────────────────────────────────────────────────
// INTÉRPRETE DE PROBLEMAS — la "única inteligencia de cálculo" de Hacé Cuentas.
//
// El usuario no siempre sabe qué calculadora necesita; llega con un problema en
// lenguaje natural ("me ofrecen 3 millones brutos y voy 3 veces a la oficina").
// El modelo SOLO: detecta intención, extrae variables, pide los datos que faltan
// y elige las fórmulas. El cálculo final NUNCA lo hace la IA: lo ejecuta el motor
// determinístico (runCompute) vía la tool `calcular`.
//
// MOTOR HÍBRIDO: primero Cloudflare Workers AI (Llama, binding env.AI) — gratis,
// corre en la cuenta CF. Si el turno sale "degradado" (no logró calcular, se
// estancó o devolvió basura), se reintenta con Anthropic (Haiku) — rápido y
// consistente, se paga solo en los casos difíciles. Mismo loop y mismas tools
// (search/describe/compute, las del MCP) para ambos. Stateless: el caller pasa el
// historial de texto, el loop resuelve el turno.
// ─────────────────────────────────────────────────────────────────────────────

// Workers AI: Llama 3.3 70B fp8 fast (function calling + español). Configurable.
export const DEFAULT_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
// Fallback Anthropic: Haiku (rápido/barato). Solo se usa en casos degradados.
export const DEFAULT_FALLBACK_MODEL = 'claude-haiku-4-5-20251001';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const MAX_STEPS = 4; // iteraciones de tools por turno (cada llamada Workers AI ~4-7s)
const MAX_TOKENS = 1024;
const PRIMARY_BUDGET_MS = 18_000; // tope del intento primario (deja aire para el fallback)

// ── Tipos públicos ───────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
export interface ResultCard {
  type: 'result';
  slug: string;
  name: string;
  url: string;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
}
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
  degraded?: boolean; // true si el turno terminó en estado de baja confianza
}

export interface AiBinding {
  run(model: string, inputs: Record<string, unknown>, options?: Record<string, unknown>): Promise<any>;
}

// ── Representación neutral (independiente del proveedor) ──────────────────────

interface ToolCall {
  id: string;
  name: string;
  args: any;
}
type Turn =
  | { role: 'user'; text: string }
  | { role: 'assistant'; text: string; toolCalls: ToolCall[] }
  | { role: 'tool'; id: string; name: string; content: string };

interface ModelTurn {
  response: string;
  toolCalls: ToolCall[];
}

/** Un proveedor de modelo: dado system + turnos, produce el próximo turno. */
interface Provider {
  name: 'workers' | 'anthropic';
  complete(system: string, turns: Turn[], withTools: boolean): Promise<ModelTurn>;
}

function newId(): string {
  try {
    return (globalThis.crypto as any)?.randomUUID?.() || `call_${Math.random().toString(36).slice(2, 10)}`;
  } catch {
    return `call_${Math.random().toString(36).slice(2, 10)}`;
  }
}

// ── Definición de tools (neutral; cada proveedor la adapta a su wire format) ──

const TOOL_DEFS = [
  {
    name: 'calcular',
    description:
      'Ejecuta el cálculo determinístico de una calculadora y devuelve el resultado real. Pasá el slug (de la lista de candidatas) y un objeto inputs con los campos. ESTE es el único modo válido de obtener un número: nunca calcules vos. Si faltan campos obligatorios, devuelve missingFields.',
    schema: {
      type: 'object',
      properties: {
        slug: { type: 'string', description: 'slug de la calc (de la lista de candidatas)' },
        inputs: {
          type: 'object',
          description: 'pares campo→valor con los ids exactos, ej. {"bruto":2800000,"hijos":2}',
        },
      },
      required: ['slug', 'inputs'],
    },
  },
  {
    name: 'buscar_calculadoras',
    description:
      'Sólo si NINGUNA de las calculadoras candidatas sirve para el pedido. Busca otras por palabras clave y devuelve slugs + sus campos.',
    schema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'palabras clave a buscar' } },
      required: ['query'],
    },
  },
];

const SYSTEM_PROMPT = `Sos el asistente de Hacé Cuentas (hacecuentas.com), calculadoras para Argentina y LATAM, datos 2026.

El usuario te cuenta un PROBLEMA en lenguaje natural; casi nunca sabe qué calculadora necesita. Tu trabajo es:
1. Detectar la intención (qué quiere saber o decidir).
2. Extraer las variables que ya te dio (montos, fechas, cantidades).
3. Elegir la o las calculadoras adecuadas (de la lista de candidatas).
4. Pedir SOLO los datos que falten para poder calcular.
5. Ejecutar el cálculo con la tool calcular.

REGLAS DURAS:
- NUNCA hagas aritmética vos. Todo número final sale de la tool calcular. Si calculás mentalmente, estás mal.
- Mapeá lo que dijo el usuario a los ids de campo EXACTOS de la calc candidata.
- Si faltan datos obligatorios, hacé UNA pregunta corta y agrupá todo lo que falte (no preguntes de a uno). No vuelvas a pedir lo que el usuario ya dijo.
- Para decisiones ("¿me conviene A o B?"), corré varias calculadoras y compará los resultados explícitamente.
- Si no hay ninguna calculadora adecuada, decilo con honestidad y ofrecé la más cercana. No inventes calculadoras.
- NO repitas la misma tool con los mismos datos. Apenas tengas el resultado de calcular, respondé con la conclusión: no vuelvas a llamar tools.
- Dirección correcta: "en mano", "me queda", "neto", "cuánto cobro" = de bruto a NETO. "cuánto bruto necesito para X" = de neto a bruto.

ESTILO:
- Español rioplatense, de vos, directo y breve. Nada de relleno ni de repetir lo que el usuario ya dijo.
- Cuando entregues un resultado, decí el número clave en una frase y, si comparás opciones, cuál conviene y por qué. La tarjeta con el detalle y el link a la calculadora la muestra la interfaz: no pegues URLs ni tablas largas, escribí la conclusión.
- Si pedís datos, terminá con la pregunta. Si ya calculaste, terminá con la conclusión.`;

const DISTILL_SYSTEM =
  'Devolvé SOLO 2 a 5 palabras clave en español para buscar la calculadora que resuelve el pedido. Nada de oraciones ni explicaciones. Ejemplos: "sueldo neto", "indemnización despido", "ladrillos pared", "plazo fijo", "actualización alquiler ICL".';

// ── Provider: Workers AI (formato OpenAI) ─────────────────────────────────────

const WORKERS_TOOLS = TOOL_DEFS.map((t) => ({ name: t.name, description: t.description, parameters: t.schema }));

function turnsToOpenAI(turns: Turn[]): any[] {
  return turns.map((t) => {
    if (t.role === 'user') return { role: 'user', content: t.text };
    if (t.role === 'tool') return { role: 'tool', tool_call_id: t.id, name: t.name, content: t.content };
    // assistant (con tool calls)
    const msg: any = { role: 'assistant', content: t.text || '' };
    if (t.toolCalls.length) {
      msg.tool_calls = t.toolCalls.map((c) => ({
        id: c.id,
        type: 'function',
        function: { name: c.name, arguments: JSON.stringify(c.args) },
      }));
    }
    return msg;
  });
}

function normalizeOpenAICalls(raw: any[]): ToolCall[] {
  return (Array.isArray(raw) ? raw : []).map((c) => {
    const name = c?.name ?? c?.function?.name ?? '';
    let args = c?.arguments ?? c?.function?.arguments ?? {};
    if (typeof args === 'string') {
      try {
        args = JSON.parse(args);
      } catch {
        args = {};
      }
    }
    return { id: c?.id || newId(), name, args: args && typeof args === 'object' ? args : {} };
  });
}

function makeWorkersProvider(ai: AiBinding, model: string): Provider {
  return {
    name: 'workers',
    async complete(system, turns, withTools) {
      const messages = [{ role: 'system', content: system }, ...turnsToOpenAI(turns)];
      const inputs: Record<string, unknown> = { messages, max_tokens: MAX_TOKENS };
      if (withTools) inputs.tools = WORKERS_TOOLS; // sin tools = forzar respuesta en prosa
      const out: any = await ai.run(model, inputs);
      return {
        response: typeof out?.response === 'string' ? out.response : '',
        toolCalls: normalizeOpenAICalls(out?.tool_calls),
      };
    },
  };
}

// ── Provider: Anthropic (formato de bloques) ──────────────────────────────────

const ANTHROPIC_TOOLS = TOOL_DEFS.map((t) => ({ name: t.name, description: t.description, input_schema: t.schema }));

function turnsToAnthropic(turns: Turn[]): any[] {
  const msgs: any[] = [];
  for (const t of turns) {
    if (t.role === 'user') {
      msgs.push({ role: 'user', content: t.text });
    } else if (t.role === 'assistant') {
      const content: any[] = [];
      if (t.text) content.push({ type: 'text', text: t.text });
      for (const c of t.toolCalls) content.push({ type: 'tool_use', id: c.id, name: c.name, input: c.args });
      msgs.push({ role: 'assistant', content: content.length ? content : [{ type: 'text', text: '…' }] });
    } else {
      // tool_result: agrupar los consecutivos en un único mensaje user.
      const block = { type: 'tool_result', tool_use_id: t.id, content: t.content };
      const last = msgs[msgs.length - 1];
      if (last && last.role === 'user' && Array.isArray(last.content)) last.content.push(block);
      else msgs.push({ role: 'user', content: [block] });
    }
  }
  return msgs;
}

function makeAnthropicProvider(apiKey: string, model: string): Provider {
  return {
    name: 'anthropic',
    async complete(system, turns, withTools) {
      const body: any = {
        model,
        max_tokens: MAX_TOKENS,
        system,
        messages: turnsToAnthropic(turns),
        tools: ANTHROPIC_TOOLS,
      };
      // withTools=false → forzar texto (el historial puede tener tool_use, así que
      // mantenemos tools definidas pero bloqueamos su uso).
      if (!withTools) body.tool_choice = { type: 'none' };
      const resp = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': ANTHROPIC_VERSION },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const detail = await resp.text().catch(() => '');
        throw new Error(`anthropic_${resp.status}: ${detail.slice(0, 200)}`);
      }
      const data: any = await resp.json();
      const blocks: any[] = Array.isArray(data?.content) ? data.content : [];
      const response = blocks
        .filter((b) => b.type === 'text')
        .map((b) => b.text || '')
        .join('\n')
        .trim();
      const toolCalls: ToolCall[] = blocks
        .filter((b) => b.type === 'tool_use')
        .map((b) => ({ id: b.id || newId(), name: b.name, args: b.input && typeof b.input === 'object' ? b.input : {} }));
      return { response, toolCalls };
    },
  };
}

// ── Tools → motor determinístico ──────────────────────────────────────────────

function suggestionFromHit(h: ReturnType<typeof searchCalcs>[number]): SuggestionCard {
  return { type: 'suggestion', slug: h.slug, name: h.name, url: h.url, category: h.category };
}

function prefillUrl(slug: string, inputs: Record<string, unknown>): string {
  const base = calcUrl(slug);
  const qs = Object.entries(inputs)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `${base}?${qs}` : base;
}

function calcSpecLine(slug: string): string | null {
  const spec = describeCalc(slug);
  if (!spec) return null;
  const fields = spec.inputs
    .map((f: any) => {
      const flags = [f.type, f.required ? 'oblig' : 'opc'];
      if (f.options) flags.push(`opciones:${f.options.join('|')}`);
      else if (f.default !== undefined) flags.push(`def:${f.default}`);
      return `${f.id}(${flags.join(',')})`;
    })
    .join(', ');
  return `- ${slug} — ${spec.name} — campos: ${fields || '(sin campos)'}`;
}

// Modelo de embeddings (multilingüe, 1024 dims) — debe coincidir con el índice
// poblado por scripts/build-calc-embeddings.ts.
const EMBED_MODEL = '@cf/baai/bge-m3';

interface VectorizeBinding {
  query: (
    vector: number[],
    opts?: { topK?: number; returnMetadata?: boolean | 'all' | 'indexed' | 'none' },
  ) => Promise<{ matches: Array<{ id: string; score: number; metadata?: Record<string, unknown> }> }>;
}

/** Embed + búsqueda semántica en Vectorize. Devuelve slugs ordenados, o null si
 *  no hay binding/índice o falla (el caller cae a búsqueda por palabras clave). */
async function semanticSlugs(ai: AiBinding | undefined, vectorize: VectorizeBinding | undefined, query: string): Promise<string[] | null> {
  if (!ai || !vectorize) return null;
  try {
    const emb: any = await ai.run(EMBED_MODEL, { text: [query.slice(0, 600)] });
    const vector: number[] | undefined = emb?.data?.[0];
    if (!Array.isArray(vector) || !vector.length) return null;
    const res = await vectorize.query(vector, { topK: 20, returnMetadata: 'all' });
    const matches = res?.matches || [];
    if (!matches.length) return null;
    // Sesgo AR (sitio de Argentina por defecto) sin excluir otros países.
    // El id del vector es un hash; el slug real va en metadata.slug.
    const ar: string[] = [];
    const rest: string[] = [];
    for (const m of matches) {
      const slug = (m.metadata?.slug as string) || '';
      if (!slug) continue;
      const aud = (m.metadata?.audience as string) || '';
      (aud === 'AR' ? ar : rest).push(slug);
    }
    return [...ar, ...rest].slice(0, 8);
  } catch {
    return null;
  }
}

/** Arma el bloque de contexto a partir de una lista de slugs candidatos. */
function candidatesFromSlugs(slugs: string[]): { contextText: string; suggestions: SuggestionCard[] } {
  const lines: string[] = [];
  const suggestions: SuggestionCard[] = [];
  for (const slug of slugs) {
    const line = calcSpecLine(slug);
    const spec = describeCalc(slug);
    if (line) lines.push(line);
    if (spec) suggestions.push({ type: 'suggestion', slug, name: spec.name, url: spec.url, category: spec.category });
  }
  const contextText = lines.length
    ? `Calculadoras candidatas para el pedido (elegí la que va en la dirección que pide el usuario):\n${lines.join('\n')}\n\nUsá calcular(slug, inputs) con los ids de campo exactos. Si ninguna sirve, usá buscar_calculadoras.`
    : 'No encontré calculadoras candidatas obvias. Usá buscar_calculadoras con palabras clave del pedido.';
  return { contextText, suggestions };
}

/** Retrieval de candidatas: semántico (embeddings) y, si no hay, por keywords. */
async function retrieveCandidates(
  ai: AiBinding | undefined,
  vectorize: VectorizeBinding | undefined,
  userText: string,
): Promise<{ contextText: string; suggestions: SuggestionCard[] }> {
  const slugs = await semanticSlugs(ai, vectorize, userText);
  if (slugs && slugs.length) return candidatesFromSlugs(slugs);
  // Fallback por palabras clave (sin embeddings): el texto crudo es ruidoso pero
  // es mejor que nada.
  const all = searchCalcs(userText, { limit: 14 });
  const ar = all.filter((h) => h.audience === 'AR');
  const rest = all.filter((h) => h.audience !== 'AR');
  return candidatesFromSlugs([...ar, ...rest].slice(0, 8).map((h) => h.slug));
}

async function execTool(
  name: string,
  input: any,
): Promise<{ content: string; card?: Card; suggestions?: SuggestionCard[] }> {
  input = input && typeof input === 'object' ? input : {};

  if (name === 'buscar_calculadoras') {
    const hits = searchCalcs(String(input.query ?? ''), { limit: 6 });
    const lines = hits.map((h) => calcSpecLine(h.slug)).filter(Boolean);
    return {
      content: lines.length ? `Resultados (slug — nombre — campos):\n${lines.join('\n')}` : 'Sin resultados.',
      suggestions: hits.map(suggestionFromHit),
    };
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
    return { content: JSON.stringify({ ok: true, slug: r.slug, inputs: r.inputs, result: r.result }), card };
  }

  return { content: JSON.stringify({ error: 'unknown_tool', name }) };
}

// ── Loop (sobre un Provider, con candidatas ya recuperadas) ──────────────────

const isMetaJunk = (s: string): boolean =>
  /function (definition|call)|expand them|not comprehensive|i (cannot|can't) (find|call)/i.test(s);

/** Resuelve un turno sobre un proveedor concreto, con las candidatas ya armadas
 *  (retrieval semántico hecho una sola vez en interpret). Devuelve `degraded`. */
async function runTurn(
  provider: Provider,
  history: ChatMessage[],
  contextText: string,
  initialSuggestions: SuggestionCard[],
): Promise<InterpretResult> {
  const clean = history.filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content.trim());
  if (!clean.length || clean[clean.length - 1].role !== 'user') {
    return { reply: 'Contame qué necesitás calcular.', cards: [] };
  }

  const system = `${SYSTEM_PROMPT}\n\n${contextText}`;
  const turns: Turn[] = clean.map((m) => ({ role: m.role, text: m.content }) as Turn);

  const resultCards: ResultCard[] = [];
  let lastSuggestions = initialSuggestions;
  const seenCalls = new Set<string>();

  const collectCards = (): Card[] => {
    if (resultCards.length) {
      const seen = new Set<string>();
      const uniq: ResultCard[] = [];
      for (const c of resultCards) {
        const k = `${c.slug}|${JSON.stringify(c.inputs)}`;
        if (seen.has(k)) continue;
        seen.add(k);
        uniq.push(c);
      }
      return uniq;
    }
    return lastSuggestions.slice(0, 4);
  };

  // Cierre forzado (sin tools) cuando el modelo se estanca o agota pasos.
  const finalize = async (): Promise<InterpretResult> => {
    const turn = await provider.complete(system, turns, false);
    const cards = collectCards();
    const t = turn.response.trim();
    const clean2 = t && !isMetaJunk(t);
    return {
      reply: clean2
        ? t
        : cards.some((c) => c.type === 'result')
          ? 'Listo, acá tenés el resultado.'
          : 'Encontré estas calculadoras para tu caso. Abrí la que te sirva.',
      cards,
      degraded: true, // llegar a finalize ya es señal de baja confianza
    };
  };

  for (let step = 0; step < MAX_STEPS; step++) {
    const turn = await provider.complete(system, turns, true);

    if (!turn.toolCalls.length) {
      const t = turn.response.trim();
      const cards = collectCards();
      if (!t || isMetaJunk(t)) return finalize();
      return { reply: t, cards, degraded: false };
    }

    const fresh = turn.toolCalls.filter((c) => !seenCalls.has(`${c.name}|${JSON.stringify(c.args)}`));
    if (!fresh.length) return finalize();

    turns.push({ role: 'assistant', text: turn.response || '', toolCalls: fresh });
    for (const call of fresh) {
      seenCalls.add(`${call.name}|${JSON.stringify(call.args)}`);
      const out = await execTool(call.name || '', call.args);
      if (out.card && out.card.type === 'result') resultCards.push(out.card);
      if (out.suggestions) lastSuggestions = out.suggestions;
      turns.push({ role: 'tool', id: call.id, name: call.name, content: out.content });
    }
  }

  return finalize();
}

// ── Orquestador híbrido ───────────────────────────────────────────────────────

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('primary_timeout')), ms);
    p.then((v) => {
      clearTimeout(timer);
      resolve(v);
    }, (e) => {
      clearTimeout(timer);
      reject(e);
    });
  });
}

/**
 * Resuelve un turno con el motor híbrido. Workers AI primero (gratis); si sale
 * degradado/error/timeout y hay clave Anthropic, reintenta con Haiku.
 */
export async function interpret(opts: {
  ai?: AiBinding;
  vectorize?: VectorizeBinding;
  anthropicKey?: string;
  model?: string; // modelo Workers AI
  fallbackModel?: string; // modelo Anthropic
  history: ChatMessage[];
}): Promise<InterpretResult> {
  const workers = opts.ai ? makeWorkersProvider(opts.ai, opts.model || DEFAULT_MODEL) : null;
  const anthropic = opts.anthropicKey
    ? makeAnthropicProvider(opts.anthropicKey, opts.fallbackModel || DEFAULT_FALLBACK_MODEL)
    : null;

  if (!workers && !anthropic) throw new Error('no_model_provider');

  // Retrieval de candidatas UNA sola vez (semántico vía embeddings + Vectorize;
  // fallback a keywords). Compartido por ambos proveedores → sin repetir trabajo.
  const userText = opts.history
    .filter((m) => m.role === 'user' && m.content.trim())
    .map((m) => m.content)
    .join(' ')
    .slice(0, 500);
  const { contextText, suggestions } = await retrieveCandidates(opts.ai, opts.vectorize, userText);

  // Sin Workers AI: Anthropic directo. Sin Anthropic: Workers AI directo.
  if (!workers) return runTurn(anthropic!, opts.history, contextText, suggestions);
  if (!anthropic) return runTurn(workers, opts.history, contextText, suggestions);

  // Híbrido: Workers AI con presupuesto acotado; si degrada/falla → Haiku.
  let primary: InterpretResult | null = null;
  try {
    primary = await withTimeout(runTurn(workers, opts.history, contextText, suggestions), PRIMARY_BUDGET_MS);
  } catch {
    primary = null;
  }
  if (primary && !primary.degraded) return primary;

  try {
    const alt = await runTurn(anthropic, opts.history, contextText, suggestions);
    // Preferí Haiku salvo que esté peor que el primario.
    if (!alt.degraded || alt.cards.some((c) => c.type === 'result') || !primary) return alt;
  } catch {
    /* si Haiku falla, devolvemos lo que haya */
  }
  return primary || { reply: 'No pude procesarlo ahora. Probá el buscador por nombre.', cards: [], degraded: true };
}
