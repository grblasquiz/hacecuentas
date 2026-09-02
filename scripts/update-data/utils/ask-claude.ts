/**
 * Helper para fetchers auto-llm: le pide a Claude que investigue una fuente
 * oficial con web_search + web_fetch y devuelva datos estructurados validados
 * contra un JSON Schema.
 *
 * Funciona como fetch a la Messages API de Anthropic. Los server-tools
 * (web_search, web_fetch) los ejecuta el server-side, así que una sola
 * llamada HTTP cubre toda la investigación. Al final Claude invoca nuestra
 * tool local `submit_findings` con el JSON estructurado.
 *
 * Fail-soft: si falta API key o el schema no valida, devuelve null y
 * el fetcher logea el error. Nunca tira excepción no-handled.
 *
 * Caminos, en orden:
 *   1. ANTHROPIC_API_KEY presente → Messages API (server-tools web_search/web_fetch).
 *   2. Sin key pero hay CLI `claude` local (suscripción) → `claude -p` con
 *      WebSearch/WebFetch y validación del JSON contra el schema acá mismo.
 *   3. Ninguno → null (el fetcher reporta 'pending' vía run-status).
 *
 * Modelo default: claude-sonnet-4-6 (buen equilibrio costo/calidad para
 * research). Para calcs críticas (indemnizaciones, escalas de impuestos),
 * override con claude-opus-4-6.
 */

import { spawnSync } from 'node:child_process';
import { createLogger } from './logger.ts';
import { localClaudeCliPath, reportLlmUnavailable, reportWarn } from './run-status.ts';

let cliAuthWarned = false;

const log = createLogger('ask-claude');

const API_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-4-6';

export interface AskClaudeOpts<T> {
  /** Prompt principal: qué investigar y con qué criterios. */
  task: string;
  /** JSON Schema del output que submit_findings debe respetar. */
  schema: Record<string, unknown>;
  /** Override de API key (por default lee ANTHROPIC_API_KEY). */
  apiKey?: string;
  /** Modelo a usar. Default: claude-sonnet-4-6. */
  model?: string;
  /** Cuántas veces puede usar web_search (default 5). */
  maxSearchUses?: number;
  /** Cuántas veces puede usar web_fetch (default 10). */
  maxFetchUses?: number;
  /** Validador extra post-schema. Si devuelve ok:false, el call falla. */
  validate?: (data: T) => { ok: true } | { ok: false; reason: string };
}

// ── Validador mínimo de JSON Schema (subset que usan los fetchers) ───────────
// El camino API delega la estructura en input_schema de la tool; el camino CLI
// recibe texto libre, así que validamos localmente: type, required, properties,
// items, minItems/maxItems, enum, minimum/maximum, pattern, minLength/maxLength.
function validateAgainstSchema(data: unknown, schema: Record<string, unknown>, path = '$'): string | null {
  const type = schema.type as string | undefined;
  if (type === 'object') {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return `${path}: esperaba object`;
    const obj = data as Record<string, unknown>;
    for (const req of (schema.required as string[]) || []) {
      if (obj[req] === undefined) return `${path}.${req}: campo requerido ausente`;
    }
    const props = (schema.properties as Record<string, Record<string, unknown>>) || {};
    for (const [key, sub] of Object.entries(props)) {
      if (obj[key] === undefined) continue;
      const err = validateAgainstSchema(obj[key], sub, `${path}.${key}`);
      if (err) return err;
    }
    return null;
  }
  if (type === 'array') {
    if (!Array.isArray(data)) return `${path}: esperaba array`;
    if (schema.minItems !== undefined && data.length < (schema.minItems as number)) return `${path}: ${data.length} items < minItems ${schema.minItems}`;
    if (schema.maxItems !== undefined && data.length > (schema.maxItems as number)) return `${path}: ${data.length} items > maxItems ${schema.maxItems}`;
    if (schema.items) {
      for (let i = 0; i < data.length; i++) {
        const err = validateAgainstSchema(data[i], schema.items as Record<string, unknown>, `${path}[${i}]`);
        if (err) return err;
      }
    }
    return null;
  }
  if (type === 'number' || type === 'integer') {
    if (typeof data !== 'number' || !Number.isFinite(data)) return `${path}: esperaba number`;
    if (schema.minimum !== undefined && data < (schema.minimum as number)) return `${path}: ${data} < minimum ${schema.minimum}`;
    if (schema.maximum !== undefined && data > (schema.maximum as number)) return `${path}: ${data} > maximum ${schema.maximum}`;
    return null;
  }
  if (type === 'string') {
    if (typeof data !== 'string') return `${path}: esperaba string`;
    if (schema.minLength !== undefined && data.length < (schema.minLength as number)) return `${path}: largo ${data.length} < minLength ${schema.minLength}`;
    if (schema.maxLength !== undefined && data.length > (schema.maxLength as number)) return `${path}: largo ${data.length} > maxLength ${schema.maxLength}`;
    if (schema.pattern && !new RegExp(schema.pattern as string).test(data)) return `${path}: no matchea pattern ${schema.pattern}`;
    if (schema.enum && !(schema.enum as unknown[]).includes(data)) return `${path}: '${data}' no está en enum`;
    return null;
  }
  if (schema.enum && !(schema.enum as unknown[]).includes(data)) return `${path}: valor no está en enum`;
  return null; // tipo no declarado → no validamos
}

/** Extrae el primer objeto JSON de un texto (tolera fences ```json y prosa alrededor). */
function extractJson(text: string): unknown | null {
  const cleaned = text.replace(/```(?:json)?/g, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Camino 2: `claude -p` local (suscripción Claude Code, sin API key).
 * Env scrubbeado: la sesión padre (Claude Code / SDK) exporta ANTHROPIC_BASE_URL
 * y CLAUDE_CODE_* que rompen la auth del CLI hijo (401 OAuth) — se lanza con un
 * env mínimo para que use las credenciales de la suscripción local.
 */
function askClaudeViaCli<T>(opts: AskClaudeOpts<T>, cliPath: string): T | null {
  // El CLI resuelve mejor los alias (sonnet/opus/haiku) que los IDs de la API.
  const raw = opts.model || DEFAULT_MODEL;
  const model = raw.includes('opus') ? 'opus' : raw.includes('haiku') ? 'haiku' : 'sonnet';
  const prompt =
    `${opts.task}\n\n` +
    `IMPORTANTE: investigá primero con las herramientas WebSearch y WebFetch (fuentes oficiales). ` +
    `Cuando tengas toda la información, tu respuesta final tiene que ser ÚNICAMENTE un objeto JSON válido ` +
    `que cumpla exactamente este JSON Schema — sin markdown, sin explicación, sin texto antes ni después:\n\n` +
    `${JSON.stringify(opts.schema, null, 2)}`;

  log.info(`sin ANTHROPIC_API_KEY — usando CLI local (${cliPath}, model ${model})`);
  const res = spawnSync(
    cliPath,
    [
      '-p', prompt,
      '--output-format', 'json',
      '--model', model,
      '--allowedTools', 'WebSearch,WebFetch',
      '--strict-mcp-config',
      '--max-turns', '40',
    ],
    {
      encoding: 'utf8',
      timeout: Number(process.env.CLAUDE_CLI_TIMEOUT_MS) || 15 * 60 * 1000,
      maxBuffer: 32 * 1024 * 1024,
      // Env mínimo: sin ANTHROPIC_BASE_URL/CLAUDE_CODE_* heredados (ver docstring).
      env: {
        HOME: process.env.HOME || '',
        USER: process.env.USER || '',
        LOGNAME: process.env.LOGNAME || process.env.USER || '',
        PATH: '/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin',
        TERM: 'dumb',
      },
    },
  );

  if (res.error) {
    log.error(`CLI falló al lanzar: ${res.error.message}`);
    return null;
  }

  // El CLI puede salir con código 1 y aún así dejar el envelope JSON de error
  // en stdout — se parsea SIEMPRE para distinguir auth vencida de otros fallos.
  let envelope: { result?: string; is_error?: boolean; subtype?: string };
  try {
    envelope = JSON.parse(res.stdout);
  } catch {
    if (res.status !== 0) {
      log.error(`CLI salió con código ${res.status}: ${(res.stderr || res.stdout || '').slice(0, 500)}`);
    } else {
      log.error(`CLI devolvió stdout no-JSON: ${res.stdout.slice(0, 300)}`);
    }
    return null;
  }
  if (envelope.is_error || res.status !== 0 || typeof envelope.result !== 'string') {
    const msg = String(envelope.result);
    if (/authenticat|oauth/i.test(msg)) {
      reportLlmUnavailable();
      log.error(
        `CLI sin sesión válida (${msg.slice(0, 120)}) — correr \`claude\` interactivo y loguearse (claude login) para revivir el fallback local`,
      );
      if (!cliAuthWarned) {
        cliAuthWarned = true;
        reportWarn('ask-claude', 'fallback CLI local presente pero SIN sesión (OAuth vencido) — correr `claude login`; hasta entonces los fetchers llm quedan pendientes');
      }
    } else {
      log.error(`CLI reportó error (${envelope.subtype || '?'}): ${msg.slice(0, 300)}`);
    }
    return null;
  }

  const parsed = extractJson(envelope.result);
  if (parsed === null) {
    log.error(`no pude extraer JSON de la respuesta del CLI: ${envelope.result.slice(0, 300)}`);
    return null;
  }

  const schemaErr = validateAgainstSchema(parsed, opts.schema);
  if (schemaErr) {
    log.error(`respuesta del CLI no valida contra el schema: ${schemaErr}`);
    return null;
  }

  const result = parsed as T;
  if (opts.validate) {
    const check = opts.validate(result);
    if (!check.ok) {
      log.error(`validación extra falló: ${check.reason}`);
      return null;
    }
  }
  return result;
}

export async function askClaudeStructured<T = unknown>(opts: AskClaudeOpts<T>): Promise<T | null> {
  const apiKey = opts.apiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback: CLI local `claude -p` (suscripción, sin API key).
    const cliPath = localClaudeCliPath();
    if (cliPath) return askClaudeViaCli(opts, cliPath);
    // No es un error del fetcher: es una limitación del entorno. El fetcher
    // que llama debe reportar 'pending' vía run-status para que el summary
    // lo liste como WARN visible (nunca deshabilitado en silencio).
    log.warn('sin ANTHROPIC_API_KEY ni CLI `claude` local — paso LLM omitido (el fetcher decide fallback)');
    return null;
  }
  const model = opts.model || DEFAULT_MODEL;

  const payload = {
    model,
    max_tokens: 8000,
    tools: [
      { type: 'web_search_20250305', name: 'web_search', max_uses: opts.maxSearchUses ?? 5 },
      { type: 'web_fetch_20250910', name: 'web_fetch', max_uses: opts.maxFetchUses ?? 10 },
      {
        name: 'submit_findings',
        description:
          'Devolvé los datos estructurados finales acá después de investigar. ' +
          'No uses texto libre — toda la respuesta va en el input de esta tool.',
        input_schema: opts.schema,
      },
    ],
    // Forzar que termine invocando alguna tool (idealmente submit_findings)
    tool_choice: { type: 'any' },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              `${opts.task}\n\n` +
              `IMPORTANTE: investigá primero con web_search y web_fetch, y cuando tengas toda la info llamá a submit_findings con el JSON estructurado final. ` +
              `No respondas con texto libre.`,
          },
        ],
      },
    ],
  };

  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        // Beta header necesario para web_fetch_20250910
        'anthropic-beta': 'web-fetch-2025-09-10',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    log.error(`fetch falló: ${(err as Error).message}`);
    return null;
  }

  if (!res.ok) {
    const body = await res.text();
    log.error(`API respondió ${res.status}: ${body.slice(0, 500)}`);
    return null;
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; name?: string; input?: unknown }>;
    stop_reason?: string;
    usage?: { input_tokens: number; output_tokens: number };
  };

  // Buscar la invocación local de submit_findings (ignorando server-tool calls)
  const submit = data.content?.find((b) => b.type === 'tool_use' && b.name === 'submit_findings');
  if (!submit) {
    log.error(`Claude no invocó submit_findings (stop_reason=${data.stop_reason || 'n/a'})`);
    // Para debug: listar qué tipos de blocks vinieron
    const types = (data.content || []).map((b) => `${b.type}${b.name ? `:${b.name}` : ''}`).join(', ');
    log.error(`content blocks recibidos: ${types}`);
    return null;
  }

  const result = submit.input as T;

  if (opts.validate) {
    const check = opts.validate(result);
    if (!check.ok) {
      log.error(`validación extra falló: ${check.reason}`);
      return null;
    }
  }

  if (data.usage) {
    const inTok = data.usage.input_tokens.toLocaleString('es-AR');
    const outTok = data.usage.output_tokens.toLocaleString('es-AR');
    log.info(`usage: ${inTok} in / ${outTok} out tokens (${model})`);
  }

  return result;
}
